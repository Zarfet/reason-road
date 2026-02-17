/**
 * NEXUS PDF Report — HTML Print Generator
 * 
 * Strategy: inject dynamic HTML into a hidden iframe → window.print()
 * Result: native browser PDF — vectorial text, real CSS, no bitmap artifacts
 */

import type { AssessmentAnswers, RecommendationResult } from '@/types/assessment';
import { PARADIGM_LABELS } from '@/types/assessment';
import { getReasoningBullets } from '@/lib/scoring';
import { generateStrategicRationale } from '@/components/results/tabs/OverviewTab';
import { generateAllArguments } from '@/lib/argumentsGenerator';
import { generateSustainabilityReport } from '@/lib/sustainabilityAnalysis';
import { generateRegulatoryAnalysis } from '@/lib/regulatoryAnalysis';
import { detectRedFlags } from '@/lib/redFlagsDetector';

// ─── Interface labels ─────────────────────────────────────────────────────────
const IL: Record<string, string> = {
  traditional_screen: 'Traditional Screen',
  invisible:          'Invisible / Ambient',
  ai_vectorial:       'AI Conversational',
  spatial:            'Spatial Computing',
  voice:              'Voice-First',
};
function iLabel(k: string): string {
  return IL[k] ?? (PARADIGM_LABELS as Record<string, string>)[k] ?? k.replace(/_/g, ' ');
}
function clean(s: string): string {
  return s.replace(/\*\*/g, '').trim();
}

// ─── Research cache reader ────────────────────────────────────────────────────
interface ResearchPaper { title: string; authors: string; year: number; venue: string; abstract: string; relevance: string; }
interface CaseStudy { name: string; company: string; year: number; outcome: 'success' | 'failure'; description: string; keyFactors: string[]; lessonsLearned: string; }

function readFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp: number };
    if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) { localStorage.removeItem(key); return null; }
    return parsed as T;
  } catch { return null; }
}

// ─── Escape HTML ──────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
function pageWrapper(num: number, title: string, rightMeta: string, content: string): string {
  return `
  <div class="a4-page">
    <div class="page-header">
      <div>
        <div class="page-title">${esc(title)}</div>
      </div>
      <div class="mono">${esc(rightMeta)}</div>
    </div>
    ${content}
    <div class="page-footer">
      <span>NEXUS Paradigm Assessment</span>
      <span>Page ${num} of ?</span>
    </div>
  </div>`;
}

// ─── PAGE 1: Cover ────────────────────────────────────────────────────────────
function buildCover(answers: AssessmentAnswers, recommendation: RecommendationResult, dateStr: string): string {
  const diff = recommendation.primary.pct - recommendation.secondary.pct;
  const confLabel = diff >= 30 ? 'STRONG' : diff >= 15 ? 'MODERATE' : 'LOW';
  const bullets = getReasoningBullets(answers, recommendation).slice(0, 4);
  const rationale = clean(generateStrategicRationale(recommendation, answers));

  const sortedScores = Object.entries(recommendation.allScores)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const scoreBars = sortedScores.map(([key, score]) => {
    const pct = score as number;
    const isPrimary = key === recommendation.primary.paradigm;
    return `
    <div class="score-row ${isPrimary ? 'score-primary' : ''}">
      <div class="score-label">${esc(iLabel(key).toUpperCase())}</div>
      <div class="bar-container"><div class="bar-fill" style="width:${pct}%;background:${isPrimary ? '#000' : '#aaa'}"></div></div>
      <div class="score-pct">${pct}%</div>
    </div>`;
  }).join('');

  const bulletItems = bullets.map((b, i) =>
    `<li>${i + 1}. ${esc(clean(b))}</li>`
  ).join('');

  return `
  <div class="a4-page">
    <div class="cover-header">
      <div>
        <div class="project-label">Project: ${esc(answers.projectName || 'Untitled')}</div>
        <div class="cover-title">NEXUS Assessment</div>
        ${answers.userDemographics ? `<div class="cover-sub">User: ${esc(answers.userDemographics)}</div>` : ''}
      </div>
      <div class="cover-meta">
        <div class="mono">CONFIDENCE: ${confLabel} (${diff}pts split)</div>
        <div class="mono">DATE: ${esc(dateStr.toUpperCase())}</div>
      </div>
    </div>

    <div class="cover-grid">
      <div class="strategy-card">
        <div class="badge">Recommended Strategy</div>
        <div class="strategy-name">
          ${esc(iLabel(recommendation.primary.paradigm))}
          <span class="strategy-secondary"> + ${esc(iLabel(recommendation.secondary.paradigm))}</span>
        </div>
        <div class="strategy-rationale">${esc(rationale)}</div>
        <ul class="reasoning-list">${bulletItems}</ul>
      </div>

      <div class="scores-panel">
        ${scoreBars}
      </div>
    </div>

    <div class="page-footer">
      <span>NEXUS Paradigm Assessment</span>
      <span>Page 1 of ?</span>
    </div>
  </div>`;
}

