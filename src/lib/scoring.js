/**
 * scoring.js — pure audit-scoring functions.
 * No DOM, no localStorage, no side effects: safe to import in Node for tests.
 */

export const VERDICTS = ['Compliant', 'Minor NC', 'Major NC', 'Critical', 'N/A'];

/** N/A is excluded from scoring (null weight). */
export const VERDICT_WEIGHTS = {
  Compliant: 1,
  'Minor NC': 0.75,
  'Major NC': 0.4,
  Critical: 0,
  'N/A': null,
};

/** Verdicts that automatically raise a finding. */
export const NC_VERDICTS = ['Minor NC', 'Major NC', 'Critical'];

export const CAPA_STATUSES = ['open', 'in_progress', 'verified', 'closed'];

export const CAPA_STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  verified: 'Verified',
  closed: 'Closed',
};

/**
 * Normalize responses, which may be stored either as an object map
 * { checkpointId: { verdict, note } } or as an array
 * [{ checkpointId, verdict, note }].
 */
export function normalizeResponses(responses) {
  if (!responses) return [];
  if (Array.isArray(responses)) return responses;
  return Object.entries(responses).map(([checkpointId, r]) => ({
    checkpointId,
    verdict: r?.verdict,
    note: r?.note ?? '',
  }));
}

/**
 * Compliance score = weighted mean × 100 over all scored (non-N/A) responses.
 * Returns null when nothing has been scored yet.
 */
export function computeComplianceScore(responses) {
  const scored = normalizeResponses(responses).filter(
    (r) => r && r.verdict && VERDICT_WEIGHTS[r.verdict] != null
  );
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, r) => acc + VERDICT_WEIGHTS[r.verdict], 0);
  return (sum / scored.length) * 100;
}

/** Per-verdict counts plus scored/N-A tallies for a response set. */
export function scoreBreakdown(responses) {
  const counts = { Compliant: 0, 'Minor NC': 0, 'Major NC': 0, Critical: 0, 'N/A': 0 };
  let answered = 0;
  for (const r of normalizeResponses(responses)) {
    if (r && r.verdict && r.verdict in counts) {
      counts[r.verdict] += 1;
      answered += 1;
    }
  }
  const naCount = counts['N/A'];
  const scoredCount = answered - naCount;
  return { counts, answered, scoredCount, naCount, score: computeComplianceScore(responses) };
}

export function emptyCapa() {
  return {
    rootCause: '',
    correctiveAction: '',
    owner: '',
    dueDate: '',
    verificationMethod: '',
    verificationResult: '',
    status: 'open',
  };
}

/**
 * Derive findings from any response carrying a non-conformance verdict.
 * audit: { id, responses }  template: { checkpoints: [{id, code, category, text}] }
 * Finding id is deterministic: "<auditId>:<checkpointCode>".
 */
export function deriveFindings(audit, template) {
  if (!audit || !template) return [];
  const checkpoints = new Map((template.checkpoints || []).map((c) => [c.id, c]));
  const findings = [];
  for (const r of normalizeResponses(audit.responses)) {
    if (!r || !NC_VERDICTS.includes(r.verdict)) continue;
    const cp = checkpoints.get(r.checkpointId);
    if (!cp) continue;
    findings.push({
      id: `${audit.id}:${cp.code}`,
      auditId: audit.id,
      checkpointId: cp.id,
      checkpointCode: cp.code,
      category: cp.category,
      text: cp.text,
      severity: r.verdict,
      note: r.note || '',
      capa: emptyCapa(),
    });
  }
  return findings;
}

/** Tailwind text color class for a compliance score. */
export function scoreColorClass(score) {
  if (score == null) return 'text-slate-400';
  if (score >= 85) return 'text-emerald-400';
  if (score >= 65) return 'text-amber-400';
  return 'text-red-400';
}

export const SEVERITY_ORDER = { Critical: 0, 'Major NC': 1, 'Minor NC': 2 };

export function sortFindings(findings) {
  return [...findings].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) ||
      a.id.localeCompare(b.id)
  );
}
