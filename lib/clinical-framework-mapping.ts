// Clinical Framework Mapping for Tier 3 Reports
// Schema therapy integration and clinical assessment protocols

export interface SchemaMapping {
  schemaName: string;
  domain: string;
  clinicalDescription: string;
  adaptiveExpression: string;
  maladaptiveExpression: string;
  leadershipManifestation: string;
  interventionApproaches: string[];
}

export interface PersonaScore {
  clinicalName: string;
  publicName: string;
  score: number;
  percentage: number;
  domain: string;
  questions: number[];
  rank: number;
  clinicalSignificance: 'HIGH' | 'MODERATE' | 'LOW';
  strengthFocus: string;
  publicDescription: string;
  clinicalDescription: string;
  developmentEdge: string;
}

export interface ClinicalAssessment {
  overallActivation: number;
  clinicalConcern: 'HIGH' | 'MODERATE' | 'LOW';
  adaptiveCapacity: string;
  interventionRecommendation: string;
  researchSignificance: string;
}

export const SCHEMA_MAPPINGS: SchemaMapping[] = [
  {
    schemaName: "Abandonment/Instability",
    domain: "Disconnection & Rejection",
    clinicalDescription: "The perceived instability or unreliability of those available for support and connection",
    adaptiveExpression: "Strong relationship building, loyalty, commitment to team stability",
    maladaptiveExpression: "Clinging behavior, excessive reassurance seeking, fear of team changes",
    leadershipManifestation: "Creates strong team bonds but may struggle with team member independence",
    interventionApproaches: ["Secure attachment building", "Independence tolerance training", "Boundary development"]
  },
  {
    schemaName: "Social Isolation/Alienation", 
    domain: "Disconnection & Rejection",
    clinicalDescription: "The feeling that one is isolated from the rest of the world, different from other people",
    adaptiveExpression: "Independent thinking, unique perspectives, innovative problem-solving",
    maladaptiveExpression: "Social withdrawal, avoiding team engagement, isolation from group processes",
    leadershipManifestation: "Brings valuable outside perspective but may limit team integration",
    interventionApproaches: ["Social skills development", "Team integration support", "Belonging cultivation"]
  },
  {
    schemaName: "Emotional Deprivation",
    domain: "Disconnection & Rejection", 
    clinicalDescription: "The expectation that one's desire for emotional support will not be adequately met",
    adaptiveExpression: "Task focus, clarity in communications, objective decision-making",
    maladaptiveExpression: "Emotional withholding, lack of empathy, dismissal of emotional needs",
    leadershipManifestation: "Maintains clear focus but may miss emotional dimensions of leadership",
    interventionApproaches: ["Emotional intelligence development", "Empathy building", "Relationship integration"]
  },
  {
    schemaName: "Mistrust/Abuse",
    domain: "Disconnection & Rejection",
    clinicalDescription: "The expectation that others will hurt, abuse, humiliate, cheat, lie, manipulate, or take advantage",
    adaptiveExpression: "Protective leadership, risk assessment, careful planning and preparation",
    maladaptiveExpression: "Excessive suspicion, inability to delegate, overly defensive posture",
    leadershipManifestation: "Excellent risk management but may limit trust-building and collaboration",
    interventionApproaches: ["Trust building exercises", "Gradual delegation training", "Risk calibration"]
  },
  {
    schemaName: "Defectiveness/Shame",
    domain: "Disconnection & Rejection",
    clinicalDescription: "The feeling that one is defective, bad, unwanted, inferior, or invalid in important respects",
    adaptiveExpression: "Independent innovation, unique problem-solving, creative approaches",
    maladaptiveExpression: "Hiding authentic self, avoiding visibility, minimizing contributions",
    leadershipManifestation: "Brings innovative solutions but may limit leadership visibility and influence",
    interventionApproaches: ["Self-worth building", "Visibility training", "Strengths recognition"]
  },
  {
    schemaName: "Incompetence/Failure",
    domain: "Impaired Autonomy & Performance",
    clinicalDescription: "The belief that one is incompetent or inadequate in areas of achievement",
    adaptiveExpression: "Thorough preparation, careful evaluation, risk-aware decision making",
    maladaptiveExpression: "Excessive self-doubt, paralysis by analysis, avoiding challenging decisions",
    leadershipManifestation: "Ensures thorough evaluation but may lack confidence in leadership decisions",
    interventionApproaches: ["Competence building", "Decision confidence training", "Success recognition"]
  },
  {
    schemaName: "Dependence/Incompetence", 
    domain: "Impaired Autonomy & Performance",
    clinicalDescription: "The belief that one is unable to handle everyday responsibilities competently",
    adaptiveExpression: "Self-reliance, independent execution, personal accountability",
    maladaptiveExpression: "Excessive independence, inability to accept help, isolation in leadership",
    leadershipManifestation: "Strong personal accountability but may limit team collaboration and support",
    interventionApproaches: ["Collaboration skills", "Support acceptance training", "Team integration"]
  },
  {
    schemaName: "Vulnerability to Harm",
    domain: "Impaired Autonomy & Performance", 
    clinicalDescription: "Exaggerated fear that imminent catastrophe will strike at any time",
    adaptiveExpression: "Stability creation, security planning, predictable environments",
    maladaptiveExpression: "Excessive risk avoidance, paralysis by safety concerns, innovation resistance",
    leadershipManifestation: "Creates stable environments but may limit necessary risk-taking and innovation",
    interventionApproaches: ["Risk calibration", "Innovation comfort building", "Calculated risk training"]
  },
  {
    schemaName: "Self-Sacrifice",
    domain: "Impaired Limits",
    clinicalDescription: "Excessive focus on voluntarily meeting the needs of others at the expense of one's own needs",
    adaptiveExpression: "Service leadership, team support, generous development of others",
    maladaptiveExpression: "Burnout patterns, boundary violations, neglect of leadership needs",
    leadershipManifestation: "Strong team support but may sacrifice leadership effectiveness through over-giving",
    interventionApproaches: ["Boundary development", "Self-care integration", "Sustainable service"]
  },
  {
    schemaName: "Subjugation",
    domain: "Impaired Limits",
    clinicalDescription: "Excessive surrendering of control to others because one feels coerced",
    adaptiveExpression: "Collaborative leadership, consensus building, harmonious team dynamics",
    maladaptiveExpression: "Loss of authentic voice, excessive accommodation, decision avoidance",
    leadershipManifestation: "Builds harmony but may sacrifice valuable perspective and leadership authority",
    interventionApproaches: ["Voice development", "Authentic expression training", "Leadership presence building"]
  },
  {
    schemaName: "Emotional Inhibition",
    domain: "Impaired Limits",
    clinicalDescription: "Excessive inhibition of spontaneous action, feeling, or communication",
    adaptiveExpression: "Diplomatic communication, smooth team interactions, conflict resolution",
    maladaptiveExpression: "Suppressed authentic expression, limited emotional range, disconnection",
    leadershipManifestation: "Facilitates smooth interactions but may limit authentic leadership connection",
    interventionApproaches: ["Authentic expression development", "Emotional integration", "Leadership presence"]
  },
  {
    schemaName: "Approval-Seeking/Recognition-Seeking",
    domain: "Other-Directedness",
    clinicalDescription: "Excessive emphasis on gaining approval, recognition, or attention from other people",
    adaptiveExpression: "Professional relationship building, stakeholder awareness, organizational sensitivity",
    maladaptiveExpression: "Image management over authenticity, external validation dependence",
    leadershipManifestation: "Strong relationship skills but may limit authentic leadership expression",
    interventionApproaches: ["Authentic relationship building", "Internal validation development", "Values-based decision making"]
  },
  {
    schemaName: "Grandiosity/Entitlement",
    domain: "Other-Directedness",
    clinicalDescription: "The belief that one is superior to other people; entitled to special rights and privileges",
    adaptiveExpression: "Strategic influence, organizational navigation, results-driven leadership",
    maladaptiveExpression: "Dominance seeking, limited collaboration, control concentration",
    leadershipManifestation: "Strong influence capabilities but may limit collaborative leadership development",
    interventionApproaches: ["Collaborative leadership training", "Empowerment skill building", "Shared power development"]
  },
  {
    schemaName: "Negativity/Pessimism",
    domain: "Overvigilance & Inhibition",
    clinicalDescription: "Pervasive, lifelong focus on the negative aspects of life while minimizing positive aspects",
    adaptiveExpression: "Realistic assessment, risk awareness, thorough problem analysis",
    maladaptiveExpression: "Excessive focus on problems, pessimistic outlook, solution resistance",
    leadershipManifestation: "Excellent risk assessment but may limit team optimism and innovation",
    interventionApproaches: ["Solution focus training", "Optimism balance", "Inspiration skill development"]
  },
  {
    schemaName: "Emotional Inhibition",
    domain: "Overvigilance & Inhibition",
    clinicalDescription: "Excessive inhibition of spontaneous action, feeling, or communication", 
    adaptiveExpression: "Emotional stability, composed leadership, steady presence under pressure",
    maladaptiveExpression: "Emotional suppression, limited expression, interpersonal distance",
    leadershipManifestation: "Provides stability but may limit emotional connection and authentic expression",
    interventionApproaches: ["Emotional integration", "Authentic expression development", "Connection building"]
  },
  {
    schemaName: "Unrelenting Standards",
    domain: "Overvigilance & Inhibition",
    clinicalDescription: "The underlying belief that one must strive to meet very high internalized standards",
    adaptiveExpression: "Excellence focus, quality standards, attention to detail and achievement",
    maladaptiveExpression: "Perfectionist paralysis, harsh self-criticism, impossible standards",
    leadershipManifestation: "Drives high quality but may create pressure and slow progress",
    interventionApproaches: ["Standard calibration", "Progress celebration", "Excellence balance"]
  },
  {
    schemaName: "Punitiveness",
    domain: "Overvigilance & Inhibition", 
    clinicalDescription: "The belief that people should be harshly punished for making mistakes",
    adaptiveExpression: "Accountability focus, clear expectations, standards maintenance",
    maladaptiveExpression: "Harsh criticism, punitive responses, fear-based motivation",
    leadershipManifestation: "Ensures accountability but may limit psychological safety and innovation",
    interventionApproaches: ["Positive reinforcement training", "Growth mindset development", "Psychological safety building"]
  },
  {
    schemaName: "Insufficient Self-Control",
    domain: "Overvigilance & Inhibition",
    clinicalDescription: "Pervasive difficulty or refusal to exercise sufficient self-control",
    adaptiveExpression: "Authentic communication, direct feedback, transparent leadership style",
    maladaptiveExpression: "Emotional reactivity, impulsive responses, lack of communication filters",
    leadershipManifestation: "Provides authenticity and clarity but may create relationship challenges",
    interventionApproaches: ["Strategic communication training", "Emotional regulation", "Context sensitivity"]
  }
];

