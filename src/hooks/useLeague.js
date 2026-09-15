import { useCallback, useEffect, useState } from 'react';

const KEY = 'faablab.league';
export const DEFAULT_LEAGUE = { teams: 12, budget: 200 };

/**
 * League settings, persisted across visits.
 *
 * A user who leaves and comes back a week later must not have to re-enter
 * their league, so this reads on mount and writes on every change. Both are
 * guarded: a corrupt or unreadable key falls back to defaults rather than
 * blanking the page.
 */
export function useLeague() {
  const [league, setLeague] = useState(DEFAULT_LEAGUE);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && (saved.teams || saved.budget)) {
        setLeague({
          teams: Number(saved.teams) || DEFAULT_LEAGUE.teams,
          budget: Number(saved.budget) || DEFAULT_LEAGUE.budget,
        });
      }
    } catch (e) {
      /* corrupt value: keep defaults */
    }
  }, []);

  const update = useCallback((patch) => {
    setLeague((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch (e) {
        /* private mode or full quota: settings just will not persist */
      }
      return next;
    });
  }, []);

  return [league, update];
}
