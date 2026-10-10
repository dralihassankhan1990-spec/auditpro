import { useState } from 'react';
import { ChevronDown, BookOpen, ListChecks } from 'lucide-react';
import { templates } from '../data/seed.js';

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

export default function Templates() {
  const [selected, setSelected] = useState(templates[0].id);
  const [open, setOpen] = useState(() => new Set([templates[0].checkpoints[0].category]));

  const template = templates.find((t) => t.id === selected);
  const groups = groupByCategory(template.checkpoints);

  const toggle = (cat) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const pick = (id) => {
    setSelected(id);
    const t = templates.find((x) => x.id === id);
    setOpen(new Set([t.checkpoints[0].category]));
  };

  return (
    <div className="space-y-5" data-tour="template-browser">
      <h2 className="text-lg font-bold text-slate-100">Audit templates</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => pick(t.id)}
            className={`card p-5 text-left transition ${
              selected === t.id ? 'ring-2 ring-teal-500/60' : 'hover:border-slate-700'
            }`}
          >
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-100">
              <BookOpen size={16} className="text-teal-400" /> {t.name}
              <span className="ml-auto rounded-full border border-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                {t.version}
              </span>
            </div>
            <p className="mb-2 text-xs leading-relaxed text-slate-500">{t.description}</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300">
              <ListChecks size={14} /> {t.checkpoints.length} checkpoints
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {groups.map((g) => {
          const isOpen = open.has(g.category);
          return (
            <div key={g.category} className="card overflow-hidden">
              <button
                onClick={() => toggle(g.category)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-800/40"
              >
                <span className="text-sm font-bold text-slate-200">
                  {g.category}
                  <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                    {g.items.length}
                  </span>
                </span>
                <ChevronDown size={16} className={`text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <ul className="divide-y divide-slate-800/60 border-t border-slate-800">
                  {g.items.map((c) => (
                    <li key={c.id} className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 font-mono text-[11px] font-bold text-teal-300">
                          {c.code}
                        </span>
                        <div>
                          <p className="text-sm text-slate-200">{c.text}</p>
                          <p className="mt-0.5 text-xs italic leading-relaxed text-slate-500">{c.guidance}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-600">
        Templates are read-only in this demo. Verdicts and notes are recorded per audit in the Audits tab.
      </p>
    </div>
  );
}
