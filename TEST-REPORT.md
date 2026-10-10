# AuditPro — Test Report

Date: 2026-10-10 · Environment: Linux VM, Node v24.20.0, npm 10.9.4

## 1. `npm install` — PASS

`npm install` completed with exit 0: **130 packages added**, no errors.
(React 18.3.1, react-dom 18.3.1, lucide-react 0.454.x, vite 5.4.x,
@vitejs/plugin-react 4.3.x, tailwindcss 3.4.x, postcss 8.4.x, autoprefixer 10.4.x.)

## 2. `npm run build` — PASS

`vite build` completed with exit 0, no errors or warnings:

```
dist/index.html                   0.43 kB │ gzip:  0.30 kB
dist/assets/index-D1eLxoqF.css   24.42 kB │ gzip:  5.07 kB
dist/assets/index-DLGde5YS.js   206.21 kB │ gzip: 63.72 kB
✓ built in 42.84s
```

## 3. Dev server + HTTP check — PASS

Started `npm run dev` (port 5173) in the background, then:

```
curl http://localhost:5173/ → HTTP 200
<title>AuditPro — Food-Safety Audit Management (Demo)</title>   ✓ present
src="/src/main.jsx" module script                                ✓ present (1×)
```

Server was stopped after the check.

## 4. Node smoke test — ALL 33 ASSERTIONS PASS

Script: `/tmp/auditpro-smoke.mjs` — imports the real `src/lib/scoring.js` and
`src/data/seed.js` modules in plain Node (both are side-effect free).

**(c) Verdict weights**
- weights match spec `{Compliant:1, Minor NC:0.75, Major NC:0.4, Critical:0, N/A:null}` ✓
- non-null weights sum to 2.15 ✓

**(a) Compliance-score math**
- Sample `[Compliant, Compliant, Minor NC, Major NC, Critical, N/A]` → **63.0**
  (weights 1+1+0.75+0.4+0 = 3.15 ÷ 5 scored × 100) ✓
- Empty response set → `null` ✓
- All-N/A response set → `null` ✓
- `scoreBreakdown` counts per verdict correct; `scoredCount` excludes N/A ✓

**Seed shape**
- GMP template: 25 checkpoints, 6 categories, unique codes ✓
- BRC-style template: 20 checkpoints, 7 categories ✓
- AUD-2026-014 Riverside: 18/25 answered, `in_progress`, auditor “M. Bilal” ✓
- AUD-2026-009 Lahore: `completed`, auditor “M. Bilal” ✓

**(b) Findings derivation**
- Lahore derives exactly **4 findings** ✓
- Severities: 1 Critical (GMP-04), 1 Major NC (GMP-13), 2 Minor NC (GMP-17, GMP-19) ✓
- Finding ids deterministic (`<auditId>:<checkpointCode>`) ✓
- Seeded CAPA stages: GMP-04 **closed**, GMP-13 **verified**, GMP-17 **in_progress**, GMP-19 **open** ✓
- Riverside derives 2 findings (both Minor NC), default CAPA `open` ✓

**Seed state**
- `buildSeedState()`: 2 audits, CAPA map covering all 6 findings, 5 activity entries ✓

Full output: `ALL SMOKE TESTS PASSED`, exit code 0.

## 5. No external network calls — PASS

- `grep` over `dist/` (js/css/html, excluding `.map`) for `http://`/`https://`:
  only XML namespace identifiers (`w3.org/...`, inert strings in lucide-react SVGs)
  and React's static error-decoder URL (used only in thrown error messages).
  **No fetchable external URLs.**
- `grep` over `src/` + `index.html`: **zero** `http://`/`https://` references,
  zero `<img>`, `fetch(`, `XMLHttpRequest`, or `new Image` usages.
- No external fonts or images anywhere; system font stack only.

## UNVERIFIED

- **Visual browser rendering** — no live-browser access in this environment, so the
  rendered UI (layout, gauge, tour spotlight, modals) was not visually inspected.
  All logic, build, serving, and data assertions above were verified; the visual
  layer is unverified by design of the sandbox.
