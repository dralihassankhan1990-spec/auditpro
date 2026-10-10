import { useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { sortFindings, CAPA_STATUS_LABELS } from '../lib/scoring.js';

const SEVERITY_BADGE = {
  Critical: 'border-red-500/40 bg-red-500/10 text-red-300',
  'Major NC': 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  'Minor NC': 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
};

const CAPA_BADGE = {
  open: 'border-slate-600 bg-slate-800/70 text-slate-300',
  in_progress: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  verified: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
  closed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
};

const FILTERS = ['All', 'Critical', 'Major NC', 'Minor NC'];

export default function Findings({ findings, onSelect }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const visible = sortFindings(findings).filter((f) => {
    if (filter !== 'All' && f.severity !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        f.id.toLowerCase().includes(q) ||
        f.auditId.toLowerCase().includes(q) ||
        f.checkpointCode.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5" data-tour="findings-panel">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-slate-100">Findings register</h2>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                filter === f
                  ? 'border-teal-500/50 bg-teal-600/20 text-teal-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input !w-56 !pl-8"
            placeholder="Search findings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {findings.length === 0 ? (
        <div className="card p-10 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="font-semibold text-slate-200">No findings yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            No findings yet — findings appear here automatically when a checkpoint is scored Minor NC or above.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold text-slate-200">No findings match this filter</p>
          <p className="mt-1 text-sm text-slate-500">Try a different severity or clear the search.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Finding</th>
                  <th className="px-4 py-3 font-semibold">Checkpoint</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">CAPA status</th>
                  <th className="px-4 py-3 font-semibold">Evidence note</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => onSelect(f)}
                    className="cursor-pointer border-b border-slate-800/60 transition last:border-0 hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-400">{f.id}</div>
                      <div className="text-xs text-slate-500">{f.auditId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 font-mono text-[11px] font-bold text-teal-300">
                        {f.checkpointCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{f.category}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${SEVERITY_BADGE[f.severity]}`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${CAPA_BADGE[f.capa.status]}`}>
                        {CAPA_STATUS_LABELS[f.capa.status]}
                      </span>
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3 text-xs text-slate-500" title={f.note}>
                      {f.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-600">
        Click any row to open its CAPA panel and work the finding through to closure.
      </p>
    </div>
  );
}
