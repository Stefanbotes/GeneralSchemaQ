
// Framework-Compliant Persona Scoring Algorithm
// Implementation of the Complete Report Framework Guide
// 
// ⚠️ DEPRECATION NOTICE: This persona-based scoring approach is being replaced
// by the new shared schema-based scoring system (shared-schema-scoring.ts) which:
// - Uses shared LASBI mapping loader for consistency with Studio
// - Implements unrounded scoring with proper tie-breakers  
// - Eliminates hardcoded arrays and fragile mappings
// - Provides better accuracy and Studio parity
//
// This file is kept for backward compatibility but new development should use
// the shared schema scoring approach.

import { ENHANCED_PERSONA_MAPPING, PERSONA_QUESTION_MAPPING, PersonaDetails } from '@/data/enhanced-persona-mapping';

export interface PersonaScore {
  clinicalName: string;
  publicName: string;
  score: number; // Raw average score (e.g., 3.2 on 1-5 scale)
  percentage: number; // Activation index (0-100), kept for backward compatibility
  activationIndex: number; // Clearer name: normalized activation index (0-100)
  domain: string;
  questions: number[];
  rank: number;
  clinicalSignificance: 'HIGH' | 'MODERATE' | 'LOW';
  strengthFocus: string;
  publicDescription: string;
  clinicalDescription: string;
  developmentEdge: string;
}

export interface DomainAnalysis {
  domainName: string;
  averageActivation: number;
  primaryPersona: PersonaScore;
  secondaryPersonas: PersonaScore[];
  clinicalSignificance: 'HIGH' | 'MODERATE' | 'LOW';
  organizationalImpact: string;
}

export interface CompleteAnalysis {
  personaScores: PersonaScore[];
  primaryPersona: PersonaScore;
  secondaryPersona: PersonaScore;
  tertiaryPersona: PersonaScore;
  domainAnalysis: DomainAnalysis[];
  overallClinicalSignificance: string;
  schemaActivationSummary: string;
}

// Domain structure from framework (corrected per Clinical_Framework_Mapping.ts)
const DOMAIN_STRUCTURE = {
  "Disconnection & Rejection": ["The Clinger", "The Invisible Operator", "The Guarded Strategist", "The Outsider"],
  "Impaired Autonomy & Performance": ["The Self-Doubter", "The Reluctant Rely-er", "The Safety Strategist"],
  "Impaired Limits": ["The Overgiver", "The Over-Adapter", "The Suppressed Voice", "The Withholder"],
  "Other-Directedness": ["The Image Manager", "The Power Broker"],
  "Overvigilance & Inhibition": ["The Cautious Realist", "The Stoic Mask", "The Perfectionist Driver", "The Harsh Enforcer", "The Unfiltered Reactor"]
};

export function calculateFrameworkPersonaScores(responses: Record<string, string>): PersonaScore[] {
  const scores: PersonaScore[] = [];

  // Calculate scores for each persona based on framework mapping
  Object.entries(PERSONA_QUESTION_MAPPING).forEach(([clinicalName, questionIds]) => {
    const questionScores = questionIds.map(id => {
      const responseValue = responses[id.toString()];
      return responseValue ? parseInt(responseValue) : 0;
    });
    
    const totalScore = questionScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / questionIds.length;
    // Note: This is a normalized index (0-100), not a true percentage
    // Based on 1-6 scale: (average/6)*100. Values >80% indicate responses >4.8
    const activationIndex = Math.round((averageScore / 6) * 100);
    
    const personaDetails = ENHANCED_PERSONA_MAPPING[clinicalName];
    
    if (personaDetails) {
      scores.push({
        clinicalName,
        publicName: personaDetails.publicName,
        score: averageScore,
        percentage: activationIndex, // Keep for backward compatibility
        activationIndex, // New clearer name
        domain: personaDetails.domain,
        questions: questionIds,
        rank: 0, // Will be set after sorting
        clinicalSignificance: assessClinicalSignificance(activationIndex),
        strengthFocus: personaDetails.strengthFocus,
        publicDescription: personaDetails.publicDescription,
        clinicalDescription: personaDetails.clinicalDescription,
        developmentEdge: personaDetails.developmentEdge
      });
    }
  });

  // Sort by percentage and assign ranks
  scores.sort((a, b) => b.percentage - a.percentage);
  scores.forEach((score, index) => {
    score.rank = index + 1;
  });

  return scores;
}

