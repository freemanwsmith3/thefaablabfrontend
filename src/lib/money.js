/**
 * Percent is the source of truth; dollars are a render.
 *
 * Bids are stored and posted as percent of FAAB, which is what makes crowd
 * data comparable across leagues with different budgets. Nothing here should
 * ever be persisted or sent to the API.
 */

/** Convert a percent of budget into whole dollars. */
export function toDollars(pct, budget) {
  if (pct == null || Number.isNaN(Number(pct))) return null;
  return Math.round((budget * Number(pct)) / 100);
}

/** "$28" — the standard way a single figure is shown. */
export function formatDollars(pct, budget) {
  const d = toDollars(pct, budget);
  return d == null ? null : `$${d}`;
}

/** "$18–$32" — used for bucket labels and the winning range. */
export function formatRange(loPct, hiPct, budget) {
  const lo = toDollars(loPct, budget);
  const hi = toDollars(hiPct, budget);
  if (lo == null || hi == null) return null;
  return `$${lo}–$${hi}`;
}

/** Thousands-separated count, e.g. "1,284". */
export function formatCount(n) {
  return typeof n === 'number' ? n.toLocaleString() : String(n ?? '');
}
