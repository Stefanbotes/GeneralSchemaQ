
// Assessment Data JSON Export System (v1.0.0)
// Studio-compatible format for schema-based assessment data export

import crypto from 'crypto';
import { 
  buildExporter, 
  convertLegacyResponses, 
  getCurrentMappingVersion,
  type ExportPayload as LasbiExportPayload 
} from './lasbi-exporter';

// JSON Export Schema Interfaces (v1.0.0 Studio-compatible format - NO DERIVED DATA)
export interface AssessmentExport {
  schemaVersion: string;
  analysisVersion: string;
  respondent: {
    id: string;
    initials: string | null;
    dobYear: number | null;
  };
  assessment: {
    assessmentId: string;
    completedAt: string;
    instrument: {
      name: string;
      form: string;
      scale: { min: number; max: number };
      items: Array<{
        id: string;
        value: number;
      }>;
    };
  };
  provenance: {
    sourceApp: string;
    sourceAppVersion: string;
    exportedAt: string;
    checksumSha256: string;
  };
}

// Note: Schema mappings and derived analytics removed per v1.0.0 spec
// v1.0.0 prohibits all derived data - only raw instrument responses allowed

// Scale configuration
const ASSESSMENT_SCALE = { min: 1, max: 6 };

// Type definitions for Studio-compatible export (v1.0.0)
type Item = { id: string; value: number };
type Scale = { min: number; max: number };

// ============================================================================
// LEGACY FALLBACK: Sequential ID to Canonical ID mapping (1-108 → d.s.q format)
// ============================================================================
// NOTE: This mapping is DEPRECATED for new exports.
// 
// As of the latest update, JSON exports read directly from lasbi_responses 
// table which stores canonical IDs natively. This mapping is maintained 
// ONLY for legacy assessments that don't have entries in lasbi_responses.
//
// NEW EXPORTS: Read from lasbi_responses → canonical IDs (no conversion)
// LEGACY ONLY: Fall back to assessment.responses → sequential IDs (needs conversion)
//
// Updated to support 108 questions (18 schemas × 6 items each)
// ============================================================================
const SEQUENTIAL_TO_CANONICAL_MAP: Record<string, string> = {
  // Domain 1: DISCONNECTION & REJECTION (5 schemas × 6 questions = 30)
  '1': '1.1.1', '2': '1.1.2', '3': '1.1.3', '4': '1.1.4', '5': '1.1.5', '6': '1.1.6',  // Abandonment
  '7': '1.2.1', '8': '1.2.2', '9': '1.2.3', '10': '1.2.4', '11': '1.2.5', '12': '1.2.6',  // Mistrust/Abuse
  '13': '1.3.1', '14': '1.3.2', '15': '1.3.3', '16': '1.3.4', '17': '1.3.5', '18': '1.3.6',  // Emotional Deprivation
  '19': '1.4.1', '20': '1.4.2', '21': '1.4.3', '22': '1.4.4', '23': '1.4.5', '24': '1.4.6', // Defectiveness
  '25': '1.5.1', '26': '1.5.2', '27': '1.5.3', '28': '1.5.4', '29': '1.5.5', '30': '1.5.6', // Social Isolation
  
  // Domain 2: IMPAIRED AUTONOMY & PERFORMANCE (4 schemas × 6 questions = 24)
  '31': '2.1.1', '32': '2.1.2', '33': '2.1.3', '34': '2.1.4', '35': '2.1.5', '36': '2.1.6', // Failure
  '37': '2.2.1', '38': '2.2.2', '39': '2.2.3', '40': '2.2.4', '41': '2.2.5', '42': '2.2.6', // Dependence
  '43': '2.3.1', '44': '2.3.2', '45': '2.3.3', '46': '2.3.4', '47': '2.3.5', '48': '2.3.6', // Vulnerability to Harm
  '49': '2.4.1', '50': '2.4.2', '51': '2.4.3', '52': '2.4.4', '53': '2.4.5', '54': '2.4.6', // Enmeshment
  
  // Domain 3: IMPAIRED LIMITS (2 schemas × 6 questions = 12)
  '55': '3.1.1', '56': '3.1.2', '57': '3.1.3', '58': '3.1.4', '59': '3.1.5', '60': '3.1.6', // Entitlement
  '61': '3.2.1', '62': '3.2.2', '63': '3.2.3', '64': '3.2.4', '65': '3.2.5', '66': '3.2.6', // Insufficient Self-Control
  
  // Domain 4: OTHER-DIRECTEDNESS (3 schemas × 6 questions = 18)
  '67': '4.1.1', '68': '4.1.2', '69': '4.1.3', '70': '4.1.4', '71': '4.1.5', '72': '4.1.6', // Subjugation
  '73': '4.2.1', '74': '4.2.2', '75': '4.2.3', '76': '4.2.4', '77': '4.2.5', '78': '4.2.6', // Self-Sacrifice
  '79': '4.3.1', '80': '4.3.2', '81': '4.3.3', '82': '4.3.4', '83': '4.3.5', '84': '4.3.6', // Approval-Seeking
  
  // Domain 5: OVERVIGILANCE & INHIBITION (4 schemas × 6 questions = 24)
  '85': '5.1.1', '86': '5.1.2', '87': '5.1.3', '88': '5.1.4', '89': '5.1.5', '90': '5.1.6', // Negativity/Pessimism
  '91': '5.2.1', '92': '5.2.2', '93': '5.2.3', '94': '5.2.4', '95': '5.2.5', '96': '5.2.6', // Emotional Inhibition
  '97': '5.3.1', '98': '5.3.2', '99': '5.3.3', '100': '5.3.4', '101': '5.3.5', '102': '5.3.6', // Unrelenting Standards
  '103': '5.4.1', '104': '5.4.2', '105': '5.4.3', '106': '5.4.4', '107': '5.4.5', '108': '5.4.6'  // Punitiveness
};

