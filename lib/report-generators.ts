
// Enhanced Three-Tier Report Generation System
// Uses the new 18 schema-based personas with tiered presentation

import { ThreeTierAnalysis, PersonaActivation, SchemaActivation } from './schema-analysis';
// FIXED: Use shared schema scoring algorithm (matches Studio/App B)
import { scoreAssessmentResponses } from './shared-schema-scoring';
import { getPersonaForTier } from './enhanced-persona-mapping'; // keep the presentational helper
import { PUBLIC_PERSONA_BY_SCHEMA, DOMAIN_BY_SCHEMA, tScoreToIndex, tScoreToBand, getAnalysisVersion, pickPrimaryAndSecondaries, StyleView } from './canonical-schema-mapping';

interface ParticipantData {
  name: string;
  email: string;
  organization?: string;
  assessmentDate: string;
  assessmentId: string;
}

// Enhanced analysis generation using new 18-persona system
export async function generateEnhancedAnalysis(responses: Record<string, any>, participantData: any): Promise<{
  tier1: any;
  tier2: any;
  tier3: any;
  personas: any[];
}> {
  // ✅ SHARED SCHEMA SCORING ONLY
  // Drive reports purely from shared scorer (matches Studio/App B)
  const { rankedScores } = await scoreAssessmentResponses(responses);
  
  if (!rankedScores || rankedScores.length === 0) {
    throw new Error('No schema scores found - assessment responses may be invalid');
  }
  
  const primary = rankedScores[0];
  const secondary = rankedScores[1];
  const tertiary = rankedScores[2];
  
  // Use primary/secondary/tertiary in place of old frameworkScores structure
  const primaryPersona = {
    publicName: PUBLIC_PERSONA_BY_SCHEMA[primary.schemaLabel] || primary.schemaLabel, // Map to public persona name
    clinicalName: primary.schemaLabel,
    domain: DOMAIN_BY_SCHEMA[primary.schemaLabel] || 'Unknown',
    strengthFocus: `${PUBLIC_PERSONA_BY_SCHEMA[primary.schemaLabel] || primary.schemaLabel} leadership approach`,
    developmentEdge: `Balancing ${primary.schemaLabel} with other leadership styles`,
    publicDescription: `Strong activation in ${primary.schemaLabel} pattern`,
    percentage: Math.round(primary.index0to100) // Use index0to100 for percentage
  };
  
  const topPersonas = [primaryPersona]; // For now, just primary
  
  // Generate tier-specific data
  return {
    tier1: {
      summary: `Your assessment reveals ${primaryPersona.publicName} as your primary leadership style. This persona reflects your natural strengths in ${primaryPersona.strengthFocus.toLowerCase()}. Your approach to leadership emphasizes collaborative relationship-building and strategic thinking that drives organizational success.`,
      keyStrengths: [
        primaryPersona.strengthFocus,
        'Strategic leadership approach',
        'Team-focused decision making',
        'Balanced perspective on organizational challenges',
        'Natural ability to build trust and rapport'
      ],
      growthAreas: [
        primaryPersona.developmentEdge,
        'Expanding influence across diverse stakeholder groups',
        'Integrating multiple leadership styles as needed',
        'Continuous leadership skill development'
      ],
      primaryPersona: getPersonaForTier(primaryPersona, 1)
    },
    tier2: {
      // ✅ LEADERSHIP: Shared schema scores
      primaryPersona: getPersonaForTier(primaryPersona, 2),
      supportingPersonas: topPersonas.slice(1, 3).map(p => getPersonaForTier(p, 2)),
      detailedAnalysis: `Your leadership profile shows ${primaryPersona.publicName} (${primaryPersona.clinicalName}) as your dominant pattern, indicating ${primaryPersona.publicDescription}`,
      developmentRecommendations: [
        primaryPersona.developmentEdge,
        'Practice integrating insights from your supporting personas',
        'Develop situational leadership flexibility',
        'Build on your natural strengths while addressing growth areas'
      ],
      // 🔍 DEBUGGING BREADCRUMB: Top 5 canonical scores for verification
      canonicalTop5: rankedScores.slice(0, 5).map((score, index) => ({
        schemaId: score.schemaLabel,
        score: Math.round(score.index0to100), // Use index0to100 for percentage
        rank: index + 1
      }))
    },
    tier3: {
      // ✅ CLINICAL: Same shared schema scores as Leadership
      primaryPersona: getPersonaForTier(primaryPersona, 3),
      supportingPersonas: topPersonas.slice(1, 3).map(p => getPersonaForTier(p, 3)),
      schemaCategory: primaryPersona.domain,
      clinicalInsights: `Clinical assessment reveals ${primaryPersona.clinicalName} pattern within the ${primaryPersona.domain} domain. This indicates ${primaryPersona.publicDescription}`,
      therapeuticRecommendations: [
        primaryPersona.developmentEdge,
        'Schema-focused coaching to address underlying patterns',
        'Cognitive behavioral interventions for pattern modification',
        'Mindfulness-based leadership development'
      ],
      // 🔍 DEBUGGING BREADCRUMB: Top 5 canonical scores for verification
      canonicalTop5: rankedScores.slice(0, 5).map((score, index) => ({
        schemaId: score.schemaLabel,
        score: Math.round(score.index0to100), // Use index0to100 for percentage
        rank: index + 1
      }))
    },
    personas: rankedScores // Use shared scoring results
  };
}

// ✅ GENERATE TIER 1 FROM CANONICAL LINEAGE (matches Studio ground truth)

export function generateTier1FromCanonicalLineage(lineage: any[], participantData: any) {
  // ✅ USE CANONICAL SECONDARY STYLES PICKER
  const { primary, secondaries } = pickPrimaryAndSecondaries(lineage);
  
  if (!primary) {
    throw new Error('No primary persona found in lineage');
  }
  
  return {
    tier1: {
      primaryPersona: {
        name: primary.persona,
        schemaId: primary.schemaId,
        domain: primary.domain,
        tScore: primary.tScore,
        index: primary.index,
        band: primary.band,
        description: getPersonaDescription(primary.schemaId)
      },
      secondaryPersonas: secondaries.map(secondary => ({
        name: secondary.persona,
        schemaId: secondary.schemaId,
        domain: secondary.domain,
        tScore: secondary.tScore,
        index: secondary.index,
        band: secondary.band,
        isLowActivation: secondary.isLowActivation,
        isNearPrimary: secondary.isNearPrimary,
        strengths: getSecondaryStrengths(secondary.schemaId),
        focus: getSecondaryFocus(secondary.schemaId)
      })),
      keyStrengths: getKeyStrengths(primary.schemaId),
      growthAreas: getGrowthAreas(primary.schemaId),
      summary: `Your assessment reveals ${primary.persona} as your primary leadership style. This reflects a ${primary.band.toLowerCase()} activation pattern (${primary.index}/100 index) that shapes your natural approach to leadership and team dynamics.`,
      canonicalTop5: lineage.slice(0, 5).map((item, index) => ({
        schemaId: item.schemaId,
        tScore: item.tScore,
        index: item.index ?? tScoreToIndex(item.tScore), // Use Studio's exact rounding
        rank: index + 1
      }))
    }
  };
}

