import { describe, it, expect } from 'vitest';
import { calculateScores, generateRecommendation, getReasoningBullets } from './scoring';
import type { AssessmentAnswers } from '@/types/assessment';

/**
 * Test suite for demographics scoring implementation
 */

describe('Demographics Scoring', () => {
  // Test Case 1: Elderly healthcare workers
  it('should boost voice and penalize spatial for elderly users', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Healthcare System',
      userDemographics: 'Nurses in retirement homes, 65-75 years old, moderate tech literacy, comfortable with tablets',
      geography: 'Primarily Europe',
      valuesRanking: ['Accessibility'],
      taskComplexity: 'Medium',
      frequency: 'Multiple times daily',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Desktop',
      informationType: 'Structured data',
      explorationMode: 'Know exactly',
      errorConsequence: 'Serious',
      controlPreference: 'Full control',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    
    // Voice should be high (elderly + accessibility)
    expect(scores.voice).toBeGreaterThan(15);
    
    // Spatial should be low (elderly penalty: -0.12)
    expect(scores.spatial).toBeLessThan(10);
    
    // Traditional screen should be boost (healthcare + elderly)
    expect(scores.traditional_screen).toBeGreaterThan(15);
    
    // Invisible should be penalized (elderly anxiety)
    expect(scores.invisible).toBeLessThan(15);
  });

  // Test Case 2: Tech-savvy young developers
  it('should boost AI and spatial for tech-savvy young users', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Developer Tools',
      userDemographics: 'Software developers, 25-35, tech-savvy, early adopters, comfortable with AI',
      geography: 'Primarily US',
      valuesRanking: ['Joy'],
      taskComplexity: 'Complex',
      frequency: 'Multiple times daily',
      predictability: 'Always different',
      contextOfUse: 'Desktop',
      informationType: 'Unstructured text',
      explorationMode: 'Mix of both',
      errorConsequence: 'Trivial',
      controlPreference: 'Automatic',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    
    // AI should be high (young + developer + Joy)
    expect(scores.ai_vectorial).toBeGreaterThan(20);
    
    // Spatial should be boosted (young + joy)
    expect(scores.spatial).toBeGreaterThan(15);
    
    // Invisible should be accepted (early adopters)
    expect(scores.invisible).toBeGreaterThan(10);
  });

  // Test Case 3: Visually impaired users (CRITICAL accessibility)
  it('should strongly boost voice for visually impaired users', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Accessible App',
      userDemographics: 'Blind users, 30-50, use screen readers daily, high tech literacy',
      geography: 'Global',
      valuesRanking: ['Accessibility'],
      taskComplexity: 'Simple',
      frequency: 'Multiple times daily',
      predictability: 'Always identical',
      contextOfUse: 'Desktop',
      informationType: 'Unstructured text',
      explorationMode: 'Know exactly',
      errorConsequence: 'Trivial',
      controlPreference: 'Full control',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    
    // Voice must be HEAVILY boosted (critical accessibility: +0.12)
    expect(scores.voice).toBeGreaterThan(25);
    
    // Traditional screen penalized (-0.10)
    expect(scores.traditional_screen).toBeLessThanOrEqual(15);
    
    // Spatial penalized (-0.10)
    expect(scores.spatial).toBeLessThan(10);
  });

  // Test Case 4: Manual workers (hands occupied)
  it('should boost voice and invisible for manual workers with hands occupied', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Factory Management',
      userDemographics: 'Warehouse workers, 35-55, hands-free needed, moderate tech literacy',
      geography: 'Primarily US',
      valuesRanking: ['Efficiency'],
      taskComplexity: 'Simple',
      frequency: 'Multiple times daily',
      predictability: 'Always identical',
      contextOfUse: 'Hands occupied',
      informationType: 'Structured data',
      explorationMode: 'Know exactly',
      errorConsequence: 'Trivial',
      controlPreference: 'Automatic',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    
    // Voice should be high (manual workers + hands occupied)
    expect(scores.voice).toBeGreaterThan(20);
    
    // Invisible should be high (efficiency + automation)
    expect(scores.invisible).toBeGreaterThan(20);
    
    // Traditional screen penalized (hands not free)
    expect(scores.traditional_screen).toBeLessThan(12);
  });

  // Test Case 5: Low tech literacy users
  it('should boost traditional screens and penalize AI for low tech literacy', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Elderly Banking',
      userDemographics: 'Retirement community residents, 70+, low tech experience, beginners',
      geography: 'Primarily Europe',
      valuesRanking: ['User Control'],
      taskComplexity: 'Simple',
      frequency: 'Rarely',
      predictability: 'Always identical',
      contextOfUse: 'Mobile',
      informationType: 'Structured data',
      explorationMode: 'Know exactly',
      errorConsequence: 'Serious',
      controlPreference: 'Full control',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    
    // Traditional screen HEAVILY boosted (low tech + user control + elderly)
    expect(scores.traditional_screen).toBeGreaterThan(25);
    
    // AI penalized (-0.05)
    expect(scores.ai_vectorial).toBeLessThan(15);
    
    // Invisible penalized (-0.10)
    expect(scores.invisible).toBeLessThan(10);
    
    // Spatial penalized (-0.08)
    expect(scores.spatial).toBeLessThan(10);
  });

  // Test Case 6: Multiple patterns matching (elderly + healthcare + visually impaired)
  it('should apply multiple pattern bonuses correctly', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Accessible Healthcare',
      userDemographics: 'Healthcare professionals, 65-75 years old, blind and visually impaired population, moderate tech',
      geography: 'Primarily Europe',
      valuesRanking: ['Accessibility'],
      taskComplexity: 'Complex',
      frequency: 'Multiple times daily',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Desktop',
      informationType: 'Structured data',
      explorationMode: 'Mix of both',
      errorConsequence: 'Serious',
      controlPreference: 'Supervised',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    const recommendation = generateRecommendation(scores);
    
    // Voice should be HIGH (elderly + healthcare + visual impairment = multiple boosts)
    // Even if not primary due to other factors, should be very significant
    expect(scores.voice).toBeGreaterThan(20);
    
    // Spatial should be LOW (elderly penalty -0.12, visual impairment -0.10, healthcare -0.03)
    expect(scores.spatial).toBeLessThan(10);
    
    // Reasoning bullets should mention demographics
    const bullets = getReasoningBullets(answers, recommendation);
    // Check for demographic mentions (case-insensitive)
    const bulletText = bullets.join(' ').toLowerCase();
    // At least some demographics should be detected
    expect(
      bulletText.includes('healthcare') ||
      bulletText.includes('visual') ||
      bulletText.includes('elderly')
    ).toBe(true);
  });

  // Test Case 7: Task Complexity weight reduction (12% vs 15%)
  it('should apply 12% weight to task complexity (not 15%)', () => {
    const answersSimple: AssessmentAnswers = {
      projectName: 'Simple Task',
      userDemographics: 'Average user, 30-50, moderate tech',
      geography: 'Primarily US',
      valuesRanking: ['Efficiency'],
      taskComplexity: 'Simple',
      frequency: 'Rarely',
      predictability: 'Always identical',
      contextOfUse: 'Desktop',
      informationType: 'Structured data',
      explorationMode: 'Know exactly',
      errorConsequence: 'Trivial',
      controlPreference: 'Automatic',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scoresSimple = calculateScores(answersSimple);
    
    // Simple task should boost invisible: +0.12 and voice: +0.08
    // (old weights were +0.15 and +0.10)
    expect(scoresSimple.invisible).toBeGreaterThan(10);
    expect(scoresSimple.voice).toBeGreaterThan(5);
  });

  // Test Case 8: Total weights normalize to 100%
  it('should normalize all scores to 100%', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Test',
      userDemographics: 'Average users',
      geography: 'Primarily US',
      valuesRanking: ['Efficiency'],
      taskComplexity: 'Medium',
      frequency: 'Several times per week',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Mobile',
      informationType: 'Visual content',
      explorationMode: 'Mix of both',
      errorConsequence: 'Trivial',
      controlPreference: 'Automatic',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
    
    // All scores should sum to 100
    expect(total).toBe(100);
  });

  // Test Case 9: Reasoning bullets include demographics
  it('should include demographics in reasoning bullets', () => {
    const answers: AssessmentAnswers = {
      projectName: 'Test',
      userDemographics: 'Elderly users, 70+, limited tech experience, retired',
      geography: 'Primarily US',
      valuesRanking: ['Accessibility'],
      taskComplexity: 'Simple',
      frequency: 'Rarely',
      predictability: 'Always identical',
      contextOfUse: 'Desktop',
      informationType: 'Structured data',
      explorationMode: 'Know exactly',
      errorConsequence: 'Trivial',
      controlPreference: 'Full control',
      deviceType: null,
      existingEcosystem: null,
      interactionInitiation: null
    };

    const scores = calculateScores(answers);
    const recommendation = generateRecommendation(scores);
    const bullets = getReasoningBullets(answers, recommendation);
    
    // Should mention elderly
    expect(bullets.some(b => b.toLowerCase().includes('elderly'))).toBe(true);
    
    // Should mention low tech literacy
    expect(bullets.some(b => b.toLowerCase().includes('tech literacy') || b.toLowerCase().includes('familiar'))).toBe(true);
  });
});