/**
 * LEGACY FALLBACK: Convert sequential question ID (1-108) to canonical schema ID (d.s.q format)
 * 
 * @deprecated This function is primarily for legacy support. New exports read
 * directly from lasbi_responses table which already stores canonical IDs.
 * 
 * @param questionId - Either sequential (1-108) or canonical (d.s.q) format
 * @returns Canonical ID in d.s.q format
 */
function convertToCanonicalId(questionId: string): string {
  // If already in canonical format (d.s.q), return as-is
  if (/^\d+\.\d+\.\d+$/.test(questionId)) {
    return questionId;
  }
  
  // Map sequential ID to canonical (legacy fallback)
  return SEQUENTIAL_TO_CANONICAL_MAP[questionId] || questionId;
}

// Instrument structure for normalization
type Instrument = {
  name: string;
  form?: "short" | "long";
  scale: { min: number; max: number };
  items: { id: string; value: number }[];
};

// Instrument normalizer (handles "LASBI-Short" → name: "LASBI", form: "short")
export function normaliseInstrument(i: Instrument): Instrument {
  const m = /^LASBI-(Short|Long)$/i.exec(i.name);
  if (m) {
    return { ...i, name: "LASBI", form: m[1].toLowerCase() as "short"|"long" };
  }
  return i; // already in spec
}

// Validation errors interface
export interface ValidationError {
  error: string;
  details: string[];
}

// Note: Scoring functions removed - v1.0.0 prohibits derived analytics

// Canonical JSON generation (per v1.0.0 spec)
function stableStringify(obj: any): string {
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  if (obj && typeof obj === "object") {
    return `{${Object.keys(obj).sort().map(k => 
      JSON.stringify(k)+":"+stableStringify(obj[k])
    ).join(",")}}`;
  }
  return JSON.stringify(obj);
}

// Calculate SHA-256 checksum (per v1.0.0 spec)
export function computeChecksumSha256(payload: unknown): string {
  const canon = stableStringify(payload);
  return crypto.createHash("sha256").update(canon, "utf8").digest("hex");
}

// Generate pseudonymous client and assessment IDs
function generatePseudonymousId(input: string, prefix: string = ''): string {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return `${prefix}${hash.substring(0, 8)}`;
}

