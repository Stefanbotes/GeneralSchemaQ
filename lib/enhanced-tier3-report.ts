
// Enhanced Tier 3 Clinical Report Generation (Research Names with Clinical Insights)
// Uses research names with full clinical context and schema-based analysis

import { getPersonaForTier, SCHEMA_CATEGORIES } from './enhanced-persona-mapping';
import { CANONICAL_SCHEMA_MAP, getCanonicalSchemaInfo, getAnalysisVersion } from './canonical-schema-mapping';

interface EnhancedClinicalReportOptions {
  participantName: string;
  participantEmail: string;
  participantTeam?: string;
  assessmentDate: string;
  assessmentId: string;
}

export function generateEnhancedTier3Report(analysis: any, options: EnhancedClinicalReportOptions): string {
  // ✅ CLINICAL: Use same canonical scores as Leadership report
  const canonicalTop5 = analysis.tier3.canonicalTop5 || [];
  
  // 🔍 DEBUGGING: Log canonical scores used for clinical report
  console.log('🏥 Clinical Report Canonical Top5:', canonicalTop5);

  // ✅ DERIVE LABELS FROM CANONICAL MAPPING (NOT HARDCODED TEXT)
  const primaryPersonaName = canonicalTop5[0]?.schemaId || 'Unknown';
  const primaryCanonical = getCanonicalSchemaInfo(primaryPersonaName);
  const supportingCanonical = canonicalTop5.slice(1, 3).map((item: any) => ({
    ...item,
    canonical: getCanonicalSchemaInfo(item.schemaId)
  })).filter((item: any) => item.canonical);

  // Use canonical domain, not derived text
  const schemaCategory = primaryCanonical?.domain || 'Unknown Domain';
  const categoryInfo = SCHEMA_CATEGORIES[schemaCategory as keyof typeof SCHEMA_CATEGORIES];
  
  // Legacy persona objects for backward compatibility
  const primary = analysis.tier3.primaryPersona;
  const supporting = analysis.tier3.supportingPersonas;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clinical Leadership Assessment - ${options.participantName}</title>
    <style>
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.8;
            color: #2d3748;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f8fafc;
        }
        .report-container {
            background: white;
            padding: 60px;
            border-radius: 8px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 4px solid #dc2626;
            padding-bottom: 30px;
            margin-bottom: 50px;
        }
        .logo {
            font-size: 36px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 15px;
        }
        .clinical-section {
            background: #fef2f2;
            padding: 30px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 5px solid #dc2626;
        }
        .schema-section {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 30px;
            border-radius: 8px;
            margin: 25px 0;
            border: 2px solid #6b7280;
        }
        .therapeutic-section {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            padding: 30px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 5px solid #059669;
        }
        .persona-clinical {
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 35px;
            margin: 30px 0;
            background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
        }
        .research-name {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
        }
        .clinical-subtitle {
            font-size: 18px;
            color: #6b7280;
            font-style: italic;
            margin-bottom: 20px;
        }
        .schema-category {
            background: #374151;
            color: white;
            padding: 15px 25px;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .supporting-clinical {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin: 30px 0;
        }
        .supporting-item {
            background: #f9fafb;
            padding: 25px;
            border-radius: 8px;
            border-left: 3px solid #6b7280;
        }
        .clinical-insights {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 30px;
            border-radius: 8px;
            margin: 25px 0;
            border: 1px solid #f59e0b;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .confidential {
            background: #dc2626;
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        li {
            margin-bottom: 10px;
        }
        .highlight {
            background: #fef3c7;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 600;
        }
        .clinical-note {
            font-style: italic;
            color: #4b5563;
            background: #f3f4f6;
            padding: 15px;
            border-left: 3px solid #9ca3af;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="confidential">
            CONFIDENTIAL CLINICAL ASSESSMENT - PROFESSIONAL USE ONLY
        </div>
        
        <div class="header">
            <div class="logo">Clinical Leadership Assessment</div>
            <h1>Schema-Based Leadership Analysis</h1>
            <p>Comprehensive clinical evaluation using schema therapy principles</p>
        </div>

        <div style="margin-bottom: 40px;">
            <h3>Clinical Assessment Overview</h3>
            <p><strong>Client:</strong> ${options.participantName}</p>
            <p><strong>Assessment Date:</strong> ${options.assessmentDate}</p>
            <p><strong>Assessment ID:</strong> ${options.assessmentId}</p>
            <p><strong>Report Type:</strong> Tier 3 - Clinical Analysis</p>
            <p><strong>Framework:</strong> Schema Therapy Leadership Assessment (18 Personas)</p>
            <p><strong>Scoring Method:</strong> Canonical 3-items-per-persona framework</p>
            <p><strong>Scale:</strong> Activation indices (0-100) derived from Likert responses. Values >80 indicate strong schema activation.</p>
        </div>

        ${canonicalTop5.length > 0 ? `
        <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #6b7280;">
            <h4>🔍 Clinical Scoring Verification (Canonical Top 5)</h4>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
                <em>This clinical report uses the same canonical scores as Leadership reports for consistency.</em>
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #e5e7eb;">
                        <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Rank</th>
                        <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Schema Pattern</th>
                        <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Activation Index</th>
                    </tr>
                </thead>
                <tbody>
                    ${canonicalTop5.map((item: any) => `
                    <tr style="${item.rank === 1 ? 'background: #fef3c7; font-weight: bold;' : ''}">
                        <td style="padding: 10px; border: 1px solid #d1d5db;">#${item.rank}</td>
                        <td style="padding: 10px; border: 1px solid #d1d5db;">${item.schemaId}</td>
                        <td style="padding: 10px; border: 1px solid #d1d5db;">${item.score}/100</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="persona-clinical">
            <div class="research-name">${primaryCanonical?.persona || primary.name}</div>
            <div class="clinical-subtitle">Primary Schema Pattern</div>
            
            <div class="schema-category">${schemaCategory}</div>
            
            <div class="clinical-insights">
                <h4>🔬 Clinical Insights</h4>
                <p>Clinical assessment reveals <strong>${primaryCanonical?.clinicalName || 'Unknown Schema'}</strong> pattern within the <strong>${schemaCategory}</strong> domain (${canonicalTop5[0]?.score || 0}/100 activation index). This indicates specific neurobiological and behavioral patterns that manifest in leadership contexts.</p>
                
                <div style="font-size: 13px; color: #6b7280; background: #f9fafb; padding: 10px; border-radius: 4px; margin-top: 10px;">
                    <strong>Activation Index:</strong> Normalized score (0-100) based on 1-5 Likert scale responses. Values >80 indicate strong pattern activation (average response >4.0).
                </div>
            </div>
            
            ${categoryInfo ? `
            <div class="clinical-note">
                <strong>Schema Domain Context:</strong> ${categoryInfo.description}
            </div>
            ` : ''}
            
            ${primary.strengthFocus ? `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 15px 0;">
                <h4>Clinical Strength Identification</h4>
                <p class="highlight">${primary.strengthFocus}</p>
            </div>
            ` : ''}
            
            ${primary.category ? `
            <div style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 15px 0;">
                <h4>Schema Category</h4>
                <p><strong>${primary.category}</strong></p>
                ${primary.developmentEdge ? `<p><em>Clinical Development Focus:</em> ${primary.developmentEdge}</p>` : ''}
            </div>
            ` : ''}
        </div>

        ${supportingCanonical && supportingCanonical.length > 0 ? `
        <h3 style="margin-top: 50px; margin-bottom: 30px; color: #374151;">Supporting Schema Patterns</h3>
        <div class="supporting-clinical">
            ${supportingCanonical.map((item: any) => `
            <div class="supporting-item">
                <h4 style="color: #dc2626; margin-bottom: 15px;">${item.canonical.persona}</h4>
                <p><strong>Schema Category:</strong> ${item.canonical.domain}</p>
                <p><strong>Clinical Name:</strong> ${item.canonical.clinicalName}</p>
                <p><strong>Activation Index:</strong> ${item.score}/100 (Rank #${item.rank})</p>
            </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="therapeutic-section">
            <h4>🎯 Therapeutic Recommendations</h4>
            <ul>
                ${analysis.tier3.therapeuticRecommendations.map((rec: any) => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        <div class="schema-section">
            <h4>📋 Schema-Based Clinical Formulation</h4>
            <p>This assessment reveals <strong>${primaryCanonical?.persona || primary.name}</strong> (<em>${primaryCanonical?.clinicalName}</em>) as the dominant leadership schema pattern within the <strong>${schemaCategory}</strong> domain.</p>
            
            <div class="clinical-note">
                <strong>Clinical Interpretation:</strong> The identified pattern suggests specific neurobiological activation patterns and cognitive-behavioral responses consistent with schema therapy frameworks. This profile indicates both adaptive strengths and areas requiring therapeutic intervention.
            </div>
            
            <h5>Recommended Clinical Interventions:</h5>
            <ul>
                <li><strong>Cognitive Restructuring:</strong> Address underlying schema-driven beliefs about leadership and authority</li>
                <li><strong>Behavioral Experiments:</strong> Test assumptions about leadership effectiveness and team responses</li>
                <li><strong>Schema Therapy Techniques:</strong> Work with identified patterns using appropriate therapeutic modalities</li>
                <li><strong>Mindfulness-Based Leadership:</strong> Develop present-moment awareness in leadership contexts</li>
            </ul>
        </div>

        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 35px; border-radius: 8px; margin: 40px 0; border: 2px solid #6b7280;">
            <h4>🧠 Neurobiological Considerations</h4>
            <p>The <strong>${primaryCanonical?.persona || primary.name}</strong> pattern is associated with specific neurobiological activation patterns that influence decision-making, stress response, and interpersonal dynamics in leadership contexts.</p>
            
            <p><strong>Treatment Planning:</strong> Consider the interplay between identified schema patterns and neurobiological factors when developing intervention strategies. The presence of supporting patterns (${supportingCanonical?.map((p: any) => p.canonical.persona).join(', ') || 'none identified'}) suggests cognitive flexibility that can be leveraged in therapeutic work.</p>
        </div>

        <div class="footer">
            <p><strong>CONFIDENTIAL CLINICAL REPORT</strong></p>
            <p>This Tier 3 clinical assessment is intended for qualified mental health professionals, executive coaches with clinical training, or organizational consultants working within appropriate scope of practice.</p>
            <p><strong>Disclaimer:</strong> This assessment is for professional development purposes and should not be used as a substitute for clinical diagnosis or treatment planning without proper clinical supervision.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #4b5563;">
                <p><strong>🔍 SOURCE LINEAGE (Top-5):</strong></p>
                <p>${canonicalTop5.map((item: any) => `[${item.schemaId}, ${item.score}/100, rank-${item.rank}]`).join(', ')}</p>
                <p><strong>Analysis Version:</strong> ${getAnalysisVersion()}</p>
            </div>
            
            <p>Clinical Assessment Report generated on ${new Date().toLocaleDateString()} | Schema-Based Leadership Assessment Framework © 2025</p>
        </div>
    </div>
</body>
</html>`;
}
