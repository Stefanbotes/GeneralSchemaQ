
// Framework-Compliant Report Generation System
// Implementation of the Complete Report Framework Guide

import { CompleteAnalysis, PersonaScore, DomainAnalysis, generateBehavioralPredictions, generateSchemaCorrelates, generateClinicalRecommendations } from './framework-scoring-algorithm';

export interface ReportGenerationOptions {
  participantName: string;
  participantEmail?: string;
  participantTeam?: string;
  assessmentDate: string;
  assessmentId: string;
  reportTier: 2 | 3;
  clinicalSupervision?: boolean;
  supervisorName?: string;
  supervisorLicense?: string;
}

export class FrameworkReportGenerator {
  
  async generateTier2Report(analysis: CompleteAnalysis, options: ReportGenerationOptions): Promise<string> {
    const primary = analysis.primaryPersona;
    const secondary = analysis.secondaryPersona;
    const tertiary = analysis.tertiaryPersona;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leadership Personas Assessment - Tier 2 Detailed Coaching Report</title>
    <style>
        body {
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1.8;
            color: #1a202c;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f7fafc;
        }
        .report-container {
            background: white;
            padding: 60px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            text-align: center;
            border-bottom: 4px solid #2b6cb0;
            padding-bottom: 30px;
            margin-bottom: 50px;
        }
        .professional-logo {
            font-size: 32px;
            font-weight: bold;
            color: #2b6cb0;
            margin-bottom: 15px;
        }
        .primary-persona {
            border: 3px solid #3182ce;
            border-radius: 16px;
            padding: 40px;
            margin: 35px 0;
            background: linear-gradient(135deg, #ebf8ff 0%, #f0fff4 100%);
        }
        .secondary-persona {
            border: 2px solid #cbd5e0;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            background: #f8fafc;
        }
        .strength-card {
            background: #f0fff4;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #16a34a;
        }
        .development-card {
            background: #fffbeb;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #f59e0b;
        }
        .action-section {
            background: #fffbeb;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #f59e0b;
        }
        .integration-section {
            background: #ecfdf5;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #16a34a;
        }
        .stakeholder-section {
            background: #f0f9ff;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
        }
        h1 { font-size: 28px; margin-bottom: 10px; }
        h2 { font-size: 24px; color: #1e40af; margin: 30px 0 15px 0; }
        h3 { font-size: 20px; color: #1e293b; margin: 25px 0 10px 0; }
        h4 { font-size: 18px; color: #334155; margin: 20px 0 10px 0; }
        .persona-badge {
            display: inline-block;
            background: #7c3aed;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            margin: 5px 10px 5px 0;
        }
        .score-badge {
            background: #16a34a;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="professional-logo">LEADERSHIP PERSONAS ASSESSMENT</div>
            <h1>TIER 2 DETAILED COACHING REPORT</h1>
            <p><strong>${options.participantName}</strong></p>
            <p>Assessment Date: ${options.assessmentDate}</p>
            <p>Report Generated: ${new Date().toLocaleDateString()}</p>
        </div>

        <h2>🎯 Primary Leadership Profile</h2>
        <div class="primary-persona">
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <div style="background: #7c3aed; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px; margin-right: 20px;">
                    #1
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 28px; color: #1e293b;">${primary.publicName}</h3>
                    <div style="color: #7c3aed; font-weight: 600; font-size: 18px; margin-top: 5px;">${primary.strengthFocus}</div>
                </div>
                <div class="score-badge">${primary.percentage}% Alignment</div>
            </div>
            
            <h4>Leadership Description:</h4>
            <p>${primary.publicDescription}</p>
            
            <div class="strength-card">
                <h4>⚡ What This Means for Your Leadership:</h4>
                <ul>
                    ${this.generateLeadershipImplications(primary)}
                </ul>
            </div>
            
            <div class="strength-card">
                <h4>🎯 How This Serves Your Teams:</h4>
                <ul>
                    ${this.generateTeamBenefits(primary)}
                </ul>
            </div>
            
            <div class="development-card">
                <h4>📈 Development Edge:</h4>
                <p>${primary.developmentEdge}</p>
            </div>
        </div>

        <h2>🔍 Your Unique Leadership Signature</h2>
        <div class="integration-section">
            <h4>Secondary Strengths Integration:</h4>
            
            <div class="secondary-persona">
                <h4><span class="persona-badge">#2</span>${secondary.publicName} <span class="score-badge">${secondary.percentage}%</span></h4>
                <p><strong>Integration Pattern:</strong> ${this.generateIntegrationPattern(primary, secondary)}</p>
                <p><strong>Combined Impact:</strong> ${this.generateCombinedImpact(primary, secondary)}</p>
            </div>
            
            <div class="secondary-persona">
                <h4><span class="persona-badge">#3</span>${tertiary.publicName} <span class="score-badge">${tertiary.percentage}%</span></h4>
                <p><strong>Integration Pattern:</strong> ${this.generateIntegrationPattern(primary, tertiary)}</p>
                <p><strong>Supporting Dynamic:</strong> ${this.generateSupportingDynamic(primary, tertiary)}</p>
            </div>
        </div>

        <h2>💡 Strategic Development Plan</h2>
        <div class="action-section">
            <h3>Immediate Development Priorities (Next 30 days):</h3>
            <ol>
                ${this.generateImmediateDevelopmentActions(primary)}
            </ol>
            
            <h3>Medium-term Growth Path (Next 3 months):</h3>
            <ol>
                ${this.generateMediumTermActions(primary)}
            </ol>
            
            <h3>Long-term Leadership Evolution (Next 6-12 months):</h3>
            <ol>
                ${this.generateLongTermActions(primary)}
            </ol>
        </div>

        <h2>👥 Stakeholder Engagement Guide</h2>
        
        <div class="stakeholder-section">
            <h4>FOR YOUR MANAGER:</h4>
            <ul>
                ${this.generateManagerGuidance(primary)}
            </ul>
        </div>
        
        <div class="stakeholder-section">
            <h4>FOR YOUR PEERS:</h4>
            <ul>
                ${this.generatePeerGuidance(primary)}
            </ul>
        </div>
        
        <div class="stakeholder-section">
            <h4>FOR YOUR TEAM:</h4>
            <ul>
                ${this.generateTeamGuidance(primary)}
            </ul>
        </div>

        <h2>📊 Real-World Applications</h2>
        <div class="integration-section">
            <h4>Practical Implementation Strategies:</h4>
            <ul>
                ${this.generateRealWorldApplications(primary)}
            </ul>
            
            <h4>Organizational Fit:</h4>
            <p>${this.generateOrganizationalFit(primary)}</p>
        </div>

        <div style="background: #7c3aed; color: white; padding: 30px; border-radius: 8px; margin: 40px 0; text-align: center;">
            <h3 style="color: white; margin-top: 0;">Your ${primary.strengthFocus.toLowerCase()} creates ${this.getImpactStatement(primary)}.</h3>
            <p style="margin-bottom: 0;">Continue building on your natural ${primary.publicName.toLowerCase().replace('the ', '')} strengths while developing the integration strategies outlined in this report to maximize your leadership impact and organizational effectiveness.</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p><strong>This detailed analysis is based on the Leadership Personas Assessment framework.</strong></p>
            <p>Assessment ID: ${options.assessmentId} | Report generated on ${new Date().toLocaleDateString()}</p>
            <p>Leadership Personas Assessment © 2025 | Tier 2 Professional Development Report</p>
        </div>
    </div>
</body>
</html>`;
  }

  async generateTier3Report(analysis: CompleteAnalysis, options: ReportGenerationOptions): Promise<string> {
    const primary = analysis.primaryPersona;
    const behavioral = generateBehavioralPredictions(analysis);
    const schemaCorrelates = generateSchemaCorrelates(analysis);
    const clinicalRecs = generateClinicalRecommendations(analysis);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leadership Personas Assessment - Clinical Analysis Report</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.7;
            color: #1a202c;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #faf7f2;
        }
        .report-container {
            background: white;
            padding: 60px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 2px solid #dc2626;
        }
        .header {
            text-align: center;
            border-bottom: 4px solid #dc2626;
            padding-bottom: 30px;
            margin-bottom: 50px;
        }
        .clinical-logo {
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 15px;
        }
        .clinical-warning {
            background: #fef2f2;
            border: 3px solid #fecaca;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            text-align: center;
        }
        .schema-profile {
            border: 3px solid #dc2626;
            border-radius: 12px;
            padding: 35px;
            margin: 30px 0;
            background: #fef2f2;
        }
        .clinical-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .clinical-table th {
            background: #7f1d1d;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: bold;
        }
        .clinical-table td {
            border: 1px solid #cbd5e0;
            padding: 12px;
            vertical-align: top;
        }
        .severity-high {
            background: #fef2f2;
            color: #dc2626;
            font-weight: bold;
        }
        .severity-moderate {
            background: #fff7ed;
            color: #ea580c;
            font-weight: bold;
        }
        .severity-low {
            background: #f0f9ff;
            color: #0284c7;
        }
        .clinical-section {
            background: #f8fafc;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #64748b;
        }
        .recommendation-section {
            background: #f0f9ff;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #0284c7;
        }
        .behavioral-section {
            background: #fefce8;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #ca8a04;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="clinical-logo">LEADERSHIP PERSONAS ASSESSMENT</div>
            <h1>CLINICAL ANALYSIS REPORT</h1>
            <p><strong>RESEARCH PARTICIPANT DATA</strong></p>
        </div>

        <div class="clinical-warning">
            <h2 style="color: #dc2626; margin-top: 0;">⚠️ CLINICAL SUPERVISION REQUIRED</h2>
            <p><strong>IMPORTANT:</strong> This report contains clinical assessment information and requires supervision by a licensed mental health professional for proper interpretation and application. This assessment is for clinical and research purposes only.</p>
            ${options.clinicalSupervision ? `<p><strong>Clinical Supervision:</strong> Confirmed - ${options.supervisorName || 'Licensed Professional'}</p>` : ''}
        </div>

        <div class="clinical-section">
            <h2>Clinical Assessment Overview</h2>
            <table style="width: 100%; border: none;">
                <tr><td><strong>Assessment Date:</strong></td><td>${options.assessmentDate}</td></tr>
                <tr><td><strong>Participant Code:</strong></td><td>${options.assessmentId}</td></tr>
                <tr><td><strong>Assessment Protocol:</strong></td><td>Leadership Schema Assessment (108-item)</td></tr>
                <tr><td><strong>Completion Status:</strong></td><td>100% (108/108 items completed)</td></tr>
                <tr><td><strong>Overall Clinical Significance:</strong></td><td>${analysis.overallClinicalSignificance}</td></tr>
            </table>
        </div>

        <h2>Schema-Based Persona Activation Profile</h2>
        
        <div class="schema-profile">
            <h3>Primary Schema Analysis: ${primary.clinicalName} (${primary.percentage}%)</h3>
            <p><strong>Domain:</strong> ${primary.domain}</p>
            <p><strong>Clinical Significance:</strong> ${primary.clinicalSignificance}</p>
            
            <h4>Clinical Definition & Manifestation:</h4>
            <p>${primary.clinicalDescription}</p>
            
            <h4>Organizational Leadership Context:</h4>
            <p>In leadership contexts, this schema manifests as ${primary.strengthFocus.toLowerCase()} behaviors that can be both adaptive and potentially problematic depending on organizational context and activation intensity.</p>
        </div>

        <h2>Complete Domain Analysis</h2>
        <table class="clinical-table">
            <thead>
                <tr>
                    <th>Schema Domain</th>
                    <th>Average Activation</th>
                    <th>Primary Pattern</th>
                    <th>Clinical Significance</th>
                </tr>
            </thead>
            <tbody>
                ${analysis.domainAnalysis.map(domain => `
                <tr>
                    <td>${domain.domainName}</td>
                    <td style="font-weight: bold; font-size: 16px;">${domain.averageActivation}%</td>
                    <td>${domain.primaryPersona.clinicalName.replace('The ', '')} (${domain.primaryPersona.percentage}%)</td>
                    <td class="severity-${domain.clinicalSignificance.toLowerCase()}">${domain.clinicalSignificance}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="clinical-section">
            <h3>Schema Therapy Correlates</h3>
            <p>${schemaCorrelates}</p>
        </div>

        <div class="behavioral-section">
            <h2>Behavioral Prediction Model</h2>
            
            <h4>Stress Response Patterns:</h4>
            <p>${behavioral.stressResponse}</p>
            
            <h4>Conflict Style Prediction:</h4>
            <p>${behavioral.conflictStyle}</p>
            
            <h4>Decision-Making Pattern:</h4>
            <p>${behavioral.decisionMaking}</p>
            
            <h4>Team Dynamics Impact:</h4>
            <p>${behavioral.teamDynamics}</p>
            
            <h4>Change Response Prediction:</h4>
            <p>${behavioral.changeResponse}</p>
        </div>

        <div class="recommendation-section">
            <h2>Clinical Recommendations</h2>
            
            <h3>Therapeutic Modality:</h3>
            <p>${clinicalRecs.therapeuticModality}</p>
            
            <h3>Clinical Focus Areas:</h3>
            <ul>
                ${clinicalRecs.focusAreas.map(area => `<li>${area}</li>`).join('')}
            </ul>
            
            <h3>Recommended Interventions:</h3>
            <ul>
                ${clinicalRecs.interventionApproaches.map(intervention => `<li>${intervention}</li>`).join('')}
            </ul>
            
            <h3>Clinical Contraindications:</h3>
            <ul>
                ${clinicalRecs.contraindications.map(contraindication => `<li>${contraindication}</li>`).join('')}
            </ul>
        </div>

        <div class="clinical-section">
            <h2>Research Implications</h2>
            
            <h3>Schema Therapy Research:</h3>
            <p>This profile contributes to understanding of schema activation patterns in organizational leadership contexts, particularly regarding ${primary.domain.toLowerCase()} domain schemas and their manifestation in professional environments.</p>
            
            <h3>Organizational Psychology Research:</h3>
            <p>Findings support schema-based leadership models and suggest specific interventions for ${primary.clinicalName.toLowerCase().replace('the ', '')} patterns in organizational contexts.</p>
            
            <h3>Leadership Development Research:</h3>
            <p>Profile suggests targeted development approaches focused on ${primary.strengthFocus.toLowerCase()} enhancement while addressing clinical considerations for optimal organizational functioning.</p>
        </div>

        <div style="margin-top: 50px; padding-top: 30px; border-top: 3px solid #dc2626; text-align: center; color: #64748b; font-size: 14px;">
            <p><strong>CONFIDENTIAL CLINICAL ASSESSMENT</strong></p>
            <p>This clinical assessment is based on the Schema-Focused Leadership Assessment protocol.</p>
            <p>Assessment ID: ${options.assessmentId} | Clinical Analysis Generated: ${new Date().toLocaleDateString()}</p>
            <p>Clinical Leadership Assessment © 2025 | Requires Clinical Supervision</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Helper methods for content generation
  private generateLeadershipImplications(persona: PersonaScore): string {
    const implications: Record<string, string[]> = {
      "The Relationship Champion": [
        "Demonstrates exceptional relationship-building in decision-making processes, ensuring stakeholder buy-in and collaborative outcomes",
        "Creates team alignment through connection and loyalty focus, establishing strong interpersonal bonds within group dynamics",
        "Navigates organizational complexity by leveraging relationship capital to build bridges and facilitate communication",
        "Builds strategic influence through deep personal connections, enabling trust-based collaboration in planning processes",
        "Establishes leadership credibility via consistent relationship investment, which creates sustainable team loyalty and engagement"
      ],
      "The Thoughtful Strategist": [
        "Demonstrates careful planning and analysis in decision-making processes, prioritizing thorough evaluation and risk assessment",
        "Creates team confidence through systematic thinking and preparation, establishing reliable strategic direction",
        "Navigates organizational complexity by leveraging analytical depth to identify optimal paths forward",
        "Builds strategic influence through well-researched insights, enabling data-driven collaboration in planning processes",
        "Establishes leadership credibility via consistent strategic thinking, which builds trust in long-term planning capabilities"
      ],
      "The Focus Leader": [
        "Demonstrates task focus and clarity in decision-making processes, prioritizing objective achievement and goal alignment",
        "Creates team productivity through results-driven clarity, establishing clear performance expectations",
        "Navigates organizational complexity by leveraging focus discipline to maintain direction despite distractions",
        "Builds strategic influence through consistent execution, enabling achievement-oriented collaboration in planning processes",
        "Establishes leadership credibility via reliable delivery focus, which creates trust in goal achievement capabilities"
      ]
    };
    
    const personaImplications = implications[persona.publicName] || [
      `Demonstrates ${persona.strengthFocus.toLowerCase()} through systematic decision-making processes`,
      `Creates team alignment through ${persona.strengthFocus.toLowerCase()}, establishing consistent performance patterns`,
      `Navigates organizational complexity by leveraging ${persona.strengthFocus.toLowerCase()} to optimize outcomes`,
      `Builds strategic influence through ${persona.strengthFocus.toLowerCase()}, enabling effective collaboration`,
      `Establishes leadership credibility via consistent ${persona.strengthFocus.toLowerCase()}, which builds stakeholder confidence`
    ];
    
    return personaImplications.map(impl => `<li>${impl}</li>`).join('');
  }

  private generateTeamBenefits(persona: PersonaScore): string {
    const benefits: Record<string, string[]> = {
      "The Relationship Champion": [
        "Team members experience strong emotional connection and support in their work environment",
        "Team performance benefits from enhanced collaboration and trust-based problem-solving approaches",
        "Team culture is strengthened through loyalty-building and relationship-focused leadership modeling",
        "Team development is supported via personal investment and individual attention to growth needs",
        "Team capabilities are expanded through collaborative skill development and relationship capital building"
      ],
      "The Thoughtful Strategist": [
        "Team members experience strategic clarity and well-researched direction in their work environment",
        "Team performance benefits from thorough planning and analytical problem-solving approaches",
        "Team culture is enhanced through careful consideration and strategic thinking modeling",
        "Team development is supported via analytical skill development and strategic planning capabilities",
        "Team capabilities are expanded through systematic thinking and strategic analysis skill building"
      ],
      "The Focus Leader": [
        "Team members experience clear direction and results-focused guidance in their work environment",
        "Team performance benefits from enhanced productivity and goal-oriented problem-solving approaches",
        "Team culture is strengthened through achievement focus and task-oriented leadership modeling",
        "Team development is supported via performance optimization and execution skill development",
        "Team capabilities are expanded through disciplined focus and results-oriented skill building"
      ]
    };
    
    const personaBenefits = benefits[persona.publicName] || [
      `Team members experience ${persona.strengthFocus.toLowerCase()} support in their work environment`,
      `Team performance benefits from ${persona.strengthFocus.toLowerCase()}-oriented problem-solving approaches`,
      `Team culture is enhanced through ${persona.strengthFocus.toLowerCase()} leadership modeling`,
      `Team development is supported via ${persona.strengthFocus.toLowerCase()} skill development`,
      `Team capabilities are expanded through ${persona.strengthFocus.toLowerCase()} emphasis and skill building`
    ];
    
    return personaBenefits.map(benefit => `<li>${benefit}</li>`).join('');
  }

  private generateImmediateDevelopmentActions(persona: PersonaScore): string {
    const actions: Record<string, string[]> = {
      "The Relationship Champion": [
        "<strong>Boundary Calibration:</strong> Practice setting clear professional boundaries while maintaining relationship warmth - start with one 30-minute daily focus block",
        "<strong>Independence Building:</strong> Identify team members ready for increased autonomy and gradually reduce check-in frequency",
        "<strong>Efficiency Integration:</strong> Balance relationship investment with task completion by time-blocking relationship activities",
        "<strong>Delegation Practice:</strong> Choose one recurring task weekly to delegate completely, resisting the urge to over-monitor",
        "<strong>Self-Care Scheduling:</strong> Block 15 minutes daily for personal needs to model sustainable leadership practices"
      ],
      "The Thoughtful Strategist": [
        "<strong>Visibility Enhancement:</strong> Share one strategic insight publicly each day through team communications or meetings",
        "<strong>Communication Amplification:</strong> Practice presenting analysis in 2-minute summaries before diving into details",
        "<strong>Recognition Acceptance:</strong> When complimented on strategic thinking, respond with 'thank you' rather than deflecting",
        "<strong>Proactive Sharing:</strong> Schedule weekly strategic briefings to share insights before being asked",
        "<strong>Influence Building:</strong> Identify one decision per week where your analysis should be featured prominently"
      ],
      "The Focus Leader": [
        "<strong>Emotional Data Integration:</strong> Spend 5 minutes after each team interaction noting emotional undercurrents observed",
        "<strong>Team Check-in Expansion:</strong> Add one emotional/personal question to regular team check-ins",
        "<strong>Engagement Tracking:</strong> Monitor team energy levels alongside task completion metrics",
        "<strong>Relationship Investment:</strong> Schedule 15 minutes weekly with each team member for non-task conversation",
        "<strong>Context Awareness:</strong> Before task-focused meetings, spend 2 minutes assessing team emotional readiness"
      ]
    };
    
    const personaActions = actions[persona.publicName] || [
      `<strong>Strength Application:</strong> Identify specific ways to apply your ${persona.strengthFocus.toLowerCase()} more strategically`,
      `<strong>Development Focus:</strong> ${persona.developmentEdge}`,
      `<strong>Integration Practice:</strong> Balance your natural ${persona.strengthFocus.toLowerCase()} with complementary skills`,
      `<strong>Feedback Seeking:</strong> Request specific feedback on your ${persona.strengthFocus.toLowerCase()} application`,
      `<strong>Impact Measurement:</strong> Track outcomes from your ${persona.strengthFocus.toLowerCase()} approach`
    ];
    
    return personaActions.map(action => `<li>${action}</li>`).join('');
  }

  private generateMediumTermActions(persona: PersonaScore): string {
    const actions: Record<string, string[]> = {
      "The Relationship Champion": [
        "<strong>Systems Thinking Development:</strong> Enroll in project management training to complement relationship skills with systematic execution",
        "<strong>Mentoring Program Design:</strong> Create structured mentoring relationships that leverage your connection abilities",
        "<strong>360-Degree Feedback:</strong> Implement comprehensive feedback system to understand relationship impact across the organization",
        "<strong>Boundary Management Systems:</strong> Develop policies and practices that maintain relationships while protecting time and energy",
        "<strong>Leadership Philosophy Integration:</strong> Create written leadership approach that combines relationship excellence with operational effectiveness"
      ]
    };
    
    const defaultActions = [
      `<strong>Skill Integration Program:</strong> Develop complementary skills that enhance your natural ${persona.strengthFocus.toLowerCase()}`,
      `<strong>Leadership Style Refinement:</strong> Work with coach or mentor to optimize your ${persona.strengthFocus.toLowerCase()} approach`,
      `<strong>Organizational Impact Assessment:</strong> Measure and document the organizational value of your ${persona.strengthFocus.toLowerCase()}`,
      `<strong>Team Development Initiative:</strong> Create program that builds team capabilities in your strength areas`,
      `<strong>Cross-Functional Collaboration:</strong> Apply your ${persona.strengthFocus.toLowerCase()} in new organizational contexts`
    ];
    
    const personaActions = actions[persona.publicName] || defaultActions;
    return personaActions.map(action => `<li>${action}</li>`).join('');
  }

  private generateLongTermActions(persona: PersonaScore): string {
    const actions: Record<string, string[]> = {
      "The Relationship Champion": [
        "<strong>Legacy Leadership Development:</strong> Evolve toward integrated relationship-systems leadership that builds both connection and organizational capability",
        "<strong>Culture Architecture:</strong> Use relationship expertise to design and implement organizational cultures that thrive on authentic connection",
        "<strong>Leadership Philosophy Mastery:</strong> Develop comprehensive leadership framework that demonstrates how relationship excellence drives business results",
        "<strong>Executive Coaching Mastery:</strong> Master ability to develop other leaders' relationship and connection capabilities",
        "<strong>Organizational Transformation Leadership:</strong> Lead culture change initiatives that integrate relationship excellence with operational performance"
      ]
    };
    
    const defaultActions = [
      `<strong>Mastery Development:</strong> Become organizational expert in ${persona.strengthFocus.toLowerCase()} applications`,
      `<strong>Leadership Philosophy Completion:</strong> Develop comprehensive approach that integrates ${persona.strengthFocus.toLowerCase()} with strategic leadership`,
      `<strong>Mentoring Excellence:</strong> Master development of other leaders' capabilities in ${persona.strengthFocus.toLowerCase()}`,
      `<strong>Organizational Innovation:</strong> Pioneer new approaches that leverage ${persona.strengthFocus.toLowerCase()} for competitive advantage`,
      `<strong>Legacy Building:</strong> Create lasting organizational systems that embody your ${persona.strengthFocus.toLowerCase()} approach`
    ];
    
    const personaActions = actions[persona.publicName] || defaultActions;
    return personaActions.map(action => `<li>${action}</li>`).join('');
  }

  private generateIntegrationPattern(primary: PersonaScore, secondary: PersonaScore): string {
    return `Your ${primary.publicName.toLowerCase().replace('the ', '')} approach is enhanced by ${secondary.publicName.toLowerCase().replace('the ', '')} capabilities, creating a leadership style that combines ${primary.strengthFocus.toLowerCase()} with ${secondary.strengthFocus.toLowerCase()}.`;
  }

  private generateCombinedImpact(primary: PersonaScore, secondary: PersonaScore): string {
    return `This integration enables you to deliver ${primary.strengthFocus.toLowerCase()} while simultaneously providing ${secondary.strengthFocus.toLowerCase()}, creating multidimensional leadership value for your organization.`;
  }

  private generateSupportingDynamic(primary: PersonaScore, tertiary: PersonaScore): string {
    return `Your ${tertiary.publicName.toLowerCase().replace('the ', '')} qualities provide supporting foundation that enables your primary ${primary.strengthFocus.toLowerCase()} to be more effective and sustainable.`;
  }

  private generateManagerGuidance(persona: PersonaScore): string {
    const guidance: Record<string, string[]> = {
      "The Relationship Champion": [
        "Provide regular relationship-building opportunities and recognize this leader's connection achievements",
        "Support boundary development by modeling healthy limits while appreciating relationship investment",
        "Leverage this leader's relationship capital for stakeholder engagement and team building initiatives",
        "Balance relationship-focused projects with systematic execution support and training opportunities"
      ]
    };
    
    const defaultGuidance = [
      `Recognize and leverage this leader's natural ${persona.strengthFocus.toLowerCase()} capabilities`,
      `Provide development opportunities that build on existing ${persona.strengthFocus.toLowerCase()} strengths`,
      `${persona.developmentEdge}`,
      `Create projects that showcase ${persona.strengthFocus.toLowerCase()} value to the organization`
    ];
    
    const personaGuidance = guidance[persona.publicName] || defaultGuidance;
    return personaGuidance.map(item => `<li>${item}</li>`).join('');
  }

  private generatePeerGuidance(persona: PersonaScore): string {
    const guidance = [
      `Appreciate this leader's ${persona.strengthFocus.toLowerCase()} contributions to collaborative projects`,
      `Share complementary skills that enhance their natural ${persona.strengthFocus.toLowerCase()} approach`,
      `Support their development by providing feedback on ${persona.strengthFocus.toLowerCase()} application`,
      `Leverage their ${persona.strengthFocus.toLowerCase()} expertise for mutual project success`
    ];
    
    return guidance.map(item => `<li>${item}</li>`).join('');
  }

  private generateTeamGuidance(persona: PersonaScore): string {
    const guidance = [
      `Appreciate and actively engage with this leader's ${persona.strengthFocus.toLowerCase()} approach`,
      `Provide feedback on how their ${persona.strengthFocus.toLowerCase()} impacts team performance and satisfaction`,
      `Support their development by sharing what works best for ${persona.strengthFocus.toLowerCase()} collaboration`,
      `Contribute your own strengths to complement their ${persona.strengthFocus.toLowerCase()} leadership style`
    ];
    
    return guidance.map(item => `<li>${item}</li>`).join('');
  }

  private generateRealWorldApplications(persona: PersonaScore): string {
    const applications = [
      `Apply ${persona.strengthFocus.toLowerCase()} in cross-functional projects to demonstrate organizational value`,
      `Use ${persona.strengthFocus.toLowerCase()} approach in change management to build adoption and engagement`,
      `Leverage ${persona.strengthFocus.toLowerCase()} during conflict resolution to create sustainable solutions`,
      `Integrate ${persona.strengthFocus.toLowerCase()} in strategic planning to enhance execution and buy-in`
    ];
    
    return applications.map(app => `<li>${app}</li>`).join('');
  }

  private generateOrganizationalFit(persona: PersonaScore): string {
    const fit: Record<string, string> = {
      "The Relationship Champion": "This leadership profile thrives in collaborative, relationship-focused organizational cultures and may face challenges in highly transactional or purely results-driven environments. Consider placement in roles requiring stakeholder engagement, team building, or culture development for optimal effectiveness.",
      "The Thoughtful Strategist": "This leadership profile thrives in strategic, planning-focused organizational cultures and may face challenges in fast-paced, execution-only environments. Consider placement in roles requiring analysis, strategic thinking, or complex problem-solving for optimal effectiveness.",
      "The Focus Leader": "This leadership profile thrives in results-oriented, performance-focused organizational cultures and may face challenges in highly relationship-dependent or emotionally complex environments. Consider placement in roles requiring execution excellence, goal achievement, or operational leadership for optimal effectiveness."
    };
    
    return fit[persona.publicName] || `This leadership profile tends to excel in environments that value ${persona.strengthFocus.toLowerCase()} and may need additional support in contexts requiring different primary capabilities.`;
  }

  private getImpactStatement(persona: PersonaScore): string {
    const statements: Record<string, string> = {
      "Connection & Loyalty": "sustainable team trust and organizational cohesion",
      "Careful Planning & Analysis": "strategic clarity and informed decision-making",
      "Task Focus & Clarity": "reliable execution and goal achievement",
      "Risk Management & Preparation": "organizational stability and security",
      "Autonomous Thinking & Innovation": "breakthrough thinking and creative solutions",
      "Thorough Assessment & Consideration": "informed decisions and risk mitigation",
      "Independence & Self-Reliance": "dependable results and personal accountability",
      "Security & Predictability": "stable foundation for team performance",
      "Team Support & Generosity": "strong team loyalty and high engagement",
      "Flexibility & Consensus Building": "collaborative success and team harmony",
      "Collaborative Decision-Making": "inclusive leadership and team alignment",
      "Professional Relationships": "strategic stakeholder engagement and influence",
      "Organizational Navigation": "results through strategic influence and systems thinking",
      "Realistic Assessment & Planning": "practical decisions and effective preparation",
      "Emotional Stability & Reliability": "team confidence and consistent performance",
      "High Standards & Quality": "excellence achievement and quality outcomes",
      "Accountability & Clear Expectations": "reliable performance and organizational integrity",
      "Direct Communication & Honesty": "clarity, transparency, and authentic relationships"
    };
    
    return statements[persona.strengthFocus] || "positive organizational impact and team effectiveness";
  }
}
