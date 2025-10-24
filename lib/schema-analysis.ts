
// Schema Therapy Framework for Leadership Assessment
// Based on Young's Schema Theory adapted for organizational leadership

export interface SchemaActivation {
  schemaName: string;
  clinicalName: string;
  domain: string;
  activationLevel: number; // 0-100%
  severity: 'Low' | 'Moderate' | 'Moderate-High' | 'High';
  questions: string[];
  responses: number[];
}

export interface PersonaActivation {
  personaName: string;
  publicName: string;
  activationLevel: number;
  rank: number;
  strengthFocus: string;
  developmentEdge: string;
}

export interface ThreeTierAnalysis {
  tier1: {
    summary: string;
    keyStrengths: string[];
    growthAreas: string[];
  };
  tier2: {
    primaryPersona: PersonaActivation;
    supportingPersonas: PersonaActivation[];
    leadershipPattern: string;
    detailedAnalysis: string;
    actionPlan: {
      immediate: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
  };
  tier3: {
    primarySchema: SchemaActivation;
    secondarySchemas: SchemaActivation[];
    clinicalFormulation: string;
    riskAssessment: {
      highRisk: string[];
      protectiveFactors: string[];
    };
    clinicalRecommendations: {
      immediate: string[];
      intermediate: string[];
      longTerm: string[];
    };
  };
}

// Schema Domain Definitions
export const SCHEMA_DOMAINS = {
  DISCONNECTION_REJECTION: 'Disconnection & Rejection',
  IMPAIRED_AUTONOMY: 'Impaired Autonomy & Performance', 
  IMPAIRED_LIMITS: 'Impaired Limits',
  OTHER_DIRECTEDNESS: 'Other-Directedness',
  OVERVIGILANCE_INHIBITION: 'Overvigilance & Inhibition'
};

// Complete Schema Mapping
export const SCHEMA_MAPPING = {
  // Disconnection & Rejection Domain
  'The Clinger': {
    clinicalName: 'Abandonment',
    domain: SCHEMA_DOMAINS.DISCONNECTION_REJECTION,
    questionIds: ['1.1.1', '1.1.2', '1.1.3']
  },
  'The Invisible Operator': {
    clinicalName: 'Defectiveness/Shame', 
    domain: SCHEMA_DOMAINS.DISCONNECTION_REJECTION,
    questionIds: ['1.2.1', '1.2.2', '1.2.3']
  },
  'The Withholder': {
    clinicalName: 'Emotional Deprivation',
    domain: SCHEMA_DOMAINS.DISCONNECTION_REJECTION,
    questionIds: ['1.3.1', '1.3.2', '1.3.3']
  },
  'The Guarded Strategist': {
    clinicalName: 'Mistrust/Abuse',
    domain: SCHEMA_DOMAINS.DISCONNECTION_REJECTION,
    questionIds: ['1.4.1', '1.4.2', '1.4.3']
  },
  'The Outsider': {
    clinicalName: 'Social Isolation',
    domain: SCHEMA_DOMAINS.DISCONNECTION_REJECTION,
    questionIds: ['1.5.1', '1.5.2', '1.5.3']
  },

  // Impaired Autonomy & Performance Domain
  'The Self-Doubter': {
    clinicalName: 'Dependence/Incompetence',
    domain: SCHEMA_DOMAINS.IMPAIRED_AUTONOMY,
    questionIds: ['2.1.1', '2.1.2', '2.1.3']
  },
  'The Reluctant Rely-er': {
    clinicalName: 'Vulnerability to Harm',
    domain: SCHEMA_DOMAINS.IMPAIRED_AUTONOMY,
    questionIds: ['2.2.1', '2.2.2', '2.2.3']
  },
  'The Safety Strategist': {
    clinicalName: 'Enmeshment/Undeveloped Self',
    domain: SCHEMA_DOMAINS.IMPAIRED_AUTONOMY,
    questionIds: ['2.3.1', '2.3.2', '2.3.3']
  },

  // Impaired Limits Domain
  'The Overgiver': {
    clinicalName: 'Entitlement/Grandiosity',
    domain: SCHEMA_DOMAINS.IMPAIRED_LIMITS,
    questionIds: ['3.1.1', '3.1.2', '3.1.3']
  },
  'The Over-Adapter': {
    clinicalName: 'Insufficient Self-Control',
    domain: SCHEMA_DOMAINS.IMPAIRED_LIMITS,
    questionIds: ['3.2.1', '3.2.2', '3.2.3']
  },

  // Other-Directedness Domain
  'The Suppressed Voice': {
    clinicalName: 'Subjugation',
    domain: SCHEMA_DOMAINS.OTHER_DIRECTEDNESS,
    questionIds: ['4.1.1', '4.1.2', '4.1.3']
  },
  'The Image Manager': {
    clinicalName: 'Self-Sacrifice',
    domain: SCHEMA_DOMAINS.OTHER_DIRECTEDNESS,
    questionIds: ['4.2.1', '4.2.2', '4.2.3']
  },
  'The Power Broker': {
    clinicalName: 'Approval-Seeking',
    domain: SCHEMA_DOMAINS.OTHER_DIRECTEDNESS,
    questionIds: ['4.3.1', '4.3.2', '4.3.3']
  },

  // Overvigilance & Inhibition Domain
  'The Cautious Realist': {
    clinicalName: 'Negativity/Pessimism',
    domain: SCHEMA_DOMAINS.OVERVIGILANCE_INHIBITION,
    questionIds: ['5.1.1', '5.1.2', '5.1.3']
  },
  'The Stoic Mask': {
    clinicalName: 'Emotional Inhibition',
    domain: SCHEMA_DOMAINS.OVERVIGILANCE_INHIBITION,
    questionIds: ['5.2.1', '5.2.2', '5.2.3']
  },
  'The Perfectionist Driver': {
    clinicalName: 'Unrelenting Standards',
    domain: SCHEMA_DOMAINS.OVERVIGILANCE_INHIBITION,
    questionIds: ['5.3.1', '5.3.2', '5.3.3']
  },
  'The Harsh Enforcer': {
    clinicalName: 'Punitiveness',
    domain: SCHEMA_DOMAINS.OVERVIGILANCE_INHIBITION,
    questionIds: ['5.4.1', '5.4.2', '5.4.3']
  },
  'The Unfiltered Reactor': {
    clinicalName: 'Inhibition',
    domain: SCHEMA_DOMAINS.OVERVIGILANCE_INHIBITION,
    questionIds: ['5.5.1', '5.5.2', '5.5.3']
  }
};

// Calculate schema activations from responses
export function calculateSchemaActivations(responses: Record<string, string>): SchemaActivation[] {
  const activations: SchemaActivation[] = [];

  Object.entries(SCHEMA_MAPPING).forEach(([personaName, schemaInfo]) => {
    const relevantResponses = schemaInfo.questionIds
      .map(id => responses[id])
      .filter(response => response !== undefined)
      .map(response => parseInt(response));

    if (relevantResponses.length > 0) {
      const averageScore = relevantResponses.reduce((sum, score) => sum + score, 0) / relevantResponses.length;
      const activationLevel = (averageScore / 5) * 100; // Convert to percentage

      let severity: 'Low' | 'Moderate' | 'Moderate-High' | 'High';
      if (activationLevel >= 75) severity = 'High';
      else if (activationLevel >= 65) severity = 'Moderate-High';
      else if (activationLevel >= 50) severity = 'Moderate';
      else severity = 'Low';

      activations.push({
        schemaName: personaName,
        clinicalName: schemaInfo.clinicalName,
        domain: schemaInfo.domain,
        activationLevel: Math.round(activationLevel * 10) / 10,
        severity,
        questions: schemaInfo.questionIds,
        responses: relevantResponses
      });
    }
  });

  return activations.sort((a, b) => b.activationLevel - a.activationLevel);
}

// Calculate persona activations for leadership framework
export function calculatePersonaActivations(responses: Record<string, string>): PersonaActivation[] {
  const { personaMapping } = require('@/data/personaMapping');
  
  const activations: PersonaActivation[] = [];

  Object.entries(SCHEMA_MAPPING).forEach(([personaName, schemaInfo]) => {
    const relevantResponses = schemaInfo.questionIds
      .map(id => responses[id])
      .filter(response => response !== undefined)
      .map(response => parseInt(response));

    if (relevantResponses.length > 0) {
      const averageScore = relevantResponses.reduce((sum, score) => sum + score, 0) / relevantResponses.length;
      const activationLevel = (averageScore / 5) * 100;

      const personaInfo = personaMapping[personaName];
      
      activations.push({
        personaName,
        publicName: personaInfo?.publicName || personaName,
        activationLevel: Math.round(activationLevel * 10) / 10,
        rank: 0, // Will be set after sorting
        strengthFocus: personaInfo?.strengthFocus || 'Leadership Qualities',
        developmentEdge: personaInfo?.developmentEdge || 'Continue developing skills'
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

// Generate complete three-tier analysis
export function generateThreeTierAnalysis(responses: Record<string, string>, participantData: any): ThreeTierAnalysis {
  const schemaActivations = calculateSchemaActivations(responses);
  const personaActivations = calculatePersonaActivations(responses);

  const primarySchema = schemaActivations[0];
  const primaryPersona = personaActivations[0];
  
  return {
    tier1: generateTier1Analysis(primaryPersona, personaActivations.slice(0, 3)),
    tier2: generateTier2Analysis(primaryPersona, personaActivations, participantData),
    tier3: generateTier3Analysis(primarySchema, schemaActivations, participantData)
  };
}

// Tier 1: Gentle Summary (2-3 paragraphs)
function generateTier1Analysis(primaryPersona: PersonaActivation, topPersonas: PersonaActivation[]) {
  const strengthsList = topPersonas.map(p => p.strengthFocus.toLowerCase()).join(', ');
  
  return {
    summary: `Your leadership style shows strong ${primaryPersona.strengthFocus.toLowerCase()} with ${primaryPersona.activationLevel.toFixed(1)}% alignment to ${primaryPersona.publicName} patterns. You bring valuable qualities including ${strengthsList} that contribute to organizational success. Your approach demonstrates natural leadership capabilities that help teams achieve their goals while maintaining positive relationships.`,
    keyStrengths: topPersonas.slice(0, 3).map(p => p.strengthFocus),
    growthAreas: topPersonas.slice(0, 2).map(p => p.developmentEdge.split('.')[0])
  };
}

// Tier 2: Detailed Leadership Report (8-12 pages worth of content)
function generateTier2Analysis(primaryPersona: PersonaActivation, allPersonas: PersonaActivation[], participantData: any) {
  const supportingPersonas = allPersonas.slice(1, 5).filter(p => p.activationLevel >= 60);
  
  const leadershipPattern = generateLeadershipPattern(primaryPersona, supportingPersonas);
  
  return {
    primaryPersona,
    supportingPersonas,
    leadershipPattern,
    detailedAnalysis: generateDetailedPersonaAnalysis(primaryPersona, supportingPersonas),
    actionPlan: {
      immediate: generateImmediateActions(primaryPersona),
      mediumTerm: generateMediumTermActions(primaryPersona, supportingPersonas),
      longTerm: generateLongTermActions(primaryPersona)
    }
  };
}

// Tier 3: Clinical Assessment Report
function generateTier3Analysis(primarySchema: SchemaActivation, allSchemas: SchemaActivation[], participantData: any) {
  const secondarySchemas = allSchemas.slice(1, 5).filter(s => s.activationLevel >= 60);
  
  return {
    primarySchema,
    secondarySchemas,
    clinicalFormulation: generateClinicalFormulation(primarySchema, secondarySchemas),
    riskAssessment: generateRiskAssessment(primarySchema, secondarySchemas),
    clinicalRecommendations: {
      immediate: generateImmediateClinicalRecommendations(primarySchema),
      intermediate: generateIntermediateClinicalRecommendations(primarySchema, secondarySchemas),
      longTerm: generateLongTermClinicalRecommendations(primarySchema, secondarySchemas)
    }
  };
}

// Helper functions for generating content
function generateLeadershipPattern(primary: PersonaActivation, supporting: PersonaActivation[]): string {
  const pattern = `The ${primary.publicName.replace('The ', '')} Leader`;
  if (supporting.length > 0) {
    const supportingTraits = supporting.map(p => p.publicName.replace('The ', '')).join(', ');
    return `${pattern} with ${supportingTraits} influences`;
  }
  return pattern;
}

function generateDetailedPersonaAnalysis(primary: PersonaActivation, supporting: PersonaActivation[]): string {
  return `As ${primary.publicName} (${primary.activationLevel}% activation), your leadership is characterized by ${primary.strengthFocus.toLowerCase()}. This creates a distinctive leadership approach that emphasizes excellence and results while maintaining focus on team development. Your supporting personas (${supporting.map(p => p.personaName).join(', ')}) add complexity and depth to your leadership style, creating unique strengths and development opportunities.`;
}

function generateImmediateActions(primary: PersonaActivation): string[] {
  return [
    `Leverage your ${primary.strengthFocus.toLowerCase()} in current projects`,
    'Seek feedback on how your leadership style affects team dynamics',
    'Identify 2-3 specific situations where you can apply your natural strengths',
    'Practice self-awareness of your automatic leadership responses'
  ];
}

function generateMediumTermActions(primary: PersonaActivation, supporting: PersonaActivation[]): string[] {
  return [
    `Develop systems that complement your ${primary.strengthFocus.toLowerCase()}`,
    'Build relationships with leaders who have complementary styles',
    'Create structured approaches for areas of development',
    'Implement regular feedback mechanisms for continuous improvement'
  ];
}

function generateLongTermActions(primary: PersonaActivation): string[] {
  return [
    'Evolve your leadership style to include advanced capabilities',
    'Mentor others who share similar leadership patterns',
    'Develop expertise in areas that complement your natural strengths',
    'Create leadership legacy that leverages your unique capabilities'
  ];
}

function generateClinicalFormulation(primary: SchemaActivation, secondary: SchemaActivation[]): string {
  const pattern = `${primary.clinicalName} (${primary.activationLevel}% activation)`;
  const secondaryPatterns = secondary.map(s => `${s.clinicalName} (${s.activationLevel}%)`).join(', ');
  
  return `Primary pattern presents as ${pattern} within the ${primary.domain} domain. Secondary activations include ${secondaryPatterns}. This configuration suggests a complex leadership schema pattern requiring integrated therapeutic approach focusing on ${primary.domain.toLowerCase()} concerns while addressing secondary schema interactions.`;
}

function generateRiskAssessment(primary: SchemaActivation, secondary: SchemaActivation[]): { highRisk: string[]; protectiveFactors: string[] } {
  const risks = [
    'Potential for interpersonal difficulties in leadership contexts',
    'Risk of team dysfunction due to schema-driven responses',
    'Possible career advancement limitations if patterns are rigid'
  ];
  
  const protective = [
    'High investment in organizational success',
    'Strong work ethic and performance orientation',
    'Clear communication style and directness'
  ];

  return { highRisk: risks, protectiveFactors: protective };
}

function generateImmediateClinicalRecommendations(primary: SchemaActivation): string[] {
  return [
    `Schema awareness training focused on ${primary.clinicalName} activation triggers`,
    'Development of self-monitoring skills for schema-driven responses',
    'Cognitive restructuring for rigid thinking patterns',
    'Emotional regulation skills training'
  ];
}

function generateIntermediateClinicalRecommendations(primary: SchemaActivation, secondary: SchemaActivation[]): string[] {
  return [
    `${primary.clinicalName} schema processing with licensed clinician`,
    'Interpersonal effectiveness skills development',
    'Integration work for multiple schema activations',
    'Workplace behavior modification planning'
  ];
}

function generateLongTermClinicalRecommendations(primary: SchemaActivation, secondary: SchemaActivation[]): string[] {
  return [
    'Comprehensive schema integration therapy',
    'Leadership coaching with clinical supervision',
    'Ongoing monitoring of workplace interpersonal effectiveness',
    'Development of healthy leadership templates'
  ];
}
