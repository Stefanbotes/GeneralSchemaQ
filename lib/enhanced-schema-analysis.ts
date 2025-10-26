

// Enhanced Schema Analysis System
// Implements sophisticated clinical and Inner Personaanalysis based on uploaded protocols

import { getPersonaDetails, ENHANCED_PERSONA_MAPPING, PersonaDetails } from '../data/enhanced-persona-mapping';

export interface EnhancedSchemaActivation {
  schemaName: string;
  clinicalName: string;
  publicName: string;
  domain: string;
  activationLevel: number;
  severity: 'Low' | 'Moderate' | 'Moderate-High' | 'High';
  questions: string[];
  responses: number[];
  behavioralMarkers: string[];
  cognitivePatterns: string[];
  emotionalRegulation: string[];
  clinicalSignificance: string;
  functionalImpact: string;
}

export interface EnhancedPersonaActivation {
  personaName: string;
  publicName: string;
  clinicalName: string;
  activationLevel: number;
  rank: number;
  strengthFocus: string;
  developmentEdge: string;
  domain: string;
  behavioralMarkers: string[];
  integrationPatterns: string[];
  adaptiveSignificance: 'High' | 'Moderate' | 'Low';
}

export interface EnhancedThreeTierAnalysis {
  tier1: {
    summary: string;
    keyStrengths: string[];
    growthAreas: string[];
  };
  tier2: {
    primaryPersona: EnhancedPersonaActivation;
    supportingPersonas: EnhancedPersonaActivation[];
    leadershipPattern: string;
    detailedAnalysis: string;
    complexPatternAnalysis: string;
    integrationDynamics: string;
    actionPlan: {
      immediate: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
    synergies: string[];
    leadershipImpact: string[];
  };
  tier3: {
    primarySchema: EnhancedSchemaActivation;
    secondarySchemas: EnhancedSchemaActivation[];
    clinicalFormulation: string;
    schemaInteractionDynamics: string;
    neurobiologicalConsiderations: string;
    behaviorPredictionModel: {
      highPerformanceContexts: string[];
      challengeAreas: string[];
      stressResponsePatterns: string;
    };
    riskAssessment: {
      highRisk: string[];
      protectiveFactors: string[];
      interventionPriorities: string[];
    };
    clinicalRecommendations: {
      immediate: string[];
      intermediate: string[];
      longTerm: string[];
      therapyModality: string;
      supervisionRequirements: string[];
    };
  };
}

// Persona Question Mapping (18 personas across 5 domains)
export const ENHANCED_PERSONA_MAPPING_QUESTIONS = {
  // Disconnection & Rejection Domain  
  "The Clinger": ['1.1.1', '1.1.2', '1.1.3'],
  "The Invisible Operator": ['1.2.1', '1.2.2', '1.2.3'], 
  "The Withholder": ['1.3.1', '1.3.2', '1.3.3'],
  "The Guarded Strategist": ['1.4.1', '1.4.2', '1.4.3'],
  "The Outsider": ['1.5.1', '1.5.2', '1.5.3'],
  
  // Impaired Autonomy & Performance Domain
  "The Self-Doubter": ['2.1.1', '2.1.2', '2.1.3'],
  "The Reluctant Rely-er": ['2.2.1', '2.2.2', '2.2.3'],
  "The Safety Strategist": ['2.3.1', '2.3.2', '2.3.3'],
  
  // Impaired Limits Domain
  "The Overgiver": ['3.1.1', '3.1.2', '3.1.3'],
  "The Over-Adapter": ['3.2.1', '3.2.2', '3.2.3'],
  
  // Other-Directedness Domain
  "The Suppressed Voice": ['4.1.1', '4.1.2', '4.1.3'],
  "The Image Manager": ['4.2.1', '4.2.2', '4.2.3'],
  "The Power Broker": ['4.3.1', '4.3.2', '4.3.3'],
  
  // Overvigilance & Inhibition Domain
  "The Cautious Realist": ['5.1.1', '5.1.2', '5.1.3'],
  "The Stoic Mask": ['5.2.1', '5.2.2', '5.2.3'],
  "The Perfectionist Driver": ['5.3.1', '5.3.2', '5.3.3'],
  "The Harsh Enforcer": ['5.4.1', '5.4.2', '5.4.3'],
  "The Unfiltered Reactor": ['5.5.1', '5.5.2', '5.5.3']
};

// Enhanced Schema Calculation with Clinical Significance
export function calculateEnhancedSchemaActivations(responses: Record<string, string>): EnhancedSchemaActivation[] {
  const activations: EnhancedSchemaActivation[] = [];

  Object.entries(ENHANCED_PERSONA_MAPPING_QUESTIONS).forEach(([personaName, questionIds]) => {
    const relevantResponses = questionIds
      .map(id => responses[id])
      .filter(response => response !== undefined)
      .map(response => parseInt(response));

    if (relevantResponses.length > 0) {
      const averageScore = relevantResponses.reduce((sum, score) => sum + score, 0) / relevantResponses.length;
      const activationLevel = (averageScore / 6) * 100;

      let severity: 'Low' | 'Moderate' | 'Moderate-High' | 'High';
      if (activationLevel >= 75) severity = 'High';
      else if (activationLevel >= 65) severity = 'Moderate-High';
      else if (activationLevel >= 50) severity = 'Moderate';
      else severity = 'Low';

      const personaDetails = getPersonaDetails(personaName);

      activations.push({
        schemaName: personaName,
        clinicalName: personaDetails?.clinicalName || personaName,
        publicName: personaDetails?.publicName || personaName,
        domain: personaDetails?.domain || 'Inner PersonaPatterns',
        activationLevel: Math.round(activationLevel * 10) / 10,
        severity,
        questions: questionIds,
        responses: relevantResponses,
        behavioralMarkers: personaDetails?.behaviors?.behavioral_markers || [],
        cognitivePatterns: personaDetails?.behaviors?.cognitive_patterns || [],
        emotionalRegulation: personaDetails?.behaviors?.emotional_regulation || [],
        clinicalSignificance: generateClinicalSignificance(personaName, activationLevel, severity),
        functionalImpact: generateFunctionalImpact(personaName, activationLevel)
      });
    }
  });

  return activations.sort((a, b) => b.activationLevel - a.activationLevel);
}

// Enhanced Persona Activation Calculation
export function calculateEnhancedPersonaActivations(responses: Record<string, string>): EnhancedPersonaActivation[] {
  const activations: EnhancedPersonaActivation[] = [];

  Object.entries(ENHANCED_PERSONA_MAPPING_QUESTIONS).forEach(([personaName, questionIds]) => {
    const relevantResponses = questionIds
      .map(id => responses[id])
      .filter(response => response !== undefined)
      .map(response => parseInt(response));

    if (relevantResponses.length > 0) {
      const averageScore = relevantResponses.reduce((sum, score) => sum + score, 0) / relevantResponses.length;
      const activationLevel = (averageScore / 6) * 100;

      const personaDetails = getPersonaDetails(personaName);
      
      let adaptiveSignificance: 'High' | 'Moderate' | 'Low';
      if (activationLevel >= 70) adaptiveSignificance = 'High';
      else if (activationLevel >= 55) adaptiveSignificance = 'Moderate'; 
      else adaptiveSignificance = 'Low';

      activations.push({
        personaName,
        publicName: personaDetails?.publicName || personaName,
        clinicalName: personaDetails?.clinicalName || personaName,
        activationLevel: Math.round(activationLevel * 10) / 10,
        rank: 0, // Will be set after sorting
        strengthFocus: personaDetails?.strengthFocus || 'Inner PersonaQualities',
        developmentEdge: personaDetails?.developmentEdge || 'Continue developing skills',
        domain: personaDetails?.domain || 'Inner PersonaPatterns',
        behavioralMarkers: personaDetails?.behaviors?.behavioral_markers || [],
        integrationPatterns: personaDetails?.integration_patterns?.with_high_scores || [],
        adaptiveSignificance
      });
    }
  });

  // Sort and rank
  const sortedActivations = activations.sort((a, b) => b.activationLevel - a.activationLevel);
  sortedActivations.forEach((activation, index) => {
    activation.rank = index + 1;
  });

  return sortedActivations;
}

// Generate clinical significance assessment
function generateClinicalSignificance(personaName: string, activationLevel: number, severity: string): string {
  const details = getPersonaDetails(personaName);
  
  if (activationLevel >= 75) {
    return `${severity} clinical significance requiring immediate attention. This pattern strongly influences Inner Personabehavior and interpersonal effectiveness.`;
  } else if (activationLevel >= 65) {
    return `${severity} clinical significance with notable impact on workplace functioning. Therapeutic intervention recommended.`;
  } else if (activationLevel >= 50) {
    return `${severity} clinical significance. Monitor for escalation and consider preventive intervention.`;
  } else {
    return `${severity} clinical significance. Minimal intervention required, focus on strengths enhancement.`;
  }
}

// Generate functional impact assessment  
function generateFunctionalImpact(personaName: string, activationLevel: number): string {
  const details = getPersonaDetails(personaName);
  
  if (activationLevel >= 70) {
    return `Significant impact on Inner Personaeffectiveness and team dynamics. Primary driver of Inner Personabehavior patterns.`;
  } else if (activationLevel >= 60) {
    return `Moderate impact on workplace functioning. Contributes to Inner Personastyle complexity and effectiveness.`;
  } else {
    return `Minimal functional impact. May provide supporting influence on Inner Personaapproach.`;
  }
}

// Generate sophisticated clinical formulation
function generateEnhancedClinicalFormulation(primary: EnhancedSchemaActivation, secondary: EnhancedSchemaActivation[]): string {
  const primaryPattern = primary.clinicalName;
  const secondaryPatterns = secondary.slice(0, 3).map(s => s.clinicalName).join(', ');
  
  return `The participant presents with a <strong>${generateComplexConfigurationName(primary, secondary)}</strong> characterized by:
  
1. <strong>Primary ${primaryPattern} Drive:</strong> ${primary.severity} need for ${primary.domain.toLowerCase()} through ${primaryPattern.toLowerCase()} behaviors
${secondary.slice(0, 3).map((schema, index) => 
  `${index + 2}. <strong>${schema.clinicalName}-Mediated ${schema.domain.split(' ')[0]}:</strong> Uses ${schema.clinicalName.toLowerCase()} as ${schema.severity.toLowerCase()} coping mechanism`
).join('\n')}

<strong>Schema Interaction Dynamics:</strong><br>
The high ${primaryPattern.toLowerCase()} appears to serve multiple schema-driven functions:
${secondary.slice(0, 3).map(schema => 
  `- <strong>${schema.domain.split(' ')[0]} mechanism</strong> for ${schema.clinicalName.toLowerCase()} concerns`
).join('<br>')}
- <strong>Emotional outlet</strong> for suppressed feelings and reactions
- <strong>Control mechanism</strong> for anticipated relationship and performance challenges`;
}

// Generate complex configuration name
function generateComplexConfigurationName(primary: EnhancedSchemaActivation, secondary: EnhancedSchemaActivation[]): string {
  const primaryType = primary.clinicalName.split('/')[0] || primary.clinicalName;
  
  if (secondary.length === 0) {
    return `Focused ${primaryType} Configuration`;
  }
  
  const dominantDomains = [primary.domain, ...secondary.slice(0, 2).map(s => s.domain)]
    .map(domain => domain.split(' ')[0])
    .filter((domain, index, arr) => arr.indexOf(domain) === index);
    
  if (dominantDomains.length >= 3) {
    return `Complex Multi-Domain Configuration`;
  } else if (dominantDomains.length === 2) {
    return `${dominantDomains[0]}-${dominantDomains[1]} Integration Configuration`;
  } else {
    return `Rigid ${primaryType} Configuration`;
  }
}

// Generate behavioral prediction model
function generateBehaviorPredictionModel(primary: EnhancedSchemaActivation, secondary: EnhancedSchemaActivation[]): any {
  const primaryDetails = getPersonaDetails(primary.schemaName);
  
  return {
    highPerformanceContexts: [
      `Structured environments that leverage ${primary.clinicalName.toLowerCase()} strengths`,
      `Teams that appreciate and respond well to ${primary.domain.toLowerCase()} leadership`,
      `Organizations with clear performance standards and accountability systems`,
      `Projects requiring ${primaryDetails?.strengthFocus?.toLowerCase() || 'focused leadership'}`,
      `Situations where ${primary.clinicalName.toLowerCase()} provides adaptive advantage`,
      `Contexts that reward ${primaryDetails?.strengthFocus?.toLowerCase() || 'distinctive Inner Personaqualities'}`
    ],
    challengeAreas: [
      `Ambiguous or highly collaborative decision-making environments`,
      `Teams requiring high psychological safety for innovation`,
      `Situations requiring significant flexibility or adaptation`,
      `Contexts that challenge ${primary.domain.toLowerCase()} comfort zones`,
      `Environments that penalize ${primary.clinicalName.toLowerCase()} responses`
    ],
    stressResponsePatterns: `Under stress: Increased ${primary.clinicalName.toLowerCase()} activation with potential escalation of ${secondary.slice(0,2).map(s => s.clinicalName.toLowerCase()).join(' and ')} patterns. Recovery mechanisms include ${primaryDetails?.strengthFocus?.toLowerCase() || 'focused activity'} and structured problem-solving approaches.`
  };
}

// Generate neurobiological considerations
function generateNeurobiologicalConsiderations(primary: EnhancedSchemaActivation, secondary: EnhancedSchemaActivation[]): string {
  return `
<strong>Communication Patterns:</strong>
- Prefrontal cortex engagement: ${primary.activationLevel >= 70 ? 'MODERATE' : 'HIGH'} (${primary.activationLevel >= 70 ? 'schema activation may limit executive function' : 'maintained executive control'})
- Amygdala regulation: ${primary.severity === 'High' ? 'CHALLENGED' : 'ADAPTIVE'} (${primary.severity === 'High' ? 'heightened threat detection in Inner Personacontexts' : 'appropriate emotional regulation'})
- Mirror neuron activity: ${secondary.some(s => s.domain.includes('Rejection')) ? 'MODERATE' : 'HIGH'} (${secondary.some(s => s.domain.includes('Rejection')) ? 'reduced empathic attunement' : 'maintained social cognition'})

<strong>Influence Mechanisms:</strong>
- Reward system activation: ${primary.activationLevel >= 65 ? 'Schema-mediated reward patterns' : 'Adaptive reward processing'}
- Social cognition networks: ${primary.domain.includes('Other-Directedness') ? 'Hyperactive social monitoring' : 'Balanced social processing'}
- Executive function: ${primary.severity === 'High' ? 'May be compromised under schema activation' : 'Generally maintained with adaptive capacity'}`;
}

// Enhanced Three-Tier Analysis Generation
export function generateEnhancedThreeTierAnalysis(responses: Record<string, string>, participantData: any): EnhancedThreeTierAnalysis {
  const schemaActivations = calculateEnhancedSchemaActivations(responses);
  const personaActivations = calculateEnhancedPersonaActivations(responses);

  const primarySchema = schemaActivations[0];
  const primaryPersona = personaActivations[0];
  const secondarySchemas = schemaActivations.slice(1).filter(s => s.activationLevel >= 50);
  const supportingPersonas = personaActivations.slice(1).filter(p => p.activationLevel >= 60);
  
  return {
    tier1: generateEnhancedTier1Analysis(primaryPersona, personaActivations.slice(0, 3)),
    tier2: generateEnhancedTier2Analysis(primaryPersona, supportingPersonas, participantData),
    tier3: generateEnhancedTier3Analysis(primarySchema, secondarySchemas, participantData)
  };
}

// Enhanced Tier 1 Analysis
function generateEnhancedTier1Analysis(primaryPersona: EnhancedPersonaActivation, topPersonas: EnhancedPersonaActivation[]) {
  const strengthsList = topPersonas.map(p => p.strengthFocus.toLowerCase()).slice(0, 3).join(', ');
  const organizationalContribution = generateOrganizationalContribution(primaryPersona, topPersonas);
  
  return {
    summary: `Your Inner Personastyle demonstrates strong ${primaryPersona.strengthFocus.toLowerCase()} with ${primaryPersona.activationLevel.toFixed(1)}% alignment to ${primaryPersona.publicName} patterns. You bring valuable combination of ${strengthsList} that creates distinctive organizational impact. ${organizationalContribution}`,
    keyStrengths: topPersonas.slice(0, 4).map(p => p.strengthFocus),
    growthAreas: topPersonas.slice(0, 3).map(p => generateGrowthArea(p))
  };
}

// Enhanced Tier 2 Analysis
function generateEnhancedTier2Analysis(primaryPersona: EnhancedPersonaActivation, supportingPersonas: EnhancedPersonaActivation[], participantData: any) {
  const leadershipPattern = generateSophisticatedLeadershipPattern(primaryPersona, supportingPersonas);
  const complexAnalysis = generateComplexPatternAnalysis(primaryPersona, supportingPersonas);
  
  return {
    primaryPersona,
    supportingPersonas,
    leadershipPattern,
    detailedAnalysis: generateDetailedPersonaAnalysis(primaryPersona, supportingPersonas),
    complexPatternAnalysis: complexAnalysis,
    integrationDynamics: generateIntegrationDynamics(primaryPersona, supportingPersonas),
    actionPlan: generateEnhancedActionPlan(primaryPersona, supportingPersonas),
    synergies: generatePowerfulSynergies(primaryPersona, supportingPersonas),
    leadershipImpact: generateLeadershipImpact(primaryPersona, supportingPersonas)
  };
}

// Generate detailed persona analysis
function generateDetailedPersonaAnalysis(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): string {
  const primaryDetails = getPersonaDetails(primary.personaName);
  
  if (!primaryDetails) {
    return `As ${primary.publicName} (${primary.activationLevel}% activation), your Inner Personademonstrates ${primary.strengthFocus.toLowerCase()} that creates value for your organization and teams.`;
  }
  
  const supportingText = supporting.length > 0 
    ? ` Your supporting personas (${supporting.slice(0, 3).map(p => p.publicName).join(', ')}) add complexity and depth to your Inner Personastyle, creating unique synergies and development opportunities.`
    : '';
  
  return `${primaryDetails.publicDescription} This ${primary.strengthFocus.toLowerCase()} orientation, at ${primary.activationLevel}% activation, creates a distinctive Inner Personaapproach that emphasizes ${primary.strengthFocus.toLowerCase()} while maintaining focus on organizational success.${supportingText}`;
}

// Enhanced Tier 3 Analysis
function generateEnhancedTier3Analysis(primarySchema: EnhancedSchemaActivation, secondarySchemas: EnhancedSchemaActivation[], participantData: any) {
  return {
    primarySchema,
    secondarySchemas,
    clinicalFormulation: generateEnhancedClinicalFormulation(primarySchema, secondarySchemas),
    schemaInteractionDynamics: generateSchemaInteractionDynamics(primarySchema, secondarySchemas),
    neurobiologicalConsiderations: generateNeurobiologicalConsiderations(primarySchema, secondarySchemas),
    behaviorPredictionModel: generateBehaviorPredictionModel(primarySchema, secondarySchemas),
    riskAssessment: generateEnhancedRiskAssessment(primarySchema, secondarySchemas),
    clinicalRecommendations: generateEnhancedClinicalRecommendations(primarySchema, secondarySchemas)
  };
}

// Helper functions for sophisticated content generation
function generateSophisticatedLeadershipPattern(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): string {
  const primaryType = primary.publicName.replace('The ', '');
  
  if (supporting.length === 0) {
    return `The Focused ${primaryType}`;
  }
  
  if (supporting.length >= 3) {
    return `The Complex ${primaryType} with Multi-Faceted Influences`;
  }
  
  const supportingTypes = supporting.slice(0, 2).map(p => p.publicName.replace('The ', ''));
  return `The ${primaryType} with ${supportingTypes.join(' and ')} Integration`;
}

function generateComplexPatternAnalysis(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): string {
  if (supporting.length < 2) {
    return `Your Inner Personais primarily characterized by ${primary.strengthFocus.toLowerCase()}, creating a focused and consistent approach.`;
  }
  
  return `Your Inner Personarepresents a sophisticated integration of ${primary.strengthFocus.toLowerCase()} (primary), ${supporting[0].strengthFocus.toLowerCase()}, and ${supporting[1]?.strengthFocus?.toLowerCase() || 'additional capabilities'}. This creates a Inner Personapresence that is both ${primary.strengthFocus.split(' ')[0].toLowerCase()} and ${supporting[0].strengthFocus.split(' ')[0].toLowerCase()}, enabling unique organizational impact.`;
}

function generateIntegrationDynamics(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): string {
  const primaryDetails = getPersonaDetails(primary.personaName);
  
  if (!primaryDetails || supporting.length === 0) {
    return "Your Inner Personadynamics create consistent patterns that teams can rely on.";
  }
  
  const integrationPatterns = primaryDetails.integration_patterns?.with_high_scores || [];
  
  return `Your persona integration creates dynamic tensions and synergies:
  
${integrationPatterns.slice(0, 3).map(pattern => `- ${pattern}`).join('\n')}

This complex integration means your team experiences you as simultaneously ${primary.strengthFocus.toLowerCase()} and ${supporting[0]?.strengthFocus?.toLowerCase() || 'supportive'}, creating both opportunity and challenge for optimization.`;
}

function generatePowerfulSynergies(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): string[] {
  return [
    `Your ${primary.strengthFocus.toLowerCase()} provides the foundation for all your Inner Personainteractions`,
    `${supporting[0]?.strengthFocus || 'Supporting capabilities'} add depth and complexity to your approach`,
    `${supporting[1]?.strengthFocus || 'Additional strengths'} create unique problem-solving capabilities`,
    `The integration of multiple personas allows for sophisticated adaptation to different Inner Personacontexts`
  ];
}

function generateLeadershipImpact(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): string[] {
  return [
    `Creates ${primary.strengthFocus.toLowerCase()} that elevates organizational performance standards`,
    `Develops team capabilities through ${supporting[0]?.strengthFocus?.toLowerCase() || 'focused leadership'}`,
    `Provides ${supporting[1]?.strengthFocus?.toLowerCase() || 'valuable perspective'} that enhances strategic thinking`,
    `Demonstrates Inner Personacomplexity that adapts to organizational needs while maintaining core strengths`
  ];
}

function generateEnhancedActionPlan(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): any {
  return {
    immediate: [
      `Conduct self-assessment of your ${primary.strengthFocus.toLowerCase()} patterns and their current impact`,
      `Engage in three specific conversations where you explain your Inner Personaintentions and approach`,
      `Identify situations where your ${primary.personaName} response serves you well vs. creates challenges`,
      `Begin transparent communication about your Inner Personastyle: "My approach is ${primary.strengthFocus.toLowerCase()}, and here's why..."`
    ],
    mediumTerm: [
      `Develop integrated systems that leverage your ${primary.strengthFocus.toLowerCase()} while incorporating ${supporting[0]?.strengthFocus?.toLowerCase() || 'supporting capabilities'}`,
      `Create feedback mechanisms that help you understand the full impact of your Inner Personastyle`,
      `Build collaborative approaches that enhance rather than replace your natural ${primary.strengthFocus.toLowerCase()}`,
      `Establish mentoring relationships to develop your coaching and development capabilities`
    ],
    longTerm: [
      `Evolve toward mastery integration where your ${primary.strengthFocus.toLowerCase()} becomes a development tool for others`,
      `Create organizational systems that institutionalize your Inner Personastrengths`,
      `Develop expertise in leading others with similar or complementary persona patterns`,
      `Build a Inner Personalegacy that combines your natural gifts with enhanced interpersonal and developmental effectiveness`
    ]
  };
}

function generateEnhancedRiskAssessment(primary: EnhancedSchemaActivation, secondary: EnhancedSchemaActivation[]): any {
  const primaryDetails = getPersonaDetails(primary.schemaName);
  
  return {
    highRisk: [
      `${primary.domain} dysfunction leading to interpersonal difficulties`,
      `Team psychological safety compromised by ${primary.severity.toLowerCase()} ${primary.clinicalName.toLowerCase()} activation`,
      `Career advancement limitations if schema patterns remain unaddressed`,
      `Organizational culture problems stemming from ${primary.clinicalName.toLowerCase()} responses`,
      `Potential for team turnover and engagement problems`
    ],
    protectiveFactors: [
      `High investment in organizational success and performance`,
      `Strong work ethic and commitment to results`,
      `${primaryDetails?.strengthFocus || 'Inner Personacapabilities'} that create value`,
      `Professional context provides structure for intervention`,
      `Apparent motivation for Inner Personaeffectiveness`
    ],
    interventionPriorities: [
      `Immediate schema awareness training for ${primary.clinicalName} triggers`,
      `Development of alternative responses to ${primary.domain.toLowerCase()} challenges`,
      `Integration work for multiple schema activations`,
      `Workplace behavior modification with clinical oversight`
    ]
  };
}

function generateEnhancedClinicalRecommendations(primary: EnhancedSchemaActivation, secondary: EnhancedSchemaActivation[]): any {
  return {
    immediate: [
      `Schema Awareness Training focused on ${primary.clinicalName} activation triggers and workplace manifestations`,
      `Development of self-monitoring skills for schema-driven vs. situation-appropriate responses`,
      `Cognitive restructuring for ${primary.domain.toLowerCase()} thinking patterns`,
      `Emotional regulation skills training with specific focus on ${primary.clinicalName.toLowerCase()} management`
    ],
    intermediate: [
      `${primary.clinicalName} schema processing with licensed schema therapy specialist`,
      `Interpersonal effectiveness skills development for Inner Personacontexts`,
      `Integration work addressing multiple schema activations: ${secondary.slice(0,2).map(s => s.clinicalName).join(', ')}`,
      `Workplace behavior modification planning with clinical supervision`
    ],
    longTerm: [
      `Comprehensive schema integration therapy addressing ${primary.domain} concerns`,
      `Inner Personacoaching with ongoing clinical supervision and consultation`,
      `Long-term monitoring of workplace interpersonal effectiveness and team impact`,
      `Development of healthy Inner Personatemplates that integrate multiple schema modifications`
    ],
    therapyModality: `Schema-Focused Cognitive Behavioral Therapy with executive coaching integration. Individual therapy for schema processing, group work for interpersonal skills, and organizational consultation for systemic support.`,
    supervisionRequirements: [
      `Regular clinical supervision for risk assessment and management`,
      `Treatment planning oversight for workplace behavior modification`,
      `Ethical consultation for organizational intervention boundaries`,
      `Integration planning for therapeutic and professional development goals`
    ]
  };
}

// Generate organizational contribution insight
function generateOrganizationalContribution(primary: EnhancedPersonaActivation, supporting: EnhancedPersonaActivation[]): string {
  if (supporting.length === 0) {
    return `Your focused ${primary.strengthFocus.toLowerCase()} creates clear value for organizational success.`;
  }
  
  return `Your combination of ${primary.strengthFocus.toLowerCase()} with ${supporting[0].strengthFocus.toLowerCase()} creates distinctive organizational value that few leaders can provide.`;
}

// Generate specific growth area
function generateGrowthArea(persona: EnhancedPersonaActivation): string {
  const details = getPersonaDetails(persona.personaName);
  return details?.developmentEdge?.split('.')[0] || `Enhanced ${persona.strengthFocus.toLowerCase()} application`;
}

// Generate schema interaction dynamics
function generateSchemaInteractionDynamics(primary: EnhancedSchemaActivation, secondary: EnhancedSchemaActivation[]): string {
  return `The ${primary.clinicalName} schema interacts with secondary activations to create complex Inner Personabehavioral patterns:

${secondary.slice(0, 3).map(schema => 
  `- <strong>${schema.clinicalName} (${schema.activationLevel}%):</strong> ${schema.clinicalSignificance}`
).join('\n')}

This multi-schema activation pattern requires integrated therapeutic approach addressing both primary ${primary.clinicalName.toLowerCase()} concerns and secondary schema interactions that reinforce maladaptive Inner Personapatterns.`;
}
