import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import SiteHeader from '../component/bid/SiteHeader';
import LeagueSetup from '../component/bid/LeagueSetup';
import FilterBar from '../component/bid/FilterBar';
import PlayerCard from '../component/bid/PlayerCard';
import BottomBar from '../component/bid/BottomBar';
import { fetchWeek, postBid } from '../api/faabApi';
import { useLeague } from '../hooks/useLeague';
import { useBids } from '../hooks/useBids';
import { initialBid } from '../lib/derive';
import { color, BOTTOM_BAR_CLEARANCE, NAV_BREAKPOINT } from '../design/tokens';

const Page = styled.div`
  min-height: 100vh;
  background: ${color.page};
  font-family: Barlow, system-ui, sans-serif;
  color: ${color.text};
  /* Clears the fixed bottom bar so it never covers the last card. */
  padding-bottom: ${BOTTOM_BAR_CLEARANCE}px;
`;
const Wrap = styled.div`max-width: 1180px; margin: 0 auto; padding: ${(p) => p.pad};`;
const Explainer = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
  color: ${color.textMuted};
  max-width: 46ch;
  text-wrap: pretty;
`;
const Grid = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 8px 14px;
  display: grid;
  gap: 14px;
  /* One column on phones, 2-3 on desktop, no media queries needed. */
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  align-items: start;
`;
// Spans the grid so it reads as a divider between cards rather than another
// card competing with them. Placed after the sixth player so it falls on a row
// boundary on desktop -- two full rows of three above it -- and still lands
// early enough on mobile to be seen without hunting.
const Coffee = styled.a`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  background: ${color.card};
  border: 1px solid ${color.borderSoft};
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: ${color.textMuted};
  text-decoration: none;
  &:hover {
    border-color: ${color.brand};
    color: ${color.brand};
  }
  &:focus-visible {
    outline: 2px solid ${color.brand};
    outline-offset: 2px;
  }
`;

const Empty = styled.p`
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 14px;
  text-align: center;
  color: ${color.label};
  font-size: 15px;
`;

export default function WeeklyBids({ season, week }) {
  const [league, setLeague] = useLeague();
  const [done, recordBid] = useBids(week);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({});
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState('ALL');
  const [setupOpen, setSetupOpen] = useState(true);
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' && window.innerWidth < NAV_BREAKPOINT
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const n = window.innerWidth < NAV_BREAKPOINT;
      setNarrow((prev) => {
        if (n !== prev) setMenuOpen(false);
        return n;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetchWeek(week, { season, signal: ctrl.signal })
      .then((data) => {
        setPlayers(data.players);
        setError(null);
      })
      .catch((e) => {
        if (e.name !== 'CanceledError') setError('Could not load this week.');
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [season, week]);

  // A returning visitor should not have to reopen a league they already set.
  useEffect(() => {
    try {
      if (localStorage.getItem('faablab.league')) setSetupOpen(false);
    } catch (e) { /* keep it open */ }
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter(
      (p) => (pos === 'ALL' || p.position === pos) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [players, pos, query]);

  const submit = useCallback(
    async (player, value) => {
      // Recorded locally first: the results are the reward for bidding, and a
      // network hiccup should not hide them.
      recordBid(player.id, value);
      try {
        await postBid({ player: player.id, season, week, value });
      } catch (e) {
        /* the bid is already reflected locally; nothing to unwind */
      }
    },
    [recordBid, season, week]
  );

  return (
    <Page>
      <SiteHeader
        week={week}
        narrow={narrow}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
      />

      <Wrap pad="20px 14px 6px" as="section">
        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
          Week {week} fantasy football FAAB waiver wire bids
        </h1>
        <Explainer>
          Set your league once. Bids are normalized across leagues and shown in your dollars.
        </Explainer>
      </Wrap>

      <Wrap pad="14px">
        <LeagueSetup
          league={league}
          onChange={setLeague}
          open={setupOpen}
          onToggle={() => setSetupOpen((v) => !v)}
        />
      </Wrap>

      <FilterBar query={query} onQuery={setQuery} pos={pos} onPos={setPos} />

      {error && <Empty>{error}</Empty>}
      {!error && loading && <Empty>Loading this week's targets…</Empty>}

      {!error && !loading && (
        <Grid>
          {visible.map((p, i) => (
            <React.Fragment key={p.id}>
              {i === 6 && (
                <Coffee
                  href="https://buymeacoffee.com/faablab"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span aria-hidden="true">☕</span>
                  FAABLab is free — buy me a coffee if it helped
                </Coffee>
              )}
              <PlayerCard
                player={p}
                budget={league.budget}
                teams={league.teams}
                value={draft[p.id] ?? initialBid(p)}
                submittedPct={done[p.id]}
                onChange={(v) => setDraft((d) => ({ ...d, [p.id]: v }))}
                onSubmit={() => submit(p, draft[p.id] ?? initialBid(p))}
              />
            </React.Fragment>
          ))}
        </Grid>
      )}

      {!error && !loading && visible.length === 0 && (
        <Empty>
          {players.length === 0
            // The week exists but has no targets yet -- normal early in the week,
            // and the only thing a first-time visitor sees before an ingest runs.
            ? `No waiver targets posted for Week ${week} yet. Check back after waivers.`
            : 'No targets match that search.'}
        </Empty>
      )}

      <BottomBar
        doneCount={players.filter((p) => done[p.id] != null).length}
        total={players.length}
        onTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </Page>
  );
}