// ─── PAGE 2: Analysis ─────────────────────────────────────────────────────────
function buildAnalysis(answers: AssessmentAnswers, recommendation: RecommendationResult): string {
  const allArgs = generateAllArguments(answers, recommendation);
  const diff = recommendation.primary.pct - recommendation.secondary.pct;

  const sections = allArgs.map(pArg => {
    const forItems = pArg.argumentsFor.map(a => `
      <div class="arg-card arg-for">
        <div class="arg-header">
          <div class="arg-title">${esc(clean(a.title))}</div>
          <span class="impact-badge impact-${a.impact}">${esc(a.impact)}</span>
        </div>
        <div class="arg-desc">${esc(clean(a.description))}</div>
      </div>`).join('');

    const againstItems = pArg.argumentsAgainst.map(a => `
      <div class="arg-card arg-against">
        <div class="arg-header">
          <div class="arg-title">${esc(clean(a.title))}</div>
          <span class="impact-badge impact-${a.impact}">${esc(a.impact)}</span>
        </div>
        <div class="arg-desc">${esc(clean(a.description))}</div>
      </div>`).join('');

    return `
    <div class="paradigm-section">
      <div class="paradigm-bar">
        <span>${esc(iLabel(pArg.paradigmKey ?? pArg.paradigm).toUpperCase())}</span>
        <span>${Math.round(pArg.percentage)}%</span>
      </div>
      <div class="args-grid">
        <div class="args-col">
          <div class="col-header col-for">FOR</div>
          ${forItems}
        </div>
        <div class="args-col">
          <div class="col-header col-against">AGAINST</div>
          ${againstItems}
        </div>
      </div>
    </div>`;
  }).join('');

  const content = `
    <div class="page-subtitle">Arguments for and against each interface type, weighted by your context.</div>
    ${sections}`;

  return pageWrapper(2, '02. Analysis — Arguments For & Against', `CONFIDENCE GAP: ${diff} PTS`, content);
}

// ─── PAGE 3: Regulatory ──────────────────────────────────────────────────────
function buildRegulatory(answers: AssessmentAnswers, recommendation: RecommendationResult): string | null {
  const reg = generateRegulatoryAnalysis(answers, recommendation);
  if (!reg || !reg.applicable || reg.requirements.length === 0) return null;

  const riskClass = `risk-${reg.overallRiskLevel}`;

  const reqs = reg.requirements.map(req => {
    const affectedLabels = req.applicableParadigms.map((p: string) => iLabel(p)).join(', ');
    const steps = req.mitigationSteps.slice(0, 4).map((s: string) => {
      const isReq = s.startsWith('REQUIRED');
      return `<li class="${isReq ? 'step-required' : ''}">${esc(clean(s.replace(/^REQUIRED: /, '')))}</li>`;
    }).join('');

    return `
    <div class="reg-row">
      <div class="reg-meta">
        <strong>${esc(req.title)}</strong>
        <span class="mono reg-law">${esc(req.regulation)}</span>
        <span class="reg-impact reg-impact-${req.impactLevel}">${esc(req.impactLevel.toUpperCase())}</span>
      </div>
      <div class="reg-body">
        <div class="text-xs">${esc(clean(req.description))}</div>
        <div class="reg-cols">
          <div>
            <span class="field-label">APPLIES TO</span>
            <div class="text-xs">${esc(affectedLabels)}</div>
          </div>
          <div>
            <span class="field-label">REQUIRED ACTIONS</span>
            <ul class="steps-list">${steps}</ul>
          </div>
        </div>
        <div class="citation-row">
          <span class="field-label">SOURCE</span>
          <span class="text-xs citation-link">${esc(req.citation.title)} (${req.citation.year})</span>
        </div>
      </div>
    </div>`;
  }).join('');

  const content = `
    <div class="reg-overview">
      <div>
        <span>Overall risk: </span><span class="risk-badge ${riskClass}">${esc(reg.overallRiskLevel.toUpperCase())} RISK</span>
        <span class="mono" style="margin-left:12px">Region: ${esc(reg.region)}</span>
      </div>
    </div>
    <div class="reg-list">${reqs}</div>
    <div class="legal-disclaimer">Legal Disclaimer: ${esc(clean(reg.disclaimer))}</div>`;

  return pageWrapper(3, '03. Regulatory Audit', 'STATUS: ACTION REQUIRED', content);
}