// Clinical Significance Assessment Functions
export function assessClinicalSignificance(personaScores: PersonaScore[]): ClinicalAssessment {
  const topScores = personaScores.slice(0, 3);
  const averageActivation = personaScores.reduce((sum, p) => sum + p.percentage, 0) / personaScores.length;
  
  return {
    overallActivation: averageActivation,
    clinicalConcern: averageActivation > 70 ? "HIGH" : averageActivation > 50 ? "MODERATE" : "LOW",
    adaptiveCapacity: assessAdaptiveCapacity(topScores),
    interventionRecommendation: generateInterventionRecommendation(topScores),
    researchSignificance: assessResearchSignificance(personaScores).clinicalValue
  };
}

function assessAdaptiveCapacity(topScores: PersonaScore[]): string {
  const highScores = topScores.filter(p => p.percentage > 70);
  if (highScores.length >= 2) {
    return "MODERATE - Multiple high activation patterns may limit adaptive flexibility";
  } else if (highScores.length === 1) {
    return "GOOD - Single primary pattern with adaptive potential";
  }
  return "HIGH - Balanced activation across multiple patterns";
}

function generateInterventionRecommendation(topScores: PersonaScore[]): string {
  const primary = topScores[0];
  if (primary.percentage > 75) {
    return "Schema-focused intervention recommended for primary pattern modification";
  } else if (primary.percentage > 60) {
    return "Cognitive-behavioral coaching recommended for skill development";
  }
  return "Strengths-based development recommended for pattern optimization";
}

