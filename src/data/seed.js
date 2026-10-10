/**
 * seed.js — demo content for AuditPro.
 * Two templates (25 + 20 checkpoints), two seeded audits, and CAPA data for
 * the completed audit's findings. Used both by the app and by the Node smoke test.
 */
import { deriveFindings } from '../lib/scoring.js';

function cp(id, code, category, text, guidance) {
  return { id, code, category, text, guidance };
}

function resp(verdict, note = '') {
  return { verdict, note };
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export const templates = [
  {
    id: 'gmp-internal',
    name: 'Internal GMP Audit',
    version: 'v3.2',
    description:
      'Good Manufacturing Practice internal audit — the routine self-check every food site should run before any certification body walks in.',
    checkpoints: [
      // Personnel Hygiene
      cp('gmp-01', 'GMP-01', 'Personnel Hygiene', 'Hand-washing facilities are available, accessible and used correctly.', 'Check stations are stocked, water is warm, and staff wash on entry and after breaks.'),
      cp('gmp-02', 'GMP-02', 'Personnel Hygiene', 'Protective clothing is worn correctly and changed when contaminated.', 'Look for dedicated production clothing, correct wearing (fastened, sleeves down), and spares available.'),
      cp('gmp-03', 'GMP-03', 'Personnel Hygiene', 'No jewellery, watches or personal items in production areas.', 'Wedding bands without stones may be permitted by policy — check the written rule and compliance.'),
      cp('gmp-04', 'GMP-04', 'Personnel Hygiene', 'Staff are trained in hygiene requirements and training records are current.', 'Sample records including temporary staff. Everyone handling exposed product must have a hygiene briefing on file.'),
      cp('gmp-05', 'GMP-05', 'Personnel Hygiene', 'Health screening / fitness-to-work policy is enforced.', 'Check return-to-work questionnaires and exclusion rules for gastrointestinal illness and infected wounds.'),
      // Premises & Equipment
      cp('gmp-06', 'GMP-06', 'Premises & Equipment', 'Floors, walls and ceilings are in good repair and easy to clean.', 'Walk the floor: flaking paint, cracked tiles and standing water are classic minors — or worse.'),
      cp('gmp-07', 'GMP-07', 'Premises & Equipment', 'Lighting is adequate and glass/plastic shatter protection is in place.', 'Check light covers over exposed product and the glass-breakage register.'),
      cp('gmp-08', 'GMP-08', 'Premises & Equipment', 'Equipment is food-contact suitable, clean and calibrated as required.', 'Sample calibration stickers against the calibration schedule; check measuring equipment first.'),
      cp('gmp-09', 'GMP-09', 'Premises & Equipment', 'Changing rooms and toilets are segregated from production.', 'Verify airflow and doors do not open directly onto high-care areas.'),
      cp('gmp-10', 'GMP-10', 'Premises & Equipment', 'Waste is collected, stored and removed without cross-contamination risk.', 'External waste areas should be lidded, bunded where needed, and away from intake points.'),
      // Sanitation
      cp('gmp-11', 'GMP-11', 'Sanitation', 'A master sanitation schedule covers all areas and is signed off.', 'Every area, every frequency, every shift — with sign-off evidence. Missing signatures are the most common minor.'),
      cp('gmp-12', 'GMP-12', 'Sanitation', 'Cleaning chemicals are approved, labelled and stored securely.', 'Check dilution stations, COSHH-style data sheets and locked storage away from product.'),
      cp('gmp-13', 'GMP-13', 'Sanitation', 'Cleaning validation and verification records are available.', 'Look for visual checks plus ATP or micro verification — validation says the method works, verification says it worked today.'),
      cp('gmp-14', 'GMP-14', 'Sanitation', 'Allergen changeover cleaning is performed and documented.', 'Review changeover records against the production plan; undeclared allergen is a recall trigger.'),
      cp('gmp-15', 'GMP-15', 'Sanitation', 'Utensils and cleaning tools are color-coded and in good condition.', 'Check for worn brush heads and tools stored off the floor in designated shadow boards.'),
      // Pest Control
      cp('gmp-16', 'GMP-16', 'Pest Control', 'A pest management program is in place with a licensed contractor.', 'Review the contract, service reports and trend analysis of pest activity.'),
      cp('gmp-17', 'GMP-17', 'Pest Control', 'Insectocutors and bait stations are mapped, monitored and records kept.', 'Walk a sample of stations against the map; check for gaps in monitoring dates.'),
      cp('gmp-18', 'GMP-18', 'Pest Control', 'Proofing measures are effective: doors, screens and gaps controlled.', 'Look for gaps under dock doors, missing screens and open windows near production.'),
      // Storage & Handling
      cp('gmp-19', 'GMP-19', 'Storage & Handling', 'Raw materials are stored off the floor, away from walls, with FIFO/FEFO applied.', 'The 45 cm rule of thumb: pallets off the floor and away from walls for cleaning and pest inspection.'),
      cp('gmp-20', 'GMP-20', 'Storage & Handling', 'Temperature-controlled storage is monitored and alarmed.', 'Check logger records, alarm tests and corrective action for any excursion.'),
      cp('gmp-21', 'GMP-21', 'Storage & Handling', 'Non-conforming / rejected stock is segregated and clearly labelled.', 'Hold stock must be physically separated and identified — "quarantine" tape alone is not control.'),
      cp('gmp-22', 'GMP-22', 'Storage & Handling', 'Loading and unloading docks protect product from contamination.', 'Check dock seals, vehicle inspection records and weather protection.'),
      // Documentation
      cp('gmp-23', 'GMP-23', 'Documentation', 'Batch / production records are complete and traceable.', 'Trace one batch forward and one backward; time it — that is your recall readiness test.'),
      cp('gmp-24', 'GMP-24', 'Documentation', 'Corrective action records are retained and reviewed by management.', 'Check the CAPA log for overdue actions and evidence that management actually reviews it.'),
      cp('gmp-25', 'GMP-25', 'Documentation', 'The internal audit schedule is followed and reports are filed.', 'The schedule should cover the whole system annually; check last year actually happened.'),
    ],
  },
  {
    id: 'brc-style',
    name: 'Pre-Certification BRC-Style Checklist',
    version: 'v1.4',
    description:
      'Readiness review modelled on the structure of GFSI-benchmarked certification standards — for sites preparing for a third-party audit.',
    checkpoints: [
      // Senior Management Commitment
      cp('brc-01', 'BRC-01', 'Senior Management Commitment', 'Senior management demonstrates commitment; a food safety and quality policy is signed and communicated.', 'Ask operators what the policy says — a signed poster nobody has read is a finding.'),
      cp('brc-02', 'BRC-02', 'Senior Management Commitment', 'Management review meetings are held with minutes and tracked actions.', 'Minutes should show decisions and resourcing, not just attendance.'),
      cp('brc-03', 'BRC-03', 'Senior Management Commitment', 'Adequate resources are allocated for food safety and quality.', 'Vacant QA roles for months or a frozen training budget tell the real story.'),
      // Food Safety Plan (HACCP)
      cp('brc-04', 'BRC-04', 'Food Safety Plan (HACCP)', 'The HACCP plan covers all products and processes and follows Codex principles.', 'Check scope matches what the site actually makes today, including seasonal products.'),
      cp('brc-05', 'BRC-05', 'Food Safety Plan (HACCP)', 'Hazard analysis is documented with a risk assessment for each hazard.', 'Challenge one hazard: is the severity × likelihood reasoning written down and current?'),
      cp('brc-06', 'BRC-06', 'Food Safety Plan (HACCP)', 'CCPs are identified with validated critical limits.', 'Critical limits need a scientific basis on file — "we have always done it this way" is not validation.'),
      cp('brc-07', 'BRC-07', 'Food Safety Plan (HACCP)', 'CCP monitoring records are complete and deviations are acted upon.', 'Sample recent records; any deviation must show product disposition and corrective action.'),
      // Quality Management System
      cp('brc-08', 'BRC-08', 'Quality Management System', 'Document control procedure is followed; current versions are in use.', 'Pull a procedure from the shop floor and check the version against the master list.'),
      cp('brc-09', 'BRC-09', 'Quality Management System', 'The internal audit programme covers all clauses annually.', 'The programme must be risk-based and actually completed — not just planned.'),
      cp('brc-10', 'BRC-10', 'Quality Management System', 'Corrective action and root-cause processes are effective.', 'Pick three closed CAPAs and test whether the fix held — recurrence means the process failed.'),
      // Site Standards
      cp('brc-11', 'BRC-11', 'Site Standards', 'The site is secure and the building fabric meets the standard.', 'Check perimeter, visitor controls and the condition of high-care boundaries.'),
      cp('brc-12', 'BRC-12', 'Site Standards', 'Utilities (water, air, steam) meet potable / food-grade specifications.', 'Review water testing results and boiler treatment chemical approvals.'),
      cp('brc-13', 'BRC-13', 'Site Standards', 'The maintenance programme is planned and hygiene risks are controlled.', 'Engineering work in food areas needs hygiene clearance — check the permit system.'),
      // Product Control
      cp('brc-14', 'BRC-14', 'Product Control', 'Product specifications and supplier approval are in place.', 'Sample a high-risk raw material: spec, approval questionnaire and recent COA.'),
      cp('brc-15', 'BRC-15', 'Product Control', 'Traceability is tested; a mass-balance recall exercise completes within 4 hours.', 'Run the exercise live if time allows — paperwork traceability often collapses under pressure.'),
      cp('brc-16', 'BRC-16', 'Product Control', 'Allergen management and labelling controls are verified.', 'Check label verification at start-up and allergen segregation in storage and rework.'),
      // Process Control
      cp('brc-17', 'BRC-17', 'Process Control', 'Process parameters are monitored and key controls are validated.', 'Validation records should prove the process delivers safe product, not just that it ran.'),
      cp('brc-18', 'BRC-18', 'Process Control', 'Foreign-body controls (sieves, magnets, metal detection) are verified.', 'Check test-piece challenges, reject-bin checks and what happens after a reject.'),
      // Personnel
      cp('brc-19', 'BRC-19', 'Personnel', 'The training matrix is complete and competency is assessed.', 'Training without competency assessment is attendance, not capability.'),
      cp('brc-20', 'BRC-20', 'Personnel', 'Personal hygiene and medical screening controls are enforced.', 'Cross-check with GMP findings — personnel issues usually repeat across audits.'),
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Seeded audits                                                       */
/* ------------------------------------------------------------------ */

const lahoreResponses = {};
for (const c of templates[0].checkpoints) lahoreResponses[c.id] = resp('Compliant');
Object.assign(lahoreResponses, {
  'gmp-01': resp('Compliant', 'Hand-wash stations stocked; correct technique observed.'),
  'gmp-04': resp('Critical', 'Untrained temporary staff handling exposed product without a hygiene briefing.'),
  'gmp-08': resp('Compliant', 'Oven temperature probes calibrated; certs on file.'),
  'gmp-13': resp('Major NC', 'ATP swabs on filler heads exceeded limits in 3 of 12 samples; cleaning verification incomplete.'),
  'gmp-17': resp('Minor NC', 'Two bait stations on east wall unmapped; monitoring records gap of two weeks.'),
  'gmp-19': resp('Minor NC', 'Pallets within 30 cm of wall in RM store; FEFO not applied to two lots.'),
  'gmp-23': resp('Compliant', 'Batch trace exercise completed in 2 h 40 min.'),
});

const riversideResponses = {
  'gmp-01': resp('Compliant', 'Hand-wash stations stocked; correct technique observed.'),
  'gmp-02': resp('Compliant'),
  'gmp-03': resp('Compliant'),
  'gmp-04': resp('Minor NC', 'Two packers observed without hairnets; corrected on the spot.'),
  'gmp-05': resp('Compliant'),
  'gmp-06': resp('Compliant'),
  'gmp-07': resp('Compliant'),
  'gmp-08': resp('Compliant', 'Filler calibration valid until 2026-11-01.'),
  'gmp-09': resp('Compliant'),
  'gmp-10': resp('Compliant'),
  'gmp-11': resp('Minor NC', 'Night-shift CIP sign-offs missing for 2026-10-02 and 2026-10-03.'),
  'gmp-12': resp('Compliant'),
  'gmp-13': resp('Compliant'),
  'gmp-14': resp('Compliant'),
  'gmp-15': resp('Compliant'),
  'gmp-16': resp('Compliant'),
  'gmp-17': resp('Compliant'),
  'gmp-24': resp('Compliant', 'Last CAPA review meeting held 2026-09-25.'),
};

export const seedAudits = [
  {
    id: 'AUD-2026-014',
    title: 'Riverside Dairy Plant — Internal GMP Audit',
    site: 'Riverside Dairy Plant',
    templateId: 'gmp-internal',
    auditor: 'M. Bilal',
    status: 'in_progress',
    createdAt: '2026-10-08T09:12:00',
    completedAt: null,
    responses: riversideResponses,
  },
  {
    id: 'AUD-2026-009',
    title: 'Lahore Bakery Unit — Internal GMP Audit',
    site: 'Lahore Bakery Unit',
    templateId: 'gmp-internal',
    auditor: 'M. Bilal',
    status: 'completed',
    createdAt: '2026-09-17T09:00:00',
    completedAt: '2026-09-18T16:40:00',
    responses: lahoreResponses,
  },
];

/* Seeded CAPA records, keyed "<auditId>|<checkpointCode>". */
const seedCapaByKey = {
  'AUD-2026-009|GMP-04': {
    rootCause: 'Temp-agency induction skipped during shift-change overlap; no gate check before line entry.',
    correctiveAction: 'Mandatory hygiene induction checklist for all temporary staff; supervisor sign-off required before line entry.',
    owner: 'QA Manager',
    dueDate: '2026-09-25',
    verificationMethod: 'Follow-up floor audit plus induction records review',
    verificationResult: 'Zero untrained staff observed on 2026-09-28; all temp records complete. Effective.',
    status: 'closed',
  },
  'AUD-2026-009|GMP-13': {
    rootCause: 'CIP cycle time was reduced during a high-throughput week without revalidation.',
    correctiveAction: 'Filler heads re-cleaned and re-validated; sanitation supervisor retrained on change control.',
    owner: 'Sanitation Lead',
    dueDate: '2026-10-05',
    verificationMethod: 'ATP retest (n=12) plus cleaning verification records',
    verificationResult: 'All 12 ATP swabs within limits; verification records complete. Effective.',
    status: 'verified',
  },
  'AUD-2026-009|GMP-17': {
    rootCause: 'Pest contractor route map was not updated after the east-wall extension.',
    correctiveAction: 'Map updated; two additional bait stations installed and logged in the monitoring schedule.',
    owner: 'Facilities Coordinator',
    dueDate: '2026-10-18',
    verificationMethod: '',
    verificationResult: '',
    status: 'in_progress',
  },
  'AUD-2026-009|GMP-19': {
    rootCause: '',
    correctiveAction: '',
    owner: '',
    dueDate: '',
    verificationMethod: '',
    verificationResult: '',
    status: 'open',
  },
};

export const seedActivity = [
  { id: 'act-seed-1', ts: '2026-09-17T09:00:00', text: 'Audit AUD-2026-009 started by M. Bilal — Lahore Bakery Unit.' },
  { id: 'act-seed-2', ts: '2026-09-18T16:40:00', text: 'Audit AUD-2026-009 completed — 4 findings raised (1 Critical, 1 Major NC, 2 Minor NC).' },
  { id: 'act-seed-3', ts: '2026-09-28T10:15:00', text: 'Finding AUD-2026-009:GMP-04 (Critical) CAPA verified — marked closed.' },
  { id: 'act-seed-4', ts: '2026-10-05T14:02:00', text: 'Finding AUD-2026-009:GMP-13 (Major NC) CAPA verified.' },
  { id: 'act-seed-5', ts: '2026-10-08T09:12:00', text: 'Audit AUD-2026-014 started by M. Bilal — Riverside Dairy Plant.' },
];

/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */

/** Seed findings with CAPA records attached (deterministic ids). */
export function buildSeedFindings(audits = seedAudits, tmpls = templates) {
  const out = [];
  for (const audit of audits) {
    const template = tmpls.find((t) => t.id === audit.templateId);
    for (const f of deriveFindings(audit, template)) {
      const key = `${f.auditId}|${f.checkpointCode}`;
      out.push(seedCapaByKey[key] ? { ...f, capa: { ...seedCapaByKey[key] } } : f);
    }
  }
  return out;
}

/** Initial localStorage state, seeded on first run. */
export function buildSeedState() {
  const capaByFinding = {};
  for (const f of buildSeedFindings()) {
    capaByFinding[f.id] = { ...f.capa };
  }
  return {
    audits: seedAudits.map((a) => ({ ...a, responses: { ...a.responses } })),
    capaByFinding,
    activity: [...seedActivity],
    nextAuditNum: 15,
  };
}