export function analyzeDomains(personaScores: PersonaScore[]): DomainAnalysis[] {
  const domainAnalyses: DomainAnalysis[] = [];

  Object.entries(DOMAIN_STRUCTURE).forEach(([domainName, personaNames]) => {
    const domainScores = personaScores.filter(score => personaNames.includes(score.clinicalName));
    
    if (domainScores.length > 0) {
      const averageActivation = domainScores.reduce((sum, score) => sum + score.percentage, 0) / domainScores.length;
      const sortedDomainScores = domainScores.sort((a, b) => b.percentage - a.percentage);
      
      domainAnalyses.push({
        domainName,
        averageActivation: Math.round(averageActivation),
        primaryPersona: sortedDomainScores[0],
        secondaryPersonas: sortedDomainScores.slice(1),
        clinicalSignificance: assessClinicalSignificance(averageActivation),
        organizationalImpact: generateOrganizationalImpact(domainName, averageActivation)
      });
    }
  });

  return domainAnalyses.sort((a, b) => b.averageActivation - a.averageActivation);
}

export function generateCompleteAnalysis(responses: Record<string, string>): CompleteAnalysis {
  const personaScores = calculateFrameworkPersonaScores(responses);
  const domainAnalysis = analyzeDomains(personaScores);
  
  return {
    personaScores,
    primaryPersona: personaScores[0],
    secondaryPersona: personaScores[1],
    tertiaryPersona: personaScores[2],
    domainAnalysis,
    overallClinicalSignificance: assessOverallClinicalSignificance(personaScores),
    schemaActivationSummary: generateSchemaActivationSummary(personaScores, domainAnalysis)
  };
}

function assessClinicalSignificance(percentage: number): 'HIGH' | 'MODERATE' | 'LOW' {
  if (percentage >= 70) return 'HIGH';
  if (percentage >= 50) return 'MODERATE';
  return 'LOW';
}

function assessOverallClinicalSignificance(personaScores: PersonaScore[]): string {
  const highSignificanceCount = personaScores.filter(score => score.clinicalSignificance === 'HIGH').length;
  const moderateSignificanceCount = personaScores.filter(score => score.clinicalSignificance === 'MODERATE').length;
  
  if (highSignificanceCount >= 3) {
    return "HIGH - Multiple significant schema activations requiring clinical attention";
  } else if (highSignificanceCount >= 1 || moderateSignificanceCount >= 4) {
    return "MODERATE - Some schema activations of clinical interest for development";
  } else {
    return "LOW - Within normal range with standard Inner Personadevelopment appropriate";
  }
}

function generateOrganizationalImpact(domainName: string, averageActivation: number): string {
  const impactLevel = averageActivation >= 70 ? "significant" : averageActivation >= 50 ? "moderate" : "minimal";
  
  const impacts: Record<string, string> = {
    "Disconnection & Rejection": `${impactLevel} impact on trust-building and relationship maintenance in organizational contexts`,
    "Impaired Autonomy & Performance": `${impactLevel} impact on decision-making independence and performance confidence`,
    "Impaired Limits": `${impactLevel} impact on boundary-setting and sustainable Inner Personapractices`,
    "Other-Directedness": `${impactLevel} impact on authentic Inner Personaexpression and stakeholder management`,
    "Overvigilance & Inhibition": `${impactLevel} impact on innovation, risk-taking, and team psychological safety`
  };

  return impacts[domainName] || `${impactLevel} organizational impact`;
}