export function generateNeurobiologicalAnalysis(primary: PersonaScore, secondary: PersonaScore): string {
  const neurobiological: Record<string, {
    prefrontalEngagement: string;
    amygdalaRegulation: string;
    mirrorNeuronActivity: string;
    explanation: string;
  }> = {
    "The Relationship Champion": {
      prefrontalEngagement: "MODERATE",
      amygdalaRegulation: "CHALLENGED",
      mirrorNeuronActivity: "VERY HIGH",
      explanation: "Attachment-focused patterns indicate hyperactive social monitoring with emotional dysregulation"
    },
    "The Focus Leader": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "OVERCONTROLLED",
      mirrorNeuronActivity: "LOW",
      explanation: "Task-focused suppression indicates strong executive control with reduced social-emotional processing"
    },
    "The Thoughtful Strategist": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "ADAPTIVE",
      mirrorNeuronActivity: "MODERATE",
      explanation: "Strategic analysis patterns suggest strong planning networks with measured social engagement"
    },
    "The Protective Planner": {
      prefrontalEngagement: "VERY HIGH",
      amygdalaRegulation: "HYPERVIGILANT",
      mirrorNeuronActivity: "MODERATE",
      explanation: "Risk-assessment orientation indicates overactive threat detection with cautious social processing"
    },
    "The Independent Innovator": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "ADAPTIVE",
      mirrorNeuronActivity: "LOW",
      explanation: "Independent thinking patterns suggest strong creative networks with reduced social conformity pressure"
    },
    "The Service Leader": {
      prefrontalEngagement: "MODERATE",
      amygdalaRegulation: "SUPPRESSED",
      mirrorNeuronActivity: "VERY HIGH",
      explanation: "Other-focused patterns indicate hyperactive empathy systems with self-care suppression"
    },
    "The Excellence Champion": {
      prefrontalEngagement: "VERY HIGH",
      amygdalaRegulation: "RIGID",
      mirrorNeuronActivity: "MODERATE",
      explanation: "Perfectionist patterns indicate overactive error-monitoring with rigid emotional control"
    },
    "The Standards Leader": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "REACTIVE",
      mirrorNeuronActivity: "LOW",
      explanation: "Punitive patterns suggest strong rule-enforcement networks with reduced empathic processing"
    },
    "The Authentic Communicator": {
      prefrontalEngagement: "MODERATE",
      amygdalaRegulation: "CHALLENGED", 
      mirrorNeuronActivity: "HIGH",
      explanation: "Direct expression patterns suggest active emotional centers with variable regulation"
    },
    "The Strategic Influencer": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "ADAPTIVE",
      mirrorNeuronActivity: "MODERATE",
      explanation: "Strategic thinking patterns indicate strong executive function with controlled emotional response"
    },
    "The Steady Anchor": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "HIGH",
      mirrorNeuronActivity: "MODERATE", 
      explanation: "Emotional stability suggests well-developed regulatory systems with controlled expression"
    },
    "The Harmony Builder": {
      prefrontalEngagement: "MODERATE",
      amygdalaRegulation: "SUPPRESSED",
      mirrorNeuronActivity: "VERY HIGH",
      explanation: "Consensus-building patterns indicate conflict-avoidant emotional regulation with hyperactive social harmony monitoring"
    },
    "The Relationship Cultivator": {
      prefrontalEngagement: "MODERATE-HIGH",
      amygdalaRegulation: "ADAPTIVE",
      mirrorNeuronActivity: "HIGH",
      explanation: "Stakeholder-focused patterns indicate strong social awareness networks with strategic relationship processing"
    },
    "The Careful Evaluator": {
      prefrontalEngagement: "VERY HIGH",
      amygdalaRegulation: "ANXIOUS",
      mirrorNeuronActivity: "MODERATE",
      explanation: "Analysis-focused patterns indicate overactive evaluation systems with anxiety-driven threat assessment"
    },
    "The Self-Sufficient Achiever": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "OVERCONTROLLED",
      mirrorNeuronActivity: "LOW",
      explanation: "Independence-focused patterns indicate strong self-regulation with reduced social dependency networks"
    },
    "The Stability Creator": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "HYPERVIGILANT",
      mirrorNeuronActivity: "MODERATE",
      explanation: "Security-focused patterns indicate overactive threat-detection systems with cautious social processing"
    },
    "The Balanced Assessor": {
      prefrontalEngagement: "HIGH",
      amygdalaRegulation: "CONTROLLED",
      mirrorNeuronActivity: "MODERATE",
      explanation: "Reality-testing patterns indicate balanced analytical processing with controlled emotional engagement"
    },
    "The Diplomatic Collaborator": {
      prefrontalEngagement: "MODERATE",
      amygdalaRegulation: "SUPPRESSED",
      mirrorNeuronActivity: "HIGH",
      explanation: "Diplomatic patterns indicate conflict-suppressing regulation with heightened social sensitivity networks"
    }
  };

  const primaryAnalysis = neurobiological[primary.publicName] || {
    prefrontalEngagement: "MODERATE",
    amygdalaRegulation: "ADAPTIVE", 
    mirrorNeuronActivity: "MODERATE",
    explanation: "Standard activation patterns with balanced regulation"
  };

  return `
**NEUROBIOLOGICAL ACTIVATION PATTERNS:**
- **Prefrontal cortex engagement:** ${primaryAnalysis.prefrontalEngagement} - ${primaryAnalysis.explanation}
- **Amygdala regulation:** ${primaryAnalysis.amygdalaRegulation}
- **Mirror neuron activity:** ${primaryAnalysis.mirrorNeuronActivity}

**INFLUENCE MECHANISMS:**
- **Reward system activation:** ${getRewardSystemPattern(primary.publicName)}
- **Social cognition networks:** ${getSocialCognitionLevel(primary.publicName, secondary.publicName)}
- **Executive function:** ${getExecutiveFunctionAssessment(primary.publicName)}
`;
}

