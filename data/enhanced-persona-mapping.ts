

// Enhanced Persona Mapping System
// Complete clinical-to-public mapping with detailed descriptions

export interface PersonaDetails {
  publicName: string;
  clinicalName: string;
  domain: string;
  strengthFocus: string;
  clinicalDescription: string;
  publicDescription: string;
  developmentEdge: string;
  questionIds: string[];
  behaviors: {
    behavioral_markers: string[];
    cognitive_patterns: string[];
    emotional_regulation: string[];
  };
  integration_patterns: {
    with_high_scores: string[];
    with_specific_personas: Record<string, string>;
  };
}

export const ENHANCED_PERSONA_MAPPING: Record<string, PersonaDetails> = {
  // DISCONNECTION & REJECTION DOMAIN
  "The Clinger": {
    publicName: "The Relationship Champion",
    clinicalName: "Abandonment Schema",
    domain: "Disconnection & Rejection",
    strengthFocus: "Connection & Loyalty",
    clinicalDescription: "Excessive dependency, fear of abandonment, clinging behavior in professional relationships",
    publicDescription: "You excel at building strong, loyal relationships and creating deep connections with team members. Your investment in relationships drives collaboration and trust.",
    developmentEdge: "Your relationship focus builds trust - consider how maintaining healthy boundaries can strengthen both your Inner Personaeffectiveness and team autonomy.",
    questionIds: ['1.1.1', '1.1.2', '1.1.3'],
    behaviors: {
      behavioral_markers: [
        "Forms strong attachments to team members and organizational goals",
        "Worries when people seem disconnected or not fully committed",
        "Checks in frequently to ensure alignment and connection",
        "Takes it personally when people don't meet standards"
      ],
      cognitive_patterns: [
        "Interprets professional boundaries as potential rejection",
        "Believes constant connection prevents relationship deterioration",
        "Attributes distance to personal inadequacy",
        "Overvalues relationship maintenance activities"
      ],
      emotional_regulation: [
        "Anxiety when sensing interpersonal distance",
        "Relief when receiving reassurance of commitment",
        "Hurt when others prioritize independence",
        "Urgency to repair perceived relationship threats"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Creates intense, emotionally demanding Inner Personarelationships",
        "May struggle with appropriate professional boundaries",
        "Uses control and demands as means of preventing abandonment"
      ],
      with_specific_personas: {
        "The Punitive Controller": "Punishment often comes from a place of caring - you're hard on people because you're invested in their success",
        "The Overgiver": "Creates exhausting pattern of over-investment followed by disappointment and control"
      }
    }
  },

  "The Invisible Operator": {
    publicName: "The Thoughtful Strategist",
    clinicalName: "Defectiveness/Shame Schema",
    domain: "Disconnection & Rejection",
    strengthFocus: "Careful Planning & Analysis", 
    clinicalDescription: "Social withdrawal, avoidance of visibility, hiding behavior due to shame",
    publicDescription: "You bring careful analysis and strategic thinking to Inner Personachallenges. Your thoughtful approach helps teams avoid hasty decisions and consider important details.",
    developmentEdge: "Your analytical depth is valuable - consider how sharing your insights more visibly can multiply your impact and help others benefit from your strategic thinking.",
    questionIds: ['1.2.1', '1.2.2', '1.2.3'],
    behaviors: {
      behavioral_markers: [
        "Prefers working behind the scenes rather than in spotlight",
        "Provides valuable input but may not advocate for recognition",
        "Avoids situations requiring high visibility or exposure",
        "Contributes significantly but may not receive appropriate credit"
      ],
      cognitive_patterns: [
        "Believes others are more competent or deserving",
        "Anticipates judgment or criticism for performance",
        "Minimizes own contributions and expertise",
        "Focuses on potential flaws rather than strengths"
      ],
      emotional_regulation: [
        "Anxiety in high-visibility situations",
        "Relief when working independently or in background",
        "Shame when receiving attention or recognition",
        "Calm when contributing without exposure"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Creates pattern of underutilized Inner Personapotential",
        "May avoid opportunities that require visibility",
        "Valuable insights may remain hidden from organization"
      ],
      with_specific_personas: {
        "The Perfectionist Driver": "Perfectionism combined with hiding creates private high standards",
        "The Self-Doubter": "Amplifies self-doubt and reduces willingness to take visible Inner Personaroles"
      }
    }
  },

  "The Withholder": {
    publicName: "The Focus Leader",
    clinicalName: "Emotional Inhibition Schema", 
    domain: "Impaired Limits",
    strengthFocus: "Task Focus & Clarity",
    clinicalDescription: "Emotional suppression, withholding of feelings and information, focus on tasks over relationships",
    publicDescription: "You maintain exceptional focus on objectives and help teams stay on track. Your ability to compartmentalize distractions enables clear decision-making and goal achievement.",
    developmentEdge: "Your focus drives results - consider how incorporating team emotions and perspectives as valuable data can enhance both performance and engagement.",
    questionIds: ['1.3.1', '1.3.2', '1.3.3'],
    behaviors: {
      behavioral_markers: [
        "Maintains strict separation between personal and professional domains",
        "Redirects emotional conversations back to task focus",
        "Provides minimal emotional expression or support",
        "Prioritizes efficiency and results over relationship maintenance"
      ],
      cognitive_patterns: [
        "Believes emotions are distractions from important work",
        "Views personal sharing as unprofessional or inefficient",
        "Focuses on measurable outcomes rather than process experience",
        "Minimizes importance of emotional connection for performance"
      ],
      emotional_regulation: [
        "Suppresses emotional responses to maintain professional facade",
        "May experience emotional buildup without appropriate outlets",
        "Discomfort when others express emotions in work context",
        "Relief when interactions remain task-focused"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Creates efficient but potentially cold work environments",
        "May miss important team emotional data",
        "Teams may feel disconnected despite high performance"
      ],
      with_specific_personas: {
        "The Punitive Controller": "Emotional withholding makes punishment feel colder and more rejecting",
        "The Perfectionist Driver": "Creates relentless focus on perfect outcomes without emotional support"
      }
    }
  },

  "The Guarded Strategist": {
    publicName: "The Protective Planner", 
    clinicalName: "Mistrust/Abuse Schema",
    domain: "Disconnection & Rejection",
    strengthFocus: "Risk Management & Preparation",
    clinicalDescription: "Hypervigilance, mistrust of others' motives, defensive planning and protection strategies",
    publicDescription: "You excel at risk assessment and protective planning that keeps teams and organizations safe from potential challenges. Your vigilance helps prevent problems before they occur.",
    developmentEdge: "Your protective instincts serve teams well - consider how building trust incrementally can unlock greater collaboration while maintaining appropriate caution.",
    questionIds: ['1.4.1', '1.4.2', '1.4.3'],
    behaviors: {
      behavioral_markers: [
        "Extensive research and background checking before trusting others",
        "Multiple backup plans and contingency strategies",
        "Careful observation of others' motives and consistency",
        "Gradual revelation of information and resources"
      ],
      cognitive_patterns: [
        "Assumes others may have hidden agendas or competing interests",
        "Hypervigilant for signs of betrayal or opportunism",
        "Believes safety requires constant vigilance and preparation",
        "Attributes negative outcomes to others' malicious intent"
      ],
      emotional_regulation: [
        "Chronic low-level anxiety about potential threats",
        "Relief when protective measures prove effective",
        "Anger when trust is violated or exploitation is suspected",
        "Tension when required to trust without verification"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Creates thorough but possibly paralyzing risk management",
        "May limit team creativity and innovation through excessive caution",
        "Valuable protective instincts may be perceived as paranoia"
      ],
      with_specific_personas: {
        "The Perfectionist Driver": "Combines high standards with protective vigilance creating intense control",
        "The Pessimistic Controller": "Double-layer of pessimism and mistrust creates very conservative leadership"
      }
    }
  },

  "The Outsider": {
    publicName: "The Independent Innovator",
    clinicalName: "Social Isolation Schema",
    domain: "Disconnection & Rejection", 
    strengthFocus: "Autonomous Thinking & Innovation",
    clinicalDescription: "Social alienation, feeling different or excluded, preference for independent rather than collaborative work",
    publicDescription: "You bring unique perspectives and independent thinking that drive innovation. Your ability to see things differently helps teams break through conventional approaches.",
    developmentEdge: "Your independent perspective is refreshing - consider how connecting your innovative ideas with team collaboration can amplify your impact and implementation success.",
    questionIds: ['1.5.1', '1.5.2', '1.5.3'],
    behaviors: {
      behavioral_markers: [
        "Works independently and generates original solutions",
        "May seem disconnected from team social dynamics",
        "Brings fresh perspectives that others haven't considered",
        "Comfortable making decisions without consensus"
      ],
      cognitive_patterns: [
        "Believes they think differently from others",
        "Assumes others won't understand their perspective",
        "Values independence over collaboration",
        "Sees conventional approaches as limiting"
      ],
      emotional_regulation: [
        "Comfort with solitude and independent work",
        "May feel misunderstood in group settings",
        "Pride in unique capabilities and perspectives",
        "Frustration when forced into conventional approaches"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Innovation potential may be limited by lack of collaborative implementation",
        "Teams may benefit from insights but feel disconnected from process",
        "Original thinking may not be effectively translated to organizational context"
      ],
      with_specific_personas: {
        "The Perfectionist Driver": "Independent perfectionism creates very high personal standards with little external input",
        "The Power Broker": "Uses independence as a form of power and influence strategy"
      }
    }
  },

  // IMPAIRED AUTONOMY & PERFORMANCE DOMAIN
  "The Self-Doubter": {
    publicName: "The Careful Evaluator",
    clinicalName: "Dependence/Incompetence Schema", 
    domain: "Impaired Autonomy & Performance",
    strengthFocus: "Thorough Assessment & Consideration",
    clinicalDescription: "Incompetence beliefs, excessive self-doubt, performance anxiety, difficulty making decisions independently",
    publicDescription: "You bring thorough evaluation and careful consideration to decisions. Your attention to multiple perspectives and potential outcomes helps teams make well-informed choices.",
    developmentEdge: "Your careful evaluation prevents mistakes - consider how trusting your expertise and communicating your insights with confidence can enhance your Inner Personainfluence.",
    questionIds: ['2.1.1', '2.1.2', '2.1.3'],
    behaviors: {
      behavioral_markers: [
        "Seeks extensive input before making decisions",
        "Double-checks work and decisions multiple times",
        "Defers to others' expertise even in areas of personal competence",
        "Extensive research and preparation before taking action"
      ],
      cognitive_patterns: [
        "Believes others are more qualified to make important decisions",
        "Catastrophizes potential negative outcomes of decisions",
        "Minimizes personal expertise and experience",
        "Overweights risks and potential problems"
      ],
      emotional_regulation: [
        "Anxiety when required to make independent decisions",
        "Relief when others take responsibility for outcomes",
        "Self-criticism when decisions don't work perfectly",
        "Comfort when working under clear direction"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Valuable caution may be undermined by excessive self-doubt",
        "Teams may lose confidence in Inner Personadecisiveness",
        "Important insights may be discounted due to delivery uncertainty"
      ],
      with_specific_personas: {
        "The Perfectionist Driver": "Creates paralysis - high standards combined with self-doubt prevents action",
        "The Invisible Operator": "Double-pattern of hiding and self-doubt severely limits Inner Personavisibility"
      }
    }
  },

  "The Reluctant Rely-er": {
    publicName: "The Self-Sufficient Achiever",
    clinicalName: "Vulnerability to Harm Schema",
    domain: "Impaired Autonomy & Performance",
    strengthFocus: "Independence & Self-Reliance",
    clinicalDescription: "Dependence fears, excessive self-reliance, difficulty accepting help or delegating appropriately",
    publicDescription: "You demonstrate exceptional self-reliance and capability that inspires confidence in your ability to deliver results. Your independence enables you to take ownership and drive initiatives forward.",
    developmentEdge: "Your self-sufficiency is impressive - consider how strategic collaboration and delegation can multiply your impact while maintaining your strong personal accountability.",
    questionIds: ['2.2.1', '2.2.2', '2.2.3'],
    behaviors: {
      behavioral_markers: [
        "Takes on excessive personal responsibility for outcomes",
        "Reluctant to delegate important tasks or decisions",
        "Works long hours to avoid burdening others",
        "Minimizes requests for support or assistance"
      ],
      cognitive_patterns: [
        "Believes relying on others creates vulnerability",
        "Assumes others will let them down if trusted",
        "Values self-sufficiency as primary virtue",
        "Sees asking for help as weakness or burden"
      ],
      emotional_regulation: [
        "Anxiety when forced to rely on others",
        "Pride in independent achievement",
        "Frustration when others don't meet self-reliance standards",
        "Discomfort when receiving help or support"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "High individual performance may limit team development",
        "Burnout risk from excessive self-reliance",
        "Team may become overly dependent on leader's capabilities"
      ],
      with_specific_personas: {
        "The Perfectionist Driver": "Creates unsustainable personal performance standards",
        "The Punitive Controller": "Punishes others for dependency while being hyperdependent on own performance"
      }
    }
  },

  "The Safety Strategist": {
    publicName: "The Stability Creator",
    clinicalName: "Enmeshment/Undeveloped Self Schema",
    domain: "Impaired Autonomy & Performance", 
    strengthFocus: "Security & Predictability",
    clinicalDescription: "Vulnerability fears, excessive safety-seeking, risk avoidance, difficulty with uncertainty",
    publicDescription: "You excel at creating stable, predictable environments that help teams perform at their best. Your focus on security and stability reduces anxiety and enables consistent performance.",
    developmentEdge: "Your stability creates team confidence - consider how calculated risks and innovation can enhance your foundation-building while maintaining the security you value.",
    questionIds: ['2.3.1', '2.3.2', '2.3.3'],
    behaviors: {
      behavioral_markers: [
        "Extensive planning and preparation for potential challenges",
        "Preference for proven methods over experimental approaches",
        "Creates multiple safety nets and backup systems",
        "Careful testing before implementing new initiatives"
      ],
      cognitive_patterns: [
        "Focuses on potential negative outcomes and risks",
        "Believes change inherently threatens stability",
        "Overvalues security over growth opportunities",
        "Catastrophizes uncertainty and ambiguous situations"
      ],
      emotional_regulation: [
        "Anxiety when facing uncertainty or change",
        "Calm when operating within established systems",
        "Stress when pressured to take risks",
        "Relief when safety measures are in place"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Strong foundation-building may limit growth and innovation",
        "Team may become risk-averse and overly cautious",
        "Valuable stability may become organizational stagnation"
      ],
      with_specific_personas: {
        "The Perfectionist Driver": "Creates need for perfect safety which can paralyze decision-making",
        "The Guarded Strategist": "Double-layer of caution and mistrust creates very conservative leadership"
      }
    }
  },

  // IMPAIRED LIMITS DOMAIN
  "The Overgiver": {
    publicName: "The Service Leader",
    clinicalName: "Self-Sacrifice Schema",
    domain: "Impaired Limits",
    strengthFocus: "Team Support & Generosity",
    clinicalDescription: "Self-sacrifice patterns, excessive giving, boundary issues, resentment when giving is not appreciated",
    publicDescription: "You demonstrate exceptional generosity and commitment to supporting others' success. Your service-oriented approach creates teams where people feel valued and supported.",
    developmentEdge: "Your generosity builds loyalty - consider how maintaining healthy boundaries and self-care can sustain your giving nature while modeling balanced leadership.",
    questionIds: ['3.1.1', '3.1.2', '3.1.3'],
    behaviors: {
      behavioral_markers: [
        "Consistently prioritizes others' needs over personal needs",
        "Works excessive hours to support team success",
        "Takes on others' responsibilities to prevent their stress",
        "Provides resources and support even when stretched"
      ],
      cognitive_patterns: [
        "Believes others' needs are more important than own",
        "Feels guilty when prioritizing personal interests",
        "Views self-care as selfish or indulgent",
        "Expects appreciation for self-sacrifice"
      ],
      emotional_regulation: [
        "Guilt when not helping others",
        "Resentment when sacrifice isn't appreciated",
        "Exhaustion from over-giving",
        "Satisfaction from being needed and helpful"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Creates unsustainable giving patterns that lead to burnout",
        "May enable team dependency rather than building capability",
        "Resentment may build when over-giving isn't reciprocated"
      ],
      with_specific_personas: {
        "The Punitive Controller": "Punishes others for not appreciating or reciprocating self-sacrifice",
        "The Clinger": "Creates exhausting emotional demands through over-giving and attachment"
      }
    }
  },

  "The Over-Adapter": {
    publicName: "The Harmony Builder",
    clinicalName: "Subjugation Schema",
    domain: "Impaired Limits",
    strengthFocus: "Flexibility & Consensus Building", 
    clinicalDescription: "Subjugation patterns, excessive accommodation, loss of authentic voice, conflict avoidance",
    publicDescription: "You excel at building consensus and finding common ground that enables team harmony and collaborative success. Your flexibility helps diverse groups work together effectively.",
    developmentEdge: "Your harmony-building creates inclusion - consider how expressing your unique perspective and expertise can add valuable depth to collaborative decisions.",
    questionIds: ['3.2.1', '3.2.2', '3.2.3'],
    behaviors: {
      behavioral_markers: [
        "Automatically accommodates others' preferences and needs",
        "Avoids expressing disagreement or contrary opinions",
        "Changes position to maintain group harmony",
        "Suppresses personal agenda to serve group consensus"
      ],
      cognitive_patterns: [
        "Believes others' opinions are more valid or important",
        "Fears conflict will damage relationships or team unity",
        "Views personal preferences as less significant",
        "Prioritizes group harmony over authentic expression"
      ],
      emotional_regulation: [
        "Anxiety when sensing potential conflict",
        "Relief when everyone appears to agree",
        "Resentment that builds from chronic self-suppression", 
        "Calm when others are satisfied with decisions"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Important perspectives may be lost to group-think",
        "Team may miss valuable insights and innovation",
        "Leader burnout from chronic self-suppression"
      ],
      with_specific_personas: {
        "The Invisible Operator": "Double-pattern of hiding and adapting creates very minimal Inner Personapresence",
        "The Overgiver": "Creates pattern of giving and adapting that eliminates personal needs entirely"
      }
    }
  },

  "The Suppressed Voice": {
    publicName: "The Diplomatic Collaborator",
    clinicalName: "Emotional Inhibition Schema", 
    domain: "Other-Directedness",
    strengthFocus: "Collaborative Decision-Making",
    clinicalDescription: "Emotional inhibition in interpersonal contexts, voice suppression, difficulty expressing authentic reactions",
    publicDescription: "You bring diplomatic skills and collaborative approaches that help teams navigate complex situations with grace. Your ability to facilitate smooth interactions is a valuable Inner Personaasset.",
    developmentEdge: "Your diplomatic skills create smooth collaboration - consider how sharing your authentic perspective can add valuable insight while maintaining your excellent relationship-building abilities.",
    questionIds: ['4.1.1', '4.1.2', '4.1.3'],
    behaviors: {
      behavioral_markers: [
        "Facilitates discussions without revealing personal position",
        "Helps others express views while remaining neutral",
        "Smooths over conflicts without addressing underlying issues",
        "Maintains professional demeanor regardless of personal reactions"
      ],
      cognitive_patterns: [
        "Believes emotional expression is unprofessional or dangerous",
        "Views neutrality as safer than authentic expression",
        "Prioritizes group process over personal contribution",
        "Fears authentic expression will create conflict"
      ],
      emotional_regulation: [
        "Suppression of immediate emotional reactions",
        "Internal tension from unexpressed perspectives",
        "Relief when difficult conversations are avoided",
        "Stress from chronic emotional suppression"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Teams miss valuable Inner Personaperspective and insight",
        "May create pseudo-harmony without real resolution",
        "Leader authenticity and influence may be compromised"
      ],
      with_specific_personas: {
        "The Over-Adapter": "Creates complete self-suppression in service of group harmony",
        "The Invisible Operator": "Double-pattern of hiding and voice suppression creates minimal Inner Personapresence"
      }
    }
  },

  // OTHER-DIRECTEDNESS DOMAIN
  "The Image Manager": {
    publicName: "The Relationship Cultivator",
    clinicalName: "Approval-Seeking Schema",
    domain: "Other-Directedness",
    strengthFocus: "Professional Relationships",
    clinicalDescription: "Approval-seeking, image management, external validation dependence, performance for others' approval",
    publicDescription: "You excel at building and maintaining professional relationships that create opportunities and support team success. Your attention to how others perceive situations helps navigate complex organizational dynamics.",
    developmentEdge: "Your relationship awareness builds connections - consider how authenticity and genuine self-expression can deepen the trust and respect you already cultivate so well.",
    questionIds: ['4.2.1', '4.2.2', '4.2.3'],
    behaviors: {
      behavioral_markers: [
        "Careful attention to how decisions will be perceived",
        "Adjusts presentation style for different audiences",
        "Seeks feedback on image and professional reputation",
        "Invests significant energy in relationship maintenance"
      ],
      cognitive_patterns: [
        "Values others' opinions as primary measure of success",
        "Anticipates reactions and adjusts accordingly",
        "Believes approval is necessary for advancement and success",
        "Focuses on perception management over authentic expression"
      ],
      emotional_regulation: [
        "Anxiety when unsure of others' approval",
        "Relief when receiving positive feedback",
        "Shame when criticized or disapproved of",
        "Pressure to maintain positive image consistently"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Authentic Inner Personavoice may be compromised",
        "Decision-making may be driven by approval rather than merit",
        "Team may sense inauthentic or performative leadership"
      ],
      with_specific_personas: {
        "The Over-Adapter": "Creates complete focus on pleasing others with no authentic self-expression",
        "The Perfectionist Driver": "Perfectionism in service of approval creates unsustainable performance pressure"
      }
    }
  },

  "The Power Broker": {
    publicName: "The Strategic Influencer",
    clinicalName: "Grandiosity/Entitlement Schema",
    domain: "Other-Directedness",
    strengthFocus: "Organizational Navigation",
    clinicalDescription: "Grandiosity patterns, dominance-seeking, control and status focus, entitlement beliefs",
    publicDescription: "You excel at understanding organizational dynamics and driving results through strategic influence. Your ability to navigate complex systems and make things happen is a valuable Inner Personaasset.",
    developmentEdge: "Your influence capabilities are impressive - consider how collaborative Inner Personaapproaches can amplify your already strong results and develop others' strategic capabilities.",
    questionIds: ['4.3.1', '4.3.2', '4.3.3'],
    behaviors: {
      behavioral_markers: [
        "Seeks positions of influence and control",
        "Uses organizational knowledge to advance agendas",
        "Expects special treatment or recognition",
        "Leverages relationships for strategic advantage"
      ],
      cognitive_patterns: [
        "Believes they deserve special status or treatment",
        "Views relationships as strategic resources",
        "Assumes others should recognize their superiority",
        "Focuses on winning and dominance over collaboration"
      ],
      emotional_regulation: [
        "Anger when not recognized or given appropriate status",
        "Pride in successful influence and control",
        "Frustration when others don't comply with expectations",
        "Excitement when gaining power or influence"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "May alienate team members through dominance focus",
        "Strategic capabilities may be undermined by entitlement",
        "Organizational impact may be limited by self-focus"
      ],
      with_specific_personas: {
        "The Punitive Controller": "Creates authoritarian Inner Personastyle with punishment for non-compliance",
        "The Image Manager": "Uses image management to support grandiose self-presentation"
      }
    }
  },

  // OVERVIGILANCE & INHIBITION DOMAIN  
  "The Cautious Realist": {
    publicName: "The Balanced Assessor",
    clinicalName: "Negativity/Pessimism Schema",
    domain: "Overvigilance & Inhibition",
    strengthFocus: "Realistic Assessment & Planning",
    clinicalDescription: "Pessimism patterns, negative outcome focus, catastrophic thinking, chronic worry",
    publicDescription: "You bring realistic assessment and balanced perspective that helps teams make informed decisions. Your ability to anticipate challenges helps organizations prepare effectively for various scenarios.",
    developmentEdge: "Your realistic perspective prevents problems - consider how balancing your valuable caution with optimism and possibility-thinking can inspire teams while maintaining your excellent preparation skills.",
    questionIds: ['5.1.1', '5.1.2', '5.1.3'],
    behaviors: {
      behavioral_markers: [
        "Consistently identifies potential problems and risks",
        "Focuses discussions on challenges and obstacles",
        "Prepares extensively for worst-case scenarios",
        "Provides realistic assessments that others may avoid"
      ],
      cognitive_patterns: [
        "Automatically scans for negative possibilities",
        "Believes optimism is naive and dangerous",
        "Focuses on what could go wrong rather than what could go right",
        "Values being right about problems over being inspiring"
      ],
      emotional_regulation: [
        "Chronic low-level anxiety about future problems",
        "Relief when problems are anticipated and planned for",
        "Frustration when others seem naive or overly optimistic",
        "Satisfaction when pessimistic predictions prove accurate"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Valuable realism may become team-demoralizing pessimism",
        "Innovation and risk-taking may be severely constrained",
        "Team energy and motivation may be consistently dampened"
      ],
      with_specific_personas: {
        "The Guarded Strategist": "Double-layer of pessimism and mistrust creates very defensive leadership",
        "The Self-Doubter": "Pessimism reinforces self-doubt creating Inner Personaparalysis"
      }
    }
  },

  "The Stoic Mask": {
    publicName: "The Steady Anchor",
    clinicalName: "Emotional Inhibition Schema",
    domain: "Overvigilance & Inhibition",
    strengthFocus: "Emotional Stability & Reliability", 
    clinicalDescription: "Emotional inhibition, suppression of authentic expression, controlled emotional presentation",
    publicDescription: "You provide emotional stability and steady presence that teams can rely on during challenging times. Your composed Inner Personahelps others maintain focus and confidence.",
    developmentEdge: "Your steadiness provides security - consider how appropriate emotional expression and vulnerability can deepen trust and create even stronger team connections.",
    questionIds: ['5.2.1', '5.2.2', '5.2.3'],
    behaviors: {
      behavioral_markers: [
        "Maintains consistent emotional presentation regardless of circumstances",
        "Avoids emotional expressions that might unsettle others",
        "Provides steady presence during team crises",
        "Suppresses personal reactions to maintain professional image"
      ],
      cognitive_patterns: [
        "Believes emotional expression is unprofessional or weakness",
        "Values control and predictability in interpersonal interactions",
        "Sees vulnerability as dangerous to Inner Personacredibility",
        "Focuses on maintaining composure above authentic expression"
      ],
      emotional_regulation: [
        "Chronic suppression of emotional responses",
        "Internal pressure from unexpressed emotions",
        "Relief when emotional expression is not required",
        "Stress when others express strong emotions"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Team may feel disconnected from leader's authentic experience",
        "Important emotional data may be missing from Inner Personadecisions",
        "Leader burnout from chronic emotional suppression"
      ],
      with_specific_personas: {
        "The Withholder": "Creates extremely controlled and potentially cold Inner Personapresence",
        "The Perfectionist Driver": "Emotional perfectionism adds pressure to never show weakness"
      }
    }
  },

  "The Perfectionist Driver": {
    publicName: "The Excellence Champion",
    clinicalName: "Unrelenting Standards Schema",
    domain: "Overvigilance & Inhibition",
    strengthFocus: "High Standards & Quality",
    clinicalDescription: "Unrelenting standards, perfectionist patterns, harsh self-criticism, never good enough beliefs",
    publicDescription: "You champion excellence and maintain high standards that drive quality results. Your attention to detail and commitment to excellence helps teams achieve their best performance.",
    developmentEdge: "Your excellence focus drives quality - consider how celebrating progress and acknowledging good enough in appropriate contexts can accelerate team performance and innovation.",
    questionIds: ['5.3.1', '5.3.2', '5.3.3'],
    behaviors: {
      behavioral_markers: [
        "Sets extremely high standards for self and others",
        "Focuses on details and quality over speed or efficiency",
        "Continues working on projects until they meet perfect standards",
        "Criticizes work that meets basic requirements but not excellence"
      ],
      cognitive_patterns: [
        "Believes anything less than perfect is failure",
        "Focuses on flaws and areas for improvement",
        "Values quality over all other considerations",
        "Assumes others share same commitment to perfection"
      ],
      emotional_regulation: [
        "Anxiety when work doesn't meet personal standards",
        "Frustration with others' acceptance of 'good enough'",
        "Pride in high-quality outcomes",
        "Self-criticism when standards are not achieved"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "High standards may create team anxiety and paralysis",
        "Innovation may be stifled by perfectionist requirements",
        "Team energy may be depleted by unrelenting pressure"
      ],
      with_specific_personas: {
        "The Punitive Controller": "Creates harsh punishment for anything less than perfect performance",
        "The Self-Doubter": "Perfectionism reinforces self-doubt creating decision paralysis"
      }
    }
  },

  "The Harsh Enforcer": {
    publicName: "The Standards Leader",
    clinicalName: "Punitiveness Schema",
    domain: "Overvigilance & Inhibition",
    strengthFocus: "Accountability & Clear Expectations",
    clinicalDescription: "Punitiveness patterns, harsh criticism, punitive responses to mistakes, belief that punishment teaches",
    publicDescription: "You excel at creating clear expectations and ensuring accountability across your teams. Your commitment to standards helps organizations maintain quality and achieve consistent results.",
    developmentEdge: "Your accountability focus drives results - consider how positive reinforcement alongside clear standards can enhance both performance and team engagement.",
    questionIds: ['5.4.1', '5.4.2', '5.4.3'],
    behaviors: {
      behavioral_markers: [
        "Implements immediate consequences for performance failures",
        "Expresses disappointment and criticism directly when standards aren't met",
        "Maintains rigid standards with limited flexibility for context",
        "Uses consequences as primary tool for teaching and motivation"
      ],
      cognitive_patterns: [
        "Believes people learn best through consequences and punishment",
        "Views mistakes as character flaws requiring correction",
        "Assumes leniency enables poor performance",
        "Focuses on punishment as necessary for learning"
      ],
      emotional_regulation: [
        "Anger as primary response to unmet expectations",
        "Satisfaction when delivering consequences for poor performance",
        "Frustration when others avoid implementing necessary consequences",
        "May experience guilt when being lenient"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Team psychological safety may be severely compromised",
        "Innovation and risk-taking may be eliminated",
        "High turnover and team burnout likely"
      ],
      with_specific_personas: {
        "The Perfectionist Driver": "Creates punitive perfectionism with harsh consequences for imperfection",
        "The Clinger": "Punishment stemming from attachment creates confusing and painful team dynamics"
      }
    }
  },

  "The Unfiltered Reactor": {
    publicName: "The Authentic Communicator", 
    clinicalName: "Inhibition (Inverse Pattern)",
    domain: "Overvigilance & Inhibition",
    strengthFocus: "Direct Communication & Honesty",
    clinicalDescription: "Emotional dysregulation, impulsive expression, lack of filters, immediate emotional reactions",
    publicDescription: "Your authentic, direct communication style brings clarity and transparency to Inner Personainteractions. Teams appreciate knowing exactly where they stand and value your honest, straightforward approach.",
    developmentEdge: "Your authenticity is refreshing - consider how strategic timing and context can make your direct communication even more effective and well-received.",
    questionIds: ['2.4.1', '2.4.2', '2.4.3'],
    behaviors: {
      behavioral_markers: [
        "Expresses reactions immediately and directly",
        "Provides unfiltered feedback on performance and decisions",
        "Emotional reactions are visible and authentic",
        "Says what others are thinking but won't express"
      ],
      cognitive_patterns: [
        "Values honesty and authenticity above diplomacy",
        "Believes people should know exactly where they stand",
        "Views filtered communication as dishonest or manipulative",
        "Prioritizes truth-telling over relationship maintenance"
      ],
      emotional_regulation: [
        "Immediate expression of emotional reactions",
        "Relief after authentic expression",
        "Frustration with others' diplomatic or filtered communication",
        "Energy from honest, direct interaction"
      ]
    },
    integration_patterns: {
      with_high_scores: [
        "Valuable honesty may be delivered in damaging ways",
        "Team may feel unsafe expressing themselves around leader",
        "Relationships may be damaged by impulsive reactions"
      ],
      with_specific_personas: {
        "The Punitive Controller": "Immediate punishment reactions without filters or consideration",
        "The Power Broker": "Unfiltered expression of grandiose expectations and entitlement"
      }
    }
  }
};

