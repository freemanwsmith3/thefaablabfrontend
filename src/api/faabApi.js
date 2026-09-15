/**
 * Data layer for the weekly bid page.
 *
 * Builds against /api/week, which returns the week's targets, the FAABLab
 * crowd distribution and the real Sleeper market distribution in one request.
 * The older /api/targets + /api/stats pair needs two round trips and returns
 * the team nickname rather than the abbreviation the card design needs.
 *
 * Everything here is percent of FAAB. Dollars are a render concern and never
 * appear in this module.
 */
import axios from 'axios';
import schedule2026 from '../data/schedule2026.json';

const BASE = process.env.REACT_APP_API_URL;

// The bid endpoint identifies a browser by a signed cookie. Without this the
// cookie never travels and every bid looks like a new visitor, silently
// defeating the per-browser deduplication.
const client = axios.create({ baseURL: BASE, withCredentials: true });

/**
 * Fewer leagues than this and the figure is noise rather than a market.
 *
 * Low on purpose: the block shows the league count next to the number, so a
 * reader can judge a thin sample themselves. Set higher only if you would
 * rather show nothing than show a small one.
 */
export const SLEEPER_MIN_LEAGUES = 3;

// Static NFL schedule, keyed by team abbreviation then week. Small enough
// (~18KB) to ship with the bundle and it never changes mid-season, so it costs
// no request. Swap the import when the season rolls over.
const SCHEDULE = { 2026: schedule2026 };

/**
 * Opponent for a team in a given week, or null when unknown -- a bye, a team
 * we cannot resolve, or a season with no schedule loaded. The card renders
 * "RB - TEN · Week 3" on null rather than inventing a matchup.
 */
export function getOpponent(abbr, week, season = 2026) {
  const table = SCHEDULE[season];
  if (!table || !abbr) return null;
  const team = table[abbr];
  if (!team) return null;
  return team[String(week)] || null;
}

/**
 * Real Sleeper market average, or null when the sample is too thin to show.
 * Percent in, percent out — the card converts to dollars.
 */
export function getSleeperAverage(market) {
  if (!market || !market.n_leagues) return null;
  if (market.n_leagues < SLEEPER_MIN_LEAGUES) return null;
  if (market.mean == null) return null;
  return { pct: market.mean, leagues: market.n_leagues };
}

/**
 * Split into two lines rather than one string.
 *
 * "TE - LV at LAC in Week 2" runs the player's own team and their opponent
 * together, so it is not clear which is which. Keeping identity and matchup
 * visually apart makes the team unambiguous.
 *
 * Returns { identity: "TE - LV", matchup: "at LAC · Week 2" }.
 */
export function buildMeta(position, abbr, opponent, week) {
  const identity = [position, abbr].filter(Boolean).join(' - ');
  const matchup = opponent
    ? `${opponent.isHome ? 'vs' : 'at'} ${opponent.abbr} · Week ${week}`
    : `Week ${week}`;
  return { identity, matchup };
}

/**
 * Normalize one API player into the view model the components render.
 * `hasData` false means nobody has bid yet -- the first-bidder state.
 */
export function toViewModel(p, week, season) {
  const crowd = p.crowd;
  const opponent = getOpponent(p.team, week, season);
  const buckets = (crowd && crowd.bins ? crowd.bins : []).map((b) => ({
    loPct: b.lo,
    hiPct: b.hi,
    bids: b.bids,
  }));
  // Outliers are trimmed (Tukey 1.5x IQR) before binning, so crowd.n counts
  // bids the bars do not show. Report the post-trim total instead, matching
  // the legacy numberOfBids, so `bids / count` shares sum to 100%.
  const trimmedTotal = buckets.reduce((sum, b) => sum + b.bids, 0);
  return {
    id: p.id,
    name: p.name,
    abbr: p.team || null,
    position: p.position || null,
    image: p.image || null,
    targetId: p.target_id,
    sleeperAdds: p.sleeper_adds ?? null,
    ...(() => {
      const m = buildMeta(p.position, p.team, opponent, week);
      // `meta` stays a single string for anything still reading it.
      return { meta: `${m.identity} ${m.matchup}`, identity: m.identity, matchup: m.matchup };
    })(),

    // Crowd figures, all percent.
    hasData: !!(crowd && crowd.n),
    median: crowd ? crowd.median : null,
    mode: crowd ? crowd.mode : null,
    count: trimmedTotal,
    countAll: crowd ? crowd.n : 0,
    buckets,

    sleeper: getSleeperAverage(p.market),
  };
}

/**
 * Current NFL season and week, from the API (which reads Sleeper's own state).
 * Replaces the hardcoded season dates that made the page show "Week 0" once
 * the 2024 window passed.
 */
export async function fetchCurrentWeek() {
  const { data } = await client.get('current-week');
  return { season: data.season, week: data.week, legacyWeek: data.legacy_week };
}

/** Fetch and normalize a week. Returns { season, week, players }. */
export async function fetchWeek(week, { season, signal } = {}) {
  const params = season ? { season, week } : { week };
  const { data } = await client.get('week', { params, signal });
  const players = (data.players || [])
    .filter((p) => p.target_id != null)
    .map((p) => toViewModel(p, data.week ?? week, data.season));
  return { season: data.season, week: data.week, players };
}

/**
 * Submit a bid, in percent.
 *
 * The server records at most one bid per browser per player per week. A repeat
 * returns 200 with recorded:false rather than an error, so callers must read
 * the body rather than trusting the status code.
 */
export async function postBid({ player, season, week, value }) {
  // Always send the season: without it the server reads `week` as the old
  // running counter, and a bid it cannot place in a season never reaches an
  // aggregate -- it saves, but never shows up on the site.
  const { data } = await client.post('bid', { player, season, week, value });
  return {
    recorded: !!data.recorded,
    reason: data.reason || null,
  };
}