// ─── PAGE 4: Sustainability ──────────────────────────────────────────────────
function buildSustainability(answers: AssessmentAnswers, recommendation: RecommendationResult): string | null {
  const sust = generateSustainabilityReport(recommendation, answers.valuesRanking ?? [], answers.geography);
  if (!sust.applicable) return null;

  const tableRows = sust.paradigmBreakdown.map((p: { paradigm: string; percentage: number; annualEnergyKwh: number; annualCO2Kg: number; hardwareLifecycle: number }, i: number) => `
    <tr class="${i % 2 === 1 ? 'tr-alt' : ''}">
      <td>${esc(iLabel(p.paradigm))}</td>
      <td>${Math.round(p.percentage)}%</td>
      <td>${p.annualEnergyKwh} kWh</td>
      <td>${p.annualCO2Kg} kg</td>
      <td>${p.hardwareLifecycle} yrs</td>
    </tr>`).join('');

  const greenFlags = sust.greenFlags.map((f: string) =>
    `<li class="green-flag">&#10003; ${esc(clean(f))}</li>`
  ).join('');

  const content = `
    <div class="sust-metrics">
      <div class="metric-tile">
        <div class="metric-val">${sust.weightedAnnualEnergy.toFixed(0)} <span class="metric-unit">kWh</span></div>
        <div class="metric-label">Annual Energy / User</div>
      </div>
      <div class="metric-tile">
        <div class="metric-val">${sust.weightedAnnualCO2.toFixed(1)} <span class="metric-unit">kg</span></div>
        <div class="metric-label">CO2 Emissions / Year</div>
      </div>
      <div class="metric-tile">
        <div class="metric-val">${sust.weightedLifecycle.toFixed(1)} <span class="metric-unit">yrs</span></div>
        <div class="metric-label">Device Lifecycle</div>
      </div>
    </div>

    <div class="sust-compare">
      <div class="compare-card">
        <span class="field-label">VS PURE SCREEN</span>
        <div class="text-xs">Energy: ${esc(sust.comparisonVsPureScreen.energySavings)}</div>
        <div class="text-xs">CO2: ${esc(sust.comparisonVsPureScreen.co2Savings)}</div>
      </div>
      <div class="compare-card">
        <span class="field-label">VS PURE SPATIAL (VR)</span>
        <div class="text-xs">Energy: ${esc(sust.comparisonVsPureVR.energySavings)}</div>
        <div class="text-xs">CO2: ${esc(sust.comparisonVsPureVR.co2Savings)}</div>
      </div>
    </div>

    ${sust.greenFlags.length > 0 ? `
    <div class="green-flags-section">
      <div class="section-title">What You Are Doing Right</div>
      <ul class="green-flags-list">${greenFlags}</ul>
    </div>` : ''}

    <div class="section-title">Environmental Impact by Interface Type</div>
    <table class="sust-table">
      <thead>
        <tr>
          <th>Interface Type</th><th>Share</th><th>Energy (kWh)</th><th>CO2 (kg)</th><th>Lifecycle</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div class="disclaimer-text">${esc(clean(sust.disclaimer))}</div>`;

  return pageWrapper(4, '04. Sustainability Report', 'ENV. IMPACT', content);
}