// Framework-compliant persona-question mapping
export const PERSONA_QUESTION_MAPPING = {
  // Domain 1: Disconnection & Rejection Patterns
  "The Clinger": [1, 19, 37],
  "The Invisible Operator": [2, 20, 38], 
  "The Withholder": [3, 21, 39],
  "The Guarded Strategist": [4, 22, 40],
  "The Outsider": [5, 23, 41],
  
  // Domain 2: Impaired Autonomy & Performance
  "The Self-Doubter": [6, 24, 42],
  "The Reluctant Rely-er": [7, 25, 43],
  "The Safety Strategist": [8, 26, 44],
  
  // Domain 3: Impaired Limits
  "The Overgiver": [9, 27, 45],
  "The Over-Adapter": [10, 28, 46],
  "The Suppressed Voice": [11, 29, 47],
  
  // Domain 4: Other-Directedness  
  "The Image Manager": [12, 30, 48],
  "The Power Broker": [13, 31, 49],
  
  // Domain 5: Overvigilance & Inhibition
  "The Cautious Realist": [14, 32, 50],
  "The Stoic Mask": [15, 33, 51],
  "The Perfectionist Driver": [16, 34, 52],
  "The Harsh Enforcer": [17, 35, 53],
  "The Unfiltered Reactor": [18, 36, 54]
};

// Get public persona information from enhanced mapping
export function getPersonaDetails(personaName: string): PersonaDetails | null {
  return ENHANCED_PERSONA_MAPPING[personaName] || null;
}