// Sanitize filename - remove unsafe characters
function sanitizeFilename(input: string): string {
  return input.replace(/[^A-Za-z0-9_\-\.]/g, '');
}

// Generate Studio-compatible filename
export function generateExportFilename(
  userId: string,
  assessmentId: string,
  completedAt: string
): string {
  const clientId = generatePseudonymousId(userId, 'client-');
  const assessId = generatePseudonymousId(assessmentId, 'assessment-');
  const timestamp = completedAt.replace(/:/g, '-').replace(/\..+Z$/, 'Z');
  
  const filename = `${clientId}_${assessId}_${timestamp}_v1.0.0.json`;
  
  // Ensure under 120 chars and safe characters only
  const sanitized = sanitizeFilename(filename);
  const finalFilename = sanitized.length > 120 ? sanitized.substring(0, 116) + '.json' : sanitized;
  
  console.log('🔄 Generated pseudonymous filename:', finalFilename);
  return finalFilename;
}

// v1.0.0 Validation function (strict schema compliance - NO DERIVED DATA)
export function validateAssessmentExport(exportData: AssessmentExport): ValidationError | null {
  const errors: string[] = [];
  
  // Guard rails: NO DERIVED DATA ALLOWED
  if ('scores' in (exportData.assessment as any)) {
    errors.push("CRITICAL: assessment.scores is prohibited in v1.0.0 - no derived data allowed");
  }
  
  // Required fields validation
  if (exportData.schemaVersion !== "1.0.0") {
    errors.push(`schemaVersion must be "1.0.0", received "${exportData.schemaVersion}"`);
  }
  
  if (!exportData.analysisVersion?.match(/^\d{4}\.\d{2}$/)) {
    errors.push(`analysisVersion must match YYYY.MM format, received "${exportData.analysisVersion}"`);
  }
  
  // Respondent validation (strict v1.0.0)
  if (!exportData.respondent?.id) {
    errors.push("respondent.id is required");
  }
  
  if (exportData.respondent?.id && exportData.respondent.id.length < 1) {
    errors.push("respondent.id must have minimum length of 1");
  }
  
  if (!('initials' in exportData.respondent)) {
    errors.push("respondent.initials is required (can be null)");
  }
  
  if (!('dobYear' in exportData.respondent)) {
    errors.push("respondent.dobYear is required (can be null)");
  }
  
  // Check for prohibited fields in respondent
  const allowedRespondentFields = ['id', 'initials', 'dobYear'];
  Object.keys(exportData.respondent).forEach(key => {
    if (!allowedRespondentFields.includes(key)) {
      errors.push(`respondent.${key} is not allowed in v1.0.0 schema`);
    }
  });
  
  // Assessment validation
  if (!exportData.assessment?.assessmentId) {
    errors.push("assessment.assessmentId is required");
  }
  
  if (!exportData.assessment?.completedAt) {
    errors.push("assessment.completedAt is required");
  }
  
  // Instrument validation (strict v1.0.0)
  if (!exportData.assessment?.instrument?.name) {
    errors.push("assessment.instrument.name is required");
  }
  
  if (exportData.assessment?.instrument?.name !== "LASBI") {
    errors.push(`assessment.instrument.name must be "LASBI", received "${exportData.assessment?.instrument?.name}"`);
  }
  
  if (!exportData.assessment?.instrument?.form) {
    errors.push("assessment.instrument.form is required");
  }
  
  if (exportData.assessment?.instrument?.form && !["short", "long"].includes(exportData.assessment.instrument.form)) {
    errors.push(`assessment.instrument.form must be "short" or "long", received "${exportData.assessment.instrument.form}"`);
  }
  
  // Scale validation
  const scale = exportData.assessment?.instrument?.scale;
  if (!scale) {
    errors.push("assessment.instrument.scale is required");
  } else {
    if (scale.min !== 1) {
      errors.push(`scale.min must be 1, received ${scale.min}`);
    }
    if (scale.max !== 6) {
      errors.push(`scale.max must be 6, received ${scale.max}`);
    }
  }
  
  // Items validation
  if (!exportData.assessment?.instrument?.items || exportData.assessment.instrument.items.length < 1) {
    errors.push("assessment.instrument.items must contain at least 1 item");
  }
  
  exportData.assessment?.instrument?.items?.forEach((item, index) => {
    if (!item.id) {
      errors.push(`items[${index}].id is required`);
    }
    
    if (typeof item.value !== 'number') {
      errors.push(`items[${index}].value must be a number, received ${typeof item.value}`);
    }
    
    if (scale && (item.value < scale.min || item.value > scale.max)) {
      errors.push(`items[${index}].value=${item.value} exceeds declared scale {min:${scale.min},max:${scale.max}}`);
    }
    
    // Check for prohibited fields in items
    const allowedItemFields = ['id', 'value'];
    Object.keys(item).forEach(key => {
      if (!allowedItemFields.includes(key)) {
        errors.push(`items[${index}].${key} is not allowed in v1.0.0 schema`);
      }
    });
  });
  
  // Provenance validation
  if (!exportData.provenance?.sourceApp) {
    errors.push("provenance.sourceApp is required");
  }
  
  if (!exportData.provenance?.sourceAppVersion) {
    errors.push("provenance.sourceAppVersion is required");
  }
  
  if (!exportData.provenance?.exportedAt) {
    errors.push("provenance.exportedAt is required");
  }
  
  if (!exportData.provenance?.checksumSha256) {
    errors.push("provenance.checksumSha256 is required");
  }
  
  if (exportData.provenance?.checksumSha256 && !/^[a-f0-9]{64}$/.test(exportData.provenance.checksumSha256)) {
    errors.push("provenance.checksumSha256 must be 64 hex characters");
  }
  
  // Validate ISO 8601 dates (NO milliseconds allowed)
  try {
    if (exportData.assessment?.completedAt) {
      const completedAtDate = new Date(exportData.assessment.completedAt);
      if (exportData.assessment.completedAt.includes('.')) {
        errors.push("completedAt must not include milliseconds (use format: 2025-09-10T14:26:12Z)");
      }
    }
    if (exportData.provenance?.exportedAt) {
      const exportedAtDate = new Date(exportData.provenance.exportedAt);
      if (exportData.provenance.exportedAt.includes('.')) {
        errors.push("exportedAt must not include milliseconds (use format: 2025-09-10T14:26:12Z)");
      }
    }
  } catch (e) {
    errors.push("Invalid ISO 8601 date format in timestamps");
  }
  
  // Time sanity check
  if (exportData.assessment?.completedAt && exportData.provenance?.exportedAt) {
    const completedAt = new Date(exportData.assessment.completedAt);
    const exportedAt = new Date(exportData.provenance.exportedAt);
    if (completedAt > exportedAt) {
      errors.push("completedAt must be <= exportedAt");
    }
  }
  
  // PII guard - check for any unsafe patterns
  const exportStr = JSON.stringify(exportData);
  if (exportStr.includes('@') && exportStr.includes('.')) {
    errors.push("Export may contain email addresses (PII violation)");
  }
  
  return errors.length > 0 ? { error: "ValidationFailed", details: errors.slice(0, 10) } : null;
}

