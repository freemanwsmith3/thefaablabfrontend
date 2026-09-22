import { useCallback, useEffect, useState } from 'react';

const keyFor = (week) => `faablab.bids.${week}`;

/**
 * Bids submitted this week, per player, in percent.
 *
 * The server records one bid per browser per player per week but has no
 * session the client can query, so which cards are already submitted lives
 * here. Keyed by week so a new week starts clean with no migration.
 */
export function useBids(week) {
  const [done, setDone] = useState({});

  useEffect(() => {
    if (week == null) return;
    try {
      setDone(JSON.parse(localStorage.getItem(keyFor(week)) || '{}') || {});
    } catch (e) {
      setDone({});
    }
  }, [week]);

  const record = useCallback(
    (playerId, percent) => {
      setDone((prev) => {
        const next = { ...prev, [playerId]: percent };
        try {
          localStorage.setItem(keyFor(week), JSON.stringify(next));
        } catch (e) {
          /* non-fatal: the card still shows results this session */
        }
        return next;
      });
    },
    [week]
  );

  return [done, record];
}