function generateSchemaActivationSummary(personaScores: PersonaScore[], domainAnalysis: DomainAnalysis[]): string {
  const primary = personaScores[0];
  const primaryDomain = domainAnalysis.find(d => d.domainName === primary.domain);
  
  return `This Inner Personaprofile demonstrates primary activation in the ${primary.domain} domain (${primaryDomain?.averageActivation}% average activation) with ${primary.clinicalName} as the dominant pattern (${primary.percentage}% activation). This manifests as ${primary.strengthFocus.toLowerCase()} in organizational contexts, with clinical significance assessed as ${primary.clinicalSignificance}. The pattern suggests ${primary.clinicalSignificance === 'HIGH' ? 'significant therapeutic potential' : primary.clinicalSignificance === 'MODERATE' ? 'moderate development focus areas' : 'standard Inner Personadevelopment approaches'} would be most beneficial for optimal organizational functioning.`;
}

// Behavioral prediction model implementation
export function generateBehavioralPredictions(analysis: CompleteAnalysis): {
  stressResponse: string;
  conflictStyle: string;
  decisionMaking: string;
  teamDynamics: string;
  changeResponse: string;
} {
  const primary = analysis.primaryPersona;
  
  return {
    stressResponse: predictStressResponse(primary),
    conflictStyle: predictConflictStyle(primary),
    decisionMaking: predictDecisionMaking(primary),
    teamDynamics: predictTeamDynamics(primary),
    changeResponse: predictChangeResponse(primary)
  };
}

function predictStressResponse(persona: PersonaScore): string {
  const stressPatterns: Record<string, string> = {
    "The Clinger": "Under stress, likely to increase monitoring and control behaviors, seeking more reassurance and connection from team members",
    "The Invisible Operator": "Under stress, likely to withdraw further and become less visible, potentially missing opportunities to contribute valuable insights",
    "The Withholder": "Under stress, likely to become more task-focused and emotionally distant, potentially alienating team members who need support",
    "The Guarded Strategist": "Under stress, likely to increase vigilance and protective measures, potentially becoming overly cautious and slowing decision-making",
    "The Outsider": "Under stress, likely to become more isolated and independent, potentially missing collaborative opportunities and support",
    "The Self-Doubter": "Under stress, likely to increase self-questioning and seek more validation, potentially becoming indecisive and ineffective",
    "The Reluctant Rely-er": "Under stress, likely to take on more individual responsibility, increasing risk of burnout and team underutilization",
    "The Safety Strategist": "Under stress, likely to become more risk-averse and controlling, potentially stifling innovation and adaptability",
    "The Overgiver": "Under stress, likely to increase self-sacrifice behaviors, risking personal burnout and creating team dependency",
    "The Over-Adapter": "Under stress, likely to accommodate even more, potentially losing authentic voice and critical perspectives",
    "The Suppressed Voice": "Under stress, likely to become even more diplomatically neutral, missing opportunities to provide valuable Inner Personainput",
    "The Image Manager": "Under stress, likely to increase concern with perception and approval, potentially compromising authentic decision-making",
    "The Power Broker": "Under stress, likely to increase control and dominance behaviors, potentially alienating team members and collaborators",
    "The Cautious Realist": "Under stress, likely to become more pessimistic and risk-focused, potentially demoralizing team and limiting opportunities",
    "The Stoic Mask": "Under stress, likely to increase emotional suppression, potentially missing important emotional information and team needs",
    "The Perfectionist Driver": "Under stress, likely to increase standards and criticism, potentially creating team anxiety and reducing innovation",
    "The Harsh Enforcer": "Under stress, likely to increase punitive responses, potentially damaging team psychological safety and trust",
    "The Unfiltered Reactor": "Under stress, likely to become more impulsive and reactive, potentially damaging relationships and team dynamics"
  };
  
  return stressPatterns[persona.clinicalName] || "Stress response patterns require individual assessment";
}

