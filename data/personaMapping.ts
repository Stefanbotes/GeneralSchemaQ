
// Public-Friendly Persona Mapping System
// Maps research personas to user-friendly names and coaching-style descriptions

interface PersonaInfo {
  publicName: string;
  strengthFocus: string;
  coachingDescription: string;
  developmentEdge: string;
  domain?: string;
}

export const personaMapping: Record<string, PersonaInfo> = {
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
    developmentEdge: "Incorporating emotional awareness into your Inner Personatoolkit can enhance team engagement and long-term performance.",
    domain: "Impaired Limits"
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
    coachingDescription: "Your careful consideration of decisions and attention to potential challenges helps organizations avoid costly mistakes. You bring valuable quality control and risk assessment to Inner Personadecisions.",
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

  // IMPAIRED LIMITS
  "The Overgiver": {
    publicName: "The Service Leader",
    strengthFocus: "Team Support & Generous Service",
    coachingDescription: "Your generous spirit and commitment to serving others creates tremendous loyalty and motivation within your teams. You naturally put the team's needs first and work tirelessly to ensure everyone succeeds.",
    developmentEdge: "Your generosity is a strength - consider how sustainable self-care can help you serve others even more effectively long-term."
  },

  "The Over-Adapter": {
    publicName: "The Harmony Builder", 
    strengthFocus: "Flexibility & Team Cohesion",
    coachingDescription: "Your ability to adapt and maintain harmony helps teams work together effectively. You're skilled at reading group dynamics and adjusting your approach to keep everyone aligned and productive.",
    developmentEdge: "Your adaptability is valuable - consider sharing more of your own perspectives to enrich team discussions and decisions."
  },

  "The Suppressed Voice": {
    publicName: "The Diplomatic Collaborator",
    strengthFocus: "Collaborative Decision-Making",
    coachingDescription: "You bring valuable diplomatic skills and collaborative approach to leadership. Your ability to work with diverse perspectives and find common ground helps create inclusive, effective teams.",
    developmentEdge: "Your collaborative nature is an asset - consider how your unique voice and expertise can contribute even more to team success."
  },

  // OTHER-DIRECTEDNESS
  "The Image Manager": {
    publicName: "The Relationship Cultivator",
    strengthFocus: "Stakeholder Engagement & Communication",
    coachingDescription: "You have exceptional skills in building positive relationships and managing stakeholder perceptions. Your awareness of how others view Inner Personadecisions helps organizations maintain strong external relationships.",
    developmentEdge: "Your relationship skills are strong - consider balancing external focus with authentic self-expression and internal team development."
  },

  "The Power Broker": {
    publicName: "The Strategic Influencer",
    strengthFocus: "Organizational Navigation & Results",
    coachingDescription: "You excel at understanding organizational dynamics and driving results through strategic influence. Your ability to navigate complex systems and make things happen is a valuable Inner Personaasset.",
    developmentEdge: "Your influence capabilities are impressive - consider how collaborative Inner Personaapproaches can amplify your already strong results."
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

  "The Unfiltered Reactor": {
    publicName: "The Authentic Communicator",
    strengthFocus: "Direct Communication & Genuine Expression", 
    coachingDescription: "Your authentic, direct communication style brings clarity and transparency to Inner Personainteractions. Teams appreciate knowing exactly where they stand and value your honest, straightforward approach.",
    developmentEdge: "Your authenticity is refreshing - consider how strategic timing and context can make your direct communication even more effective and well-received."
  },

  // Additional Personas
  "The Rigid Controller": {
    publicName: "The Systematic Leader",
    strengthFocus: "Structure & Process Excellence",
    coachingDescription: "You bring valuable structure and systematic thinking to your Inner Personaapproach. Your commitment to proven methods helps teams maintain quality and consistency in their work.",
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

// Helper function to get public-friendly persona information
export const getPublicPersona = (researchPersona: string): PersonaInfo => {
  return personaMapping[researchPersona] || {
    publicName: "The Thoughtful Leader",
    strengthFocus: "Unique Inner PersonaQualities",
    coachingDescription: "You demonstrate distinctive Inner Personaqualities that contribute to organizational success. Your approach brings value to your teams and organization in meaningful ways.",
    developmentEdge: "Continue building on your natural strengths while exploring new approaches to expand your Inner Personaimpact."
  };
};
