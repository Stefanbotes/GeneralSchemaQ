

// Enhanced Three-Tier Report Generation System
// Professional-grade report content matching clinical quality standards

import { ThreeTierAnalysis, PersonaActivation, SchemaActivation } from './schema-analysis';
import { EnhancedPersonaActivation, EnhancedSchemaActivation, EnhancedThreeTierAnalysis } from './enhanced-schema-analysis';
import { getPersonaDetails, ENHANCED_PERSONA_MAPPING } from '../data/enhanced-persona-mapping';

interface ParticipantData {
  name: string;
  email: string;
  organization?: string;
  assessmentDate: string;
  assessmentId: string;
}

// Generate specific behavioral analysis for personas
function generateBehavioralAnalysis(persona: any, personaDetails: any): string {
  if (!personaDetails) return "Demonstrates distinctive leadership patterns that contribute to organizational success.";
  
  const behaviors = personaDetails.behaviors?.behavioral_markers || [];
  const patterns = personaDetails.behaviors?.cognitive_patterns || [];
  
  return `
    <strong>Behavioral Markers:</strong>
    <ul>${behaviors.map((marker: string) => `<li>${marker}</li>`).join('')}</ul>
    
    <strong>Cognitive Patterns:</strong>
    <ul>${patterns.map((pattern: string) => `<li>${pattern}</li>`).join('')}</ul>
  `;
}

// Generate integration analysis between personas
function generateIntegrationAnalysis(primary: any, supporting: any[]): string {
  const primaryDetails = getPersonaDetails(primary.personaName);
  
  let integrationAnalysis = `<h4>⚡ The Internal Integration and Its Power</h4>`;
  integrationAnalysis += `<p><strong>Your Complex Reality:</strong> You simultaneously:</p><ul>`;
  
  if (supporting.length > 0) {
    integrationAnalysis += `<li>${primary.strengthFocus} while ${supporting[0].strengthFocus.toLowerCase()}</li>`;
    if (supporting.length > 1) {
      integrationAnalysis += `<li>Express ${supporting[1].strengthFocus.toLowerCase()} through your ${primary.strengthFocus.toLowerCase()}</li>`;
    }
    if (supporting.length > 2) {
      integrationAnalysis += `<li>Balance ${supporting[2].strengthFocus.toLowerCase()} with your primary ${primary.strengthFocus.toLowerCase()} approach</li>`;
    }
  }
  
  integrationAnalysis += `<li>Create a unique leadership presence that combines multiple strengths</li></ul>`;
  
  integrationAnalysis += `<p>This creates a unique but sophisticated leadership dynamic where your team experiences you as both ${primary.strengthFocus.toLowerCase()} and deeply invested in their success.</p>`;
  
  return integrationAnalysis;
}

// Generate specific action plans based on persona combinations
function generateSpecificActionPlan(primary: any, supporting: any[]): any {
  const primaryDetails = getPersonaDetails(primary.personaName);
  
  return {
    immediate: [
      `Track your ${primary.strengthFocus.toLowerCase()} patterns for one week to build self-awareness`,
      `Practice explaining the 'why' behind your ${primary.strengthFocus.toLowerCase()} approach in at least 3 situations`,
      `Identify your top 3 trigger situations that activate your ${primary.personaName} response`,
      `Start one conversation this week with: "I'm invested in your success, so..." before giving feedback`
    ],
    mediumTerm: [
      `Create a structured framework that leverages your ${primary.strengthFocus.toLowerCase()} while addressing development edges`,
      `Establish regular check-ins focused on growth and development, not just performance`,
      `Develop ways to celebrate progress and effort alongside outcome achievement`,
      `Create psychological safety protocols while maintaining your high standards`
    ],
    longTerm: [
      `Evolve toward an integrated approach that maintains your ${primary.strengthFocus.toLowerCase()} while enhancing team development`,
      `Mentor others who share similar leadership patterns to develop your coaching capabilities`,
      `Use your natural ${primary.strengthFocus.toLowerCase()} to build others' capabilities rather than just demand performance`,
      `Create a leadership legacy that combines your strengths with enhanced interpersonal effectiveness`
    ]
  };
}