function predictConflictStyle(persona: PersonaScore): string {
  const conflictStyles: Record<string, string> = {
    "The Clinger": "Pursues resolution through relationship repair, may become overly accommodating to preserve connection",
    "The Invisible Operator": "Avoids direct confrontation, prefers working behind scenes to resolve issues indirectly",
    "The Withholder": "Compartmentalizes conflict, focuses on task resolution while avoiding emotional processing",
    "The Guarded Strategist": "Approaches conflict with caution and extensive preparation, may be slow to trust resolution",
    "The Outsider": "Handles conflict independently, may not seek collaborative resolution or team input",
    "The Self-Doubter": "Second-guesses own position, may defer to others even when having valid perspectives",
    "The Reluctant Rely-er": "Takes personal responsibility for conflict resolution, may not leverage team resources effectively",
    "The Safety Strategist": "Seeks predictable resolution processes, may avoid necessary but risky confrontations",
    "The Overgiver": "Sacrifices own needs for conflict resolution, may create resentment through over-accommodation",
    "The Over-Adapter": "Adapts position to reduce conflict, may lose important perspectives in pursuit of harmony",
    "The Suppressed Voice": "Facilitates others' conflict resolution while withholding own authentic perspective",
    "The Image Manager": "Manages conflict with attention to how resolution affects reputation and relationships",
    "The Power Broker": "Uses influence and control to drive preferred resolution, may not seek win-win outcomes",
    "The Cautious Realist": "Focuses on potential negative outcomes of conflict, may become paralyzed by worst-case scenarios",
    "The Stoic Mask": "Suppresses emotional reactions during conflict, may miss important interpersonal dynamics",
    "The Perfectionist Driver": "Holds high standards for conflict resolution, may create additional tension through criticism",
    "The Harsh Enforcer": "Uses direct confrontation and consequences, may damage relationships through punitive approach",
    "The Unfiltered Reactor": "Expresses immediate reactions, may escalate conflict through impulsive responses"
  };
  
  return conflictStyles[persona.clinicalName] || "Conflict style requires individual assessment";
}

function predictDecisionMaking(persona: PersonaScore): string {
  const decisionPatterns: Record<string, string> = {
    "The Clinger": "Makes decisions with heavy consideration of relationship impact, seeks team alignment and connection",
    "The Invisible Operator": "Prefers thorough analysis before decisions, may not advocate strongly for own recommendations",
    "The Withholder": "Makes task-focused decisions efficiently, may not incorporate emotional or interpersonal data",
    "The Guarded Strategist": "Extensively researches risks before deciding, creates multiple contingency plans",
    "The Outsider": "Makes independent decisions based on unique perspective, may not seek collaborative input",
    "The Self-Doubter": "Second-guesses decisions extensively, seeks validation and input from others before committing",
    "The Reluctant Rely-er": "Takes personal responsibility for decision outcomes, may not delegate decision-making appropriately",
    "The Safety Strategist": "Prioritizes predictable outcomes, may avoid decisions that involve uncertainty or risk",
    "The Overgiver": "Makes decisions that benefit others, may sacrifice optimal outcomes for team satisfaction",
    "The Over-Adapter": "Adapts decisions to accommodate various perspectives, may compromise effectiveness for consensus",
    "The Suppressed Voice": "Facilitates group decision-making while withholding personal preferences and insights",
    "The Image Manager": "Considers perception and approval in decision-making, may prioritize image over optimal outcomes",
    "The Power Broker": "Uses influence and control to drive preferred decisions, may not incorporate collaborative input",
    "The Cautious Realist": "Focuses on potential problems in decisions, may become paralyzed by negative possibilities",
    "The Stoic Mask": "Makes decisions based on rational analysis, may not incorporate emotional intelligence or team needs",
    "The Perfectionist Driver": "Seeks perfect decisions with extensive analysis, may delay decisions to achieve impossible standards",
    "The Harsh Enforcer": "Makes decisive judgments with clear consequences, may not consider developmental or relationship impact",
    "The Unfiltered Reactor": "Makes impulsive decisions based on immediate reactions, may not consider long-term consequences"
  };
  
  return decisionPatterns[persona.clinicalName] || "Decision-making style requires individual assessment";
}