// ─── PAGE 5: Red Flags ───────────────────────────────────────────────────────
function buildRedFlags(answers: AssessmentAnswers, recommendation: RecommendationResult): string | null {
  const flags = detectRedFlags(answers, recommendation);
  if (!flags.hasFlags) return null;

  const summary = flags.criticalCount > 0
    ? `${flags.criticalCount} critical issue(s) require immediate attention before implementation.`
    : `${flags.totalFlags} issue(s) detected that should be addressed.`;

  const cards = flags.flags.map((flag: { severity: string; category: string; title: string; description: string; impact: string; affectedParadigms: string[]; mitigation: string[]; citation?: { title: string; year: number } }) => {
    const affectedLabels = flag.affectedParadigms.map((p: string) => iLabel(p)).join(', ');
    const mitigations = flag.mitigation.map((m: string) => {
      const isReq = m.startsWith('REQUIRED');
      return `<li class="${isReq ? 'step-required' : ''}">${esc(clean(m.replace(/^REQUIRED: /, '')))}</li>`;
    }).join('');

    return `
    <div class="flag-card flag-${flag.severity}">
      <div class="flag-header">
        <div class="flag-badges">
          <span class="sev-badge sev-${flag.severity}">${esc(flag.severity.toUpperCase())}</span>
          <span class="cat-badge">${esc(flag.category.toUpperCase())}</span>
        </div>
        <div class="flag-title">${esc(clean(flag.title))}</div>
      </div>
      <div class="flag-body">
        <div class="flag-col">
          <span class="field-label">ISSUE</span>
          <div class="text-xs">${esc(clean(flag.description))}</div>
          <span class="field-label mt-2">IMPACT IF IGNORED</span>
          <div class="text-xs">${esc(clean(flag.impact))}</div>
          ${flag.citation ? `
          <span class="field-label mt-2">RESEARCH EVIDENCE</span>
          <div class="text-xs citation-link">${esc(flag.citation.title)} (${flag.citation.year})</div>` : ''}
        </div>
        <div class="flag-col">
          <span class="field-label">AFFECTS</span>
          <div class="text-xs">${esc(affectedLabels)}</div>
          <span class="field-label mt-2">REQUIRED MITIGATIONS</span>
          <ul class="steps-list">${mitigations}</ul>
        </div>
      </div>
    </div>`;
  }).join('');

  const content = `
    <div class="flag-summary ${flags.criticalCount > 0 ? 'flag-summary-critical' : ''}">${esc(summary)}</div>
    ${cards}`;

  return pageWrapper(5, '05. Red Flags & Critical Considerations', `${flags.totalFlags} ISSUE(S)`, content);
}

