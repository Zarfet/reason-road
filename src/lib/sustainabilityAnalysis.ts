/**
 * NEXUS - Sustainability Analysis Generator
 * 
 * Purpose: Calculate environmental impact of paradigm choices
 * 
 * Metrics Tracked:
 * - Hardware lifecycle (years until replacement)
 * - Annual energy consumption (kWh)
 * - CO₂ emissions (kg/year per user)
 * - E-waste generation (kg over lifecycle)
 * - Materials composition (recycled content %)
 * - Repairability score (1-10)
 */

import type { RecommendationResult, ParadigmPercentages } from '@/types/assessment';

export interface ParadigmSustainability {
  paradigm: keyof ParadigmPercentages;
  percentage: number;
  
  // Hardware
  hardwareLifecycle: number;          // Years until replacement
  hardwareExample: string;            // e.g., "Smartphone, laptop"
  
  // Energy
  idlePower: number;                  // Watts in idle/standby
  activePower: number;                // Watts during active use
  annualEnergyKwh: number;           // Total kWh/year per user
  
  // Carbon
  annualCO2Kg: number;                // kg CO₂/year (assumes EU energy mix)
  lifecycleCO2Kg: number;             // Total CO₂ over hardware lifecycle
  
  // Waste
  eWasteKg: number;                   // kg of e-waste at end-of-life
  recyclablePercent: number;          // % of device that's recyclable
  
  // Materials
  recycledContentPercent: number;     // % PCR (Post-Consumer Recycled)
  repairabilityScore: number;         // 1-10 (10 = fully repairable)
}

export interface SustainabilityReport {
  applicable: boolean;
  reason: string;
  
  paradigmBreakdown: ParadigmSustainability[];
  
  // Aggregate metrics
  weightedAnnualEnergy: number;       // kWh/year (weighted by paradigm %)
  weightedAnnualCO2: number;          // kg CO₂/year (weighted)
  weightedLifecycle: number;          // Years (weighted average)
  weightedRepairability: number;      // Score 1-10 (weighted)
  
  // Comparison
  comparisonVsPureScreen: {
    energySavings: string;            // "+15% more efficient" or "-20% worse"
    co2Savings: string;
  };
  comparisonVsPureVR: {
    energySavings: string;
    co2Savings: string;
  };
  
  // Recommendations
  sustainabilityScore: number;        // 0-100 (higher = better)
  recommendations: string[];
  greenFlags: string[];               // What you're doing right
  redFlags: string[];                 // Areas for improvement
}

/**
 * Paradigm sustainability profiles (based on industry research)
 */