function getRewardSystemPattern(personaName: string): string {
  const rewardPatterns: Record<string, string> = {
    "The Relationship Champion": "HIGH - Social connection drives strong reward activation",
    "The Focus Leader": "LOW - Task completion provides minimal reward response",
    "The Strategic Influencer": "HIGH - Achievement and influence drive strong reward activation",
    "The Excellence Champion": "MODERATE - Perfectionist standards reduce reward satisfaction",
    "The Standards Leader": "LOW - Punishment focus reduces positive reward responsivity",
    "The Authentic Communicator": "VARIABLE - Intense but inconsistent reward response patterns",
    "The Service Leader": "MODERATE - Other-focused giving provides delayed reward satisfaction",
    "The Thoughtful Strategist": "LOW-MODERATE - Internal satisfaction with minimal external reward seeking",
    "The Independent Innovator": "MODERATE - Creative achievement provides intrinsic reward activation",
    "The Steady Anchor": "LOW - Reduced emotional responsivity to typical reward stimuli",
    "The Harmony Builder": "MODERATE - Consensus achievement provides delayed social reward satisfaction",
    "The Relationship Cultivator": "HIGH - Stakeholder approval and relationship success drive strong reward activation",
    "The Careful Evaluator": "LOW - Thorough analysis provides minimal reward activation due to anxiety patterns",
    "The Self-Sufficient Achiever": "MODERATE - Internal achievement satisfaction with reduced external reward dependency",
    "The Stability Creator": "LOW - Security maintenance provides minimal reward activation",
    "The Balanced Assessor": "MODERATE - Realistic assessment accuracy provides steady reward response",
    "The Diplomatic Collaborator": "MODERATE - Conflict resolution and harmony achievement provide delayed reward satisfaction"
  };
  return rewardPatterns[personaName] || "MODERATE - Standard reward system responsivity";
}