function predictTeamDynamics(persona: PersonaScore): string {
  const teamPatterns: Record<string, string> = {
    "The Clinger": "Creates emotionally intensive team relationships, team members may feel controlled but also deeply supported",
    "The Invisible Operator": "Provides valuable behind-the-scenes support, team may underutilize leader's strategic insights",
    "The Withholder": "Creates efficient but potentially cold team environment, members may feel disconnected despite high performance",
    "The Guarded Strategist": "Team benefits from careful risk management but may become overly cautious and slow to innovate",
    "The Outsider": "Brings innovative thinking to team but may not build strong collaborative relationships",
    "The Self-Doubter": "Team may lose confidence in Inner Personadecisiveness, valuable insights may be discounted",
    "The Reluctant Rely-er": "Team may become dependent on leader's individual performance rather than developing own capabilities",
    "The Safety Strategist": "Creates stable team environment but may limit growth opportunities and innovation",
    "The Overgiver": "Team feels supported but may become dependent, leader risk of burnout affects team stability",
    "The Over-Adapter": "Team enjoys harmony but may miss valuable Inner Personaperspective and authentic challenge",
    "The Suppressed Voice": "Team experiences smooth facilitation but misses leader's unique insights and perspectives",
    "The Image Manager": "Team benefits from strong stakeholder relationships but may question leader authenticity",
    "The Power Broker": "Team may achieve results through leader influence but could become disengaged from autonomous contribution",
    "The Cautious Realist": "Team benefits from realistic planning but may become demoralized by persistent focus on problems",
    "The Stoic Mask": "Team appreciates stability but may feel emotionally disconnected and unsupported",
    "The Perfectionist Driver": "Team produces high-quality work but may experience anxiety and reduced innovation",
    "The Harsh Enforcer": "Team performs to standards through fear but psychological safety and creativity are compromised",
    "The Unfiltered Reactor": "Team appreciates honesty but may feel unsafe expressing themselves due to unpredictable reactions"
  };
  
  return teamPatterns[persona.clinicalName] || "Team dynamics require individual assessment";
}

function predictChangeResponse(persona: PersonaScore): string {
  const changePatterns: Record<string, string> = {
    "The Clinger": "Anxious about change that threatens relationships, needs reassurance about continued connection and support",
    "The Invisible Operator": "Adapts to change privately, may not advocate for necessary modifications or voice concerns",
    "The Withholder": "Focuses on task implications of change, may not address emotional impact on team",
    "The Guarded Strategist": "Highly cautious about change, needs extensive planning and risk mitigation before accepting",
    "The Outsider": "May embrace innovative changes while resisting collaborative implementation processes",
    "The Self-Doubter": "Anxious about change, seeks extensive validation and support before adapting to new approaches",
    "The Reluctant Rely-er": "Takes personal responsibility for change success, may not effectively leverage team resources",
    "The Safety Strategist": "Resistant to change that increases uncertainty, needs clear stability measures and transition plans",
    "The Overgiver": "Supports others through change while neglecting own adaptation needs, risk of burnout during transitions",
    "The Over-Adapter": "Readily accommodates change demands but may lose authentic voice about what changes are actually needed",
    "The Suppressed Voice": "Facilitates others' change adaptation while withholding own reactions and insights about change impact",
    "The Image Manager": "Manages change with attention to how adaptation affects reputation and stakeholder relationships",
    "The Power Broker": "Uses influence to control change direction, may resist changes that reduce personal control or status",
    "The Cautious Realist": "Focuses on potential negative consequences of change, may resist necessary adaptations due to risk concerns",
    "The Stoic Mask": "Maintains composed facade during change while suppressing emotional reactions and concerns",
    "The Perfectionist Driver": "Demands perfect change implementation, may create additional stress during already challenging transitions",
    "The Harsh Enforcer": "Uses punishment to force change compliance, may create resistance and undermine change success",
    "The Unfiltered Reactor": "Expresses immediate reactions to change, may create instability during transition periods"
  };
  
  return changePatterns[persona.clinicalName] || "Change response requires individual assessment";
}