// Main export function - v1.0.0 Studio compatible (NO DERIVED DATA)
export function generateAssessmentExport(
  responses: Record<string, any>,
  participantData: any,
  assessmentId: string,
  userId: string
): AssessmentExport {
  
  console.log('🔄 Starting v1.0.0 JSON export generation (NO DERIVED DATA)...');
  console.log('🔄 Raw responses keys:', Object.keys(responses).slice(0, 10));
  console.log('🔄 Sample response:', responses[Object.keys(responses)[0]]);
  
  // Detect if responses are already in canonical format or need conversion
  const firstKey = Object.keys(responses)[0];
  const isCanonicalFormat = /^\d+\.\d+\.\d+$/.test(firstKey);
  
  console.log('🔍 Response format detected:', {
    firstKey,
    isCanonical: isCanonicalFormat,
    strategy: isCanonicalFormat ? 'Direct use (canonical)' : 'Convert from sequential'
  });
  
  // Convert responses to items array (v1.0.0: only id and value, NO timestamps)
  const items: Item[] = Object.entries(responses).map(([questionId, responseData]) => {
    // If already canonical, use directly; otherwise convert
    const canonicalId = isCanonicalFormat ? questionId : convertToCanonicalId(questionId);
    
    return {
      id: canonicalId,
      value: typeof responseData === 'object' && responseData.value 
        ? Number(responseData.value)
        : Number(responseData)
    };
  });
  
  console.log('🔄 Converted to items:', items.length);
  console.log('🔄 Sample items with canonical IDs:', items.slice(0, 3));
  
  if (!isCanonicalFormat) {
    console.log('🔄 [Legacy mode] ID conversion examples:', {
      '1': convertToCanonicalId('1'),
      '27': convertToCanonicalId('27'),
      '54': convertToCanonicalId('54')
    });
  } else {
    console.log('✅ [Canonical mode] IDs used directly from lasbi_responses table');
  }
  
  // Generate pseudonymous IDs
  const respondentId = generatePseudonymousId(userId);
  const assessId = generatePseudonymousId(assessmentId);
  
  // Get current date for analysis version
  const now = new Date();
  const analysisVersion = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Format timestamps (NO milliseconds per v1.0.0 spec)
  const completedAt = participantData.assessmentDate 
    ? new Date(participantData.assessmentDate).toISOString().replace(/\.\d{3}Z$/, 'Z')
    : new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const exportedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  
  // Create base instrument
  const baseInstrument: Instrument = {
    name: "LASBI-Short", // Will be normalized
    scale: ASSESSMENT_SCALE,
    items
  };
  
  // Normalize instrument (splits "LASBI-Short" → name: "LASBI", form: "short")
  const normalizedInstrument = normaliseInstrument(baseInstrument);
  
  // Build export object (without checksum first) - v1.0.0 STRICT COMPLIANCE
  const exportObj: Omit<AssessmentExport, 'provenance'> & { 
    provenance: Omit<AssessmentExport['provenance'], 'checksumSha256'> 
  } = {
    schemaVersion: "1.0.0",
    analysisVersion,
    respondent: {
      id: respondentId,
      initials: participantData.name ? 
        participantData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 3) : null,
      dobYear: null
      // NOTE: No 'labels' field - removed per v1.0.0 spec
    },
    assessment: {
      assessmentId: assessId,
      completedAt,
      instrument: {
        name: normalizedInstrument.name, // "LASBI"
        form: normalizedInstrument.form || "short", // "short" | "long"
        scale: normalizedInstrument.scale,
        items: normalizedInstrument.items
      }
      // NOTE: No 'scores' field - removed per v1.0.0 spec (NO DERIVED DATA)
    },
    provenance: {
      sourceApp: "Inner PersonaAssessment Portal",
      sourceAppVersion: "3.2.1",
      exportedAt
    }
  };
  
  console.log('✅ Export object created (v1.0.0) with', items.length, 'items');
  console.log('✅ Instrument normalized:', {
    name: normalizedInstrument.name,
    form: normalizedInstrument.form
  });
  console.log('✅ NO DERIVED DATA - strict compliance');
  
  // Generate canonical JSON and calculate checksum (per v1.0.0 spec)
  const checksum = computeChecksumSha256(exportObj);
  
  // Add checksum to complete the object
  const finalExport: AssessmentExport = {
    ...exportObj,
    provenance: {
      ...exportObj.provenance,
      checksumSha256: checksum
    }
  };
  
  console.log('✅ v1.0.0 Export completed with SHA-256:', checksum.substring(0, 16) + '...');
  
  return finalExport;
}