function getSocialCognitionLevel(primary: string, secondary: string): string {
  const socialCognition: Record<string, string> = {
    "The Relationship Champion": "VERY HIGH - Hyperactivated social monitoring and connection systems",
    "The Focus Leader": "LOW - Reduced social-emotional processing for task focus",
    "The Strategic Influencer": "HIGH - Strong social awareness for influence and navigation",
    "The Service Leader": "VERY HIGH - Hyperactive empathy and social caregiving networks",
    "The Thoughtful Strategist": "MODERATE - Analytical social processing with reduced social exposure",
    "The Independent Innovator": "LOW-MODERATE - Reduced social network engagement with selective connection",
    "The Protective Planner": "MODERATE-HIGH - Social threat assessment and risk evaluation networks",
    "The Excellence Champion": "MODERATE - Task-focused social awareness with performance monitoring",
    "The Standards Leader": "LOW-MODERATE - Rule-focused social processing with reduced empathy",
    "The Authentic Communicator": "HIGH - Direct social processing with variable emotional regulation",
    "The Steady Anchor": "MODERATE - Stable social processing with controlled emotional engagement",
    "The Harmony Builder": "VERY HIGH - Hyperactive conflict-detection and consensus-building social networks",
    "The Relationship Cultivator": "HIGH - Strategic stakeholder awareness with relationship management focus",
    "The Careful Evaluator": "MODERATE - Analytical social processing with anxiety-driven evaluation",
    "The Self-Sufficient Achiever": "LOW - Minimal social dependency with task-focused processing",
    "The Stability Creator": "MODERATE - Security-focused social threat assessment and stability monitoring",
    "The Balanced Assessor": "MODERATE-HIGH - Realistic social evaluation with balanced emotional processing",
    "The Diplomatic Collaborator": "HIGH - Heightened social sensitivity with conflict-avoidant processing"
  };
  return socialCognition[primary] || "MODERATE - Balanced social cognition networks";
}

