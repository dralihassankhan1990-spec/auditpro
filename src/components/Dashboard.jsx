import { ClipboardCheck, AlertTriangle, Repeat, Building2, Activity, Info } from 'lucide-react';
import { computeComplianceScore, scoreColorClass } from '../lib/scoring.js';
import { templates } from '../data/seed.js';

const SEVERITY_STYLE = {
  Critical: 'bg-red-500',
  'Major NC': 'bg-orange-500',
  'Minor NC': 'bg-yellow-400',
};

function Gauge({ score }) {
  const R = 80;
  const LEN = Math.PI * R;
  const frac = score == null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const color = score == null ? '#475569' : score >= 85 ? '#34d399' : score >= 65 ? '#fbbf24' : '#f87171';
  return (
    <div data-tour="score-gauge" className="relative">
      <svg viewBox="0 0 200 122" className="w-full max-w-[260px]">
        <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M 20 105 A 80 80 0 0 1 180 105"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${frac * LEN} ${LEN}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className={`text-3xl font-extrabold ${scoreColorClass(score)}`}>
          {score == null ? '—' : score.toFixed(1)}
        </div>
        <div className="text-[11px] uppercase tracking-widest text-slate-500">compliance score</div>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color, suffix }) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-bold text-slate-100">{suffix ?? value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard({ state, findings }) {
  const templateById = new Map(templates.map((t) => [t.id, t]));

  const auditScores = state.audits.map((a) => {
    const template = templateById.get(a.templateId);
    const total = template ? template.checkpoints.length : 0;
    const answered = Object.values(a.responses || {}).filter((r) => r && r.verdict).length;
    return { audit: a, total, answered, score: computeComplianceScore(a.responses) };
  });

  const scored = auditScores.filter((s) => s.score != null);
  const portfolioScore = scored.length ? scored.reduce((a, s) => a + s.score, 0) / scored.length : null;

  const sevCounts = { Critical: 0, 'Major NC': 0, 'Minor NC': 0 };
  for (const f of findings) sevCounts[f.severity] = (sevCounts[f.severity] || 0) + 1;
  const maxSev = Math.max(1, ...Object.values(sevCounts));

  // Repeat-finding analysis: categories flagged in 2+ distinct audits
  const byCategory = new Map();
  for (const f of findings) {
    if (!byCategory.has(f.category)) byCategory.set(f.category, { audits: new Set(), count: 0 });
    const e = byCategory.get(f.category);
    e.audits.add(f.auditId);
    e.count += 1;
  }
  const repeats = [...byCategory.entries()]
    .map(([category, e]) => ({ category, audits: e.audits.size, count: e.count }))
    .filter((r) => r.audits >= 2)
    .sort((a, b) => b.audits - a.audits || b.count - a.count);

  // Site comparison: average score per site
  const bySite = new Map();
  for (const s of auditScores) {
    if (s.score == null) continue;
    if (!bySite.has(s.audit.site)) bySite.set(s.audit.site, []);
    bySite.get(s.audit.site).push(s.score);
  }
  const siteScores = [...bySite.entries()].map(([site, arr]) => ({
    site,
    avg: arr.reduce((a, b) => a + b, 0) / arr.length,
  }));

  const recent = [...state.activity].slice(-8).reverse();

  return (
    <div className="space-y-5">
      {/* Top row: gauge + key stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="card flex flex-col items-center justify-center p-6">
          <Gauge score={portfolioScore} />
          <p className="mt-3 max-w-[240px] text-center text-xs leading-relaxed text-slate-500">
            Weighted mean across {scored.length} audit{scored.length === 1 ? '' : 's'}. N/A answers are excluded.
          </p>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
            <AlertTriangle size={16} className="text-amber-400" /> Findings by severity
          </div>
          {findings.length === 0 ? (
            <p className="text-sm text-slate-500">No findings recorded yet.</p>
          ) : (
            ['Critical', 'Major NC', 'Minor NC'].map((sev) => (
              <Bar key={sev} label={sev} value={sevCounts[sev]} max={maxSev} color={SEVERITY_STYLE[sev]} />
            ))
          )}
          <div className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-500">
            {findings.length} total finding{findings.length === 1 ? '' : 's'} across {state.audits.length} audit{state.audits.length === 1 ? '' : 's'}.
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
            <Repeat size={16} className="text-teal-400" /> Repeat-finding analysis
          </div>
          {repeats.length === 0 ? (
            <div className="flex h-full flex-col justify-center">
              <p className="text-sm text-slate-500">No category is flagged in more than one audit yet.</p>
              <p className="mt-2 text-xs text-slate-600">Repeat categories surface here automatically as findings accumulate.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {repeats.map((r) => (
                <li key={r.category} className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
                  <div className="text-sm font-semibold text-slate-200">{r.category}</div>
                  <div className="text-xs text-slate-500">
                    flagged in {r.audits} audits · {r.count} findings
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom row: site comparison + activity */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
            <Building2 size={16} className="text-teal-400" /> Site comparison
          </div>
          {siteScores.length === 0 ? (
            <p className="text-sm text-slate-500">No scored audits yet — scores appear once checkpoints are answered.</p>
          ) : (
            siteScores.map((s) => (
              <Bar key={s.site} label={s.site} value={s.avg} max={100} color="bg-teal-500" suffix={s.avg.toFixed(1)} />
            ))
          )}
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600">
            <Info size={12} className="mt-0.5 shrink-0" />
            In-progress audits contribute their partial score; demo data only, not a benchmark.
          </p>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
            <Activity size={16} className="text-teal-400" /> Recent activity
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing has happened yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {recent.map((a) => (
                <li key={a.id} className="flex gap-2.5 text-sm">
                  <ClipboardCheck size={15} className="mt-0.5 shrink-0 text-slate-600" />
                  <div>
                    <div className="text-slate-300">{a.text}</div>
                    <div className="text-[11px] text-slate-600">{new Date(a.ts).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