// Enhanced Tier 2 Report: Professional Leadership Development
export function generateEnhancedTier2Report(analysis: EnhancedThreeTierAnalysis, participant: ParticipantData): string {
  const primary = analysis.tier2.primaryPersona;
  const supporting = analysis.tier2.supportingPersonas;
  const primaryDetails = getPersonaDetails(primary.personaName);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Inner Personas Report - ${participant.name}</title>
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
        .supporting-persona {
            border: 2px solid #cbd5e0;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            background: #f8fafc;
        }
        .behavioral-analysis {
            background: #f0f9ff;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 6px solid #0284c7;
        }
        .integration-section {
            background: #ecfdf5;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #16a34a;
        }
        .action-section {
            background: #fffbeb;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #f59e0b;
        }
        .strength-card {
            background: #f0fff4;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #16a34a;
        }
        .shadow-card {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #f56565;
        }
        .persona-badge {
            background: #3182ce;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin: 5px 10px 5px 0;
        }
        .activation-high {
            background: #16a34a;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 14px;
        }
        .activation-moderate {
            background: #f59e0b;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 14px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .summary-table th {
            background: #1e293b;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: bold;
        }
        .summary-table td {
            border: 1px solid #cbd5e0;
            padding: 12px;
            vertical-align: top;
        }
        .summary-table tr:nth-child(even) {
            background: #f8fafc;
        }
        .organizational-context {
            background: #ecfdf5;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border: 2px solid #a7f3d0;
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
            <p><strong>Total Questions:</strong> 54 | <strong>All Questions Answered:</strong> ✓</p>
            ${participant.organization ? `<p><strong>Organization:</strong> ${participant.organization}</p>` : ''}
            <p><strong>Primary Persona:</strong> ${primary.publicName} (${primary.activationLevel}% alignment)</p>
            <p><strong>Top 5 Inner Personas:</strong></p>
            <ol>
                <li>${primary.publicName} - ${primary.activationLevel}%</li>
                ${supporting.slice(0, 4).map(p => `<li>${p.publicName} - ${p.activationLevel}%</li>`).join('')}
            </ol>
        </div>

        <h2>🎯 Primary Leadership Profile: ${primary.publicName} (${primary.activationLevel}%)</h2>
        
        <div class="primary-persona">
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <div style="background: #3182ce; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px; margin-right: 20px;">
                    #${primary.rank}
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 28px; color: #1e293b;">${primary.publicName}</h3>
                    <div style="color: #3182ce; font-weight: 600; font-size: 18px; margin-top: 5px;">${primary.strengthFocus}</div>
                </div>
                <div class="activation-high">${primary.activationLevel}% Alignment</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4>What Being "${primary.publicName}" Means</h4>
                <p><strong>Core Pattern:</strong> ${primaryDetails?.publicDescription || analysis.tier2.detailedAnalysis}</p>
            </div>
            
            <div class="strength-card">
                <h4>⚡ Your Leadership Strengths as ${primary.publicName}:</h4>
                <p><strong>${primary.strengthFocus}</strong></p>
                ${primaryDetails ? generateBehavioralAnalysis(primary, primaryDetails) : `
                <ul>
                    <li>You maintain consistently high expectations that elevate overall performance</li>
                    <li>You demonstrate ${primary.strengthFocus.toLowerCase()} that helps teams achieve their goals</li>
                    <li>Your approach creates clarity and direction for organizational success</li>
                    <li>You provide valuable perspective that enhances team capability</li>
                </ul>`}
            </div>
            
            <div class="shadow-card">
                <h4>⚠️ The Shadow Side: What to Watch For</h4>
                <p><strong>Development Areas to Monitor:</strong></p>
                <ul>
                    <li>Ensure your ${primary.strengthFocus.toLowerCase()} doesn't create unintended pressure or constraints</li>
                    <li>Balance your natural approach with flexibility for different situations and people</li>
                    <li>Monitor how your leadership style affects team psychological safety and innovation</li>
                    <li>Watch for signs that your strengths may be creating blind spots or limitations</li>
                </ul>
            </div>
        </div>

        ${supporting.length > 0 ? `
        <h2>🔍 Understanding Your Supporting Personas (60%+ Alignment)</h2>
        <p>Your high scores across multiple personas create a complex, sophisticated leadership profile:</p>
        
        ${supporting.map(persona => {
          const details = getPersonaDetails(persona.personaName);
          return `
          <div class="supporting-persona">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="background: #6b7280; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;">
                      #${persona.rank}
                  </div>
                  <div style="flex: 1;">
                      <strong style="font-size: 18px;">${persona.publicName} (${persona.activationLevel}%)</strong>
                      <div style="color: #6b7280; font-size: 14px; margin-top: 2px;">${persona.strengthFocus}</div>
                  </div>
                  <div class="${persona.activationLevel >= 70 ? 'activation-high' : 'activation-moderate'}">${persona.activationLevel}%</div>
              </div>
              
              <p><strong>How it shows up in you:</strong> ${details?.behaviors?.behavioral_markers?.[0] || persona.developmentEdge}</p>
              
              <p><strong>Integration with ${primary.publicName}:</strong> 
              ${details?.integration_patterns?.with_specific_personas?.[primary.personaName] || 
                `This pattern adds ${persona.strengthFocus.toLowerCase()} to your leadership approach, creating additional depth and capability that enhances your primary ${primary.strengthFocus.toLowerCase()} style.`}
              </p>
          </div>`;
        }).join('')}
        ` : ''}

        ${generateIntegrationAnalysis(primary, supporting)}

        <div class="action-section">
            <h3>💡 How to Optimize Your "${analysis.tier2.leadershipPattern}" Style</h3>
            
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

        <h3>🎯 Specific Action Plan for ${participant.name}</h3>
        
        <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h4>Week 1-2: Self-Awareness Building</h4>
            <ul>
                <li>Track your ${primary.strengthFocus.toLowerCase()} responses and their impact on team dynamics</li>
                <li>Notice the gap between your intentions and how others experience your leadership</li>
                <li>Identify your top 3 "trigger" situations that bring out your ${primary.personaName} patterns most strongly</li>
                <li>Reflect on: "When does my ${primary.strengthFocus.toLowerCase()} help vs. potentially hinder team performance?"</li>
            </ul>
        </div>

        <div style="background: #e0f2fe; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h4>Week 3-4: Communication Enhancement Experiments</h4>
            <ul>
                <li>Before using your ${primary.strengthFocus.toLowerCase()}, start with: "I'm invested in your success, so..."</li>
                <li>Practice explaining the 'why' behind your approach in at least 3 leadership situations</li>
                <li>Try asking "What support do you need to excel here?" before implementing your natural style</li>
                <li>Implement one "development conversation" focused on growth rather than just performance</li>
            </ul>
        </div>

        <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h4>Month 2: System Development</h4>
            <ul>
                <li>Create a framework that combines your ${primary.strengthFocus.toLowerCase()} with enhanced team development</li>
                <li>Establish regular "growth check-ins" focused on capability building, not just outcome measurement</li>
                <li>Develop ways to celebrate progress and effort alongside outcome achievement</li>
                <li>Create psychological safety protocols that work within your natural leadership style</li>
            </ul>
        </div>

        <div style="background: #ecfdf5; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h4>Ongoing: Leadership Mastery Integration</h4>
            <ul>
                <li>Regular self-check: "Am I using my ${primary.strengthFocus.toLowerCase()} from investment or from frustration?"</li>
                <li>Seek feedback on how your leadership affects others' willingness to take risks and innovate</li>
                <li>Continue developing your unique integrated approach that combines multiple personas</li>
                <li>Use your natural strengths to build others' capabilities rather than just demanding performance</li>
            </ul>
        </div>

        ${participant.organization ? `
        <div class="organizational-context">
            <h3>🌟 The ${participant.organization} Context: Maximizing Your Leadership Impact</h3>
            
            <div style="margin: 20px 0;">
                <h4>Your Natural Advantages:</h4>
                <ul>
                    <li><strong>${primary.strengthFocus}:</strong> Your natural ${primary.strengthFocus.toLowerCase()} aligns well with organizational performance needs</li>
                    <li><strong>Relationship Investment:</strong> Your caring nature helps build lasting professional relationships</li>
                    <li><strong>Authentic Communication:</strong> Your direct style provides honest, trusted advisor relationships</li>
                    <li><strong>Performance Standards:</strong> Your approach creates accountability systems that develop capability</li>
                </ul>
            </div>
            
            <div style="margin: 20px 0;">
                <h4>Areas for Strategic Development:</h4>
                <ul>
                    <li><strong>Innovation Balance:</strong> Ensure your strengths don't inadvertently stifle creative approaches</li>
                    <li><strong>Team Retention:</strong> Use your caring nature more visibly to retain and develop top talent</li>
                    <li><strong>Stakeholder Relations:</strong> Balance your directness with appropriate relationship maintenance</li>
                    <li><strong>Leadership Energy:</strong> Channel your intensity into sustainable strategic impact</li>
                </ul>
            </div>
            
            <div style="margin: 20px 0;">
                <h4>${participant.organization}-Specific Applications:</h4>
                <ol>
                    <li><strong>Strategic Leadership:</strong> Use your ${primary.strengthFocus.toLowerCase()} to lead thorough analysis and planning</li>
                    <li><strong>Team Development:</strong> Transform your investment in others into mentoring emerging professionals</li>
                    <li><strong>Stakeholder Communication:</strong> Leverage your authentic style for trusted advisor relationships</li>
                    <li><strong>Performance Management:</strong> Create accountability systems that develop capability while maintaining standards</li>
                </ol>
            </div>
        </div>
        ` : ''}

        <div style="background: #e0f2fe; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3>🎉 Celebrating Your Unique Leadership Gifts</h3>
            <p>Your ${primary.activationLevel}% alignment with ${primary.publicName}, supported by ${supporting.length > 0 ? supporting.map(p => p.publicName).join(', ') : 'additional strengths'}, represents a rare and powerful leadership combination.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4>You have the Rare Ability To:</h4>
                <ul style="text-align: left;">
                    <li>Combine ${primary.strengthFocus.toLowerCase()} with genuine care for people's development</li>
                    <li>Express authentic leadership while staying deeply invested in relationships</li>
                    <li>Drive results from a place of investment rather than just demand</li>
                    <li>Challenge people while believing deeply in their potential and capability</li>
                </ul>
            </div>
            
            <p><strong>Your Leadership Superpower:</strong> You create environments where ${primary.strengthFocus.toLowerCase()} isn't just demanded but is experienced as investment in people's success. This "${analysis.tier2.leadershipPattern}" style, when optimized, produces exceptional results with strong loyalty and engagement.</p>
            
            <p><strong>The Key:</strong> Continue being ${primary.strengthFocus.toLowerCase()}, but make your care and investment more visible. Your standards and approach are a gift to your team - help them experience it that way.</p>
        </div>

        <div style="margin-top: 40px;">
            <h3>📊 Complete Persona Profile Summary</h3>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Leadership Persona</th>
                        <th>Score</th>
                        <th>Key Insight</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: #f0fff4;">
                        <td style="font-weight: bold; color: #16a34a;">#{primary.rank}</td>
                        <td style="font-weight: bold;">${primary.publicName}</td>
                        <td style="color: #16a34a; font-weight: bold; font-size: 18px;">${primary.activationLevel}%</td>
                        <td>Primary driver of ${primary.strengthFocus.toLowerCase()}</td>
                    </tr>
                    ${supporting.map(persona => `
                    <tr>
                        <td style="font-weight: bold;">#{persona.rank}</td>
                        <td>${persona.publicName}</td>
                        <td style="font-weight: bold; color: ${persona.activationLevel >= 70 ? '#16a34a' : '#f59e0b'};">${persona.activationLevel}%</td>
                        <td>${persona.strengthFocus}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <p><strong>Your Unique Pattern:</strong> The ${analysis.tier2.leadershipPattern.toLowerCase()} who combines ${primary.strengthFocus.toLowerCase()} with ${supporting.length > 0 ? supporting.map(p => p.strengthFocus.toLowerCase()).slice(0,2).join(' and ') : 'comprehensive leadership capabilities'}.</p>
        </div>

        <div style="background: #1e293b; color: white; padding: 30px; border-radius: 8px; margin: 40px 0; text-align: center;">
            <h3 style="color: white; margin-top: 0;">Your leadership matters. Your ${primary.strengthFocus.toLowerCase()} elevates others.</h3>
            <p style="margin-bottom: 0;">Your challenge now is to help people experience your leadership strengths as investment in their success rather than judgment of their performance. You have the unique ability to drive excellence while building capability - a rare and powerful leadership gift.</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p><strong>This detailed analysis is based on the Inner Personas Assessment framework.</strong></p>
            <p>Your complex profile represents the intersection of ${primary.strengthFocus.toLowerCase()} with sophisticated interpersonal dynamics - a powerful combination that, when optimized, creates exceptional leadership impact.</p>
            <p>Report generated on ${new Date().toLocaleDateString()} | Inner Personas Assessment © 2025</p>
        </div>
    </div>
</body>
</html>`;
}

// Enhanced Tier 3 Report: Clinical Assessment
export function generateEnhancedTier3Report(analysis: EnhancedThreeTierAnalysis, participant: ParticipantData): string {
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
        .secondary-schema {
            border: 2px solid #f97316;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
            background: #fff7ed;
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
        .clinical-table .severity-high {
            background: #fef2f2;
            color: #dc2626;
            font-weight: bold;
        }
        .clinical-table .severity-moderate-high {
            background: #fff7ed;
            color: #ea580c;
            font-weight: bold;
        }
        .clinical-table .severity-moderate {
            background: #fefce8;
            color: #ca8a04;
            font-weight: bold;
        }
        .risk-section {
            background: #fef2f2;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #dc2626;
        }
        .recommendation-section {
            background: #f0f9ff;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 6px solid #0284c7;
        }
        .clinical-note {
            background: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #64748b;
            margin: 15px 0;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="clinical-logo">Clinical Leadership Schema Assessment Report</div>
            <h1>${participant.name}${participant.organization ? ` - ${participant.organization}` : ''}</h1>
        </div>

        <div class="clinical-warning">
            <h2 style="color: #dc2626; margin-top: 0;">⚠️ CLINICAL SUPERVISION REQUIRED</h2>
            <p><strong>IMPORTANT:</strong> This report contains clinical assessment information and requires supervision by a licensed mental health professional for proper interpretation and application. This assessment is for clinical and research purposes only.</p>
        </div>

        <div style="margin-bottom: 40px;">
            <h2>Clinical Assessment Overview</h2>
            <p><strong>Assessment Date:</strong> ${new Date(participant.assessmentDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Participant:</strong> ${participant.name}</p>
            ${participant.organization ? `<p><strong>Organization:</strong> ${participant.organization}</p>` : ''}
            <p><strong>Assessment Protocol:</strong> Leadership Schema Assessment (54-item)</p>
            <p><strong>Completion Status:</strong> 100% (54/54 items completed)</p>
        </div>

        <h2>Clinical Schema Profile</h2>
        <p><strong>Primary Schema Domain:</strong> ${primary.domain} (${primary.activationLevel}%)</p>
        <p><strong>Dominant Schema:</strong> ${primary.clinicalName} (${primary.activationLevel}% activation)</p>

        ${secondary.length > 0 ? `
        <p><strong>Secondary Schema Activations:</strong></p>
        <ul>
            ${secondary.map(schema => `<li>${schema.clinicalName} (${schema.domain}) - ${schema.activationLevel}%</li>`).join('')}
        </ul>
        ` : ''}

        <div class="schema-profile">
            <h3>Primary Schema Analysis: ${primary.clinicalName} (${primary.activationLevel}%)</h3>
            
            <div class="clinical-note">
                <h4>Clinical Definition:</h4>
                <p>${getPersonaDetails(primary.schemaName)?.clinicalDescription || `The ${primary.clinicalName} schema manifests in leadership contexts through specific behavioral and cognitive patterns that impact organizational effectiveness and interpersonal relationships.`}</p>
            </div>

            <h4>Clinical Manifestation in Leadership:</h4>
            ${getPersonaDetails(primary.schemaName) ? generateBehavioralAnalysis(primary as any, getPersonaDetails(primary.schemaName)) : `
            <p><strong>Behavioral Markers:</strong></p>
            <ul>
                <li>Consistent patterns related to ${primary.clinicalName.toLowerCase()}</li>
                <li>Leadership decisions influenced by schema activation</li>
                <li>Interpersonal responses shaped by underlying beliefs</li>
                <li>Organizational impact through schema-driven behaviors</li>
            </ul>`}
        </div>

        ${secondary.length > 0 ? `
        <h2>Secondary Schema Analysis</h2>
        ${secondary.map(schema => {
          const details = getPersonaDetails(schema.schemaName);
          return `
          <div class="secondary-schema">
              <h4>${schema.clinicalName} Schema (${schema.activationLevel}%)</h4>
              <p><strong>Domain:</strong> ${schema.domain}</p>
              
              <div class="clinical-note">
                  <p><strong>Clinical Presentation:</strong> ${details?.clinicalDescription || `Manifests through patterns related to ${schema.clinicalName.toLowerCase()} in leadership and organizational contexts.`}</p>
              </div>
              
              <p><strong>Integration with ${primary.clinicalName}:</strong> 
              ${details?.integration_patterns?.with_specific_personas?.[primary.schemaName] || 
                `This secondary activation interacts with the primary schema to create complex leadership patterns requiring integrated therapeutic approach.`}
              </p>
          </div>`;
        }).join('')}
        ` : ''}

        <div style="background: #1e293b; color: white; padding: 30px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: white; margin-top: 0;">Complex Schema Integration Pattern</h3>
            
            <h4 style="color: #fbbf24;">Clinical Formulation:</h4>
            <p>The participant presents with a <strong>${analysis.tier2.leadershipPattern} Configuration</strong> characterized by:</p>
            <ol>
                <li><strong>Primary ${primary.clinicalName} Drive:</strong> ${primary.severity} activation creating specific leadership patterns</li>
                ${secondary.slice(0, 3).map(schema => `<li><strong>${schema.clinicalName}-Mediated Response:</strong> Uses ${schema.clinicalName.toLowerCase()} patterns as ${schema.severity.toLowerCase()} coping mechanism</li>`).join('')}
            </ol>
            
            <h4 style="color: #fbbf24;">Schema Interaction Dynamics:</h4>
            <p>The high ${primary.clinicalName.toLowerCase()} appears to serve multiple schema-driven functions:</p>
            <ul>
                ${secondary.slice(0, 3).map(schema => `<li><strong>${schema.domain.split(' ')[0]} mechanism</strong> for ${schema.clinicalName.toLowerCase()} management</li>`).join('')}
                <li><strong>Emotional regulation</strong> for suppressed feelings and reactions</li>
                <li><strong>Control mechanism</strong> for anticipated organizational challenges</li>
            </ul>
        </div>

        <div class="risk-section">
            <h3>Clinical Risk Assessment</h3>
            
            <h4>High-Risk Areas:</h4>
            <ul>
                ${analysis.tier3.riskAssessment.highRisk.map(risk => `<li>${risk}</li>`).join('')}
            </ul>
            
            <h4>Protective Factors:</h4>
            <ul>
                ${analysis.tier3.riskAssessment.protectiveFactors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
        </div>

        <div class="recommendation-section">
            <h3>Clinical Recommendations</h3>
            
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

        <h3>Complete Clinical Schema Profile</h3>
        <table class="clinical-table">
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
                    <td style="font-weight: bold;">${primary.clinicalName}</td>
                    <td style="font-weight: bold; font-size: 16px;">${primary.activationLevel}%</td>
                    <td class="severity-${primary.severity.toLowerCase().replace(' ', '-')}">${primary.severity}</td>
                </tr>
                ${secondary.map(schema => `
                <tr>
                    <td>${schema.domain}</td>
                    <td>${schema.clinicalName}</td>
                    <td style="font-weight: bold;">${schema.activationLevel}%</td>
                    <td class="severity-${schema.severity.toLowerCase().replace(' ', '-')}">${schema.severity}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin: 30px 0; border: 2px solid #64748b;">
            <h3>Clinical Summary & Prognosis</h3>
            
            <h4>Diagnostic Formulation:</h4>
            <p><strong>Primary Pattern:</strong> ${analysis.tier2.leadershipPattern} with ${primary.clinicalName} Implementation</p>
            <p><strong>Secondary Patterns:</strong> ${secondary.slice(0, 2).map(s => s.clinicalName).join(', ')}</p>
            
            <h4>Treatment Prognosis:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <p><strong>Favorable Factors:</strong></p>
                    <ul>
                        <li>High motivation for performance and success</li>
                        <li>Professional context provides structure for intervention</li>
                        <li>Genuine investment in organizational outcomes</li>
                        <li>Clear behavioral patterns amenable to modification</li>
                    </ul>
                </div>
                <div>
                    <p><strong>Challenging Factors:</strong></p>
                    <ul>
                        <li>High schema activation levels across multiple domains</li>
                        <li>Potential resistance due to past success with current patterns</li>
                        <li>Complex integration of multiple schema activations</li>
                        <li>Workplace reinforcement of maladaptive patterns</li>
                    </ul>
                </div>
            </div>
            
            <h4>Recommended Treatment Modality:</h4>
            <p><strong>Schema-Focused Cognitive Behavioral Therapy with executive coaching integration:</strong></p>
            <ul>
                <li>Individual therapy focused on schema processing and modification</li>
                <li>Group work for interpersonal skill development</li>
                <li>Executive coaching for professional behavior integration</li>
                <li>Organizational consultation for systemic support</li>
            </ul>
        </div>

        <div style="background: #dc2626; color: white; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: white; margin-top: 0;">Clinical Supervision Requirements</h3>
            <p>Given the ${primary.severity.toLowerCase()} activation levels and potential for workplace impact, regular clinical supervision is recommended for:</p>
            <ul>
                <li>Risk assessment and management strategies</li>
                <li>Treatment planning and modification approaches</li>
                <li>Ethical considerations in workplace intervention</li>
                <li>Integration with organizational development needs</li>
            </ul>
        </div>

        <div style="margin-top: 50px; padding-top: 30px; border-top: 3px solid #dc2626; text-align: center; color: #64748b; font-size: 14px;">
            <p><strong>CONFIDENTIAL CLINICAL ASSESSMENT</strong></p>
            <p>This clinical assessment is based on the Schema-Focused Leadership Assessment protocol. This report is intended for clinical professionals and should be used only within appropriate therapeutic or clinical supervision contexts.</p>
            <p><strong>Clinical Disclaimer:</strong> This assessment is for clinical and research purposes only. It should not be used for employment decisions, performance evaluation, or other non-clinical purposes without appropriate clinical supervision and participant consent.</p>
            <p>Report generated on ${new Date().toLocaleDateString()} | Clinical Leadership Assessment © 2025</p>
        </div>
    </div>
</body>
</html>`;
}

// Generate complex leadership pattern analysis
export function generateComplexPatternAnalysis(primary: PersonaActivation, supporting: PersonaActivation[]): string {
  if (supporting.length === 0) {
    return `The Focused ${primary.publicName.replace('The ', '')} Leader`;
  }
  
  // Generate pattern based on combination
  if (supporting.length >= 2) {
    const pattern1 = primary.publicName.replace('The ', '');
    const pattern2 = supporting[0].publicName.replace('The ', '');
    const pattern3 = supporting[1].publicName.replace('The ', '');
    
    return `The ${pattern1} with ${pattern2} and ${pattern3} Influences`;
  }
  
  return `The ${primary.publicName.replace('The ', '')} with ${supporting[0].publicName.replace('The ', '')} Integration`;
}