// Schema therapy correlates analysis
export function generateSchemaCorrelates(analysis: CompleteAnalysis): string {
  const primary = analysis.primaryPersona;
  const secondary = analysis.secondaryPersona;
  const tertiary = analysis.tertiaryPersona;
  
  return `Schema therapy analysis reveals primary activation of ${primary.clinicalName.replace('The ', '').toLowerCase()} patterns (${primary.percentage}% activation) within the ${primary.domain} domain. This manifests organizationally as ${primary.strengthFocus.toLowerCase()} with ${primary.clinicalSignificance.toLowerCase()} clinical significance. Secondary activation patterns include ${secondary.clinicalName.replace('The ', '').toLowerCase()} (${secondary.percentage}%) and ${tertiary.clinicalName.replace('The ', '').toLowerCase()} (${tertiary.percentage}%), suggesting a complex interaction of schemas that requires integrated therapeutic and developmental approaches. The overall pattern indicates ${analysis.overallClinicalSignificance.toLowerCase()}, with particular attention needed for ${primary.domain.toLowerCase()} domain schemas in organizational Inner Personacontexts.`;
}

// Clinical recommendations generator
export function generateClinicalRecommendations(analysis: CompleteAnalysis): {
  therapeuticModality: string;
  focusAreas: string[];
  interventionApproaches: string[];
  contraindications: string[];
} {
  const primary = analysis.primaryPersona;
  
  return {
    therapeuticModality: getTherapeuticModality(primary),
    focusAreas: getClinicalFocusAreas(primary),
    interventionApproaches: getInterventionApproaches(primary),
    contraindications: getContraindications(primary)
  };
}

function getTherapeuticModality(persona: PersonaScore): string {
  const modalities: Record<string, string> = {
    "The Clinger": "Schema Therapy with focus on Abandonment/Instability schema, combined with attachment-based interventions",
    "The Invisible Operator": "Cognitive Behavioral Therapy for shame and self-worth, combined with assertiveness training",
    "The Withholder": "Emotionally Focused Therapy to develop emotional awareness and expression skills",
    "The Guarded Strategist": "Trauma-informed therapy with gradual trust-building and safety establishment",
    "The Outsider": "Interpersonal Therapy to develop connection skills while maintaining authentic independence",
    "The Self-Doubter": "Cognitive Behavioral Therapy for competence beliefs, combined with graduated exposure therapy",
    "The Reluctant Rely-er": "Schema Therapy for dependence fears, with controlled delegation and trust-building exercises",
    "The Safety Strategist": "Anxiety management therapy with gradual exposure to controlled risks and uncertainty",
    "The Overgiver": "Boundary-setting therapy combined with self-compassion and sustainable care practices",
    "The Over-Adapter": "Assertiveness training combined with authentic self-expression therapy",
    "The Suppressed Voice": "Expressive therapy to develop voice and perspective-sharing skills",
    "The Image Manager": "Authenticity-focused therapy to develop internal validation and genuine self-expression",
    "The Power Broker": "Narcissistic patterns therapy focused on empathy development and collaborative leadership",
    "The Cautious Realist": "Cognitive therapy for pessimistic thought patterns, combined with optimism and resilience training",
    "The Stoic Mask": "Emotional intelligence therapy to develop appropriate emotional expression and connection",
    "The Perfectionist Driver": "Schema Therapy for unrelenting standards, combined with self-compassion and flexibility training",
    "The Harsh Enforcer": "Anger management and empathy development, combined with positive reinforcement training",
    "The Unfiltered Reactor": "Emotional regulation therapy with impulse control and communication timing skills"
  };
  
  return modalities[persona.clinicalName] || "Individual assessment required for therapeutic modality selection";
}