function getExecutiveFunctionAssessment(personaName: string): string {
  const executiveFunction: Record<string, string> = {
    "The Relationship Champion": "MODERATE - Emotional needs may override planning systems",
    "The Focus Leader": "HIGH - Strong task focus with excellent cognitive control",
    "The Excellence Champion": "VERY HIGH - Strong planning and error monitoring systems",
    "The Strategic Influencer": "HIGH - Strategic planning with implementation focus",
    "The Standards Leader": "HIGH - Rule enforcement with systematic planning",
    "The Thoughtful Strategist": "HIGH - Analytical planning with thorough evaluation",
    "The Protective Planner": "VERY HIGH - Risk assessment and contingency planning emphasis",
    "The Independent Innovator": "MODERATE-HIGH - Creative flexibility with structured execution",
    "The Service Leader": "MODERATE - Other-focus may compromise self-regulation",
    "The Authentic Communicator": "CHALLENGED - Impulse control and planning limitations",
    "The Steady Anchor": "HIGH - Stable cognitive control with consistent execution",
    "The Harmony Builder": "MODERATE - Consensus focus may compromise decisive action",
    "The Relationship Cultivator": "MODERATE-HIGH - Strategic relationship planning with stakeholder management",
    "The Careful Evaluator": "HIGH - Thorough analytical processing with systematic evaluation",
    "The Self-Sufficient Achiever": "VERY HIGH - Strong independent planning and execution systems",
    "The Stability Creator": "HIGH - Security-focused planning with systematic risk management",
    "The Balanced Assessor": "HIGH - Realistic planning with balanced evaluation systems",
    "The Diplomatic Collaborator": "MODERATE - Relationship focus may delay decision-making"
  };
  return executiveFunction[personaName] || "MODERATE - Balanced executive function capacity";
}

// Clinical Intervention Frameworks
export const INTERVENTION_FRAMEWORKS = {
  "Schema Therapy": {
    description: "Direct work with underlying schema patterns",
    applicability: "High activation scores (>70%) with maladaptive expression",
    techniques: ["Cognitive restructuring", "Experiential exercises", "Behavioral experiments"],
    duration: "12-18 months for significant schema modification"
  },
  "Cognitive-Behavioral Coaching": {
    description: "Skill-building focused on adaptive behaviors",
    applicability: "Moderate activation scores (40-70%) with functional impairment",
    techniques: ["Behavioral modification", "Skill practice", "Cognitive reframing"],
    duration: "3-6 months for specific skill development"
  },
  "Strengths-Based Development": {
    description: "Building on existing adaptive patterns",
    applicability: "Adaptive expression patterns with growth opportunities",
    techniques: ["Strengths amplification", "Context expansion", "Integration work"],
    duration: "1-3 months for strengths optimization"
  },
  "Organizational Intervention": {
    description: "Environmental modifications to support adaptive expression",
    applicability: "Situational activation patterns with organizational factors",
    techniques: ["Role modification", "Team dynamics work", "Organizational culture adjustment"],
    duration: "3-12 months depending on organizational complexity"
  }
};

// Risk Assessment Framework
export interface RiskAssessment {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  factors: string[];
  recommendations: string[];
  monitoring: string[];
}

export function assessLeadershipRisk(personaScores: PersonaScore[]): RiskAssessment {
  const highActivationPersonas = personaScores.filter(p => p.percentage > 70);
  const problematicCombinations = identifyProblematicCombinations(personaScores);
  
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
  let factors: string[] = [];
  let recommendations: string[] = [];
  let monitoring: string[] = [];

  // High activation risk assessment
  if (highActivationPersonas.length >= 3) {
    riskLevel = 'HIGH';
    factors.push("Multiple high-activation patterns suggest significant behavioral rigidity");
    recommendations.push("Comprehensive leadership development program recommended");
    monitoring.push("Monitor for stress-related escalation of patterns");
  } else if (highActivationPersonas.length === 2) {
    riskLevel = 'MODERATE';
    factors.push("Dual high-activation patterns require development focus");
    recommendations.push("Targeted coaching for top two pattern areas");
    monitoring.push("Track pattern interaction under stress");
  }

  // Specific high-risk patterns
  const harshEnforcer = personaScores.find(p => p.publicName === "The Harsh Enforcer");
  if (harshEnforcer && harshEnforcer.percentage > 75) {
    riskLevel = riskLevel === 'LOW' ? 'MODERATE' : 'HIGH';
    factors.push("High punitiveness activation may impact team psychological safety");
    recommendations.push("Immediate coaching on positive reinforcement and psychological safety");
    monitoring.push("Monitor team engagement and turnover metrics");
  }

  const unfilteredReactor = personaScores.find(p => p.publicName === "The Unfiltered Reactor");
  if (unfilteredReactor && unfilteredReactor.percentage > 70) {
    riskLevel = riskLevel === 'LOW' ? 'MODERATE' : 'HIGH';
    factors.push("High reactivity patterns may create interpersonal challenges");
    recommendations.push("Emotional regulation training and communication filtering skills");
    monitoring.push("Monitor team relationship quality and communication effectiveness");
  }

  return { level: riskLevel, factors, recommendations, monitoring };
}

