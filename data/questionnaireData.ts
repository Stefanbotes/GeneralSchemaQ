// ✅ data/questionnaireData.ts

export type ItemType = "cognitive" | "emotional" | "belief";

export interface Item {
  id: string;        // e.g., "1.1.1"
  type: ItemType;
  text: string;
}

export interface Schema {
  code: string;      // e.g., "1.1"
  name: string;
  coreTheme: string;
  items: Item[];     // exactly 6
}

export interface Domain {
  domain: string;    // e.g., "1. DISCONNECTION & REJECTION (General reflective version)"
  description: string;
  schemas: Schema[];
}

export interface Instrument {
  version: string;       // "2.0.0-general"
  instrument: string;    // human-readable name
  lastUpdated: string;   // ISO date
  structureNotes: string;
  domains: Domain[];     // 5 domains
}

// ✅ KEEP ONLY the real instrument and export it as default
const GENERAL_REFLECTIVE_V2: Instrument = {
  version: "2.0.0-general",
  instrument: "Schema Questionnaire v2 — General Reflective",
  lastUpdated: "2025-10-24",
  structureNotes:
    "Cognitive = items 1–2, Emotional = items 3–4, Belief = items 5–6. IDs use Domain.Schema.Item (e.g., 1.1.1). Total 108. No reverse scoring.",

  domains: [
    {
      domain: "1. DISCONNECTION & REJECTION (General reflective version)",
      description: "Fear of loss, rejection, deprivation, mistrust, or not belonging.",
      schemas: [
        {
          code: "1.1",
          name: "Abandonment / Instability",
          coreTheme: "Fear that important people will not stay available or supportive.",
          items: [
            { id: "1.1.1", type: "cognitive", text: "I worry that people I depend on may withdraw or lose interest, even when things seem to be going well." },
            { id: "1.1.2", type: "cognitive", text: "Part of me stays alert for signs that someone close could pull away or become less invested." },
            { id: "1.1.3", type: "emotional", text: "When someone I care about grows distant, I feel a strong wave of unease or sadness." },
            { id: "1.1.4", type: "emotional", text: "If messages or replies from important people are delayed, I can feel anxious that I’ve done something wrong." },
            { id: "1.1.5", type: "belief", text: "Deep down, I believe closeness rarely lasts — people eventually drift away." },
            { id: "1.1.6", type: "belief", text: "I assume that even good relationships can end suddenly or fade without warning." }
          ]
        },
        {
          code: "1.2",
          name: "Defectiveness / Shame",
          coreTheme: "Feeling inherently flawed, unworthy, or less lovable than others.",
          items: [
            { id: "1.2.1", type: "cognitive", text: "I often compare myself with others and notice where I seem to fall short." },
            { id: "1.2.2", type: "cognitive", text: "I tend to assume others are more confident, attractive, or capable than I am." },
            { id: "1.2.3", type: "emotional", text: "When I make a mistake, I can feel a wave of embarrassment that stays with me." },
            { id: "1.2.4", type: "emotional", text: "Even mild criticism can hurt more than I expect and linger in my mind." },
            { id: "1.2.5", type: "belief", text: "Deep down, I believe something about me is not good enough." },
            { id: "1.2.6", type: "belief", text: "I fear that if people saw the real me, they would think less of me." }
          ]
        },
        {
          code: "1.3",
          name: "Emotional Deprivation",
          coreTheme: "Expectation that one’s needs for care, empathy, or understanding won’t be met.",
          items: [
            { id: "1.3.1", type: "cognitive", text: "I often assume others won’t really notice or respond to what I’m going through emotionally." },
            { id: "1.3.2", type: "cognitive", text: "I believe that when I share my feelings, people rarely offer the comfort I hope for." },
            { id: "1.3.3", type: "emotional", text: "Even when surrounded by people, I sometimes feel emotionally alone." },
            { id: "1.3.4", type: "emotional", text: "When I need understanding, I often feel I receive politeness instead of real empathy." },
            { id: "1.3.5", type: "belief", text: "Part of me believes my emotional needs are too much for others." },
            { id: "1.3.6", type: "belief", text: "I’ve learned not to expect people to truly understand how I feel." }
          ]
        },
        {
          code: "1.4",
          name: "Mistrust / Abuse",
          coreTheme: "Expectation of harm, exploitation, or betrayal in relationships.",
          items: [
            { id: "1.4.1", type: "cognitive", text: "I often question people’s motives, even when they seem kind or generous." },
            { id: "1.4.2", type: "cognitive", text: "I expect that if I let my guard down, someone might take advantage of me." },
            { id: "1.4.3", type: "emotional", text: "I can feel tense or on alert when others show unexpected interest or warmth." },
            { id: "1.4.4", type: "emotional", text: "When someone praises or compliments me, part of me wonders what they really want." },
            { id: "1.4.5", type: "belief", text: "I believe most people ultimately look out for themselves." },
            { id: "1.4.6", type: "belief", text: "Trust feels risky because people can disappoint or exploit you." }
          ]
        },
        {
          code: "1.5",
          name: "Social Isolation

    {
      domain: "2. IMPAIRED AUTONOMY & PERFORMANCE (General reflective version)",
      description: "Beliefs about one’s ability to function independently, handle life effectively, or feel secure in one’s judgment.",
      schemas: [
        {
          code: "2.1",
          name: "Dependence / Incompetence",
          coreTheme: "Belief that one is unable to handle responsibilities or make sound decisions without help.",
          items: [
            { id: "2.1.1", type: "cognitive", text: "I believe others often make better decisions than I do, especially in uncertain situations." },
            { id: "2.1.2", type: "cognitive", text: "When things feel unclear, my first instinct is to look for someone to guide or reassure me." },
            { id: "2.1.3", type: "emotional", text: "When I have to manage something alone, I can feel anxious or lost about what to do." },
            { id: "2.1.4", type: "emotional", text: "I feel uneasy taking full responsibility without someone more experienced to advise me." },
            { id: "2.1.5", type: "belief", text: "Deep down, I believe I’m not capable enough to manage important tasks on my own." },
            { id: "2.1.6", type: "belief", text: "I assume that I need others’ input to avoid making big mistakes." }
          ]
        },
        {
          code: "2.2",
          name: "Vulnerability to Harm or Illness",
          coreTheme: "Exaggerated fear that catastrophe, illness, or disaster is imminent and unavoidable.",
          items: [
            { id: "2.2.1", type: "cognitive", text: "I often imagine worst-case scenarios — accidents, illness, or sudden losses — even when things are fine." },
            { id: "2.2.2", type: "cognitive", text: "I tend to notice danger signs or physical symptoms that others might overlook." },
            { id: "2.2.3", type: "emotional", text: "I can feel sudden waves of anxiety about something bad happening to me or my loved ones." },
            { id: "2.2.4", type: "emotional", text: "Even when everything seems safe, part of me stays on alert for potential threats." },
            { id: "2.2.5", type: "belief", text: "I believe life can change for the worse at any moment, no matter how careful I am." },
            { id: "2.2.6", type: "belief", text: "I assume danger is always just around the corner — accidents, illness, or loss." }
          ]
        },
        {
          code: "2.3",
          name: "Enmeshment / Undeveloped Self",
          coreTheme: "Difficulty forming a strong sense of self or separating emotionally from others.",
          items: [
            { id: "2.3.1", type: "cognitive", text: "I often shape my opinions or choices around what close others think or prefer." },
            { id: "2.3.2", type: "cognitive", text: "It can be hard to know what I truly want when people I care about want something different." },
            { id: "2.3.3", type: "emotional", text: "When someone close feels upset, I can feel anxious or responsible for fixing it." },
            { id: "2.3.4", type: "emotional", text: "If I disappoint someone important, I feel deeply unsettled until harmony is restored." },
            { id: "2.3.5", type: "belief", text: "I believe closeness means sharing almost everything — feelings, decisions, and boundaries." },
            { id: "2.3.6", type: "belief", text: "I fear that asserting too much independence could damage my closest relationships." }
          ]
        },
        {
          code: "2.4",
          name: "Failure",
          coreTheme: "Belief that one is inadequate, will fail, or is less successful than peers.",
          items: [
            { id: "2.4.1", type: "cognitive", text: "I often compare my progress with others and feel I’m falling behind." },
            { id: "2.4.2", type: "cognitive", text: "Even when I do well, part of me expects that I’ll eventually fail or be exposed as less capable." },
            { id: "2.4.3", type: "emotional", text: "When others achieve more, I can feel discouraged or inferior." },
            { id: "2.4.4", type: "emotional", text: "Success sometimes feels fragile — as if one mistake could erase it all." },
            { id: "2.4.5", type: "belief", text: "Deep down, I believe I’m not as capable or talented as most people." },
            { id: "2.4.6", type: "belief", text: "I expect that, in the long run, I’ll prove less successful than my peers." }
          ]
        }
      ]
    },
    {
      domain: "3. IMPAIRED LIMITS (General reflective version)",
      description: "Difficulties with self-discipline, respecting boundaries, or acknowledging the needs and rights of others.",
      schemas: [
        {
          code: "3.1",
          name: "Entitlement / Grandiosity",
          coreTheme: "Belief that one is superior to others or deserves special treatment or privileges.",
          items: [
            { id: "3.1.1", type: "cognitive", text: "I sometimes feel my views or preferences should carry more weight than others’." },
            { id: "3.1.2", type: "cognitive", text: "I can feel irritated when my contributions aren’t acknowledged as much as I think they should be." },
            { id: "3.1.3", type: "emotional", text: "When others disagree with me, I can feel frustrated or disrespected." },
            { id: "3.1.4", type: "emotional", text: "I feel uneasy when I’m treated the same as people who, in my view, contribute less." },
            { id: "3.1.5", type: "belief", text: "I believe my insights or abilities are stronger than most people’s." },
            { id: "3.1.6", type: "belief", text: "Part of me expects special recognition for what I offer." }
          ]
        },
        {
          code: "3.2",
          name: "Insufficient Self-Control / Self-Discipline",
          coreTheme: "Difficulty tolerating frustration or delaying gratification to meet goals or responsibilities.",
          items: [
            { id: "3.2.1", type: "cognitive", text: "I often choose what feels good in the moment, even when I know it might cause problems later." },
            { id: "3.2.2", type: "cognitive", text: "It’s hard for me to stay focused on long-term goals when short-term rewards are available." },
            { id: "3.2.3", type: "emotional", text: "When I feel restricted or told 'no', I can quickly become irritated or restless." },
            { id: "3.2.4", type: "emotional", text: "I can feel strong urges to act on impulses even when I know they’re unhelpful." },
            { id: "3.2.5", type: "belief", text: "Part of me believes rules are flexible if they stand in the way of what I want." },
            { id: "3.2.6", type: "belief", text: "I believe self-control often limits creativity or enjoyment of life." }
          ]
        }
      ]
    },
    {
      domain: "4. OTHER-DIRECTEDNESS (General reflective version)",
      description: "Excessive focus on meeting the needs, approval, or expectations of others—often at the expense of personal authenticity or well-being.",
      schemas: [
        {
          code: "4.1",
          name: "Subjugation",
          coreTheme: "Tendency to suppress one’s own needs or opinions to avoid conflict, guilt, or rejection.",
          items: [
            { id: "4.1.1", type: "cognitive", text: "I often hold back my opinions to keep interactions smooth and avoid disagreements." },
            { id: "4.1.2", type: "cognitive", text: "I assume it’s safer to agree than to risk upsetting someone or being seen as difficult." },
            { id: "4.1.3", type: "emotional", text: "When I stand up for myself, I can feel anxious until I know the other person isn’t upset." },
            { id: "4.1.4", type: "emotional", text: "If I assert my needs and someone reacts negatively, I feel guilty or uneasy afterward." },
            { id: "4.1.5", type: "belief", text: "Deep down, I believe keeping others comfortable is more important than expressing myself fully." },
            { id: "4.1.6", type: "belief", text: "I assume that showing strong opinions can harm relationships or create tension." }
          ]
        },
        {
          code: "4.2",
          name: "Self-Sacrifice",
          coreTheme: "Prioritizing others’ needs above one’s own to prevent harm, guilt, or loss of connection.",
          items: [
            { id: "4.2.1", type: "cognitive", text: "I tend to notice others’ needs before my own and quickly move to meet them." },
            { id: "4.2.2", type: "cognitive", text: "I often put my own desires aside because someone else seems to need more support." },
            { id: "4.2.3", type: "emotional", text: "When I take time for myself, I can feel guilty or selfish." },
            { id: "4.2.4", type: "emotional", text: "If someone I care about is struggling, I feel compelled to help even when I’m exhausted." },
            { id: "4.2.5", type: "belief", text: "Deep down, I believe that a good person should always put others first." },
            { id: "4.2.6", type: "belief", text: "I assume my worth is tied to how much I give or care for others." }
          ]
        },
        {
          code: "4.3",
          name: "Approval-Seeking / Recognition-Seeking",
          coreTheme: "Overemphasis on gaining approval, attention, or acceptance from others.",
          items: [
            { id: "4.3.1", type: "cognitive", text: "I often adjust what I say or do so that others will think well of me." },
            { id: "4.3.2", type: "cognitive", text: "I notice myself scanning for signs that people like or respect me." },
            { id: "4.3.3", type: "emotional", text: "I can feel uneasy if I sense that someone doesn’t approve of me." },
            { id: "4.3.4", type: "emotional", text: "Praise gives me a lift, but the feeling fades quickly and I look for more reassurance." },
            { id: "4.3.5", type: "belief", text: "I believe being accepted by others is essential to feeling good about myself." },
            { id: "4.3.6", type: "belief", text: "I assume my value depends on how others perceive or validate me." }
          ]
        }
      ]
    },
    {
      domain: "5. OVERVIGILANCE & INHIBITION (General reflective version)",
      description: "Excessive emphasis on self-control, rules, and avoiding mistakes, often at the expense of spontaneity or emotional expression.",
      schemas: [
        {
          code: "5.1",
          name: "Negativity / Pessimism",
          coreTheme: "Persistent focus on what could go wrong or on potential loss and failure.",
          items: [
            { id: "5.1.1", type: "cognitive", text: "I tend to notice what might go wrong before I see what could go well." },
            { id: "5.1.2", type: "cognitive", text: "Even when things are going fine, part of me expects problems to appear." },
            { id: "5.1.3", type: "emotional", text: "It’s hard for me to fully relax because I stay alert for possible setbacks." },
            { id: "5.1.4", type: "emotional", text: "Good moments can feel temporary — as if something bad might follow." },
            { id: "5.1.5", type: "belief", text: "I believe that being too optimistic can make people unprepared for reality." },
            { id: "5.1.6", type: "belief", text: "Deep down, I assume that staying cautious is safer than trusting things will turn out well." }
          ]
        },
        {
          code: "5.2",
          name: "Emotional Inhibition",
          coreTheme: "Belief that showing feelings or vulnerability will lead to criticism, rejection, or loss of control.",
          items: [
            { id: "5.2.1", type: "cognitive", text: "I often hold back strong emotions because I worry they’ll be judged or misunderstood." },
            { id: "5.2.2", type: "cognitive", text: "I believe that showing too much emotion can make people uncomfortable or think less of me." },
            { id: "5.2.3", type: "emotional", text: "When I feel upset, I tend to shut down rather than express it openly." },
            { id: "5.2.4", type: "emotional", text: "Even in close relationships, I sometimes hide sadness or anger to stay in control." },
            { id: "5.2.5", type: "belief", text: "I believe being composed and controlled is more important than being emotionally open." },
            { id: "5.2.6", type: "belief", text: "I assume that showing vulnerability will make me look weak or unstable." }
          ]
        },
        {
          code: "5.3",
          name: "Unrelenting Standards / Hypercriticalness",
          coreTheme: "Belief that one must always strive harder and meet very high standards to avoid failure or criticism.",
          items: [
            { id: "5.3.1", type: "cognitive", text: "I often set standards for myself that are higher than what others expect." },
            { id: "5.3.2", type: "cognitive", text: "I tend to focus more on what still needs improving than on what’s already going well." },
            { id: "5.3.3", type: "emotional", text: "It’s hard for me to feel satisfied with my performance for long — there’s always more to do." },
            { id: "5.3.4", type: "emotional", text: "When I make small mistakes, I can feel tense or self-critical for hours." },
            { id: "5.3.5", type: "belief", text: "I believe that relaxing my standards would make me lazy or less successful." },
            { id: "5.3.6", type: "belief", text: "Deep down, I assume that achievement defines my worth." }
          ]
        },
        {
          code: "5.4",
          name: "Punitiveness",
          coreTheme: "Belief that people deserve harsh judgment or punishment for mistakes, including oneself.",
          items: [
            { id: "5.4.1", type: "cognitive", text: "I can be very critical of people when they make careless mistakes." },
            { id: "5.4.2", type: "cognitive", text: "I tend to focus on what went wrong rather than trying to understand why it happened." },
            { id: "5.4.3", type: "emotional", text: "When I make a mistake, I can feel angry at myself instead of forgiving it." },
            { id: "5.4.4", type: "emotional", text: "I find it hard to let go of resentment when others disappoint me." },
            { id: "5.4.5", type: "belief", text: "I believe that people learn best when they face consequences for their errors." },
            { id: "5.4.6", type: "belief", text: "Deep down, I assume that weakness or failure should be corrected, not excused." }
          ]
        }
      ]
    }
  ]
};

export default GENERAL_REFLECTIVE_V2;
