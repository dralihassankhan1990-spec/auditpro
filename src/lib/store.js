/**
 * store.js — localStorage persistence layer for the demo.
 * State shape (key `auditpro-state-v1`):
 * {
 *   audits: [{ id, title, site, templateId, auditor, status, createdAt, completedAt,
 *               responses: { checkpointId: { verdict, note } } }],
 *   capaByFinding: { [findingId]: capa },
 *   activity: [{ id, ts, text }],
 *   nextAuditNum: number,
 * }
 */
import { buildSeedState } from '../data/seed.js';

export const STATE_KEY = 'auditpro-state-v1';
export const TOUR_KEY = 'auditpro-tour-seen';

export function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.audits)) return parsed;
    }
  } catch {
    // corrupted state — fall through to reseed
  }
  const seed = buildSeedState();
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(seed));
  } catch {
    // storage unavailable — run in-memory only
  }
  return seed;
}

export function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota/privacy errors in demo
  }
}

export function resetState() {
  localStorage.removeItem(STATE_KEY);
  return loadState();
}

export function markTourSeen() {
  try {
    localStorage.setItem(TOUR_KEY, '1');
  } catch {
    // ignore
  }
}

export function hasSeenTour() {
  try {
    return localStorage.getItem(TOUR_KEY) === '1';
  } catch {
    return true;
  }
}

export function logActivity(state, text) {
  return {
    ...state,
    activity: [
      ...state.activity,
      { id: `act-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, ts: new Date().toISOString(), text },
    ],
  };
}
