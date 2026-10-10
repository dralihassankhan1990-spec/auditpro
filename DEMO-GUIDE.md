# AuditPro — 3-Minute Demo Script

Total: ~3 minutes. Assumes a fresh seed (header → **Reset demo** if unsure).

## 0:00 — Open & take the tour (30s)

1. Open `http://localhost:5173`.
2. The **guided tour** starts automatically (5 steps, spotlight). Click **Next** through it —
   it visits the score gauge, the in-progress audit, the findings register, the templates,
   and the honest-demo disclaimer. Click **Start exploring** to finish.
   *(Replay anytime via the **Tour** button in the header.)*

## 0:30 — Dashboard numbers (45s)

Point at the four cards:

- **Portfolio compliance score** — the SVG gauge. Say the weighting out loud:
  *Compliant = 1, Minor NC = 0.75, Major NC = 0.4, Critical = 0, N/A excluded.*
- **Findings by severity** — 1 Critical, 1 Major NC, 4 Minor NC (2 seeded in Riverside + 2 more in a moment).
- **Repeat-finding analysis** — *Sanitation* and *Personnel Hygiene* are each flagged in
  2 audits. This is the money insight: the same weakness categories recur across sites.
- **Site comparison** — average score per site; **Recent activity** — the seeded audit trail.

## 1:15 — Continue the in-progress audit (60s)

1. Go to **Audits** → **Continue audit** on *AUD-2026-014 Riverside Dairy Plant* (18/25 answered).
2. Scroll to **Pest Control → GMP-18**. Click **Major NC**, add evidence note:
   *“Dock door gap > 15 mm at bay 2; droppings found on sill.”*
3. Scroll to **Storage & Handling → GMP-19**. Click **Compliant**, note: *“Pallets on racking, FEFO labels verified.”*
4. Watch the progress bar move to 20/25 and the live score update in the header row.

## 2:15 — Watch it land in Findings + work the CAPA (45s)

1. Open the **Findings** tab (badge count just went up). The new row reads
   `AUD-2026-014:GMP-18 — Major NC`, CAPA status **Open**.
2. Click the row → the **CAPA panel** opens. Fill the six steps:
   - Root cause: *“Dock seal worn; no proofing check in the maintenance round.”*
   - Corrective action: *“Replace dock seal; add proofing to the weekly maintenance checklist.”*
   - Owner: *“Facilities Coordinator”* · Due date: pick a date ~2 weeks out.
3. Click status **In progress** → **Save CAPA**. (Try jumping straight to **Closed** first —
   the panel blocks it until verification method + result are filled. That's the guardrail.)
4. Reopen the row, add verification method *“Re-inspection of bay 2”* and result
   *“Gap sealed; no droppings on follow-up.”*, set **Verified**, save.

## 3:00 — Back to Dashboard (15s)

Return to **Dashboard**: the gauge shifted, severity bars grew, and the activity feed shows
*“Finding AUD-2026-014:GMP-18 logged (Major NC)”* and the CAPA transition. Close with the
honest line: **“Demonstration prototype — not a certified audit system.”**

## If something looks off

- **Reset demo** in the header restores the seed instantly.
- Tour replays from the header **Tour** button.
- State lives in `localStorage` key `auditpro-state-v1` — clearing site data also resets.
