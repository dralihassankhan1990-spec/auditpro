import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { VERDICTS, computeComplianceScore, scoreColorClass } from '../lib/scoring.js';

const VERDICT_STYLE = {
  Compliant: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
  'Minor NC': 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20',
  'Major NC': 'border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20',
  Critical: 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  'N/A': 'border-slate-600 bg-slate-800/60 text-slate-400 hover:bg-slate-800',
};

const VERDICT_ACTIVE = {
  Compliant: '!bg-emerald-600 !text-white !border-emerald-600',
  'Minor NC': '!bg-yellow-500 !text-slate-950 !border-yellow-500',
  'Major NC': '!bg-orange-600 !text-white !border-orange-600',
  Critical: '!bg-red-600 !text-white !border-red-600',
  'N/A': '!bg-slate-500 !text-white !border-slate-500',
};

function groupByCategory(checkpoints) {
  const groups = [];
  const idx = new Map();
  for (const c of checkpoints) {
    if (!idx.has(c.category)) {
      idx.set(c.category, groups.length);
      groups.push({ category: c.category, items: [] });
    }
    groups[idx.get(c.category)].items.push(c);
  }
  return groups;
}

export default function RunAudit({ audit, template, onBack, onSetVerdict, onComplete, readOnly }) {
  const total = template.checkpoints.length;
  const answered = template.checkpoints.filter((c) => audit.responses?.[c.id]?.verdict).length;
  const remaining = total - answered;
  const score = computeComplianceScore(audit.responses);
  const groups = groupByCategory(template.checkpoints);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="btn-ghost !px-3">
          <ArrowLeft size={16} /> Audits
        </button>
        <div>
          <div className="text-[11px] font-mono text-slate-500">{audit.id}</div>
          <h2 className="text-lg font-bold text-slate-100">{audit.title}</h2>
        </div>
        {score != null && (
          <span className={`ml-auto rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm font-bold ${scoreColorClass(score)}`}>
            Score: {score.toFixed(1)}
          </span>
        )}
      </div>

      <div className="card p-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            {answered} of {total} checkpoints answered
          </span>
          <span className="text-slate-500">{remaining} remaining</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </div>

      {groups.map((g) => (
        <section key={g.category}>
          <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wider text-teal-400">{g.category}</h3>
          <div className="space-y-3">
            {g.items.map((c) => {
              const r = audit.responses?.[c.id] || {};
              return (
                <div key={c.id} className="card p-4">
                  <div className="mb-1 flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 font-mono text-[11px] font-bold text-teal-300">
                      {c.code}
                    </span>
                    <p className="text-sm font-medium text-slate-100">{c.text}</p>
                  </div>
                  <p className="mb-3 ml-[52px] text-xs italic leading-relaxed text-slate-500">{c.guidance}</p>
                  <div className="ml-[52px] flex flex-wrap gap-1.5">
                    {VERDICTS.map((v) => (
                      <button
                        key={v}
                        disabled={readOnly}
                        onClick={() => onSetVerdict(audit.id, c.id, v)}
                        className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-default ${VERDICT_STYLE[v]} ${
                          r.verdict === v ? VERDICT_ACTIVE[v] : ''
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  {!readOnly && (
                    <input
                      className="input ml-[52px] mt-2 !w-[calc(100%-52px)]"
                      placeholder="Evidence note (optional) — what did you see?"
                      value={r.note || ''}
                      onChange={(e) => onSetVerdict(audit.id, c.id, r.verdict || null, e.target.value)}
                    />
                  )}
                  {readOnly && r.note && (
                    <p className="ml-[52px] mt-2 rounded bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-400">
                      <span className="font-semibold text-slate-500">Note: </span>
                      {r.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="card p-5">
        {readOnly ? (
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <Lock size={15} /> This audit is completed and read-only. Findings were raised automatically from its non-conformances.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={onComplete} disabled={remaining > 0} className="btn-primary">
              <CheckCircle2 size={16} /> Complete audit
            </button>
            {remaining > 0 ? (
              <p className="text-sm text-amber-300">
                Answer all {total} checkpoints to complete this audit — {remaining} still unanswered.
              </p>
            ) : (
              <p className="text-sm text-emerald-300">All checkpoints answered — ready to complete.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
