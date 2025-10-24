
/**
 * LASBI Assessment Exporter - Surgical Update
 * 
 * Emits Studio-compatible JSON with:
 * - itemId (modern cmf... LASBI id) ✅ primary join key
 * - canonicalId ("d.s.q" format e.g., "2.4.3") ✅ human-readable guard
 * - value (response 1..6)
 * - Optional: UI index (1..108) for display only
 * 
 * Supports multiple input formats:
 * 1. Modern itemId (cmf...) - preferred
 * 2. CanonicalId (d.s.q) - second preference
 * 3. Legacy questionId (e.g., "1.1.R1") - fallback
 */

import { loadMappingArray, type LasbiItemMapping } from './shared-lasbi-mapping';

// ============================================================================
// Type Definitions
// ============================================================================

export type UIAnswer = {
  index: number;          // UI order (1..108) - display only
  value: number;          // 1..6
  itemId?: string;        // cmf… (if your UI already knows it)
  canonicalId?: string;   // "d.s.q" if known
  questionId?: string;    // legacy like "1.1.R1" (fallback)
};

export type MappingRow = {
  itemId: string;         // cmf…
  variableId: string;     // "d.s"
  questionNumber: number; // 1|2|3
  schemaLabel: string;    // not required for export, useful for QA
};

export type ExportedItem = {
  index: number;
  itemId: string;
  canonicalId: string;
  value: number;
};

export type ExportPayload = {
  instrument: { 
    name: "LASBI"; 
    schemaVersion: string;
  };
  mappingVersion: string;
  responses: ExportedItem[];
  metadata?: {
    exportedAt: string;
    locale?: string;
    [key: string]: any;
  };
};

// ============================================================================
// Exporter Implementation
// ============================================================================

export async function buildExporter({
  answers,
  mappingVersion,
  schemaVersion = "1.0.0",
  locale = "en-US"
}: {
  answers: UIAnswer[];
  mappingVersion: string;
  schemaVersion?: string;
  locale?: string;
}): Promise<ExportPayload> {
  
  console.log('🔄 LASBI Exporter: Starting surgical export');
  console.log('🔄 Input answers:', answers.length);
  
  // Validate input
  if (answers.length !== 108) {
    throw new Error(`Expected 108 answers, received ${answers.length}`);
  }
  
  // Load canonical mapping from shared source
  const mapping: MappingRow[] = await loadMappingArray();
  
  console.log('✅ Loaded mapping:', mapping.length, 'items');
  
  // Create lookup maps for efficient mapping
  const byItemId = new Map(mapping.map(m => [m.itemId, m]));
  const byCanonical = new Map(mapping.map(m => [
    `${m.variableId}.${m.questionNumber}`, 
    m
  ]));
  
  console.log('✅ Created lookup maps:', {
    byItemId: byItemId.size,
    byCanonical: byCanonical.size
  });
  
  // Map answers to exported items
  const out: ExportedItem[] = answers.map((a, i) => {
    // Strategy 1: Prefer modern cmf itemId if provided by UI
    if (a.itemId && byItemId.has(a.itemId)) {
      const row = byItemId.get(a.itemId)!;
      return {
        index: a.index ?? i + 1,
        itemId: row.itemId,
        canonicalId: `${row.variableId}.${row.questionNumber}`,
        value: a.value
      };
    }

    // Strategy 2: Prefer canonicalId if provided by UI
    if (a.canonicalId && byCanonical.has(a.canonicalId)) {
      const row = byCanonical.get(a.canonicalId)!;
      return {
        index: a.index ?? i + 1,
        itemId: row.itemId,
        canonicalId: a.canonicalId,
        value: a.value
      };
    }

    // Strategy 3: Parse legacy like "1.1.R1" → "1.1.1" and map
    if (a.questionId && /^[1-5]\.[1-5]\./.test(a.questionId)) {
      const [d, s, tail] = a.questionId.split(".");
      const qn = /(\d+)/.exec(tail)?.[1];      // grab trailing number
      if (!qn) {
        throw new Error(`Unable to parse question number from legacy ID: ${a.questionId}`);
      }
      const canon = `${d}.${s}.${qn}`;
      if (byCanonical.has(canon)) {
        const row = byCanonical.get(canon)!;
        return {
          index: a.index ?? i + 1,
          itemId: row.itemId,
          canonicalId: canon,
          value: a.value
        };
      }
    }

    throw new Error(
      `Unmappable answer at index ${i + 1}: needs itemId (cmf…) or canonicalId (d.s.q) or legacy d.s.* ` +
      `[provided: ${JSON.stringify({ itemId: a.itemId, canonicalId: a.canonicalId, questionId: a.questionId })}]`
    );
  });

  console.log('✅ Mapped all answers to exported items');
  console.log('🔍 Sample mapped items:', out.slice(0, 3));
  
  // Defensive checks
  const ids = new Set(out.map(r => r.itemId));
  if (ids.size !== 108) {
    throw new Error(`Duplicate or missing itemId(s) in export: expected 108 unique, got ${ids.size}`);
  }
  
  const canon = new Set(out.map(r => r.canonicalId));
  if (canon.size !== 108) {
    throw new Error(`Duplicate or missing canonicalId(s) in export: expected 108 unique, got ${canon.size}`);
  }

  console.log('✅ Validation passed: 108 unique itemIds and canonicalIds');
  
  // Build final payload
  const payload: ExportPayload = {
    instrument: { 
      name: "LASBI", 
      schemaVersion 
    },
    mappingVersion,
    responses: out,
    metadata: {
      exportedAt: new Date().toISOString(),
      locale,
      totalItems: out.length,
      format: "order-independent-studio-compatible"
    }
  };

  console.log('✅ Export payload generated successfully');
  
  return payload;
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Convert legacy response format to UIAnswer format
 * Handles multiple input formats from the existing system
 */
export function convertLegacyResponses(
  responses: Record<string, any>
): UIAnswer[] {
  console.log('🔄 Converting legacy responses to UIAnswer format');
  console.log('🔄 Response keys sample:', Object.keys(responses).slice(0, 5));
  
  const answers: UIAnswer[] = [];
  let index = 1;
  
  for (const [key, responseData] of Object.entries(responses)) {
    // Extract value from response
    const value = typeof responseData === 'object' && 'value' in responseData
      ? Number(responseData.value)
      : Number(responseData);
    
    // Check format of key and create appropriate UIAnswer
    if (/^cmf[a-z0-9]{20,}$/i.test(key)) {
      // Modern itemId format (cmf...)
      answers.push({
        index,
        itemId: key,
        value
      });
    } else if (/^\d+\.\d+\.\d+$/.test(key)) {
      // Canonical ID format (d.s.q like "1.1.1")
      answers.push({
        index,
        canonicalId: key,
        value
      });
    } else {
      // Legacy format (like "1.1.R1" or other)
      answers.push({
        index,
        questionId: key,
        value
      });
    }
    
    index++;
  }
  
  console.log('✅ Converted', answers.length, 'responses');
  console.log('🔍 Sample conversions:', answers.slice(0, 3));
  
  return answers;
}

/**
 * Validate mapping version format
 */
export function validateMappingVersion(version: string): boolean {
  return /^lasbi-v\d+\.\d+\.\d+$/.test(version);
}

/**
 * Get current mapping version from environment or default
 */
export function getCurrentMappingVersion(): string {
  return process.env.LASBI_MAPPING_VERSION || 'lasbi-v1.3.0';
}
