
// Enhanced Tier 2 Report Generation (Coaching Focus with Both Names)
// Uses public names + research names with detailed coaching insights

import { getPersonaForTier } from './enhanced-persona-mapping';

interface EnhancedReportOptions {
  participantName: string;
  participantEmail: string;
  participantTeam?: string;
  assessmentDate: string;
  assessmentId: string;
}

export function generateEnhancedTier2Report(analysis: any, options: EnhancedReportOptions): string {
  const primary = analysis.tier2.primaryPersona;
  const supporting = analysis.tier2.supportingPersonas;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Inner PersonaReport - ${options.participantName}</title>
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
            margin-right: 20px;
        }
        .persona-name {
            font-size: 24px;
            font-weight: bold;
            color: #2b6cb0;
        }
        .persona-subtitle {
            font-size: 16px;
            color: #4a5568;
            font-style: italic;
            margin-left: 5px;
        }
        .section {
            background: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4299e1;
        }
        .coaching-section {
            background: linear-gradient(135deg, #fef5e7 0%, #f0fff4 100%);
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }
        .development-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #fef3c7 100%);
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0284c7;
        }
        .supporting-personas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        .supporting-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
        }
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .highlight {
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="logo">Inner PersonaDevelopment Report</div>
            <h1>Comprehensive Inner PersonaAnalysis</h1>
            <p>Professional coaching-focused insights and development planning</p>
        </div>

        <div style="margin-bottom: 30px;">
            <h3>Assessment Overview</h3>
            <p><strong>Name:</strong> ${options.participantName}</p>
            <p><strong>Assessment Date:</strong> ${options.assessmentDate}</p>
            <p><strong>Report Type:</strong> Tier 2 - Coaching & Development Focus</p>
        </div>

        <div class="persona-card">
            <div class="persona-header">
                <div class="rank-badge">1</div>
                <div>
                    <div class="persona-name">${primary.name}</div>
                    <div class="persona-subtitle">Primary Inner PersonaPattern</div>
                </div>
            </div>
            
            <div class="coaching-section">
                <h4>🎯 Your Inner PersonaApproach</h4>
                <p>${analysis.tier2.detailedAnalysis}</p>
            </div>
            
            ${primary.strengthFocus ? `
            <div class="section">
                <h4>💪 Core Strength Focus</h4>
                <p class="highlight">${primary.strengthFocus}</p>
            </div>
            ` : ''}
            
            ${primary.developmentEdge ? `
            <div class="development-section">
                <h4>🌱 Development Edge</h4>
                <p>${primary.developmentEdge}</p>
            </div>
            ` : ''}
        </div>

        ${supporting && supporting.length > 0 ? `
        <h3 style="margin-top: 40px; margin-bottom: 20px;">Supporting Inner PersonaPatterns</h3>
        <div class="supporting-personas">
            ${supporting.map((persona: any, index: number) => `
            <div class="supporting-card">
                <h4 style="color: #2b6cb0; margin-bottom: 15px;">${persona.name}</h4>
                ${persona.strengthFocus ? `<p><strong>Strength Focus:</strong> ${persona.strengthFocus}</p>` : ''}
                ${persona.developmentEdge ? `<p><strong>Development:</strong> ${persona.developmentEdge}</p>` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h4>🚀 Development Recommendations</h4>
            <ul>
                ${analysis.tier2.developmentRecommendations.map((rec: any) => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        <div style="background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%); padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px solid #0284c7;">
            <h4>💡 Integration & Next Steps</h4>
            <p>Your Inner Personaprofile shows a clear primary pattern complemented by supporting styles. This combination provides you with flexibility and depth in your Inner Personaapproach.</p>
            <p><strong>Key Integration Opportunity:</strong> Practice moving fluidly between your primary ${primary.name} approach and your supporting patterns based on situational needs.</p>
        </div>

        <div class="footer">
            <p><strong>Inner PersonaDevelopment Report</strong></p>
            <p>This Tier 2 report provides coaching-focused insights for Inner Personadevelopment planning.</p>
            <p>For clinical-level analysis, consider requesting a Tier 3 report from your coach or consultant.</p>
            <p>Report generated on ${new Date().toLocaleDateString()} | Inner Personas Assessment © 2025</p>
        </div>
    </div>
</body>
</html>`;
}