// ============================================================================
// NEW SURGICAL EXPORTER (LASBI v1.3.0 Format)
// ============================================================================

/**
 * Generate assessment export using the new surgical exporter format
 * This produces itemId + canonicalId + value format per LASBI v1.3.0 spec
 * 
 * Use this for new exports or when Studio-compatible format with 
 * modern LASBI IDs is required.
 * 
 * Scale: 1-6 (6-point Likert scale)
 */
export async function generateAssessmentExportV2(
  responses: Record<string, any>,
  participantData: any,
  assessmentId: string,
  userId: string
): Promise<LasbiExportPayload> {
  
  console.log('🔄 Starting LASBI v1.3.0 surgical export generation...');
  console.log('🔄 Response count:', Object.keys(responses).length);
  
  // Convert legacy response format to UIAnswer format
  const uiAnswers = convertLegacyResponses(responses);
  
  console.log('✅ Converted to UIAnswer format:', uiAnswers.length, 'items');
  
  // Get current mapping version
  const mappingVersion = getCurrentMappingVersion();
  
  console.log('✅ Using mapping version:', mappingVersion);
  
  // Build export using surgical exporter
  const exportPayload = await buildExporter({
    answers: uiAnswers,
    mappingVersion,
    schemaVersion: "1.0.0"
  });
  
  console.log('✅ Surgical export generated successfully');
  console.log('🔍 Export summary:', {
    instrument: exportPayload.instrument.name,
    schemaVersion: exportPayload.instrument.schemaVersion,
    mappingVersion: exportPayload.mappingVersion,
    responseCount: exportPayload.responses.length,
    sampleResponse: exportPayload.responses[0]
  });
  
  return exportPayload;
}