// Combination Analysis
export function identifyProblematicCombinations(personaScores: PersonaScore[]): string[] {
  const combinations = [];
  const topThree = personaScores.slice(0, 3);
  
  // Check for specific problematic combinations
  const hasHarshEnforcer = topThree.some(p => p.publicName === "The Harsh Enforcer");
  const hasUnfilteredReactor = topThree.some(p => p.publicName === "The Unfiltered Reactor");
  
  if (hasHarshEnforcer && hasUnfilteredReactor) {
    combinations.push("High standards combined with unfiltered expression may create team stress and interpersonal conflict");
  }

  const hasWithholder = topThree.some(p => p.publicName === "The Focus Leader");
  const hasClinger = topThree.some(p => p.publicName === "The Relationship Champion");
  
  if (hasWithholder && hasClinger) {
    combinations.push("Emotional withholding combined with relationship dependency creates confusing signals and attachment ambivalence");
  }

  const hasPowerBroker = topThree.some(p => p.publicName === "The Power Broker");
  const hasIndependent = topThree.some(p => p.publicName === "The Independent Innovator");
  
  if (hasPowerBroker && hasIndependent) {
    combinations.push("Control orientation combined with independence seeking may create internal tension and inconsistent leadership signals");
  }

  return combinations;
}

// Treatment Planning Framework
export interface TreatmentPlan {
  primaryTarget: string;
  secondaryTarget: string;
  interventionType: string;
  duration: string;
  techniques: string[];
  outcomes: string[];
  contraindications: string[];
}

export function generateTreatmentPlan(personaScores: PersonaScore[]): TreatmentPlan {
  const primary = personaScores[0];
  const secondary = personaScores[1];
  
  return {
    primaryTarget: `${primary.publicName} pattern optimization and adaptive expression enhancement`,
    secondaryTarget: `${secondary.publicName} integration with balanced activation`,
    interventionType: determineInterventionType(primary.percentage, secondary.percentage),
    duration: determineTreatmentDuration(primary.percentage),
    techniques: getRecommendedTechniques(primary.publicName, secondary.publicName),
    outcomes: getExpectedOutcomes(primary.publicName, secondary.publicName),
    contraindications: getContraindications(primary.publicName, secondary.publicName)
  };
}

function determineInterventionType(primaryScore: number, secondaryScore: number): string {
  if (primaryScore > 75) return "Intensive Schema-Focused Therapy";
  if (primaryScore > 60) return "Cognitive-Behavioral Leadership Coaching";
  if (primaryScore > 40) return "Strengths-Based Development Program";
  return "Supportive Leadership Enhancement";
}

function determineTreatmentDuration(primaryScore: number): string {
  if (primaryScore > 75) return "12-18 months with ongoing monitoring";
  if (primaryScore > 60) return "6-12 months with quarterly follow-up";
  if (primaryScore > 40) return "3-6 months with monthly check-ins";
  return "1-3 months with bi-weekly sessions";
}

function getRecommendedTechniques(primary: string, secondary: string): string[] {
  const techniques: Record<string, string[]> = {
    "The Strategic Influencer": ["Collaborative decision-making practice", "Shared power exercises", "Empowerment skill development"],
    "The Excellence Champion": ["Standard calibration exercises", "Progress celebration practices", "Flexibility training"],
    "The Standards Leader": ["Positive reinforcement training", "Psychological safety building", "Growth mindset development"],
    "The Authentic Communicator": ["Emotional regulation techniques", "Communication filtering skills", "Context sensitivity training"],
    "The Harmony Builder": ["Authentic voice development", "Healthy conflict navigation", "Decision confidence building"],
    "The Relationship Cultivator": ["Authentic relationship building", "Internal validation development", "Values-based decision making"],
    "The Relationship Champion": ["Boundary development", "Independence tolerance training", "Secure attachment building"],
    "The Focus Leader": ["Emotional intelligence integration", "Empathy building exercises", "Relationship data incorporation"],
    "The Service Leader": ["Boundary setting practices", "Self-care integration", "Sustainable service modeling"],
    "The Careful Evaluator": ["Decision confidence training", "Success recognition exercises", "Competence building activities"]
  };
  
  return techniques[primary] || ["Strengths amplification", "Skill practice", "Context expansion"];
}