const PARADIGM_PROFILES: Record<keyof ParadigmPercentages, Omit<ParadigmSustainability, 'paradigm' | 'percentage'>> = {
  traditional_screen: {
    hardwareLifecycle: 4,             // Smartphones ~3-4 years, laptops ~5 years
    hardwareExample: 'Smartphone, tablet, or laptop',
    idlePower: 3,                      // 3W standby
    activePower: 20,                   // 15-25W average (smartphone to laptop)
    annualEnergyKwh: 50,              // ~50 kWh/year moderate use
    annualCO2Kg: 20,                   // 50 kWh * 0.4 kg CO₂/kWh (EU mix)
    lifecycleCO2Kg: 80,                // 20 kg/year * 4 years
    eWasteKg: 0.5,                     // 500g typical smartphone/tablet
    recyclablePercent: 70,             // 70% of components recyclable
    recycledContentPercent: 25,        // 25% PCR plastics typical
    repairabilityScore: 6              // Moderate (screen, battery replaceable)
  },
  
  invisible: {
    hardwareLifecycle: 7,              // IoT sensors last 5-10 years
    hardwareExample: 'IoT sensors, edge devices',
    idlePower: 0.5,                    // Ultra-low power
    activePower: 2,                    // Minimal active power
    annualEnergyKwh: 10,               // Very efficient
    annualCO2Kg: 4,                    // 10 kWh * 0.4 kg CO₂/kWh
    lifecycleCO2Kg: 28,                // 4 kg/year * 7 years
    eWasteKg: 0.1,                     // Small sensors
    recyclablePercent: 80,             // High recyclability
    recycledContentPercent: 40,        // Good PCR content
    repairabilityScore: 4              // Low (often sealed units)
  },
  
  ai_vectorial: {
    hardwareLifecycle: 3,              // Cloud-dependent, client hardware shorter
    hardwareExample: 'Laptop/tablet + cloud GPU infrastructure',
    idlePower: 3,                      // Client device
    activePower: 50,                   // Client + cloud GPU amortized
    annualEnergyKwh: 120,              // High due to cloud computing
    annualCO2Kg: 48,                   // 120 kWh * 0.4 kg CO₂/kWh
    lifecycleCO2Kg: 144,               // 48 kg/year * 3 years
    eWasteKg: 0.6,                     // Client device + share of server waste
    recyclablePercent: 65,             // Lower (complex electronics)
    recycledContentPercent: 20,        // Lower PCR in high-performance chips
    repairabilityScore: 5              // Moderate
  },
  
  spatial: {
    hardwareLifecycle: 3,              // VR headsets 2-4 years (rapid obsolescence)
    hardwareExample: 'VR headset (Meta Quest, Vision Pro)',
    idlePower: 5,                      // Standby
    activePower: 100,                  // High (displays, tracking, rendering)
    annualEnergyKwh: 200,              // Very high
    annualCO2Kg: 80,                   // 200 kWh * 0.4 kg CO₂/kWh
    lifecycleCO2Kg: 240,               // 80 kg/year * 3 years
    eWasteKg: 1.5,                     // Heavy device (500g headset + controllers)
    recyclablePercent: 50,             // Low (complex optics, batteries)
    recycledContentPercent: 10,        // Very low (cutting-edge materials)
    repairabilityScore: 2              // Very low (proprietary, sealed)
  },
  
  voice: {
    hardwareLifecycle: 6,              // Smart speakers ~5-7 years
    hardwareExample: 'Smart speaker, headset with mic',
    idlePower: 2,                      // Always listening (low power)
    activePower: 8,                    // Processing + speaker
    annualEnergyKwh: 25,               // Efficient
    annualCO2Kg: 10,                   // 25 kWh * 0.4 kg CO₂/kWh
    lifecycleCO2Kg: 60,                // 10 kg/year * 6 years
    eWasteKg: 0.3,                     // Small device
    recyclablePercent: 75,             // Good
    recycledContentPercent: 35,        // Good PCR content
    repairabilityScore: 5              // Moderate
  }
};

/**
 * Generate sustainability report from paradigm percentages
 */