/**
 * Validate surgical export payload
 */
export function validateSurgicalExport(payload: LasbiExportPayload): ValidationError | null {
  const errors: string[] = [];
  
  // Validate instrument
  if (!payload.instrument) {
    errors.push("instrument is required");
  } else {
    if (payload.instrument.name !== "LASBI") {
      errors.push(`instrument.name must be "LASBI", received "${payload.instrument.name}"`);
    }
    if (!payload.instrument.schemaVersion) {
      errors.push("instrument.schemaVersion is required");
    }
  }
  
  // Validate mapping version
  if (!payload.mappingVersion) {
    errors.push("mappingVersion is required");
  } else if (!/^lasbi-v\d+\.\d+\.\d+$/.test(payload.mappingVersion)) {
    errors.push(`mappingVersion must match format "lasbi-v1.3.0", received "${payload.mappingVersion}"`);
  }
  
  // Validate responses
  if (!payload.responses || !Array.isArray(payload.responses)) {
    errors.push("responses must be an array");
  } else {
    if (payload.responses.length !== 108) {
      errors.push(`responses must contain exactly 108 items, received ${payload.responses.length}`);
    }
    
    // Validate each response item
    payload.responses.forEach((item, idx) => {
      if (!item.itemId) {
        errors.push(`responses[${idx}].itemId is required`);
      } else if (!/^cmf[a-z0-9]{20,}$/i.test(item.itemId)) {
        errors.push(`responses[${idx}].itemId must match format "cmf...", received "${item.itemId}"`);
      }
      
      if (!item.canonicalId) {
        errors.push(`responses[${idx}].canonicalId is required`);
      } else if (!/^\d+\.\d+\.\d+$/.test(item.canonicalId)) {
        errors.push(`responses[${idx}].canonicalId must match format "d.s.q", received "${item.canonicalId}"`);
      }
      
      if (typeof item.value !== 'number') {
        errors.push(`responses[${idx}].value must be a number, received ${typeof item.value}`);
      } else if (item.value < 1 || item.value > 6) {
        errors.push(`responses[${idx}].value must be between 1 and 6, received ${item.value}`);
      }
      
      if (typeof item.index !== 'number') {
        errors.push(`responses[${idx}].index must be a number, received ${typeof item.index}`);
      }
    });
    
    // Check for duplicates
    const itemIds = new Set(payload.responses.map(r => r.itemId));
    if (itemIds.size !== payload.responses.length) {
      errors.push("Duplicate itemIds found in responses");
    }
    
    const canonicalIds = new Set(payload.responses.map(r => r.canonicalId));
    if (canonicalIds.size !== payload.responses.length) {
      errors.push("Duplicate canonicalIds found in responses");
    }
  }
  
  return errors.length > 0 ? { error: "ValidationFailed", details: errors.slice(0, 10) } : null;
}
