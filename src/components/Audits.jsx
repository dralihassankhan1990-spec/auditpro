import { useState } from 'react';
import { Play, Eye, Plus, User, Building2, CalendarDays, FileText, X } from 'lucide-react';
import { templates } from '../data/seed.js';
import { computeComplianceScore, scoreColorClass } from '../lib/scoring.js';

function StatusBadge({ status }) {
  const style =
    status === 'completed'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : 'border-blue-500/30 bg-blue-500/10 text-blue-300';
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {status === 'completed' ? 'Completed' : 'In progress'}
    </span>
  );
}

export default function Audits({ state, onStart, onContinue, onReview }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ templateId: templates[0].id, site: '', auditor: '' });
  const [formError, setFormError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!form.site.trim()) return setFormError('Enter a site name — e.g. “Faisalabad Snacks Plant”.');
    if (!form.auditor.trim()) return setFormError('Enter the auditor name.');
    setFormError('');
    onStart(form);
    setShowForm(false);
    setForm({ templateId: templates[0].id, site: '', auditor: '' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Audits</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Start new audit
        </button>
      </div>

      {showForm && (
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">New audit</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Template</label>
              <select
                className="input"
                value={form.templateId}
                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.checkpoints.length} checkpoints)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Site</label>
              <input
                className="input"
                placeholder="e.g. Gujranwala Dairy Unit"
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Auditor</label>
              <input
                className="input"
                placeholder="e.g. M. Bilal"
                value={form.auditor}
                onChange={(e) => setForm({ ...form, auditor: e.target.value })}
              />
            </div>
          </form>
          {formError && <p className="mt-3 text-sm text-red-400">{formError}</p>}
          <div className="mt-4 flex gap-2">
            <button onClick={submit} className="btn-primary">
              <Play size={16} /> Create & start audit
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.audits.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="font-semibold text-slate-200">No audits yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Start your first audit above — pick a template, name the site, and work through the checkpoints.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.audits.map((a, idx) => {
            const template = templates.find((t) => t.id === a.templateId);
            const total = template ? template.checkpoints.length : 0;
            const answered = Object.values(a.responses || {}).filter((r) => r && r.verdict).length;
            const score = computeComplianceScore(a.responses);
            return (
              <div key={a.id} className="card p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono text-slate-500">{a.id}</div>
                    <h3 className="font-bold text-slate-100">{a.title}</h3>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={12} /> {a.site}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User size={12} /> {a.auditor}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} /> {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {answered} of {total} checkpoints answered
                  </span>
                  {score != null && (
                    <span className={`font-bold ${scoreColorClass(score)}`}>{score.toFixed(1)}</span>
                  )}
                </div>
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
                  />
                </div>
                {a.status === 'in_progress' ? (
                  <button
                    onClick={() => onContinue(a.id)}
                    data-tour={idx === 0 ? 'continue-audit' : undefined}
                    className="btn-primary w-full justify-center"
                  >
                    <Play size={16} /> Continue audit
                  </button>
                ) : (
                  <button onClick={() => onReview(a.id)} className="btn-ghost w-full justify-center">
                    <Eye size={16} /> Review results
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