// ─── PAGE 6: Research ────────────────────────────────────────────────────────
function buildResearch(answers: AssessmentAnswers, recommendation: RecommendationResult): string | null {
  const demo = (answers.userDemographics?.trim() || 'general').toLowerCase().replace(/\s+/g, '_');
  const paradigm = recommendation.primary.paradigm;
  const rKey = `nexus_research_${paradigm}_${demo}`;
  const cKey = `nexus_case_studies_${paradigm}_${demo}`;

  const rCache = readFromCache<{ papers: ResearchPaper[] }>(rKey);
  const cCache = readFromCache<{ cases: CaseStudy[] }>(cKey);
  const papers = rCache?.papers ?? [];
  const cases = cCache?.cases ?? [];

  if (papers.length === 0 && cases.length === 0) return null;

  const paperItems = papers.slice(0, 6).map(p => `
    <li class="research-item">
      <strong>${esc(p.title)}</strong>
      <span class="mono author-line">${esc(p.authors)} &middot; ${p.year} &middot; ${esc(p.venue)}</span>
      <div class="text-xs">${esc(p.abstract)}</div>
      <div class="relevance-box">
        <span class="field-label">WHY RELEVANT</span>
        <div class="text-xs">${esc(p.relevance)}</div>
      </div>
    </li>`).join('');

  const successes = cases.filter(c => c.outcome === 'success');
  const failures = cases.filter(c => c.outcome === 'failure');

  function caseGroup(list: CaseStudy[], label: string, cls: string): string {
    if (list.length === 0) return '';
    const items = list.map(cs => `
      <div class="case-card">
        <div class="case-header">
          <span class="outcome-badge outcome-${cs.outcome}">${esc(cs.outcome.toUpperCase())}</span>
          <strong>${esc(cs.name)}</strong>
          <span class="mono" style="margin-left:auto">${esc(cs.company)} &middot; ${cs.year}</span>
        </div>
        <div class="case-body">
          <div class="case-col">
            <span class="field-label">DESCRIPTION</span>
            <div class="text-xs">${esc(cs.description)}</div>
            <span class="field-label mt-2">LESSON LEARNED</span>
            <div class="text-xs">${esc(cs.lessonsLearned)}</div>
          </div>
          <div class="case-col">
            <span class="field-label">KEY FACTORS</span>
            <ul class="steps-list">${cs.keyFactors.slice(0, 4).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>`).join('');
    return `<div class="case-group ${cls}"><div class="case-group-title">${esc(label)}</div>${items}</div>`;
  }

  const content = `
    ${papers.length > 0 ? `
    <div class="section-title">Supporting Academic Research</div>
    <ul class="research-list">${paperItems}</ul>` : ''}
    ${(successes.length > 0 || failures.length > 0) ? `
    <div class="section-title">Real-World Case Studies</div>
    ${caseGroup(successes, 'Successes', 'group-success')}
    ${caseGroup(failures, 'Failures', 'group-failure')}` : ''}`;

  return pageWrapper(6, '06. Research & Case Studies', 'SOURCE MATERIAL', content);
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;600;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #e5e5e5; }

  .a4-page {
    background: white; width: 210mm; min-height: 297mm; padding: 15mm;
    position: relative; color: #111; display: flex; flex-direction: column; gap: 16px;
    page-break-after: always;
  }

  .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; letter-spacing: -0.02em; }
  .text-xs { font-size: 0.72rem; line-height: 1.5; color: #444; }
  .mt-2 { display: block; margin-top: 8px; }

  .page-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 4px;
  }
  .page-title { font-size: 0.9rem; font-weight: 800; text-transform: uppercase; }
  .page-subtitle { font-size: 0.72rem; color: #666; font-style: italic; margin-bottom: 8px; }
  .page-footer {
    margin-top: auto; border-top: 1px solid #000; padding-top: 6px;
    display: flex; justify-content: space-between; font-size: 0.65rem; color: #888;
  }

  .cover-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: 2px solid #000; padding-bottom: 14px;
  }
  .project-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 4px; }
  .cover-title { font-size: 2.2rem; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; line-height: 1; }
  .cover-sub { font-size: 0.78rem; color: #555; margin-top: 4px; }
  .cover-meta { text-align: right; }
  .cover-meta div { margin-bottom: 2px; }
  .cover-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }

  .strategy-card { border: 2px solid #000; padding: 16px; }
  .badge {
    display: inline-block; background: #000; color: #fff;
    font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
    padding: 2px 6px; margin-bottom: 8px;
  }
  .strategy-name { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
  .strategy-secondary { color: #aaa; font-weight: 400; }
  .strategy-rationale { font-size: 0.72rem; color: #444; line-height: 1.5; margin-bottom: 10px; }
  .reasoning-list { list-style: none; font-size: 0.72rem; display: flex; flex-direction: column; gap: 6px; }
  .reasoning-list li { padding-left: 4px; border-left: 3px solid #000; line-height: 1.4; }

  .scores-panel { border: 1px solid #ccc; padding: 14px; background: #fafafa; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
  .score-row { display: grid; grid-template-columns: 1fr auto; gap: 4px; align-items: center; }
  .score-label { font-size: 0.6rem; font-weight: 700; grid-column: 1 / -1; }
  .bar-container { height: 8px; border: 1px solid #000; padding: 1px; }
  .bar-fill { height: 100%; }
  .score-pct { font-size: 0.65rem; font-family: 'JetBrains Mono', monospace; text-align: right; }
  .score-primary .score-label { color: #000; }
  .score-row:not(.score-primary) { opacity: 0.5; }

  .paradigm-section { margin-bottom: 14px; }
  .paradigm-bar {
    display: flex; justify-content: space-between;
    background: #1a1a1a; color: #fff;
    font-size: 0.72rem; font-weight: 700;
    padding: 5px 10px; margin-bottom: 8px;
  }
  .args-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .args-col { display: flex; flex-direction: column; gap: 5px; }
  .col-header {
    font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
    padding: 4px 8px; margin-bottom: 2px;
  }
  .col-for { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .col-against { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }

  .arg-card { padding: 7px 9px; border-radius: 3px; }
  .arg-for { background: #f0fdf4; border-left: 3px solid #16a34a; }
  .arg-against { background: #fff7ed; border-left: 3px solid #ea580c; }
  .arg-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 4px; margin-bottom: 4px; }
  .arg-title { font-size: 0.7rem; font-weight: 700; line-height: 1.3; }
  .arg-desc { font-size: 0.65rem; color: #444; line-height: 1.4; }
  .impact-badge {
    font-size: 0.55rem; font-weight: 700; text-transform: uppercase;
    padding: 1px 5px; border-radius: 2px; white-space: nowrap; flex-shrink: 0;
  }
  .impact-high { background: #000; color: #fff; }
  .impact-medium { background: #555; color: #fff; }
  .impact-low { background: #bbb; color: #333; }

  .reg-overview { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .risk-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border: 1px solid #000; }
  .risk-critical { background: #fee2e2; border-color: #b91c1c; color: #b91c1c; }
  .risk-high { background: #fff7ed; border-color: #c2410c; color: #c2410c; }
  .risk-medium { background: #fefce8; border-color: #a16207; color: #a16207; }
  .risk-low { background: #f0fdf4; border-color: #166534; color: #166534; }

  .reg-list { display: flex; flex-direction: column; gap: 0; }
  .reg-row { display: grid; grid-template-columns: 100px 1fr; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
  .reg-meta { display: flex; flex-direction: column; gap: 4px; }
  .reg-meta strong { font-size: 0.72rem; }
  .reg-law { color: #888; }
  .reg-impact { font-size: 0.6rem; font-weight: 700; padding: 1px 4px; border: 1px solid currentColor; width: fit-content; }
  .reg-impact-critical { color: #b91c1c; }
  .reg-impact-high { color: #c2410c; }
  .reg-impact-medium { color: #a16207; }
  .reg-impact-low { color: #166534; }
  .reg-body { display: flex; flex-direction: column; gap: 6px; }
  .reg-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .citation-row { display: flex; gap: 8px; align-items: center; }
  .legal-disclaimer {
    margin-top: 12px; border: 1px solid #000; padding: 8px 12px;
    font-size: 0.65rem; background: #fafafa;
  }

  .sust-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .metric-tile { border: 1px solid #ccc; padding: 12px; text-align: left; }
  .metric-val { font-size: 1.6rem; font-weight: 800; line-height: 1; }
  .metric-unit { font-size: 0.65rem; font-weight: 400; }
  .metric-label { font-size: 0.6rem; text-transform: uppercase; color: #888; margin-top: 4px; }
  .sust-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .compare-card { border: 1px solid #ccc; padding: 10px; }
  .green-flags-section { margin-top: 4px; }
  .green-flags-list { list-style: none; font-size: 0.72rem; display: flex; flex-direction: column; gap: 4px; }
  .green-flag { color: #166534; padding-left: 4px; }
  .sust-table { width: 100%; border-collapse: collapse; font-size: 0.7rem; }
  .sust-table th { background: #000; color: #fff; padding: 5px 8px; text-align: left; font-size: 0.65rem; }
  .sust-table td { padding: 5px 8px; border-bottom: 1px solid #eee; }
  .tr-alt td { background: #f7f9f7; }
  .disclaimer-text { font-size: 0.6rem; color: #888; margin-top: 6px; }

  .flag-summary { font-size: 0.72rem; font-weight: 600; margin-bottom: 8px; }
  .flag-summary-critical { color: #b91c1c; }
  .flag-card { margin-bottom: 10px; border-radius: 3px; overflow: hidden; border-left: 4px solid; }
  .flag-critical { border-color: #b91c1c; background: #fef2f2; }
  .flag-high { border-color: #c2410c; background: #fff7ed; }
  .flag-medium { border-color: #a16207; background: #fefce8; }
  .flag-header { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .flag-badges { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }
  .sev-badge { font-size: 0.6rem; font-weight: 700; padding: 2px 6px; color: #fff; border-radius: 2px; }
  .sev-critical { background: #b91c1c; }
  .sev-high { background: #c2410c; }
  .sev-medium { background: #a16207; }
  .cat-badge { font-size: 0.58rem; font-weight: 600; padding: 2px 6px; background: #e5e5e5; color: #555; border-radius: 2px; }
  .flag-title { font-size: 0.78rem; font-weight: 700; }
  .flag-body { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }
  .flag-col { display: flex; flex-direction: column; gap: 4px; }

  .research-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .research-item { border-left: 2px solid #ccc; padding-left: 10px; }
  .research-item strong { font-size: 0.78rem; display: block; margin-bottom: 2px; }
  .author-line { display: block; color: #888; margin-bottom: 4px; }
  .relevance-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 8px; margin-top: 5px; border-radius: 2px; }
  .case-group { margin-bottom: 10px; }
  .case-group-title { font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; }
  .group-success .case-group-title { color: #166534; }
  .group-failure .case-group-title { color: #b91c1c; }
  .case-card { border: 1px solid #ccc; margin-bottom: 8px; border-radius: 3px; overflow: hidden; }
  .case-header { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #fafafa; border-bottom: 1px solid #eee; }
  .case-header strong { font-size: 0.78rem; }
  .outcome-badge { font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 2px; }
  .outcome-success { background: #dcfce7; color: #166534; }
  .outcome-failure { background: #fee2e2; color: #b91c1c; }
  .case-body { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }
  .case-col { display: flex; flex-direction: column; gap: 4px; }

  .section-title { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 8px; }
  .field-label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; color: #888; display: block; margin-bottom: 2px; }
  .steps-list { list-style: none; font-size: 0.65rem; display: flex; flex-direction: column; gap: 3px; padding-left: 0; }
  .steps-list li::before { content: "— "; }
  .step-required { font-weight: 700; color: #b91c1c; }
  .citation-link { color: #166534; }

  @media print {
    body { background: none; }
    .a4-page { box-shadow: none; width: 100%; margin: 0; }
  }
`;

// ─── Main export ──────────────────────────────────────────────────────────────
export function generatePDFReport({
  answers,
  recommendation,
  createdAt,
}: {
  answers: AssessmentAnswers;
  recommendation: RecommendationResult;
  createdAt?: string;
}): void {
  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Build all pages
  const pages: string[] = [];
  pages.push(buildCover(answers, recommendation, dateStr));
  pages.push(buildAnalysis(answers, recommendation));

  const regPage = buildRegulatory(answers, recommendation);
  const sustPage = buildSustainability(answers, recommendation);
  const flagsPage = buildRedFlags(answers, recommendation);
  const resPage = buildResearch(answers, recommendation);

  if (regPage) pages.push(regPage);
  if (sustPage) pages.push(sustPage);
  if (flagsPage) pages.push(flagsPage);
  if (resPage) pages.push(resPage);

  // Fix page numbers now that we know total
  const total = pages.length;
  const html = pages.join('\n').replace(/Page (\d+) of \?/g, (_, n) => `Page ${n} of ${total}`);

  // Inject into hidden iframe and trigger print
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument!;
  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${CSS}</style></head><body>${html}</body></html>`);
  iframeDoc.close();

  // Wait for fonts to load, then print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 800);
  };
}
