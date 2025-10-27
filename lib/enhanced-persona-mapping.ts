
// ⚠️ WARNING: DO NOT USE FOR SCORING ⚠️
// This mapping is INCONSISTENT and should NOT be used for persona scoring calculations.
// 
// PROBLEM: Question mappings are uneven (some 6, some 5, some 2, some 0 questions per persona)
// RESULT: Different rankings than Studio (App B) - confirmed mismatch with canonical framework
//
// FOR SCORING: Use calculateFrameworkPersonaScores() from ./framework-scoring-algorithm.ts
// FOR PRESENTATION: This file's getPersonaForTier() helper can still be used for display names
//
// Enhanced Persona Mapping System for 18 Schema-Based Personas
// Maps 54 assessment questions to comprehensive Inner Personas

// ⚠️ INTERFACE REMOVED ⚠️
// PersonaMapping interface was used by the removed shadow mapping.
// Reports now use PersonaScore interface from framework-scoring-algorithm.ts

// ⚠️ SHADOW MAPPING REMOVED ⚠️
// This array contained uneven item counts (6/5/4/3/2/0 items per persona) that caused ranking inconsistencies.
// Reports now drive purely from canonical framework scores (3 items per persona, consistent 1-54 mapping).
// 
// REMOVED: ENHANCED_PERSONA_MAPPINGS array - use calculateFrameworkPersonaScores() instead

// Schema categories mapping
export const SCHEMA_CATEGORIES = {
  'DISCONNECTION & REJECTION PATTERNS': {
    description: 'Patterns related to difficulty forming secure attachments and trusting relationships',
    personas: ['persona_01', 'persona_02', 'persona_03', 'persona_04', 'persona_05']
  },
  'IMPAIRED AUTONOMY & PERFORMANCE': {
    description: 'Patterns affecting independence, competence, and performance effectiveness',
    personas: ['persona_06', 'persona_07', 'persona_08']
  },
  'IMPAIRED LIMITS': {
    description: 'Patterns involving difficulty setting boundaries and maintaining self-direction',
    personas: ['persona_09', 'persona_10', 'persona_11']
  },
  'OTHER-DIRECTEDNESS': {
    description: 'Patterns focused on external approval and meeting others\' expectations',
    personas: ['persona_12', 'persona_13']
  },
  'OVERVIGILANCE & INHIBITION': {
    description: 'Patterns involving excessive control, perfectionism, or emotional suppression',
    personas: ['persona_14', 'persona_15', 'persona_16', 'persona_17', 'persona_18']
  }
};

// ⚠️ FUNCTION REMOVED ⚠️
// calculateEnhancedPersonaScores() used shadow mapping with uneven item counts.
// Reports now drive purely from canonical framework: calculateFrameworkPersonaScores()
// 
// REMOVED: calculateEnhancedPersonaScores() - use calculateFrameworkPersonaScores() instead

// Get persona by tier (for report generation)
// Updated to work with canonical PersonaScore format from framework-scoring-algorithm.ts
export function getPersonaForTier(persona: any, tier: 1 | 2 | 3): {
  name: string;
  description: string;
  category?: string;
  strengthFocus?: string;
  developmentEdge?: string;
} {
  switch (tier) {
    case 1:
      // Tier 1: Use public names only (positive framing)
      return {
        name: persona.publicName,
        description: persona.publicDescription
      };
    
    case 2:
      // Tier 2: Combine both names with coaching descriptions
      return {
        name: `${persona.publicName} (${persona.clinicalName})`,
        description: persona.publicDescription,
        strengthFocus: persona.strengthFocus,
        developmentEdge: persona.developmentEdge
      };
    
    case 3:
      // Tier 3: Research names with full clinical context
      return {
        name: persona.clinicalName,
        description: persona.clinicalDescription,
        category: persona.domain,
        strengthFocus: persona.strengthFocus,
        developmentEdge: persona.developmentEdge
      };
    
    default:
      return {
        name: persona.publicName,
        description: persona.publicDescription
      };
  }
}
