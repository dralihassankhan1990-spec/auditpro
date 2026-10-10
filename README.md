# AuditPro — Food-Safety Audit Management (Demo)

A demonstration web app for planning, running, scoring, and closing out food-safety audits —
from checkpoint verdicts to findings to CAPA (corrective and preventive action) closure.

> **Demonstration prototype — not a certified audit system.**
> AuditPro is a UI/UX demo. It does not certify sites, auditors, or products, and its scores
> are illustrative, not certification-grade. It is a companion demo for
> *“The Digital Audit Playbook”* by **Muhammad Bilal**.

## Quick start

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # production build into dist/
```

No backend, no API keys, no network calls, no external images. All state persists in the
browser's `localStorage` under the key `auditpro-state-v1` and is seeded on first run.
Use **Reset demo** in the header to restore the original seed.

## What's inside

| Tab | What it does |
|---|---|
| **Dashboard** | Portfolio compliance gauge (hand-rolled SVG), findings-by-severity bars, repeat-finding analysis (categories flagged in 2+ audits), site comparison bars, recent activity |
| **Audits** | Audit list with progress + scores, **Start new audit** (template + site + auditor), continue in-progress audits, review completed ones |
| **Findings** | Auto-derived register — any checkpoint scored *Minor NC* or above lands here. Severity filter + search; click a row for the CAPA panel |
| **Templates** | Read-only browser for the two seeded checklists |

**Scoring** (`src/lib/scoring.js`, pure functions, no side effects):
Compliant = 1 · Minor NC = 0.75 · Major NC = 0.4 · Critical = 0 · N/A = excluded.
Compliance score = weighted mean × 100.

**CAPA workflow** per finding: root cause → corrective action → owner → due date →
verification method → verification result, with status transitions
Open → In progress → Verified → Closed. Advancing past *Open* requires the first four
fields; *Verified*/*Closed* additionally require verification evidence.

**Guided tour:** a 5-step spotlight tour appears on first run (flag in `localStorage`,
`auditpro-tour-seen`) and is replayable anytime from the **Tour** button in the header.

## Project structure

```
auditpro/
├── index.html
├── package.json            # React 18 + Vite + Tailwind v3 + lucide-react
├── tailwind.config.js      # content: ./index.html, ./src/**/*.{js,jsx}
├── postcss.config.js
├── vite.config.js
├── README.md
├── DEMO-GUIDE.md           # 3-minute click-by-click demo script
├── TEST-REPORT.md          # verification evidence
└── src/
    ├── main.jsx
    ├── index.css           # @tailwind directives + dark ops-console base
    ├── App.jsx             # tabs, run-audit routing, state wiring
    ├── data/
    │   └── seed.js         # 2 templates (25 + 20 checkpoints), 2 audits, CAPA seed
    ├── lib/
    │   ├── scoring.js      # pure: weights, score, breakdown, deriveFindings
    │   ├── store.js        # localStorage load/save/reset + activity log
    │   └── constants.js    # honest-labelling strings
    └── components/
        ├── Header.jsx      # brand, tabs, disclaimer chip, tour/reset buttons
        ├── Tour.jsx        # 5-step spotlight overlay
        ├── Dashboard.jsx   # gauge, severity bars, repeats, site comparison, activity
        ├── Audits.jsx      # list + start-new-audit form
        ├── RunAudit.jsx    # grouped checkpoints, verdicts, notes, complete gate
        ├── Findings.jsx    # filterable register table
        ├── CapaPanel.jsx   # CAPA modal with validation + status transitions
        └── Templates.jsx   # read-only template browser
```

## Data model summary

- **Template**: `{ id, name, version, description, checkpoints[] }`
- **Checkpoint**: `{ id, code (e.g. GMP-01), category, text, guidance }`
- **Audit**: `{ id, title, site, templateId, auditor, status (in_progress|completed), createdAt, completedAt, responses: { checkpointId: { verdict, note } } }`
- **Verdicts**: `Compliant | Minor NC | Major NC | Critical | N/A`
- **Finding** (derived, deterministic id `<auditId>:<checkpointCode>`):
  `{ id, auditId, checkpointId, checkpointCode, category, text, severity, note, capa }`
- **CAPA**: `{ rootCause, correctiveAction, owner, dueDate, verificationMethod, verificationResult, status (open|in_progress|verified|closed) }`

Seeded demo data: **Internal GMP Audit** (25 checkpoints, 6 categories), **Pre-Certification
BRC-Style Checklist** (20 checkpoints, 7 categories); **AUD-2026-014** Riverside Dairy Plant
(in progress, 18/25 answered); **AUD-2026-009** Lahore Bakery Unit (completed, 4 findings:
1 Critical closed, 1 Major NC verified, 2 Minor NC in-progress/open).

## Honest-labelling policy

The disclaimer *“Demonstration prototype — not a certified audit system.”* appears in the
header, the footer, the tour, and this README. No screen claims certification authority.

## Tech stack

React 18 + Vite 5 + Tailwind CSS v3 + PostCSS · `lucide-react` icons · hand-rolled SVG gauge ·
no backend — all state persists in `localStorage`.

## Author

**Muhammad Bilal** — IT Project Coordinator (GovTech), MPhil Food Safety & Control.