function getClinicalFocusAreas(persona: PersonaScore): string[] {
  const focusAreas: Record<string, string[]> = {
    "The Clinger": ["Attachment security", "Boundary development", "Independence skills", "Anxiety management"],
    "The Invisible Operator": ["Self-worth building", "Visibility comfort", "Contribution recognition", "Shame healing"],
    "The Withholder": ["Emotional awareness", "Expression skills", "Intimacy capacity", "Vulnerability tolerance"],
    "The Guarded Strategist": ["Trust development", "Safety assessment accuracy", "Collaboration skills", "Trauma processing"],
    "The Outsider": ["Connection skills", "Belonging development", "Collaborative capacity", "Social integration"],
    "The Self-Doubter": ["Competence recognition", "Decision confidence", "Self-trust building", "Performance anxiety"],
    "The Reluctant Rely-er": ["Delegation skills", "Support acceptance", "Interdependence capacity", "Control flexibility"],
    "The Safety Strategist": ["Risk tolerance", "Uncertainty management", "Flexibility development", "Innovation capacity"],
    "The Overgiver": ["Boundary setting", "Self-care prioritization", "Sustainable giving", "Resentment prevention"],
    "The Over-Adapter": ["Authentic expression", "Assertiveness skills", "Preference articulation", "Conflict tolerance"],
    "The Suppressed Voice": ["Voice development", "Perspective sharing", "Authentic communication", "Inner Personapresence"],
    "The Image Manager": ["Internal validation", "Authentic expression", "Genuine relationship building", "Self-acceptance"],
    "The Power Broker": ["Empathy development", "Collaborative leadership", "Humility building", "Influence ethics"],
    "The Cautious Realist": ["Optimism development", "Possibility thinking", "Positive focus", "Resilience building"],
    "The Stoic Mask": ["Emotional expression", "Vulnerability skills", "Connection deepening", "Authentic leadership"],
    "The Perfectionist Driver": ["Flexibility development", "Good enough acceptance", "Self-compassion", "Process focus"],
    "The Harsh Enforcer": ["Empathy building", "Positive reinforcement", "Compassionate accountability", "Patience development"],
    "The Unfiltered Reactor": ["Impulse control", "Communication timing", "Emotional regulation", "Relationship repair"]
  };
  
  return focusAreas[persona.clinicalName] || ["Individual assessment required"];
}

