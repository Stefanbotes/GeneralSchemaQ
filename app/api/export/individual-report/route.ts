
// API route to export individual assessment report
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bioData, topPersonas, responses, completedAt } = await request.json();

    // Generate HTML report
    const htmlReport = generateHTMLReport(bioData, topPersonas, responses, completedAt);
    
    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="Leadership_Assessment_Report_${bioData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html"`
      }
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function generateHTMLReport(bioData: any, topPersonas: any[], responses: any, completedAt: string) {
  const reportDate = new Date(completedAt).toLocaleDateString();
  const totalQuestions = Object.keys(responses).length;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leadership Personas Assessment Report - ${bioData.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
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
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .participant-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .persona-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
            border-left: 5px solid #4f46e5;
        }
        .persona-rank {
            background: #4f46e5;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
        }
        .persona-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .persona-name {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
        }
        .persona-focus {
            color: #4f46e5;
            font-weight: 600;
            margin-top: 5px;
        }
        .score-badge {
            margin-left: auto;
            background: #4f46e5;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        .description {
            margin-bottom: 15px;
        }
        .development-edge {
            background: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
        }
        .stat-label {
            color: #64748b;
            font-size: 14px;
        }
        @media print {
            body { background: white !important; }
            .report-container { box-shadow: none !important; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="logo">Leadership Personas Assessment</div>
            <h1>Personal Leadership Report</h1>
            <p>Behavioral Pattern Analysis & Growth Insights</p>
        </div>

        <div class="participant-info">
            <h2>Participant Information</h2>
            <p><strong>Name:</strong> ${bioData.name}</p>
            <p><strong>Email:</strong> ${bioData.email}</p>
            <p><strong>Team/Organization:</strong> ${bioData.team}</p>
            <p><strong>Assessment Date:</strong> ${reportDate}</p>
            <p><strong>Unique Code:</strong> ${bioData.uniqueCode}</p>
        </div>

        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">${totalQuestions}</div>
                <div class="stat-label">Questions Answered</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${topPersonas.length}</div>
                <div class="stat-label">Top Personas Identified</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round(topPersonas[0]?.percentage || 0)}%</div>
                <div class="stat-label">Strongest Pattern</div>
            </div>
        </div>

        <h2>Your Leadership Personas</h2>
        <p>Based on your responses to ${totalQuestions} behavioral reflection statements, here are your strongest leadership patterns:</p>

        ${topPersonas.map((persona, index) => {
          // Import the persona mapping here or pass it through
          const personaMap = getPersonaMapping();
          const publicPersona = (personaMap as any)[persona.persona] || {
            publicName: persona.persona,
            strengthFocus: "Leadership Qualities",
            coachingDescription: "You demonstrate distinctive leadership qualities.",
            developmentEdge: "Continue building on your natural strengths."
          };
          
          return `
            <div class="persona-card">
                <div class="persona-header">
                    <div class="persona-rank">#${index + 1}</div>
                    <div>
                        <div class="persona-name">${publicPersona.publicName}</div>
                        <div class="persona-focus">${publicPersona.strengthFocus}</div>
                    </div>
                    <div class="score-badge">${persona.percentage}%</div>
                </div>
                <div class="description">
                    <strong>Your Strength:</strong> ${publicPersona.coachingDescription}
                </div>
                <div class="development-edge">
                    <strong>Development Edge:</strong> ${publicPersona.developmentEdge}
                </div>
            </div>
          `;
        }).join('')}

        <div class="footer">
            <p>This report is confidential and intended for personal development purposes.</p>
            <p>Generated on ${new Date().toLocaleDateString()} | Leadership Personas Assessment &copy; ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>`;
}

