import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CAPA_STATUSES, CAPA_STATUS_LABELS } from '../lib/scoring.js';

const STATUS_BUTTON = {
  open: 'border-slate-600 text-slate-300 hover:border-slate-500',
  in_progress: 'border-blue-500/50 text-blue-300 hover:bg-blue-500/10',
  verified: 'border-teal-500/50 text-teal-300 hover:bg-teal-500/10',
  closed: 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10',
};

const STATUS_ACTIVE = {
  open: '!bg-slate-600 !text-white !border-slate-600',
  in_progress: '!bg-blue-600 !text-white !border-blue-600',
  verified: '!bg-teal-600 !text-white !border-teal-600',
  closed: '!bg-emerald-600 !text-white !border-emerald-600',
};

/**
 * CAPA workflow panel. Status can move freely between stages (demo), but
 * advancing past "open" requires root cause / action / owner / due date, and
 * "verified"/"closed" additionally require verification evidence.
 */
export default function CapaPanel({ finding, onClose, onSave }) {
  const [capa, setCapa] = useState({ ...finding.capa });
  const [error, setError] = useState('');

  const set = (k, v) => setCapa((c) => ({ ...c, [k]: v }));

  const validate = (next) => {
    if (next !== 'open') {
      if (!capa.rootCause.trim() || !capa.correctiveAction.trim() || !capa.owner.trim() || !capa.dueDate) {
        return 'Before leaving “Open”, fill in root cause, corrective action, owner and due date.';
      }
    }
    if (next === 'verified' || next === 'closed') {
      if (!capa.verificationMethod.trim() || !capa.verificationResult.trim()) {
        return '“Verified” and “Closed” require a verification method and a verification result.';
      }
    }
    return '';
  };

  const save = () => {
    const problem = validate(capa.status);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    onSave(finding.id, capa);
    onClose();
  };

  const fields = [
    { key: 'rootCause', label: '1 · Root cause', placeholder: 'Why did this happen? (5-Why style)', type: 'textarea' },
    { key: 'correctiveAction', label: '2 · Corrective action', placeholder: 'What will fix it and prevent recurrence?', type: 'textarea' },
    { key: 'owner', label: '3 · Owner', placeholder: 'e.g. QA Manager', type: 'input' },
    { key: 'dueDate', label: '4 · Due date', placeholder: '', type: 'date' },
    { key: 'verificationMethod', label: '5 · Verification method', placeholder: 'How will you check the fix worked?', type: 'textarea' },
    { key: 'verificationResult', label: '6 · Verification result', placeholder: 'What did the check show?', type: 'textarea' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-xs text-slate-500">{finding.id}</div>
            <h3 className="text-base font-bold text-slate-100">
              {finding.checkpointCode} — {finding.severity}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{finding.text}</p>
            {finding.note && (
              <p className="mt-1.5 rounded bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-500">
                <span className="font-semibold">Evidence: </span>
                {finding.note}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close CAPA panel">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <span className="label">CAPA status — click to transition</span>
          <div className="flex flex-wrap gap-1.5">
            {CAPA_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => set('status', s)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${STATUS_BUTTON[s]} ${
                  capa.status === s ? STATUS_ACTIVE[s] : ''
                }`}
              >
                {CAPA_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3.5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  className="input min-h-[64px]"
                  placeholder={f.placeholder}
                  value={capa[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type={f.type === 'date' ? 'date' : 'text'}
                  placeholder={f.placeholder}
                  value={capa[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button onClick={save} className="btn-primary">
            <Save size={16} /> Save CAPA
          </button>
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