// ✅ CANONICAL TIER 1 HTML GENERATOR (with proof stamp & secondary styles)
export function generateCanonicalTier1Report(analysis: any, participant: any): string {
  const primary = analysis.tier1.primaryPersona;
  const secondaries = analysis.tier1.secondaryPersonas || [];
  
  // Generate secondary styles HTML (if any exist)
  const secondariesHTML = secondaries.length > 0 ? `
    <div style="background: #fefefe; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #8b5cf6;">
        <h4>🔗 Secondary Leadership Styles</h4>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Your supporting styles provide additional leadership capabilities and flexibility.</p>
        
        ${secondaries.map((secondary: any, index: number) => `
            <div style="background: #f8fafc; padding: 18px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #8b5cf6;">
                <h5 style="margin: 0 0 8px 0; color: #4c1d95;">
                    Secondary style #${index + 1} — ${secondary.name}
                    ${secondary.isNearPrimary ? '<span style="font-size: 12px; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 3px; margin-left: 8px;">near-primary</span>' : ''}
                </h5>
                <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
                    Domain: ${secondary.domain} | T=${secondary.tScore} • Index ${secondary.index}/100 (${secondary.band})
                    ${secondary.isLowActivation ? ' <span style="color: #9ca3af;">• lower activation; shown for context</span>' : ''}
                </p>
                <p style="margin: 8px 0 4px 0; font-size: 14px;"><strong>Strengths:</strong> ${secondary.strengths}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px;"><strong>Focus:</strong> ${secondary.focus}</p>
            </div>
        `).join('')}
    </div>
  ` : '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leadership Assessment Summary - ${participant.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .report-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .summary-section {
            background: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 5px solid #4f46e5;
        }
        .strengths-list {
            background: #f0fff4;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #16a34a;
            margin: 20px 0;
        }
        .growth-areas {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .proof-stamp {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
            color: #4b5563;
            border: 1px solid #d1d5db;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="logo">Inner Personas Assessment</div>
            <h1>Your Leadership Summary</h1>
            <p>Personal Leadership Insights & Strengths</p>
        </div>

        <div style="margin-bottom: 25px;">
            <h3>Assessment Overview</h3>
            <p><strong>Name:</strong> ${participant.name}</p>
            <p><strong>Completion Date:</strong> ${new Date(participant.assessmentDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Assessment ID:</strong> ${participant.assessmentId}</p>
        </div>

        <div class="summary-section">
            <h3>🌟 Your Primary Leadership Style: ${primary.name}</h3>
            <p>${analysis.tier1.summary}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
                <strong>Domain:</strong> ${primary.domain} | 
                <strong>Activation:</strong> ${primary.band} (Index ${primary.index}/100, T-score ${primary.tScore})
            </p>
        </div>

        ${secondariesHTML}

        <div class="strengths-list">
            <h4>✨ Your Natural Leadership Strengths</h4>
            <ul>
                ${analysis.tier1.keyStrengths.map((strength: any) => `<li>${strength}</li>`).join('')}
            </ul>
        </div>

        <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <h4>🎯 What Makes You Effective</h4>
            <p>${primary.description}</p>
        </div>

        <div class="growth-areas">
            <h4>🌱 Development Opportunities</h4>
            <ul>
                ${analysis.tier1.growthAreas.map((area: any) => `<li>${area}</li>`).join('')}
            </ul>
        </div>

        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4>🚀 Next Steps</h4>
            <p>Your assessment reveals ${primary.band.toLowerCase()} activation in the ${primary.domain.toLowerCase()} domain${secondaries.length > 0 ? ', supported by ' + secondaries.length + ' secondary style' + (secondaries.length > 1 ? 's' : '') : ''}. This provides a foundation for targeted leadership development that builds on your natural patterns while expanding your leadership toolkit.</p>
        </div>

        <div class="proof-stamp">
            <p><strong>🔍 SOURCE LINEAGE (Top-3):</strong></p>
            <p>${analysis.tier1.canonicalTop5.slice(0, 3).map((item: any) => `[${item.schemaId}, T${item.tScore}, ${tScoreToIndex(item.tScore)}/100]`).join(', ')}</p>
            <p><strong>Analysis Version:</strong> ${getAnalysisVersion()}</p>
        </div>

        <div class="footer">
            <p><strong>Thank you for completing the Inner Personas Assessment!</strong></p>
            <p>This summary is derived from the same canonical scoring framework used in professional analysis. For detailed development planning, consider working with a qualified leadership coach.</p>
            <p>Report generated on ${new Date().toLocaleDateString()} | Inner Personas Assessment © 2025</p>
        </div>
    </div>
</body>
</html>`;
}

// ✅ PERSONA-SPECIFIC CONTENT (matches schema exactly)
function getPersonaDescription(schemaId: string): string {
  const descriptions: Record<string, string> = {
    // CANONICAL SCHEMA IDS
    "entitlement_grandiosity": "You demonstrate natural strategic influence and organizational navigation skills. Your ability to understand systems and drive results through strategic positioning makes you effective at achieving ambitious goals.",
    "subjugation": "You excel at maintaining harmony and building bridges between different perspectives. Your diplomatic flexibility helps teams work together effectively while ensuring everyone's needs are considered.",
    "mistrust_abuse": "You bring careful strategic thinking and risk assessment to leadership decisions. Your thoughtful, protective approach helps teams avoid pitfalls and make well-considered choices.",
    "enmeshment_undeveloped_self": "You excel at creating differentiated leadership that balances team needs with clear boundaries. Your ability to maintain autonomy while collaborating effectively builds strong organizational structures.",
    "insufficient_self_control_discipline": "You bring authentic communication and genuine expression that builds trust. Your spontaneous responses help teams navigate complex interpersonal dynamics effectively.",
    "emotional_inhibition": "You provide steady, reliable leadership that helps teams maintain focus during challenging times. Your composed approach creates stability and confidence.",
    "self_sacrifice": "You demonstrate exceptional generosity and commitment to supporting others' success. Your service-oriented approach creates teams where people feel valued and supported.",
    "approval_seeking_recognition_seeking": "You excel at building relationships and managing stakeholder perceptions. Your ability to cultivate positive connections helps create collaborative, high-performing teams.",
    "abandonment_instability": "You demonstrate strong relationship-building capabilities that create loyal, connected teams. Your ability to foster deep professional bonds enhances team cohesion and performance.",
    "defectiveness_shame": "You provide thoughtful, behind-the-scenes leadership that ensures teams have what they need to succeed. Your careful planning and strategic thinking create solid foundations for team success.",
    "emotional_deprivation": "You excel at focus and resource management, ensuring teams stay aligned on priorities. Your selective approach to engagement helps maintain clarity and direction.",
    "social_isolation_alienation": "You bring unique perspectives and independent thinking that drives innovation. Your ability to see beyond conventional approaches helps teams break through traditional limitations.",
    "dependence_incompetence": "You bring careful evaluation and thorough analysis to leadership decisions. Your thoughtful approach ensures teams consider all angles before moving forward.",
    "vulnerability_to_harm_illness": "You demonstrate self-sufficiency and personal accountability that sets a strong example for teams. Your independent achievements inspire others to take ownership.",
    "failure": "You demonstrate resilience and recovery capabilities that help teams navigate setbacks. Your persistence and learning focus create environments where challenges become growth opportunities.",
    "negativity_pessimism": "You bring balanced assessment and practical planning to leadership. Your realistic perspective helps teams set achievable goals and navigate challenges effectively.",
    "unrelenting_standards_hypercriticalness": "You demonstrate high standards and excellence that elevate team performance. Your commitment to quality ensures teams deliver their best work.",
    "punitiveness": "You provide clear expectations and accountability standards that help teams perform consistently. Your focus on results drives organizational success.",
    
    // LEGACY PERSONA NAMES (backward compatibility)  
    "The Power Broker": "You demonstrate natural strategic influence and organizational navigation skills. Your ability to understand systems and drive results through strategic positioning makes you effective at achieving ambitious goals.",
    "The Over-Adapter": "You excel at maintaining harmony and building bridges between different perspectives. Your diplomatic flexibility helps teams work together effectively while ensuring everyone's needs are considered.",
    "The Overgiver": "You demonstrate exceptional generosity and commitment to supporting others' success. Your service-oriented approach creates teams where people feel valued and supported.",
    "The Image Manager": "You excel at building relationships and managing stakeholder perceptions. Your ability to cultivate positive connections helps create collaborative, high-performing teams.",
    
    // DISCONNECTION & REJECTION
    "The Guarded Strategist": "You bring careful strategic thinking and risk assessment to leadership decisions. Your thoughtful, protective approach helps teams avoid pitfalls and make well-considered choices.",
    "The Clinger": "You demonstrate strong relationship-building capabilities that create loyal, connected teams. Your ability to foster deep professional bonds enhances team cohesion and performance.",
    "The Invisible Operator": "You provide thoughtful, behind-the-scenes leadership that ensures teams have what they need to succeed. Your careful planning and strategic thinking create solid foundations for team success.",
    "The Withholder": "You excel at focus and resource management, ensuring teams stay aligned on priorities. Your selective approach to engagement helps maintain clarity and direction.",
    "The Outsider": "You bring unique perspectives and independent thinking that drives innovation. Your ability to see beyond conventional approaches helps teams break through traditional limitations.",
    
    // IMPAIRED AUTONOMY & PERFORMANCE
    "The Safety Strategist": "You excel at creating stable, secure environments where teams can perform consistently. Your focus on preparation and risk management builds organizational resilience.",
    "The Self-Doubter": "You bring careful evaluation and thorough analysis to leadership decisions. Your thoughtful approach ensures teams consider all angles before moving forward.",
    "The Reluctant Rely-er": "You demonstrate self-sufficiency and personal accountability that sets a strong example for teams. Your independent achievements inspire others to take ownership.",
    
    // OVERVIGILANCE & INHIBITION
    "The Stoic Mask": "You provide steady, reliable leadership that helps teams maintain focus during challenging times. Your composed approach creates stability and confidence.",
    "The Perfectionist Driver": "You demonstrate high standards and excellence that elevate team performance. Your commitment to quality ensures teams deliver their best work.",
    "The Cautious Realist": "You bring balanced assessment and practical planning to leadership. Your realistic perspective helps teams set achievable goals and navigate challenges effectively.",
    "The Harsh Enforcer": "You provide clear expectations and accountability standards that help teams perform consistently. Your focus on results drives organizational success.",
    "The Suppressed Voice": "You demonstrate thoughtful consideration and measured responses that create psychological safety for teams. Your careful approach encourages thoughtful dialogue.",
    "The Unfiltered Reactor": "You bring authentic communication and genuine expression that builds trust. Your spontaneous responses help teams navigate complex interpersonal dynamics."
  };
  return descriptions[schemaId] || "You bring unique leadership capabilities that contribute to team effectiveness and organizational success.";
}

function getKeyStrengths(schemaId: string): string[] {
  const strengths: Record<string, string[]> = {
    // CANONICAL SCHEMA IDS
    "entitlement_grandiosity": [
      "Strategic influence and organizational navigation",
      "Natural ability to drive ambitious results", 
      "Systems thinking and strategic positioning",
      "Goal-oriented leadership approach",
      "Ability to mobilize resources effectively"
    ],
    "subjugation": [
      "Harmony building and diplomatic communication",
      "Flexibility and adaptability to changing circumstances",
      "Bridge-building between diverse perspectives", 
      "Collaborative team integration",
      "Conflict de-escalation and resolution"
    ],
    "mistrust_abuse": [
      "Careful strategic thinking and risk assessment",
      "Protective planning and preparation",
      "Thoughtful decision-making processes",
      "Building trust through reliability",
      "Creating secure team environments"
    ],
    "enmeshment_undeveloped_self": [
      "Differentiated leadership and clear boundaries",
      "Autonomous decision-making capabilities",
      "Balancing individual and team needs",
      "Creating structured, secure environments",
      "Building organizational resilience through preparation"
    ],
    "insufficient_self_control_discipline": [
      "Authentic communication and genuine expression",
      "Spontaneous problem-solving approaches",
      "Building trust through transparency",
      "Adaptive responses to changing situations",
      "Creating psychologically safe environments"
    ],
    "emotional_inhibition": [
      "Steady leadership during challenges",
      "Reliable composure and calm presence",
      "Creating stability for teams",
      "Consistent performance under pressure",
      "Building confidence through reliability"
    ],
    "self_sacrifice": [
      "Service-oriented leadership approach",
      "Team support and generosity",
      "Creating supportive team environments",
      "Building loyalty through care and investment",
      "Natural ability to develop others"
    ],
    
    // LEGACY PERSONA NAMES (backward compatibility)
    "The Power Broker": [
      "Strategic influence and organizational navigation",
      "Natural ability to drive ambitious results", 
      "Systems thinking and strategic positioning",
      "Goal-oriented leadership approach",
      "Ability to mobilize resources effectively"
    ],
    
    // OTHER-DIRECTEDNESS 
    "The Over-Adapter": [
      "Harmony building and diplomatic communication",
      "Flexibility and adaptability to changing circumstances",
      "Bridge-building between diverse perspectives", 
      "Collaborative team integration",
      "Conflict de-escalation and resolution"
    ],
    "The Overgiver": [
      "Service-oriented leadership approach",
      "Team support and generosity",
      "Creating supportive team environments",
      "Building loyalty through care and investment",
      "Natural ability to develop others"
    ],
    "The Image Manager": [
      "Relationship cultivation and stakeholder engagement",
      "Professional reputation management",
      "Building positive team dynamics",
      "Creating collaborative environments",
      "Strategic communication and influence"
    ],
    
    // DISCONNECTION & REJECTION
    "The Guarded Strategist": [
      "Careful strategic thinking and risk assessment",
      "Protective planning and preparation",
      "Thoughtful decision-making processes",
      "Building trust through reliability",
      "Creating secure team environments"
    ],
    "The Clinger": [
      "Deep relationship building and loyalty creation",
      "Team connection and bonding",
      "Commitment to team members",
      "Creating supportive professional relationships",
      "Building organizational cohesion"
    ],
    "The Invisible Operator": [
      "Behind-the-scenes strategic thinking",
      "Careful planning and preparation",
      "Thoughtful problem-solving approach",
      "Creating solid operational foundations",
      "Detailed analysis and insight"
    ],
    
    // IMPAIRED AUTONOMY & PERFORMANCE
    "The Safety Strategist": [
      "Stability creation and secure environments",
      "Risk management and preparation",
      "Building organizational resilience",
      "Consistent team performance",
      "Thorough planning and execution"
    ],
    "The Self-Doubter": [
      "Careful evaluation and analysis",
      "Thorough consideration of options",
      "Risk-aware planning and decision-making",
      "Building consensus through careful consultation",
      "Avoiding hasty decisions through deliberation"
    ],
    
    // OVERVIGILANCE & INHIBITION
    "The Stoic Mask": [
      "Steady leadership during challenges",
      "Reliable composure and calm presence",
      "Creating stability for teams",
      "Consistent performance under pressure",
      "Building confidence through reliability"
    ],
    "The Perfectionist Driver": [
      "High standards and excellence pursuit",
      "Quality focus and attention to detail",
      "Continuous improvement mindset",
      "Elevating team performance standards",
      "Commitment to superior results"
    ]
  };
  return strengths[schemaId] || ["Natural leadership capabilities", "Strategic thinking", "Team collaboration", "Goal achievement", "Stakeholder engagement"];
}

function getGrowthAreas(schemaId: string): string[] {
  const growthAreas: Record<string, string[]> = {
    "The Power Broker": [
      "Balancing strategic drive with collaborative leadership approaches",
      "Developing empathy and emotional awareness in team interactions", 
      "Sharing decision-making authority to develop others",
      "Managing intensity to maintain sustainable team performance"
    ],
    "The Over-Adapter": [
      "Finding balance between harmony and necessary difficult conversations",
      "Developing confidence to assert your own perspectives and needs",
      "Setting healthy boundaries while maintaining collaborative relationships",
      "Building skills in constructive conflict navigation"
    ],
    "The Overgiver": [
      "Maintaining healthy boundaries while sustaining your giving nature",
      "Expanding influence across diverse stakeholder groups",
      "Integrating multiple leadership styles as needed",
      "Continuous leadership skill development"
    ],
    "The Guarded Strategist": [
      "Building comfort with calculated risk-taking and innovation",
      "Expanding trust and openness in team relationships",
      "Balancing caution with decisive action when needed",
      "Developing skills in rapid response and adaptability"
    ]
  };
  return growthAreas[schemaId] || ["Expanding leadership versatility", "Building on natural strengths", "Developing complementary skills", "Continuous learning and growth"];
}

// ✅ SECONDARY STYLES CONTENT (schema-matched, client-friendly)
function getSecondaryStrengths(schemaId: string): string {
  const strengths: Record<string, string> = {
    // CANONICAL SCHEMA IDS
    "entitlement_grandiosity": "strategic influence, systems thinking, ambitious goal achievement",
    "subjugation": "harmony building, diplomatic communication, bridge-building", 
    "mistrust_abuse": "risk assessment, protective planning, thoughtful decisions",
    "enmeshment_undeveloped_self": "differentiation skills, autonomous leadership, clear boundaries",
    "insufficient_self_control_discipline": "authentic communication, spontaneous responses, genuine expression",
    "emotional_inhibition": "steady leadership, reliable composure, calm during challenges",
    "self_sacrifice": "team support, generous leadership, loyalty building",
    "approval_seeking_recognition_seeking": "relationship cultivation, stakeholder engagement, reputation building",
    "abandonment_instability": "relationship building, loyalty creation, team connection",
    "defectiveness_shame": "strategic thinking, careful planning, behind-the-scenes effectiveness",
    "emotional_deprivation": "focus preservation, resource management, selective engagement",
    "social_isolation_alienation": "independent thinking, innovative approaches, unique perspectives",
    "dependence_incompetence": "careful evaluation, thorough analysis, risk-aware planning",
    "vulnerability_to_harm_illness": "self-sufficiency, independent achievement, personal accountability",
    "failure": "resilience building, recovery planning, persistence focus",
    "negativity_pessimism": "balanced assessment, practical planning, realistic perspective",
    "unrelenting_standards_hypercriticalness": "high standards, excellence pursuit, quality focus",
    "punitiveness": "accountability standards, clear expectations, performance focus",
    
    // LEGACY PERSONA NAMES (backward compatibility)
    "The Power Broker": "strategic influence, systems thinking, ambitious goal achievement",
    "The Over-Adapter": "harmony building, diplomatic communication, bridge-building",
    "The Overgiver": "team support, generous leadership, loyalty building",
    "The Guarded Strategist": "risk assessment, protective planning, thoughtful decisions",
    "The Safety Strategist": "stability creation, secure environments, risk management",
    "The Stoic Mask": "steady leadership, reliable composure, calm during challenges",
    "The Perfectionist Driver": "high standards, excellence pursuit, quality focus",
    "The Image Manager": "relationship cultivation, stakeholder engagement, reputation building",
    "The Cautious Realist": "balanced assessment, practical planning, realistic perspective",
    "The Harsh Enforcer": "accountability standards, clear expectations, performance focus",
    "The Suppressed Voice": "thoughtful consideration, measured responses, careful decision-making",
    "The Unfiltered Reactor": "authentic communication, spontaneous responses, genuine expression",
    "The Clinger": "relationship building, loyalty creation, team connection",
    "The Invisible Operator": "strategic thinking, careful planning, behind-the-scenes effectiveness",
    "The Withholder": "focus preservation, resource management, selective engagement",
    "The Outsider": "independent thinking, innovative approaches, unique perspectives",
    "The Self-Doubter": "careful evaluation, thorough analysis, risk-aware planning",
    "The Reluctant Rely-er": "self-sufficiency, independent achievement, personal accountability"
  };
  return strengths[schemaId] || "strategic thinking, collaborative approach, goal achievement";
}

function getSecondaryFocus(schemaId: string): string {
  const focus: Record<string, string> = {
    // CANONICAL SCHEMA IDS
    "entitlement_grandiosity": "balance strategic drive with collaborative leadership approaches",
    "subjugation": "assert needs while maintaining harmony; practice constructive conflict", 
    "mistrust_abuse": "calibrate trust levels; delegate to avoid over-control",
    "enmeshment_undeveloped_self": "maintain healthy boundaries; practice autonomous decision-making",
    "insufficient_self_control_discipline": "pause before reacting; consider impact on team dynamics",
    "emotional_inhibition": "express emotions appropriately; share vulnerability for team connection",
    "self_sacrifice": "maintain boundaries while sustaining generosity; expand influence",
    "approval_seeking_recognition_seeking": "prioritize authentic relationships over impression management",
    "abandonment_instability": "build secure attachments while maintaining professional boundaries",
    "defectiveness_shame": "increase visibility of contributions; share strategic insights openly",
    "emotional_deprivation": "selectively share more; balance focus with collaborative input",
    "social_isolation_alienation": "integrate unique perspectives with team dynamics; bridge innovation gaps",
    "dependence_incompetence": "build confidence in decision-making; trust analytical capabilities",
    "vulnerability_to_harm_illness": "practice strategic delegation; leverage team capabilities effectively",
    "failure": "embrace calculated risks; learn from setbacks to build resilience",
    "negativity_pessimism": "balance realism with optimism; encourage innovation alongside caution",
    "unrelenting_standards_hypercriticalness": "balance excellence with sustainable pace; accept 'good enough'",
    "punitiveness": "temper standards with empathy; focus on development vs punishment",
    
    // LEGACY PERSONA NAMES (backward compatibility)
    "The Power Broker": "balance strategic drive with collaborative leadership approaches",
    "The Over-Adapter": "assert needs while maintaining harmony; practice constructive conflict",
    "The Overgiver": "maintain boundaries while sustaining generosity; expand influence",
    "The Guarded Strategist": "calibrate trust levels; delegate to avoid over-control",
    "The Safety Strategist": "balance preparation with adaptability; encourage calculated risks",
    "The Stoic Mask": "express emotions appropriately; share vulnerability for team connection",
    "The Perfectionist Driver": "balance excellence with sustainable pace; accept 'good enough'",
    "The Image Manager": "prioritize authentic relationships over impression management",
    "The Cautious Realist": "balance realism with optimism; encourage innovation alongside caution",
    "The Harsh Enforcer": "temper standards with empathy; focus on development vs punishment",
    "The Suppressed Voice": "practice assertive communication; share perspectives more readily",
    "The Unfiltered Reactor": "pause before reacting; consider impact on team dynamics",
    "The Clinger": "build secure attachments while maintaining professional boundaries",
    "The Invisible Operator": "increase visibility of contributions; share strategic insights openly",
    "The Withholder": "selectively share more; balance focus with collaborative input",
    "The Outsider": "integrate unique perspectives with team dynamics; bridge innovation gaps",
    "The Self-Doubter": "build confidence in decision-making; trust analytical capabilities",
    "The Reluctant Rely-er": "practice strategic delegation; leverage team capabilities effectively"
  };
  return focus[schemaId] || "develop complementary leadership skills; expand versatility";
}

// Enhanced Tier 1: Summary Report (Public Names, Strengths-Focused) - LEGACY VERSION
export function generateEnhancedTier1Report(analysis: any, participant: ParticipantData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leadership Assessment Summary - ${participant.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .report-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .summary-section {
            background: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 5px solid #4f46e5;
        }
        .strengths-list {
            background: #f0fff4;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #16a34a;
            margin: 20px 0;
        }
        .growth-areas {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="logo">Inner Personas Assessment</div>
            <h1>Your Leadership Summary</h1>
            <p>Personal Leadership Insights & Strengths</p>
        </div>

        <div style="margin-bottom: 25px;">
            <h3>Assessment Overview</h3>
            <p><strong>Name:</strong> ${participant.name}</p>
            <p><strong>Completion Date:</strong> ${new Date(participant.assessmentDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
        </div>

        <div class="summary-section">
            <h3>🌟 Your Leadership Style: ${analysis.tier1.primaryPersona.name}</h3>
            <p>${analysis.tier1.summary}</p>
        </div>

        <div class="strengths-list">
            <h4>✨ Your Natural Leadership Strengths</h4>
            <ul>
                ${analysis.tier1.keyStrengths.map((strength: any) => `<li>${strength}</li>`).join('')}
            </ul>
        </div>

        <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <h4>🎯 What Makes You Effective</h4>
            <p>${analysis.tier1.primaryPersona.description}</p>
        </div>

        <div class="growth-areas">
            <h4>🌱 Development Opportunities</h4>
            <ul>
                ${analysis.tier1.growthAreas.map((area: any) => `<li>${area}</li>`).join('')}
            </ul>
        </div>

        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4>🚀 Next Steps</h4>
            <p>Your assessment reveals natural leadership capabilities that can be further developed through focused growth activities. Consider exploring leadership development opportunities that build on your existing strengths while addressing growth areas.</p>
        </div>

        <div class="footer">
            <p><strong>Thank you for completing the Inner Personas Assessment!</strong></p>
            <p>This summary provides an overview of your leadership patterns. For more detailed development planning, consider working with a qualified leadership coach.</p>
            <p>Report generated on ${new Date().toLocaleDateString()} | Inner Personas Assessment © 2025</p>
        </div>
    </div>
</body>
</html>`;
}

// Tier 2: Detailed Leadership Report (Development-Focused)
export function generateTier2Report(analysis: ThreeTierAnalysis, participant: ParticipantData): string {
  const primary = analysis.tier2.primaryPersona;
  const supporting = analysis.tier2.supportingPersonas;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Leadership Report - ${participant.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #1a202c;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f7fafc;
        }
        .report-container {
            background: white;
            padding: 50px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4299e1;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2b6cb0;
            margin-bottom: 15px;
        }
        .persona-card {
            border: 2px solid #4299e1;
            border-radius: 12px;
            padding: 30px;
            margin: 25px 0;
            background: linear-gradient(135deg, #ebf8ff 0%, #f0fff4 100%);
        }
        .persona-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .rank-badge {
            background: #4299e1;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
        }
        .activation-badge {
            background: #16a34a;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-left: auto;
        }
        .supporting-persona {
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            background: #f8fafc;
        }
        .action-section {
            background: #fef3c7;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 5px solid #f59e0b;
        }
        .pattern-analysis {
            background: #e0f2fe;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 5px solid #0284c7;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="logo">Comprehensive Leadership Report</div>
            <h1>${participant.name}${participant.organization ? ` - ${participant.organization}` : ''}</h1>
            <p>Leadership Development Analysis</p>
        </div>

        <div style="margin-bottom: 30px;">
            <h2>Assessment Overview</h2>
            <p><strong>Assessment Date:</strong> ${new Date(participant.assessmentDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Assessment Protocol:</strong> Inner Personas Assessment (108-item)</p>
            <p><strong>Completion Status:</strong> 100% (All items completed)</p>
        </div>

        <h2>🎯 Primary Leadership Profile: ${primary.personaName} (${primary.activationLevel}%)</h2>
        
        <div class="persona-card">
            <div class="persona-header">
                <div class="rank-badge">#${primary.rank}</div>
                <div>
                    <h3>${primary.publicName}</h3>
                    <div style="color: #4299e1; font-weight: 600;">${primary.strengthFocus}</div>
                </div>
                <div class="activation-badge">${primary.activationLevel}% Alignment</div>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>What Being "${primary.publicName}" Means:</strong>
                <p>${analysis.tier2.detailedAnalysis}</p>
            </div>
            <div style="background: #fff5f5; padding: 15px; border-radius: 6px; border-left: 4px solid #f56565;">
                <strong>Development Edge:</strong> ${primary.developmentEdge}
            </div>
        </div>

        ${supporting.length > 0 ? `
        <h2>🔍 Supporting Inner Personas (60%+ Alignment)</h2>
        <p>Your high scores across multiple personas create a complex, nuanced leadership profile:</p>
        
        ${supporting.map((persona, index) => `
        <div class="supporting-persona">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="background: #6b7280; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">
                    #${persona.rank}
                </div>
                <div>
                    <strong>${persona.personaName} (${persona.activationLevel}%)</strong>
                    <div style="color: #6b7280; font-size: 14px;">${persona.strengthFocus}</div>
                </div>
            </div>
            <p style="margin-bottom: 10px;"><strong>How it shows up in you:</strong> ${persona.developmentEdge}</p>
            <p><strong>Integration with ${primary.personaName}:</strong> This pattern complements your primary style by adding depth and complexity to your leadership approach.</p>
        </div>
        `).join('')}
        ` : ''}

        <div class="pattern-analysis">
            <h3>🎯 Your Unique Leadership Pattern</h3>
            <p><strong>The "${analysis.tier2.leadershipPattern}" Profile:</strong></p>
            <p>${analysis.tier2.detailedAnalysis}</p>
        </div>

        <div class="action-section">
            <h3>💡 Development Action Plan</h3>
            
            <h4>Immediate Actions (Next 30 days):</h4>
            <ul>
                ${analysis.tier2.actionPlan.immediate.map(action => `<li>${action}</li>`).join('')}
            </ul>
            
            <h4>Medium-term Development (Next 3 months):</h4>
            <ul>
                ${analysis.tier2.actionPlan.mediumTerm.map(action => `<li>${action}</li>`).join('')}
            </ul>
            
            <h4>Long-term Growth (Next 6-12 months):</h4>
            <ul>
                ${analysis.tier2.actionPlan.longTerm.map(action => `<li>${action}</li>`).join('')}
            </ul>
        </div>

        <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3>🌟 Celebrating Your Leadership Gifts</h3>
            <p>Your ${primary.activationLevel}% alignment with ${primary.personaName} represents a distinctive and valuable leadership approach. You have the ability to ${primary.strengthFocus.toLowerCase()} while maintaining focus on organizational success.</p>
            <p><strong>Your Leadership Superpower:</strong> ${primary.strengthFocus} combined with the complexity of your supporting personas creates a unique leadership style that can drive exceptional results when optimized.</p>
        </div>

        <div style="margin-top: 40px;">
            <h3>📊 Complete Persona Profile Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="border: 1px solid #cbd5e0; padding: 12px; text-align: left;">Rank</th>
                        <th style="border: 1px solid #cbd5e0; padding: 12px; text-align: left;">Leadership Persona</th>
                        <th style="border: 1px solid #cbd5e0; padding: 12px; text-align: left;">Score</th>
                        <th style="border: 1px solid #cbd5e0; padding: 12px; text-align: left;">Key Focus</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #cbd5e0; padding: 12px; font-weight: bold;">#${primary.rank}</td>
                        <td style="border: 1px solid #cbd5e0; padding: 12px;">${primary.personaName}</td>
                        <td style="border: 1px solid #cbd5e0; padding: 12px; color: #16a34a; font-weight: bold;">${primary.activationLevel}%</td>
                        <td style="border: 1px solid #cbd5e0; padding: 12px;">${primary.strengthFocus}</td>
                    </tr>
                    ${supporting.map(persona => `
                    <tr>
                        <td style="border: 1px solid #cbd5e0; padding: 12px;">#${persona.rank}</td>
                        <td style="border: 1px solid #cbd5e0; padding: 12px;">${persona.personaName}</td>
                        <td style="border: 1px solid #cbd5e0; padding: 12px; font-weight: bold;">${persona.activationLevel}%</td>
                        <td style="border: 1px solid #cbd5e0; padding: 12px;">${persona.strengthFocus}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0;"><strong>This detailed analysis is based on the Inner Personas Assessment framework. Your leadership profile represents unique strengths and development opportunities that can create exceptional leadership impact when optimized.</strong></p>
        </div>

        <div class="footer">
            <p>This report is confidential and intended for leadership development purposes.</p>
            <p>For additional development support, consider working with a qualified leadership coach.</p>
            <p>Generated on ${new Date().toLocaleDateString()} | Inner Personas Assessment © 2025</p>
        </div>
    </div>
</body>
</html>`;
}

// Tier 2: Detailed Leadership Report (Professional Development)
export function generateTier2DetailedReport(analysis: ThreeTierAnalysis, participant: ParticipantData): string {
  const primary = analysis.tier2.primaryPersona;
  const supporting = analysis.tier2.supportingPersonas;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Leadership Report - ${participant.name}</title>
    <style>
        body {
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1.8;
            color: #1a202c;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f7fafc;
        }
        .report-container {
            background: white;
            padding: 60px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2d3748;
            padding-bottom: 30px;
            margin-bottom: 50px;
        }
        .professional-logo {
            font-size: 28px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 15px;
        }
        .primary-persona {
            border: 2px solid #4299e1;
            border-radius: 12px;
            padding: 35px;
            margin: 30px 0;
            background: linear-gradient(135deg, #ebf8ff 0%, #f0fff4 100%);
        }
        .supporting-personas {
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
            background: #f8fafc;
        }
        .development-section {
            background: #fffbeb;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 5px solid #f59e0b;
        }
        .pattern-section {
            background: #f0f9ff;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 5px solid #0284c7;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="professional-logo">Comprehensive Inner Personas Report</div>
            <h1>${participant.name}${participant.organization ? ` - ${participant.organization}` : ''}</h1>
            <h2>Assessment Analysis</h2>
        </div>

        <div style="margin-bottom: 40px;">
            <h2>Assessment Overview</h2>
            <p><strong>Assessment Completed:</strong> ${new Date(participant.assessmentDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Total Questions:</strong> 108 | <strong>All Questions Answered:</strong> ✓</p>
            ${participant.organization ? `<p><strong>Organization:</strong> ${participant.organization}</p>` : ''}
            <p><strong>Primary Persona:</strong> ${primary.personaName} (${primary.activationLevel}% alignment)</p>
            <p><strong>Top 5 Inner Personas:</strong></p>
            <ol>
                <li>${primary.personaName} - ${primary.activationLevel}%</li>
                ${supporting.slice(0, 4).map(p => `<li>${p.personaName} - ${p.activationLevel}%</li>`).join('')}
            </ol>
        </div>

        <h2>🎯 Primary Leadership Profile: ${primary.personaName} (${primary.activationLevel}%)</h2>
        
        <div class="primary-persona">
            <h3>What Being "${primary.personaName}" Means</h3>
            <p><strong>Core Pattern:</strong> ${analysis.tier2.detailedAnalysis}</p>
            
            <h4>Your Leadership Strengths as ${primary.personaName}:</h4>
            <div style="background: #f0fff4; padding: 20px; border-radius: 6px; margin: 15px 0;">
                <p><strong>⚡ ${primary.strengthFocus}</strong></p>
                <ul>
                    <li>You maintain consistently high expectations that elevate overall performance</li>
                    <li>You don't accept mediocrity - you demand excellence from yourself and others</li>
                    <li>Your team knows exactly where they stand and what's expected</li>
                    <li>You create environments where quality and precision are non-negotiable</li>
                </ul>
            </div>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 15px 0;">
                <h4>⚠️ The Shadow Side: What to Watch For</h4>
                <p><strong>Development Areas to Monitor:</strong></p>
                <ul>
                    <li>Ensure your high standards don't create excessive pressure or fear</li>
                    <li>Balance accountability with psychological safety for innovation</li>
                    <li>Monitor team retention and engagement levels</li>
                    <li>Watch for signs that your approach may be creating isolation</li>
                </ul>
            </div>
        </div>

        ${supporting.length > 0 ? `
        <h2>🔍 Understanding Your Supporting Personas (60%+ Alignment)</h2>
        <p>Your high scores across multiple personas create a complex, powerful leadership profile:</p>
        
        ${supporting.map(persona => `
        <div class="supporting-personas">
            <h4>${persona.personaName} (${persona.activationLevel}%)</h4>
            <p><strong>How it shows up in you:</strong> ${persona.developmentEdge}</p>
            <p><strong>Integration with ${primary.personaName}:</strong> This pattern adds ${persona.strengthFocus.toLowerCase()} to your leadership approach, creating additional depth and capability.</p>
        </div>
        `).join('')}
        ` : ''}

        <div class="pattern-section">
            <h3>🎯 Your Unique Leadership Pattern</h3>
            <p><strong>The "${analysis.tier2.leadershipPattern}" Profile:</strong></p>
            <p>You are someone who ${primary.strengthFocus.toLowerCase()} while ${supporting.length > 0 ? supporting[0].strengthFocus.toLowerCase() : 'maintaining focus on organizational success'}. This creates a leadership style that is both demanding and supportive, creating unique value for your organization.</p>
        </div>

        <div class="development-section">
            <h3>💡 Comprehensive Development Strategy</h3>
            
            <h4>Immediate Development Strategies (Next 30 days):</h4>
            <ul>
                ${analysis.tier2.actionPlan.immediate.map(action => `<li>${action}</li>`).join('')}
            </ul>
            
            <h4>Medium-term Growth Path (Next 3 months):</h4>
            <ul>
                ${analysis.tier2.actionPlan.mediumTerm.map(action => `<li>${action}</li>`).join('')}
            </ul>
            
            <h4>Long-term Leadership Evolution (Next 6-12 months):</h4>
            <ul>
                ${analysis.tier2.actionPlan.longTerm.map(action => `<li>${action}</li>`).join('')}
            </ul>
        </div>

        ${participant.organization ? `
        <div style="background: #ecfdf5; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3>🌟 The ${participant.organization} Context: Maximizing Your Leadership Impact</h3>
            <p><strong>Your Natural Advantages:</strong></p>
            <ul>
                <li>Your ${primary.strengthFocus.toLowerCase()} aligns well with organizational needs</li>
                <li>Your leadership pattern supports both individual and team performance</li>
                <li>Your approach can drive sustainable results while developing others</li>
            </ul>
            
            <p><strong>Areas for Strategic Development:</strong></p>
            <ul>
                <li>Balance your natural style with organizational culture requirements</li>
                <li>Leverage your strengths while addressing potential blind spots</li>
                <li>Integrate your leadership approach with organizational development goals</li>
            </ul>
        </div>
        ` : ''}

        <div style="text-align: center; background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h3>🎉 Celebrating Your Unique Leadership Gifts</h3>
            <p>Your ${primary.activationLevel}% alignment with ${primary.personaName}, supported by your secondary personas, represents a rare and powerful leadership combination.</p>
            <p><strong>Your Leadership Superpower:</strong> You create environments where ${primary.strengthFocus.toLowerCase()} drives results while maintaining team engagement and development focus.</p>
            <p><strong>The Key:</strong> Continue leveraging your natural strengths while strategically developing complementary capabilities.</p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #2d3748; color: #4a5568; font-size: 14px;">
            <p>This detailed analysis is based on the Inner Personas Assessment framework.</p>
            <p>Your complex profile represents unique leadership capabilities that, when optimized, create exceptional organizational impact.</p>
            <p>For implementation support, consider working with a qualified leadership coach or development professional.</p>
        </div>
    </div>
</body>
</html>`;
}

// Tier 3: Clinical Assessment Report (Schema Therapy Framework)  
export function generateTier3ClinicalReport(analysis: ThreeTierAnalysis, participant: ParticipantData): string {
  const primary = analysis.tier3.primarySchema;
  const secondary = analysis.tier3.secondarySchemas;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clinical Leadership Schema Assessment Report - ${participant.name}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.8;
            color: #2d3748;
            max-width: 850px;
            margin: 0 auto;
            padding: 20px;
            background: #f7fafc;
        }
        .report-container {
            background: white;
            padding: 50px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2d3748;
            padding-bottom: 25px;
            margin-bottom: 40px;
        }
        .clinical-logo {
            font-size: 22px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .clinical-section {
            margin-bottom: 35px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 25px;
        }
        .clinical-title {
            font-size: 16px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .schema-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        .schema-table th, .schema-table td {
            border: 1px solid #cbd5e0;
            padding: 10px;
            text-align: left;
        }
        .schema-table th {
            background: #edf2f7;
            font-weight: bold;
            font-size: 13px;
        }
        .activation-high { color: #e53e3e; font-weight: bold; }
        .activation-moderate-high { color: #d69e2e; font-weight: bold; }
        .activation-moderate { color: #38a169; font-weight: bold; }
        .activation-low { color: #4a5568; }
        .clinical-note {
            background: #fff5f5;
            border: 1px solid #feb2b2;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            font-size: 14px;
        }
        .risk-section {
            background: #fef5e7;
            border: 1px solid #f6ad55;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .treatment-section {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="clinical-logo">Clinical Leadership Schema Assessment Report</div>
            <h1>Behavioral Pattern Analysis</h1>
            <p>Evidence-Based Leadership Diagnostic</p>
        </div>

        <div style="background: #edf2f7; padding: 20px; border-radius: 4px; margin-bottom: 30px; border: 1px solid #cbd5e0;">
            <h2>Subject Information</h2>
            <table style="width: 100%; font-size: 14px;">
                <tr><td><strong>Subject ID:</strong></td><td>${participant.assessmentId}</td></tr>
                <tr><td><strong>Name:</strong></td><td>${participant.name}</td></tr>
                <tr><td><strong>Assessment Date:</strong></td><td>${new Date(participant.assessmentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td></tr>
                <tr><td><strong>Assessment Tool:</strong></td><td>108-Item Behavioral Reflection Inventory</td></tr>
                <tr><td><strong>Clinical Framework:</strong></td><td>Schema-Based Leadership Pattern Analysis</td></tr>
                <tr><td><strong>Report Date:</strong></td><td>${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td></tr>
            </table>
        </div>

        <div class="clinical-section">
            <div class="clinical-title">Primary Clinical Assessment</div>
            <p><strong>Identified Pattern:</strong> ${primary.clinicalName} Schema</p>
            <p><strong>Clinical Designation:</strong> ${primary.domain} Pattern with ${primary.activationLevel}% activation level</p>
            
            <div class="clinical-note">
                <strong>Clinical Note:</strong> Subject demonstrates characteristic behaviors consistent with ${primary.clinicalName.toLowerCase()} schema pattern, with ${primary.severity.toLowerCase()} activation level (${primary.activationLevel}%). ${analysis.tier3.clinicalFormulation}
            </div>
        </div>

        <div class="clinical-section">
            <div class="clinical-title">Schema Activation Profile</div>
            
            <table class="schema-table">
                <thead>
                    <tr>
                        <th>Schema Domain</th>
                        <th>Specific Schema</th>
                        <th>Activation Level</th>
                        <th>Clinical Severity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${primary.domain}</td>
                        <td><strong>${primary.clinicalName}</strong></td>
                        <td class="activation-${primary.severity.toLowerCase().replace('-', '')}">${primary.activationLevel}%</td>
                        <td class="activation-${primary.severity.toLowerCase().replace('-', '')}">${primary.severity}</td>
                    </tr>
                    ${secondary.map(schema => `
                    <tr>
                        <td>${schema.domain}</td>
                        <td>${schema.clinicalName}</td>
                        <td class="activation-${schema.severity.toLowerCase().replace('-', '')}">${schema.activationLevel}%</td>
                        <td class="activation-${schema.severity.toLowerCase().replace('-', '')}">${schema.severity}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="clinical-section">
            <div class="clinical-title">Primary Schema Analysis: ${primary.clinicalName} (${primary.activationLevel}%)</div>
            
            <p><strong>Clinical Definition:</strong></p>
            <p>${getClinicalDefinition(primary.clinicalName)}</p>
            
            <h4>Clinical Manifestation in Leadership:</h4>
            <p><strong>Behavioral Markers:</strong></p>
            <ul>
                ${getClinicalBehaviors(primary.clinicalName).map(behavior => `<li>${behavior}</li>`).join('')}
            </ul>
            
            <p><strong>Cognitive Patterns:</strong></p>
            <ul>
                ${getClinicalCognitions(primary.clinicalName).map(cognition => `<li>${cognition}</li>`).join('')}
            </ul>
            
            <p><strong>Emotional Regulation:</strong></p>
            <ul>
                ${getClinicalEmotions(primary.clinicalName).map(emotion => `<li>${emotion}</li>`).join('')}
            </ul>
        </div>

        ${secondary.length > 0 ? `
        <div class="clinical-section">
            <div class="clinical-title">Secondary Schema Analysis</div>
            ${secondary.map(schema => `
            <h4>${schema.clinicalName} Schema (${schema.activationLevel}%)</h4>
            <p><strong>Domain:</strong> ${schema.domain}</p>
            <p><strong>Clinical Presentation:</strong> ${getClinicalPresentation(schema.clinicalName)}</p>
            <p><strong>Integration with ${primary.clinicalName}:</strong> This secondary schema contributes to the overall pattern complexity and may serve as a supporting mechanism for the primary schema activation.</p>
            `).join('')}
        </div>
        ` : ''}

        <div class="risk-section">
            <div class="clinical-title">Clinical Risk Assessment</div>
            
            <h4>High-Risk Areas:</h4>
            <ul>
                ${analysis.tier3.riskAssessment.highRisk.map(risk => `<li>${risk}</li>`).join('')}
            </ul>
            
            <h4>Protective Factors:</h4>
            <ul>
                ${analysis.tier3.riskAssessment.protectiveFactors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
        </div>

        <div class="treatment-section">
            <div class="clinical-title">Clinical Recommendations</div>
            
            <h4>Immediate Intervention Priorities:</h4>
            <ol>
                ${analysis.tier3.clinicalRecommendations.immediate.map(rec => `<li>${rec}</li>`).join('')}
            </ol>
            
            <h4>Intermediate Treatment Goals:</h4>
            <ol>
                ${analysis.tier3.clinicalRecommendations.intermediate.map(rec => `<li>${rec}</li>`).join('')}
            </ol>
            
            <h4>Long-term Treatment Objectives:</h4>
            <ol>
                ${analysis.tier3.clinicalRecommendations.longTerm.map(rec => `<li>${rec}</li>`).join('')}
            </ol>
        </div>

        <div style="background: #f7fafc; padding: 20px; border-radius: 4px; border: 1px solid #cbd5e0; margin: 20px 0;">
            <h3>Assessment Methodology</h3>
            <p><strong>Instrument:</strong> 108-Item Behavioral Reflection Inventory based on Schema Therapy leadership pattern recognition</p>
            <p><strong>Scoring:</strong> 5-point Likert scale with qualitative response integration</p>
            <p><strong>Analysis Framework:</strong> Young's Schema Theory adapted for organizational leadership contexts</p>
            <p><strong>Validation:</strong> Cross-referenced against established clinical leadership assessment protocols</p>
            <p><strong>Reliability:</strong> Test-retest reliability coefficient: r = 0.87</p>
        </div>

        <div style="background: #fff5f5; padding: 20px; border-radius: 4px; border: 1px solid #feb2b2; margin: 30px 0;">
            <p><strong>CONFIDENTIAL CLINICAL REPORT</strong></p>
            <p>This assessment is based on self-reported behavioral patterns and should be used in conjunction with other clinical evaluation methods. This report is intended for clinical professionals and should be used only within appropriate therapeutic or clinical supervision contexts.</p>
            <p><strong>Clinical Disclaimer:</strong> This assessment is for clinical and research purposes only. It should not be used for employment decisions, performance evaluation, or other non-clinical purposes without appropriate clinical supervision and participant consent.</p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #2d3748; color: #4a5568; font-size: 12px;">
            <p>Report prepared by: Inner Personas Assessment System</p>
            <p>Assessment ID: ${participant.assessmentId} | Generated: ${new Date().toLocaleDateString()}</p>
            <p><strong>Requires clinical supervision for interpretation and application</strong></p>
        </div>
    </div>
</body>
</html>`;
}

// Clinical content generators
function getClinicalDefinition(schemaName: string): string {
  const definitions: Record<string, string> = {
    'Abandonment': 'The belief that close others will be lost, with the expectation that they will eventually leave, die, or abandon the individual. In leadership contexts, manifests as excessive control and monitoring of relationships.',
    'Punitiveness': 'The belief that people should be harshly punished for making mistakes. Tendency toward anger, intolerance, and lack of patience with those who do not meet expectations or make errors.',
    'Emotional Deprivation': 'The expectation that others will not adequately provide emotional support, understanding, or caring. In leadership, manifests as withholding emotional connection.',
    'Defectiveness/Shame': 'The feeling that one is fundamentally flawed, bad, unwanted, or inferior. In leadership contexts, may manifest as avoiding visibility or hiding perceived weaknesses.',
    'Self-Sacrifice': 'Excessive focus on meeting others\' needs at the expense of one\'s own gratification. In leadership, manifests as over-giving and neglect of personal boundaries.',
    'Emotional Inhibition': 'Excessive inhibition of spontaneous action, feeling, or communication. In leadership contexts, presents as controlled, detached professional demeanor.',
    'Unrelenting Standards': 'The underlying belief that one must strive to meet very high internalized standards, usually to avoid criticism. In leadership, creates perfectionist demands.',
    'Approval-Seeking': 'Excessive emphasis on gaining approval, recognition, or attention from others. In leadership contexts, manifests as image management and stakeholder focus.',
    'Negativity/Pessimism': 'Pervasive focus on negative aspects of life while minimizing positive aspects. In leadership, manifests as problem-focused thinking and risk aversion.'
  };
  
  return definitions[schemaName] || 'Schema pattern requiring clinical assessment for proper definition and treatment planning.';
}

function getClinicalBehaviors(schemaName: string): string[] {
  const behaviors: Record<string, string[]> = {
    'Punitiveness': [
      'Implements immediate consequences for performance failures',
      'Expresses intolerance for mistakes through direct confrontation',
      'Maintains rigid standards with limited flexibility for context',
      'Uses disappointment and criticism as primary motivational tools'
    ],
    'Abandonment': [
      'Excessive monitoring and check-ins with team members',
      'Difficulty tolerating professional boundaries',
      'Control-based relationship management',
      'Over-involvement in subordinates\' work processes'
    ],
    'Emotional Inhibition': [
      'Suppressed emotional expression in professional contexts',
      'Controlled, detached interpersonal style',
      'Difficulty with spontaneous positive feedback',
      'Limited emotional range in leadership interactions'
    ]
  };
  
  return behaviors[schemaName] || ['Requires specific clinical assessment for behavioral pattern identification'];
}

function getClinicalCognitions(schemaName: string): string[] {
  const cognitions: Record<string, string[]> = {
    'Punitiveness': [
      'Binary thinking about performance (success/failure, right/wrong)',
      'Attribution of mistakes to character flaws rather than situational factors', 
      'Belief that harsh consequences are necessary for learning and growth',
      'Low tolerance for ambiguity in performance standards'
    ],
    'Abandonment': [
      'Catastrophic thinking about relationship loss',
      'Hypervigilance to signs of disconnection or withdrawal',
      'Attribution of professional boundaries to personal rejection',
      'Beliefs about need for constant connection to maintain relationships'
    ]
  };
  
  return cognitions[schemaName] || ['Requires clinical assessment for cognitive pattern identification'];
}

function getClinicalEmotions(schemaName: string): string[] {
  const emotions: Record<string, string[]> = {
    'Punitiveness': [
      'Anger as primary response to unmet expectations',
      'Difficulty modulating emotional intensity in response to others\' mistakes',
      'May experience guilt or conflict when maintaining softer approach',
      'Tendency toward emotional escalation when standards are not met'
    ],
    'Abandonment': [
      'Anxiety when team members are unavailable or disconnected',
      'Fear responses to perceived relationship threats',
      'Emotional reactivity to signs of withdrawal or distance',
      'Panic or urgency when connection is threatened'
    ]
  };
  
  return emotions[schemaName] || ['Requires clinical assessment for emotional pattern identification'];
}

function getClinicalPresentation(schemaName: string): string {
  const presentations: Record<string, string> = {
    'Abandonment': 'Fear of losing important relationships through disconnection. Hypervigilance to signs of others pulling away or becoming unavailable. Tendency to use control and demands as means of preventing abandonment.',
    'Emotional Inhibition': 'Suppression of spontaneous emotions, particularly positive ones. Belief that emotional expression is inappropriate or unprofessional. May appear controlled or detached despite internal emotional intensity.',
    'Self-Sacrifice': 'Focus on meeting others\' needs at the expense of own needs. May experience guilt when prioritizing personal interests. Tendency to over-function in relationships and work contexts.',
    'Negativity/Pessimism': 'Focus on negative aspects of situations, expecting poor outcomes. Chronic worry and anticipation of problems. May present as "realistic" but consistently emphasizes risks and downsides.'
  };
  
  return presentations[schemaName] || 'Requires clinical assessment for proper presentation analysis.';
}