// Helper function for persona mapping (complete version)
function getPersonaMapping() {
  return {
    // DISCONNECTION & REJECTION PATTERNS
    "The Clinger": {
      publicName: "The Relationship Champion",
      strengthFocus: "Building Deep Connections",
      coachingDescription: "You have a remarkable gift for creating lasting relationships and ensuring team cohesion. Your natural inclination to stay connected with your team members helps build trust and loyalty that many leaders struggle to achieve.",
      developmentEdge: "Consider balancing your relationship focus with empowering others to develop independence and confidence in their own abilities."
    },
    "The Invisible Operator": {
      publicName: "The Thoughtful Strategist", 
      strengthFocus: "Careful Planning & Analysis",
      coachingDescription: "Your preference for working behind the scenes allows you to develop well-thought-out strategies and solutions. You bring valuable perspective and careful consideration that helps teams avoid costly mistakes.",
      developmentEdge: "Your insights have tremendous value - consider sharing your expertise more visibly to amplify your positive impact."
    },
    "The Withholder": {
      publicName: "The Focus Leader",
      strengthFocus: "Results-Driven Clarity", 
      coachingDescription: "You excel at keeping teams focused on objectives without getting derailed by emotional distractions. Your clarity and task orientation help organizations maintain productivity and achieve their goals efficiently.",
      developmentEdge: "Incorporating emotional awareness into your leadership toolkit can enhance team engagement and long-term performance."
    },
    "The Guarded Strategist": {
      publicName: "The Protective Planner",
      strengthFocus: "Risk Management & Strategic Thinking",
      coachingDescription: "Your careful approach to trust and decision-making protects your organization from potential risks and pitfalls. You bring valuable strategic thinking that helps teams navigate complex challenges safely.",
      developmentEdge: "Building on your natural caution, explore opportunities to gradually expand trust and delegation to accelerate team development."
    },
    "The Outsider": {
      publicName: "The Independent Innovator",
      strengthFocus: "Original Thinking & Self-Reliance",
      coachingDescription: "Your ability to think independently and work autonomously brings fresh perspectives and innovative solutions. You're comfortable challenging conventional wisdom and exploring new approaches that others might miss.",
      developmentEdge: "Your unique insights could have even greater impact when paired with collaborative approaches to implementation."
    },

    // IMPAIRED AUTONOMY & PERFORMANCE
    "The Self-Doubter": {
      publicName: "The Careful Evaluator", 
      strengthFocus: "Thorough Assessment & Quality Assurance",
      coachingDescription: "Your careful consideration of decisions and attention to potential challenges helps organizations avoid costly mistakes. You bring valuable quality control and risk assessment to leadership decisions.",
      developmentEdge: "Trust in your proven capabilities and consider moving forward with confidence when you've done thorough preparation."
    },
    "The Reluctant Rely-er": {
      publicName: "The Self-Sufficient Achiever",
      strengthFocus: "Personal Accountability & Reliability", 
      coachingDescription: "Your commitment to personal accountability and self-reliance makes you incredibly dependable. Teams know they can count on you to deliver on your commitments and handle responsibilities effectively.",
      developmentEdge: "Your reliability is an asset - consider how strategic delegation and team development can multiply your impact."
    },
    "The Safety Strategist": {
      publicName: "The Stability Creator",
      strengthFocus: "Building Secure Foundations",
      coachingDescription: "You excel at creating stable, secure environments where teams can thrive. Your attention to potential risks and systematic approach to planning helps organizations build sustainable success.",
      developmentEdge: "Balance your valuable risk awareness with calculated opportunities for growth and innovation."
    },
    "The Over-Adapter": {
      publicName: "The Harmony Builder", 
      strengthFocus: "Flexibility & Team Cohesion",
      coachingDescription: "Your ability to adapt and maintain harmony helps teams work together effectively. You're skilled at reading group dynamics and adjusting your approach to keep everyone aligned and productive.",
      developmentEdge: "Your adaptability is valuable - consider sharing more of your own perspectives to enrich team discussions and decisions."
    },

    // IMPAIRED LIMITS
    "The Power Broker": {
      publicName: "The Strategic Influencer",
      strengthFocus: "Organizational Navigation & Results",
      coachingDescription: "You excel at understanding organizational dynamics and driving results through strategic influence. Your ability to navigate complex systems and make things happen is a valuable leadership asset.",
      developmentEdge: "Your influence capabilities are impressive - consider how collaborative leadership approaches can amplify your already strong results."
    },
    "The Unfiltered Reactor": {
      publicName: "The Authentic Communicator",
      strengthFocus: "Direct Communication & Genuine Expression", 
      coachingDescription: "Your authentic, direct communication style brings clarity and transparency to leadership interactions. Teams appreciate knowing exactly where they stand and value your honest, straightforward approach.",
      developmentEdge: "Your authenticity is refreshing - consider how strategic timing and context can make your direct communication even more effective and well-received."
    },

    // OTHER-DIRECTEDNESS
    "The Suppressed Voice": {
      publicName: "The Diplomatic Collaborator",
      strengthFocus: "Collaborative Decision-Making",
      coachingDescription: "You bring valuable diplomatic skills and collaborative approach to leadership. Your ability to work with diverse perspectives and find common ground helps create inclusive, effective teams.",
      developmentEdge: "Your collaborative nature is an asset - consider how your unique voice and expertise can contribute even more to team success."
    },
    "The Overgiver": {
      publicName: "The Service Leader",
      strengthFocus: "Team Support & Generous Service",
      coachingDescription: "Your generous spirit and commitment to serving others creates tremendous loyalty and motivation within your teams. You naturally put the team's needs first and work tirelessly to ensure everyone succeeds.",
      developmentEdge: "Your generosity is a strength - consider how sustainable self-care can help you serve others even more effectively long-term."
    },
    "The Image Manager": {
      publicName: "The Relationship Cultivator",
      strengthFocus: "Stakeholder Engagement & Communication",
      coachingDescription: "You have exceptional skills in building positive relationships and managing stakeholder perceptions. Your awareness of how others view leadership decisions helps organizations maintain strong external relationships.",
      developmentEdge: "Your relationship skills are strong - consider balancing external focus with authentic self-expression and internal team development."
    },

    // OVERVIGILANCE & INHIBITION
    "The Cautious Realist": {
      publicName: "The Balanced Assessor",
      strengthFocus: "Practical Decision-Making",
      coachingDescription: "Your balanced approach to optimism and realism helps teams make well-grounded decisions. You bring valuable perspective that helps organizations avoid both naive optimism and unnecessary pessimism.",
      developmentEdge: "Your balanced perspective is valuable - consider how strategic optimism can complement your practical assessment skills."
    },
    "The Stoic Mask": {
      publicName: "The Steady Anchor",
      strengthFocus: "Emotional Stability & Consistency",
      coachingDescription: "You provide valuable emotional stability and consistency that teams can depend on. Your composed approach helps others stay calm and focused during challenging or uncertain times.",
      developmentEdge: "Your stability is an asset - consider how sharing appropriate emotions can deepen your connection and influence with team members."
    },
    "The Perfectionist Driver": {
      publicName: "The Excellence Champion",
      strengthFocus: "Quality Standards & Achievement Drive",
      coachingDescription: "Your commitment to excellence and high standards elevates the quality of everything your team produces. You naturally inspire others to achieve their best work and deliver outstanding results.",
      developmentEdge: "Your pursuit of excellence is admirable - consider how strategic flexibility can help achieve great results while maintaining team energy and creativity."
    },
    "The Harsh Enforcer": {
      publicName: "The Standards Leader",
      strengthFocus: "Accountability & Clear Expectations",
      coachingDescription: "You excel at creating clear expectations and ensuring accountability across your teams. Your commitment to standards and follow-through helps organizations maintain consistency and achieve their commitments.",
      developmentEdge: "Your accountability focus drives results - consider how positive reinforcement alongside clear standards can enhance both performance and team engagement."
    },

    // Additional Personas
    "The Rigid Controller": {
      publicName: "The Systematic Leader",
      strengthFocus: "Structure & Process Excellence",
      coachingDescription: "You bring valuable structure and systematic thinking to your leadership approach. Your commitment to proven methods helps teams maintain quality and consistency in their work.",
      developmentEdge: "Your systematic approach is valuable - consider how selective flexibility can help you adapt to changing circumstances while maintaining your high standards."
    },
    "The Recognition Seeker": {
      publicName: "The Achievement Catalyst",
      strengthFocus: "Performance Drive & Excellence Motivation",
      coachingDescription: "Your drive for achievement and recognition helps elevate team performance and results. You naturally inspire others to strive for excellence and celebrate accomplishments.",
      developmentEdge: "Your achievement focus drives results - consider how internal motivation and team recognition can complement your natural drive for excellence."
    },
    "The Comfort Seeker": {
      publicName: "The Balance Advocate",
      strengthFocus: "Work-Life Integration & Sustainable Performance",
      coachingDescription: "You bring valuable perspective on sustainable performance and work-life balance. Your awareness of comfort and well-being helps teams maintain long-term productivity and engagement.",
      developmentEdge: "Your balance perspective is valuable - consider how strategic stretching and growth challenges can complement your sustainable approach to performance."
    }
  };
}
