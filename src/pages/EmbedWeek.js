/**
 * A read-only week table, sized to sit inside someone else's article.
 *
 * Deliberately not the bid page: an embed lives in a page we do not control,
 * so it takes no input, posts nothing, and needs no league setup. It states
 * the two numbers that are ours alone -- what FAABLAB bidders say a player is
 * worth and what Sleeper leagues actually paid -- and links back for the rest.
 *
 * Query params, so one build serves every embed:
 *   ?season=2026&week=3   pin a week (default: whatever is current)
 *   ?budget=100           convert percentages against this budget (default 200)
 *   ?limit=8              rows to show (default 8)
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { fetchCurrentWeek, fetchWeek } from '../api/faabApi';
import { formatCount, formatDollars } from '../lib/money';
import { color, radius } from '../design/tokens';

const Frame = styled.div`
  box-sizing: border-box;
  max-width: 680px;
  margin: 0 auto;
  padding: 12px;
  font-family: Barlow, system-ui, sans-serif;
  overflow-x: auto;
  @media (max-width: 460px) { padding: 10px; }
  color: ${color.text};
  background: ${color.card};
  border: 2px solid ${color.brand};
  border-radius: ${radius.card};
  * { box-sizing: border-box; }
`;
const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px solid ${color.divider};
`;
const Title = styled.span`
  font-size: 14px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: ${color.brand};
`;
const Note = styled.span`font-size: 11px; font-weight: 600; color: ${color.label};`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  /* Lines the digits up so the columns can be compared down the page. */
  font-variant-numeric: tabular-nums;
`;
const Th = styled.th`
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  color: ${color.label}; text-align: ${(p) => p.align || 'left'};
  padding: 8px 4px 4px;
  white-space: nowrap;
  ${(p) => p.hideNarrow && '@media (max-width: 460px) { display: none; }'}
`;
const Td = styled.td`
  font-size: 13px; font-weight: 600;
  text-align: ${(p) => p.align || 'left'};
  padding: 7px 4px;
  border-top: 1px solid ${color.divider};
  color: ${(p) => p.tone || color.text};
  white-space: ${(p) => (p.align ? 'nowrap' : 'normal')};
  ${(p) => p.hideNarrow && '@media (max-width: 460px) { display: none; }'}
`;
const Who = styled.span`display: block; font-weight: 700; color: ${color.brand}; line-height: 1.2;`;
const Pos = styled.span`display: block; font-size: 11px; font-weight: 600; color: ${color.label};`;
const Foot = styled.a`
  display: block;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${color.divider};
  font-size: 11px; font-weight: 700; letter-spacing: .04em;
  color: ${color.brand}; text-decoration: none;
  &:hover { text-decoration: underline; }
`;
const Msg = styled.div`padding: 18px 4px; font-size: 13px; font-weight: 600; color: ${color.label};`;

const SITE = 'https://www.faablab.app';

export default function EmbedWeek() {
  const [params] = useSearchParams();
  const budget = Number(params.get('budget')) || 200;
  const limit = Number(params.get('limit')) || 8;
  const pinnedWeek = params.get('week');
  const pinnedSeason = params.get('season');

  const [state, setState] = useState({ loading: true, error: null, players: [], week: null });
  const frameRef = useRef(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        let season = pinnedSeason && Number(pinnedSeason);
        let week = pinnedWeek && Number(pinnedWeek);
        if (!week) {
          const cur = await fetchCurrentWeek();
          season = season || cur.season;
          week = cur.week;
        }
        const data = await fetchWeek(week, { season, signal: ctrl.signal });
        setState({ loading: false, error: null, players: data.players, week: data.week ?? week });
      } catch (e) {
        if (e.name !== 'CanceledError') {
          setState({ loading: false, error: 'unavailable', players: [], week: null });
        }
      }
    })();
    return () => ctrl.abort();
  }, [pinnedSeason, pinnedWeek]);

  // Most-bid players first: an article wants the week's talking points, not
  // the tail of the target list.
  const rows = useMemo(
    () => [...state.players].sort((a, b) => (b.countAll || 0) - (a.countAll || 0)).slice(0, limit),
    [state.players, limit]
  );

  // Tell the host page how tall we are, so it can size the iframe instead of
  // guessing and leaving a scrollbar or a gap.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const post = () => {
      const height = Math.ceil(el.getBoundingClientRect().height) + 4;
      window.parent?.postMessage({ type: 'faablab:height', height }, '*');
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state.loading, rows.length]);

  const anySleeper = rows.some((p) => p.sleeper);

  return (
    <Frame ref={frameRef}>
      <Head>
        <Title>FAABLAB{state.week ? ` · Week ${state.week}` : ''}</Title>
        <Note>Dollars of a ${budget} budget</Note>
      </Head>

      {state.loading && <Msg>Loading this week's waiver market…</Msg>}
      {state.error && <Msg>Waiver data is unavailable right now.</Msg>}
      {!state.loading && !state.error && rows.length === 0 && (
        <Msg>No waiver targets posted for this week yet.</Msg>
      )}

      {rows.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Player</Th>
              <Th align="right">Crowd</Th>
              {anySleeper && <Th align="right">Sleeper</Th>}
              <Th align="right" hideNarrow>Bids</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <Td>
                  <Who>{p.name}</Who>
                  <Pos>{p.identity || `${p.position} - ${p.team}`}</Pos>
                </Td>
                <Td align="right">{p.median != null ? formatDollars(p.median, budget) : '—'}</Td>
                {anySleeper && (
                  <Td align="right" tone={color.safe}>
                    {p.sleeper ? formatDollars(p.sleeper.pct, budget) : '—'}
                  </Td>
                )}
                <Td align="right" hideNarrow tone={color.label}>
                  {formatCount(p.countAll || 0)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Foot href={SITE} target="_blank" rel="noopener noreferrer">
        See every target and place your own bid at faablab.app →
      </Foot>
    </Frame>
  );
}
