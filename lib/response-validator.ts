
/**
 * Response Validation for LASBI Assessment
 * 
 * Enforces stable identifier storage:
 * - itemId (cmf...) - primary
 * - canonicalId (d.s.q) - secondary
 * - value (1..6) - required
 */

export interface ValidatedResponse {
  itemId: string;
  canonicalId: string;
  variableId: string;
  value: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  responses?: ValidatedResponse[];
}

// Regex patterns
const ITEM_ID_PATTERN = /^cmf[a-z0-9]{20,}$/i;
const CANONICAL_ID_PATTERN = /^[1-5]\.[1-5]\.[1-3]$/;
const VARIABLE_ID_PATTERN = /^[1-5]\.[1-5]$/;

/**
 * Validate a single response
 */
function validateResponse(
  response: any,
  index: number
): { valid: boolean; error?: string; validated?: ValidatedResponse } {
  // Check for required fields
  const hasItemId = typeof response.itemId === 'string' && ITEM_ID_PATTERN.test(response.itemId);
  const hasCanonicalId = typeof response.canonicalId === 'string' && CANONICAL_ID_PATTERN.test(response.canonicalId);
  
  if (!hasItemId && !hasCanonicalId) {
    return {
      valid: false,
      error: `Response ${index + 1}: Missing stable identifier (itemId or canonicalId)`
    };
  }
  
  // Validate value
  const value = Number(response.value);
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    return {
      valid: false,
      error: `Response ${index + 1}: Value must be an integer between 1 and 6, got ${response.value}`
    };
  }
  
  // Extract canonical ID if only itemId provided
  let canonicalId = response.canonicalId;
  let variableId = response.variableId;
  
  if (!canonicalId && hasItemId) {
    // Will be resolved via database lookup
    canonicalId = ''; // Placeholder - will be filled by server
  }
  
  if (!variableId && canonicalId) {
    // Derive from canonicalId
    const parts = canonicalId.split('.');
    variableId = `${parts[0]}.${parts[1]}`;
  }
  
  // Validate variableId format if present
  if (variableId && !VARIABLE_ID_PATTERN.test(variableId)) {
    return {
      valid: false,
      error: `Response ${index + 1}: Invalid variableId format: ${variableId}`
    };
  }
  
  // Check consistency
  if (canonicalId && variableId) {
    const expectedVariableId = canonicalId.split('.').slice(0, 2).join('.');
    if (expectedVariableId !== variableId) {
      return {
        valid: false,
        error: `Response ${index + 1}: Inconsistent canonicalId (${canonicalId}) and variableId (${variableId})`
      };
    }
  }
  
  return {
    valid: true,
    validated: {
      itemId: response.itemId || '',
      canonicalId: canonicalId || '',
      variableId: variableId || '',
      value
    }
  };
}

/**
 * Validate incoming assessment response payload
 */
export function validateResponses(payload: any): ValidationResult {
  const errors: string[] = [];
  
  // Check payload structure
  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      errors: ['Invalid payload: Expected object']
    };
  }
  
  // Check responses array
  if (!Array.isArray(payload.responses)) {
    return {
      valid: false,
      errors: ['Invalid payload: responses must be an array']
    };
  }
  
  // Check count
  if (payload.responses.length !== 108) {
    errors.push(`Expected 108 responses, got ${payload.responses.length}`);
  }
  
  // Validate each response
  const validated: ValidatedResponse[] = [];
  const seenItemIds = new Set<string>();
  const seenCanonicalIds = new Set<string>();
  
  for (let i = 0; i < payload.responses.length; i++) {
    const result = validateResponse(payload.responses[i], i);
    
    if (!result.valid) {
      errors.push(result.error!);
      continue;
    }
    
    const resp = result.validated!;
    
    // Check for duplicates
    if (resp.itemId && seenItemIds.has(resp.itemId)) {
      errors.push(`Response ${i + 1}: Duplicate itemId ${resp.itemId}`);
    }
    if (resp.canonicalId && seenCanonicalIds.has(resp.canonicalId)) {
      errors.push(`Response ${i + 1}: Duplicate canonicalId ${resp.canonicalId}`);
    }
    
    if (resp.itemId) seenItemIds.add(resp.itemId);
    if (resp.canonicalId) seenCanonicalIds.add(resp.canonicalId);
    
    validated.push(resp);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    responses: validated
  };
}

/**
 * Validate legacy format (order-based or old question IDs)
 * This is for backward compatibility during transition
 */
export function isLegacyFormat(payload: any): boolean {
  if (!payload || typeof payload !== 'object' || !payload.responses) {
    return false;
  }
  
  // Check if it's the old JSON object format (key-value pairs instead of array)
  if (!Array.isArray(payload.responses) && typeof payload.responses === 'object') {
    return true; // Accept any object format as legacy
  }
  
  return false;
}