export function generateSustainabilityReport(
  recommendation: RecommendationResult,
  valuesRanking: string[],
  geography?: string
): SustainabilityReport {
  // Check if applicable
  const sustainabilityRank = valuesRanking.indexOf('Sustainability');
  const isTopThree = sustainabilityRank >= 0 && sustainabilityRank <= 2;
  const hasHighSpatial = (recommendation.allScores.spatial || 0) > 10;
  const isEuDeployment = geography === 'Primarily Europe' || geography === 'Global';
  
  if (!isTopThree && !hasHighSpatial && !isEuDeployment) {
    return {
      applicable: false,
      reason: 'Sustainability not in top 3 values',
      paradigmBreakdown: [],
      weightedAnnualEnergy: 0,
      weightedAnnualCO2: 0,
      weightedLifecycle: 0,
      weightedRepairability: 0,
      comparisonVsPureScreen: { energySavings: '', co2Savings: '' },
      comparisonVsPureVR: { energySavings: '', co2Savings: '' },
      sustainabilityScore: 0,
      recommendations: [],
      greenFlags: [],
      redFlags: []
    };
  }
  
  // Build paradigm breakdown
  const paradigmBreakdown: ParadigmSustainability[] = (Object.entries(recommendation.allScores) as Array<[keyof ParadigmPercentages, number]>)
    .filter(([_, percentage]) => percentage > 0)
    .map(([paradigm, percentage]) => ({
      paradigm,
      percentage,
      ...PARADIGM_PROFILES[paradigm]
    }));
  
  // Calculate weighted metrics
  const weightedAnnualEnergy = paradigmBreakdown.reduce((sum, p) => 
    sum + (p.annualEnergyKwh * p.percentage / 100), 0
  );
  
  const weightedAnnualCO2 = paradigmBreakdown.reduce((sum, p) => 
    sum + (p.annualCO2Kg * p.percentage / 100), 0
  );
  
  const weightedLifecycle = paradigmBreakdown.reduce((sum, p) => 
    sum + (p.hardwareLifecycle * p.percentage / 100), 0
  );
  
  const weightedRepairability = paradigmBreakdown.reduce((sum, p) => 
    sum + (p.repairabilityScore * p.percentage / 100), 0
  );
  
  // Comparisons
  const pureScreenEnergy = PARADIGM_PROFILES.traditional_screen.annualEnergyKwh;
  const pureScreenCO2 = PARADIGM_PROFILES.traditional_screen.annualCO2Kg;
  const pureVREnergy = PARADIGM_PROFILES.spatial.annualEnergyKwh;
  const pureVRCO2 = PARADIGM_PROFILES.spatial.annualCO2Kg;
  
  const energyVsScreen = ((weightedAnnualEnergy - pureScreenEnergy) / pureScreenEnergy * 100);
  const co2VsScreen = ((weightedAnnualCO2 - pureScreenCO2) / pureScreenCO2 * 100);
  const energyVsVR = ((pureVREnergy - weightedAnnualEnergy) / pureVREnergy * 100);
  const co2VsVR = ((pureVRCO2 - weightedAnnualCO2) / pureVRCO2 * 100);
  
  const comparisonVsPureScreen = {
    energySavings: energyVsScreen < 0 ? 
      `${Math.abs(Math.round(energyVsScreen))}% more efficient` : 
      `${Math.round(energyVsScreen)}% higher consumption`,
    co2Savings: co2VsScreen < 0 ? 
      `${Math.abs(Math.round(co2VsScreen))}% lower emissions` : 
      `${Math.round(co2VsScreen)}% higher emissions`
  };
  
  const comparisonVsPureVR = {
    energySavings: `${Math.round(energyVsVR)}% more efficient`,
    co2Savings: `${Math.round(co2VsVR)}% lower emissions`
  };
  
  // Calculate sustainability score (0-100)
  const energyScore = Math.max(0, 100 - (weightedAnnualEnergy / 2)); // 0 kWh = 100, 200 kWh = 0
  const lifecycleScore = (weightedLifecycle / 10) * 100;              // 10 years = 100
  const repairabilityScore = weightedRepairability * 10;              // 10/10 = 100
  const sustainabilityScore = Math.round(
    (energyScore * 0.4) + (lifecycleScore * 0.3) + (repairabilityScore * 0.3)
  );
  
  // Generate recommendations
  const recommendations: string[] = [];
  const greenFlags: string[] = [];
  const redFlags: string[] = [];
  
  if (weightedAnnualCO2 < 30) {
    greenFlags.push('✅ Low carbon footprint (<30 kg CO₂/year per user)');
  } else if (weightedAnnualCO2 > 60) {
    redFlags.push('⚠️ High carbon footprint (>60 kg CO₂/year). Consider reducing screen time or VR usage.');
  }
  
  if (weightedLifecycle > 5) {
    greenFlags.push('✅ Long hardware lifecycle reduces e-waste');
  } else if (weightedLifecycle < 4) {
    redFlags.push('⚠️ Short hardware lifecycle (<4 years). Budget for frequent replacements.');
  }
  
  if (weightedRepairability > 6) {
    greenFlags.push('✅ High repairability score extends device lifespan');
  } else if (weightedRepairability < 4) {
    redFlags.push('⚠️ Low repairability. Devices difficult to repair, increasing e-waste.');
  }
  
  // Specific recommendations
  if (recommendation.allScores.spatial > 15) {
    recommendations.push('Consider reducing VR usage to <10% to significantly lower environmental impact');
  }
  
  if (recommendation.allScores.invisible > 20) {
    recommendations.push('Edge processing with low-power IoT sensors is excellent for sustainability');
  }
  
  if (recommendation.allScores.ai_vectorial > 20) {
    recommendations.push('Use green cloud providers (AWS us-west-2 Oregon, Google Belgium) for lower carbon');
  }
  
  if (weightedAnnualEnergy > 100) {
    recommendations.push('Implement power-saving modes: dim screens, sleep after 5 min idle, disable background sync');
  }
  
  recommendations.push('Choose devices with high recycled content (>30% PCR plastics)');
  recommendations.push('Implement device trade-in/recycling program at end-of-life');
  
  if (sustainabilityRank === 0) {
    recommendations.push('As Sustainability is your #1 value, aim for <20 kg CO₂/year per user');
  }
  
  return {
    applicable: true,
    reason: isTopThree ? 
      `Sustainability ranked #${sustainabilityRank + 1} in your values` : 
      isEuDeployment ? 'EU Green Deal compliance recommended' : 'High environmental impact detected',
    paradigmBreakdown,
    weightedAnnualEnergy,
    weightedAnnualCO2,
    weightedLifecycle,
    weightedRepairability,
    comparisonVsPureScreen,
    comparisonVsPureVR,
    sustainabilityScore,
    recommendations,
    greenFlags,
    redFlags
  };
}
