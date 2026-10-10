import { useLayoutEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const TOUR_STEPS = [
  {
    tab: 'dashboard',
    target: '[data-tour="score-gauge"]',
    title: 'Portfolio compliance score',
    text: 'The gauge rolls every scored checkpoint into one weighted score: Compliant counts 1, Minor NC 0.75, Major NC 0.4, Critical 0 — N/A is excluded entirely.',
  },
  {
    tab: 'audits',
    target: '[data-tour="continue-audit"]',
    title: 'Continue the in-progress audit',
    text: 'The Riverside Dairy Plant audit is 18 of 25 checkpoints in. Continue it to score the rest — any Minor NC or above automatically becomes a finding.',
  },
  {
    tab: 'findings',
    target: '[data-tour="findings-panel"]',
    title: 'Findings register',
    text: 'Every non-conformance lands here automatically. Open a row to work its CAPA: root cause → corrective action → owner → due date → verification → close.',
  },
  {
    tab: 'templates',
    target: '[data-tour="template-browser"]',
    title: 'Audit templates',
    text: 'Browse the read-only checklists: a 25-point Internal GMP Audit and a 20-point pre-certification BRC-style checklist, each with auditor guidance.',
  },
  {
    tab: 'dashboard',
    target: '[data-tour="disclaimer"]',
    title: 'Honest demo labelling',
    text: 'AuditPro is a demonstration prototype — not a certified audit system. It never claims certification-grade authority anywhere in the interface.',
  },
];

/**
 * Spotlight tour overlay. App owns `step` (null = hidden) and switches tabs.
 */
export default function Tour({ step, setTab, onNext, onPrev, onExit }) {
  const [rect, setRect] = useState(null);
  const current = TOUR_STEPS[step];

  useLayoutEffect(() => {
    if (step == null || !current) {
      setRect(null);
      return;
    }
    setTab(current.tab);
    setRect(null);
    let raf;
    const measure = () => {
      const el = document.querySelector(current.target);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        });
      } else {
        raf = requestAnimationFrame(measure);
      }
    };
    const t = setTimeout(measure, 120);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [step, current, setTab]);

  if (step == null || !current || !rect) return null;

  const pad = 8;
  const r = {
    top: Math.max(0, rect.top - pad),
    left: Math.max(0, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  const tipWidth = 340;
  let tipLeft = Math.min(Math.max(12, r.left), window.innerWidth - tipWidth - 12);
  let tipTop = r.top + r.height + 14;
  if (tipTop + 230 > window.innerHeight) tipTop = Math.max(12, r.top - 240);

  return (
    <div className="fixed inset-0 z-50">
      {/* dimmed regions around the spotlight */}
      <div className="absolute inset-x-0 top-0 bg-black/70" style={{ height: r.top }} onClick={onExit} />
      <div className="absolute inset-x-0 bottom-0 bg-black/70" style={{ top: r.top + r.height }} onClick={onExit} />
      <div className="absolute bg-black/70" style={{ top: r.top, left: 0, width: r.left, height: r.height }} onClick={onExit} />
      <div className="absolute bg-black/70" style={{ top: r.top, left: r.left + r.width, right: 0, height: r.height }} onClick={onExit} />
      {/* spotlight ring */}
      <div
        className="absolute rounded-lg ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950"
        style={{ top: r.top, left: r.left, width: r.width, height: r.height, pointerEvents: 'none' }}
      />
      {/* tooltip card */}
      <div
        className="card absolute w-[340px] max-w-[calc(100vw-24px)] p-5 shadow-2xl"
        style={{ top: tipTop, left: tipLeft }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
            Step {step + 1} of {TOUR_STEPS.length}
          </span>
          <button onClick={onExit} className="text-slate-500 hover:text-slate-300" aria-label="Close tour">
            <X size={16} />
          </button>
        </div>
        <h3 className="mb-1.5 text-base font-bold text-slate-100">{current.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-400">{current.text}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 w-6 rounded-full ${i === step ? 'bg-teal-400' : 'bg-slate-700'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={onPrev} className="btn-ghost !px-3 !py-1.5 text-xs">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step < TOUR_STEPS.length - 1 ? (
              <button onClick={onNext} className="btn-primary !px-3 !py-1.5 text-xs">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={onExit} className="btn-primary !px-3 !py-1.5 text-xs">
                Start exploring
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
