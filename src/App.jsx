import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Tour, { TOUR_STEPS } from './components/Tour.jsx';
import Dashboard from './components/Dashboard.jsx';
import Audits from './components/Audits.jsx';
import RunAudit from './components/RunAudit.jsx';
import Findings from './components/Findings.jsx';
import CapaPanel from './components/CapaPanel.jsx';
import Templates from './components/Templates.jsx';
import { templates } from './data/seed.js';
import { deriveFindings, emptyCapa } from './lib/scoring.js';
import { loadState, saveState, resetState, markTourSeen, hasSeenTour, logActivity, STATE_KEY } from './lib/store.js';
import { DISCLAIMER, BOOK_LINE } from './lib/constants.js';

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('dashboard');
  const [runningAuditId, setRunningAuditId] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [tourStep, setTourStep] = useState(() => (hasSeenTour() ? null : 0));

  const persist = (next) => {
    setState(next);
    saveState(next);
  };

  const templateById = useMemo(() => new Map(templates.map((t) => [t.id, t])), []);

  /** All findings derived from current responses, with CAPA overlays applied. */
  const findings = useMemo(
    () =>
      state.audits.flatMap((audit) => {
        const template = templateById.get(audit.templateId);
        return deriveFindings(audit, template).map((f) => ({
          ...f,
          capa: { ...emptyCapa(), ...(state.capaByFinding[f.id] || {}) },
          site: audit.site,
          auditTitle: audit.title,
        }));
      }),
    [state, templateById]
  );

  const runningAudit = runningAuditId ? state.audits.find((a) => a.id === runningAuditId) : null;

  /* ---------------- actions ---------------- */

  const startTour = () => {
    setRunningAuditId(null);
    setTab('dashboard');
    setTourStep(0);
  };

  const endTour = () => {
    setTourStep(null);
    markTourSeen();
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to the original seed? Your changes will be lost.')) {
      const fresh = resetState();
      setState(fresh);
      setRunningAuditId(null);
      setSelectedFinding(null);
      setTab('dashboard');
    }
  };

  const handleStartAudit = ({ templateId, site, auditor }) => {
    const template = templateById.get(templateId);
    const num = state.nextAuditNum;
    const id = `AUD-2026-${String(num).padStart(3, '0')}`;
    const audit = {
      id,
      title: `${site.trim()} — ${template.name}`,
      site: site.trim(),
      templateId,
      auditor: auditor.trim(),
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      completedAt: null,
      responses: {},
    };
    let next = { ...state, audits: [...state.audits, audit], nextAuditNum: num + 1 };
    next = logActivity(next, `Audit ${id} started by ${audit.auditor} — ${audit.site}.`);
    persist(next);
    setRunningAuditId(id);
  };

  const handleSetVerdict = (auditId, checkpointId, verdict, note) => {
    setState((prev) => {
      const audit = prev.audits.find((a) => a.id === auditId);
      if (!audit) return prev;
      const template = templateById.get(audit.templateId);
      const before = new Set(deriveFindings(audit, template).map((f) => f.id));
      const current = audit.responses[checkpointId] || {};
      const responses = {
        ...audit.responses,
        [checkpointId]: {
          verdict: verdict !== null && verdict !== undefined ? verdict : current.verdict,
          note: note !== undefined ? note : current.note || '',
        },
      };
      const updated = { ...audit, responses };
      const after = deriveFindings(updated, template);
      let next = { ...prev, audits: prev.audits.map((a) => (a.id === auditId ? updated : a)) };
      for (const f of after) {
        if (!before.has(f.id)) {
          next = logActivity(next, `Finding ${f.id} logged (${f.severity}) on ${f.checkpointCode}.`);
        }
      }
      saveState(next);
      return next;
    });
  };

  const handleCompleteAudit = (auditId) => {
    const audit = state.audits.find((a) => a.id === auditId);
    if (!audit) return;
    const template = templateById.get(audit.templateId);
    const answered = template.checkpoints.filter((c) => audit.responses?.[c.id]?.verdict).length;
    if (answered < template.checkpoints.length) return;
    const newFindings = deriveFindings(audit, template).length;
    let next = {
      ...state,
      audits: state.audits.map((a) =>
        a.id === auditId ? { ...a, status: 'completed', completedAt: new Date().toISOString() } : a
      ),
    };
    next = logActivity(next, `Audit ${auditId} completed — ${newFindings} finding${newFindings === 1 ? '' : 's'} raised.`);
    persist(next);
    setRunningAuditId(null);
    setTab('findings');
  };

  const handleSaveCapa = (findingId, capa) => {
    setState((prev) => {
      const old = (prev.capaByFinding[findingId] || {}).status || 'open';
      let next = {
        ...prev,
        capaByFinding: { ...prev.capaByFinding, [findingId]: capa },
      };
      if (capa.status !== old) {
        next = logActivity(next, `Finding ${findingId} CAPA: ${old.replace('_', ' ')} → ${capa.status.replace('_', ' ')}.`);
      }
      saveState(next);
      return next;
    });
    // keep the open panel in sync
    setSelectedFinding((f) => (f && f.id === findingId ? { ...f, capa } : f));
  };

  const liveFinding = selectedFinding ? findings.find((f) => f.id === selectedFinding.id) : null;

  /* ---------------- render ---------------- */

  return (
    <div className="min-h-screen">
      <Header
        tab={runningAudit ? 'audits' : tab}
        setTab={(t) => {
          setRunningAuditId(null);
          setTab(t);
        }}
        findingCount={findings.length}
        onReplayTour={startTour}
        onReset={handleReset}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {runningAudit ? (
          <RunAudit
            audit={runningAudit}
            template={templateById.get(runningAudit.templateId)}
            onBack={() => setRunningAuditId(null)}
            onSetVerdict={handleSetVerdict}
            onComplete={() => handleCompleteAudit(runningAudit.id)}
            readOnly={runningAudit.status === 'completed'}
          />
        ) : tab === 'dashboard' ? (
          <Dashboard state={state} findings={findings} />
        ) : tab === 'audits' ? (
          <Audits
            state={state}
            onStart={handleStartAudit}
            onContinue={(id) => setRunningAuditId(id)}
            onReview={(id) => setRunningAuditId(id)}
          />
        ) : tab === 'findings' ? (
          <Findings findings={findings} onSelect={setSelectedFinding} />
        ) : (
          <Templates />
        )}
      </main>

      <footer className="border-t border-slate-800 py-5">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs leading-relaxed text-slate-600">
          <p>{BOOK_LINE}</p>
          <p className="mt-1">{DISCLAIMER} State is stored locally in your browser ({STATE_KEY}).</p>
        </div>
      </footer>

      {liveFinding && (
        <CapaPanel finding={liveFinding} onClose={() => setSelectedFinding(null)} onSave={handleSaveCapa} />
      )}

      {tourStep != null && (
        <Tour
          step={tourStep}
          setTab={(t) => {
            setRunningAuditId(null);
            setTab(t);
          }}
          onNext={() => setTourStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1))}
          onPrev={() => setTourStep((s) => Math.max(s - 1, 0))}
          onExit={endTour}
        />
      )}
    </div>
  );
}