function getInterventionApproaches(persona: PersonaScore): string[] {
  const interventions: Record<string, string[]> = {
    "The Clinger": ["Graduated independence exercises", "Attachment security building", "Boundary practice", "Anxiety coping skills"],
    "The Invisible Operator": ["Visibility exposure therapy", "Strength recognition exercises", "Contribution highlighting", "Shame resilience building"],
    "The Withholder": ["Emotion identification practice", "Safe expression exercises", "Vulnerability challenges", "Intimacy skill building"],
    "The Guarded Strategist": ["Trust-building exercises", "Safety assessment calibration", "Collaboration practice", "Protective factor development"],
    "The Outsider": ["Connection skill development", "Group participation practice", "Collaboration exercises", "Belonging cultivation"],
    "The Self-Doubter": ["Competence evidence gathering", "Decision-making practice", "Self-trust exercises", "Performance confidence building"],
    "The Reluctant Rely-er": ["Delegation experiments", "Support-seeking practice", "Interdependence exercises", "Control release training"],
    "The Safety Strategist": ["Controlled risk-taking", "Uncertainty tolerance building", "Flexibility practice", "Innovation encouragement"],
    "The Overgiver": ["Boundary-setting practice", "Self-care scheduling", "Reciprocity awareness", "Sustainable service"],
    "The Over-Adapter": ["Authentic expression exercises", "Assertiveness training", "Preference identification", "Conflict engagement practice"],
    "The Suppressed Voice": ["Voice strengthening exercises", "Perspective articulation", "Communication confidence", "Inner Personavisibility"],
    "The Image Manager": ["Authenticity practice", "Internal validation building", "Genuine expression", "Self-acceptance work"],
    "The Power Broker": ["Empathy exercises", "Collaborative Inner Personapractice", "Humility building", "Ethical influence training"],
    "The Cautious Realist": ["Optimism exercises", "Positive focus training", "Possibility exploration", "Resilience building"],
    "The Stoic Mask": ["Emotional expression practice", "Vulnerability exercises", "Connection deepening", "Authentic Inner Personadevelopment"],
    "The Perfectionist Driver": ["Flexibility training", "Good enough practice", "Self-compassion exercises", "Process appreciation"],
    "The Harsh Enforcer": ["Empathy building exercises", "Positive reinforcement training", "Compassionate accountability", "Patience development"],
    "The Unfiltered Reactor": ["Pause techniques", "Communication timing", "Emotional regulation skills", "Relationship repair training"]
  };
  
  return interventions[persona.clinicalName] || ["Individual intervention planning required"];
}

function getContraindications(persona: PersonaScore): string[] {
  const contraindications: Record<string, string[]> = {
    "The Clinger": ["Isolation therapy", "Attachment disruption", "Harsh boundary enforcement", "Abandonment triggers"],
    "The Invisible Operator": ["Forced visibility", "Shame-based interventions", "Criticism focus", "Public exposure"],
    "The Withholder": ["Emotional flooding", "Forced vulnerability", "Intimacy pressure", "Expression demands"],
    "The Guarded Strategist": ["Trust-breaking exercises", "Safety minimization", "Naive optimism promotion", "Vulnerability pressure"],
    "The Outsider": ["Forced conformity", "Group pressure", "Independence reduction", "Uniqueness suppression"],
    "The Self-Doubter": ["Competence questioning", "Performance pressure", "Decision forcing", "Confidence undermining"],
    "The Reluctant Rely-er": ["Dependency creation", "Control removal", "Support forcing", "Independence undermining"],
    "The Safety Strategist": ["Reckless risk-taking", "Safety undermining", "Chaos introduction", "Unpredictability"],
    "The Overgiver": ["Guilt-based interventions", "Service demands", "Self-sacrifice promotion", "Boundary violations"],
    "The Over-Adapter": ["Accommodation demands", "Conflict avoidance", "Voice suppression", "Harmony pressure"],
    "The Suppressed Voice": ["Voice criticism", "Perspective dismissal", "Communication judgment", "Expression punishment"],
    "The Image Manager": ["Image attacks", "Approval withdrawal", "Reputation threats", "Authenticity forcing"],
    "The Power Broker": ["Power stripping", "Humiliation tactics", "Control removal", "Status attacks"],
    "The Cautious Realist": ["Reality denial", "Optimism forcing", "Risk minimization", "Consequence ignoring"],
    "The Stoic Mask": ["Emotional forcing", "Vulnerability demands", "Composure attacks", "Stability threats"],
    "The Perfectionist Driver": ["Standard lowering", "Imperfection forcing", "Quality attacks", "Excellence undermining"],
    "The Harsh Enforcer": ["Leniency forcing", "Accountability removal", "Standard elimination", "Consequence avoidance"],
    "The Unfiltered Reactor": ["Expression suppression", "Authenticity attacks", "Communication restriction", "Reaction punishment"]
  };
  
  return contraindications[persona.clinicalName] || ["Individual contraindication assessment required"];
}