function getExpectedOutcomes(primary: string, secondary: string): string[] {
  const outcomes: Record<string, string[]> = {
    "The Strategic Influencer": ["Increased collaborative leadership", "Enhanced team empowerment", "Balanced influence approach"],
    "The Excellence Champion": ["Flexible excellence standards", "Improved team morale", "Balanced achievement focus"],
    "The Standards Leader": ["Positive team culture", "Increased psychological safety", "Growth-oriented feedback"],
    "The Relationship Champion": ["Healthy professional boundaries", "Balanced team connection", "Enhanced autonomy support"],
    "The Harmony Builder": ["Authentic voice expression", "Healthy conflict engagement", "Decisive leadership confidence"],
    "The Relationship Cultivator": ["Authentic stakeholder relationships", "Internal confidence building", "Values-driven decision making"],
    "The Focus Leader": ["Enhanced emotional intelligence", "Improved team engagement", "Balanced task-relationship focus"],
    "The Service Leader": ["Sustainable leadership practices", "Healthy boundary maintenance", "Balanced self-care modeling"],
    "The Careful Evaluator": ["Increased decision confidence", "Recognition of competence", "Balanced evaluation approach"],
    "The Authentic Communicator": ["Improved emotional regulation", "Enhanced communication effectiveness", "Context-sensitive expression"]
  };
  
  return outcomes[primary] || ["Enhanced adaptive expression", "Improved leadership effectiveness", "Better team dynamics"];
}

function getContraindications(primary: string, secondary: string): string[] {
  const contraindications: Record<string, string[]> = {
    "The Strategic Influencer": ["Avoid power reduction without skill building", "Don't suppress influence capabilities", "Maintain achievement orientation"],
    "The Excellence Champion": ["Don't eliminate standards entirely", "Avoid perfectionism shaming", "Maintain excellence focus"],
    "The Standards Leader": ["Avoid accountability elimination", "Don't suppress leadership authority", "Maintain performance standards"],
    "The Harmony Builder": ["Avoid conflict elimination", "Don't suppress harmony skills", "Maintain collaboration strengths"],
    "The Relationship Cultivator": ["Avoid relationship avoidance", "Don't eliminate stakeholder awareness", "Maintain networking abilities"],
    "The Focus Leader": ["Don't eliminate task focus", "Avoid productivity reduction", "Maintain goal orientation"],
    "The Service Leader": ["Avoid service elimination", "Don't suppress generosity", "Maintain team support strengths"],
    "The Relationship Champion": ["Avoid relationship avoidance", "Don't eliminate connection focus", "Maintain loyalty building"]
  };
  
  return contraindications[primary] || ["Avoid pattern suppression", "Maintain adaptive elements", "Support gradual change"];
}

// Research Significance Assessment
interface ResearchSignificance {
  uniqueness: 'HIGH' | 'MODERATE' | 'LOW';
  clinicalValue: string;
  researchContribution: string;
  followUpRecommendation: string;
}

export function assessResearchSignificance(personaScores: PersonaScore[]): ResearchSignificance {
  const unusualPatterns = personaScores.filter(p => p.percentage > 80 || p.percentage < 10);
  const domainDistribution = analyzeDomainDistribution(personaScores);
  
  return {
    uniqueness: unusualPatterns.length > 2 ? "HIGH" : unusualPatterns.length > 0 ? "MODERATE" : "LOW",
    clinicalValue: assessClinicalValue(personaScores),
    researchContribution: assessResearchContribution(domainDistribution),
    followUpRecommendation: generateFollowUpRecommendation(personaScores)
  };
}

function analyzeDomainDistribution(personaScores: PersonaScore[]): Record<string, number> {
  const domainCounts: Record<string, number> = {};
  personaScores.forEach(p => {
    domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
  });
  return domainCounts;
}

function assessClinicalValue(personaScores: PersonaScore[]): string {
  const highActivation = personaScores.filter(p => p.percentage > 70);
  if (highActivation.length >= 3) {
    return "HIGH - Multiple high activation patterns provide significant clinical insight";
  } else if (highActivation.length >= 2) {
    return "MODERATE - Dual activation patterns offer valuable clinical data";
  }
  return "STANDARD - Typical activation patterns with general clinical utility";
}

function assessResearchContribution(domainDistribution: Record<string, number>): string {
  const dominantDomains = Object.entries(domainDistribution).filter(([_, count]) => count > 2);
  if (dominantDomains.length > 1) {
    return "Cross-domain activation patterns contribute to leadership schema integration research";
  } else if (dominantDomains.length === 1) {
    return "Single-domain concentration provides insight into specialized leadership patterns";
  }
  return "Balanced domain distribution offers general leadership development insights";
}

function generateFollowUpRecommendation(personaScores: PersonaScore[]): string {
  const primary = personaScores[0];
  if (primary.percentage > 75) {
    return "6-month follow-up assessment recommended to track pattern evolution and intervention effectiveness";
  } else if (primary.percentage > 60) {
    return "3-month follow-up recommended to monitor development progress and adaptive changes";
  }
  return "Annual follow-up sufficient for general leadership development tracking";
}

// Additional exports (main functions are already exported above)