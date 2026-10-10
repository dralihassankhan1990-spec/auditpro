import { ShieldCheck, HelpCircle, RotateCcw, LayoutDashboard, ClipboardList, AlertTriangle, BookOpen } from 'lucide-react';
import { DISCLAIMER } from '../lib/constants.js';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'audits', label: 'Audits', icon: ClipboardList },
  { id: 'findings', label: 'Findings', icon: AlertTriangle },
  { id: 'templates', label: 'Templates', icon: BookOpen },
];

export default function Header({ tab, setTab, findingCount, onReplayTour, onReset }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/40">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-base font-bold leading-tight text-slate-100">AuditPro</div>
            <div className="text-[11px] leading-tight text-slate-500">Food-safety audit management</div>
          </div>
        </div>

        <nav className="ml-2 flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tab === id ? 'bg-teal-600/20 text-teal-300 ring-1 ring-teal-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
              {id === 'findings' && findingCount > 0 && (
                <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-500/40">
                  {findingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span
            data-tour="disclaimer"
            title={DISCLAIMER}
            className="hidden max-w-[240px] truncate rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-400 lg:inline"
          >
            {DISCLAIMER}
          </span>
          <button onClick={onReplayTour} className="btn-ghost !px-3 !py-1.5 text-xs" title="Replay the guided tour">
            <HelpCircle size={15} /> <span className="hidden md:inline">Tour</span>
          </button>
          <button onClick={onReset} className="btn-ghost !px-3 !py-1.5 text-xs" title="Reset demo data to the original seed">
            <RotateCcw size={15} /> <span className="hidden md:inline">Reset demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
