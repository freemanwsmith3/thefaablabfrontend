import React from 'react';
import styled from '@emotion/styled';
import { color, radius, shadow } from '../../design/tokens';
import { formatCount, formatDollars, formatRange, toDollars } from '../../lib/money';
import { barWidth, bucketColor, bucketShare, winningBucketIndex } from '../../lib/derive';

const Card = styled.div`
  background: ${color.card};
  border: 2px solid ${color.brand};
  border-radius: ${radius.card};
  padding: 14px;
  display: grid;
  gap: 14px;
`;
const Frame = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: ${radius.control};
  overflow: hidden;
  background: #fff;
  border: 1px solid ${color.borderSoft};
  display: grid;
  place-items: end center;
`;
const Name = styled.span`font-size: 20px; font-weight: 700; color: ${color.brand}; line-height: 1.15;`;
const Meta = styled.span`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${color.brand};
`;
// Sleeper's own demand signal, shown before anyone here has bid -- it is the
// only number on a fresh card, so it earns its place rather than duplicating
// the crowd data further down.
const Demand = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${color.label};
  text-align: center;
`;

// Lighter and smaller than the identity line above it, so the player's own
// team reads as part of who they are and the fixture reads as context.
const Matchup = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${color.textMuted};
`;

const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: ${color.label};
`;
const BigFigure = styled.span`font-size: 34px; font-weight: 700; color: ${color.brand}; line-height: 1;`;
const Sub = styled.span`font-size: 11px; font-weight: 600; color: ${color.label};`;
const Slider = styled.input`
  flex: 1;
  /* The prototype draws this 30px tall, but the token table requires a 44px
     minimum touch target. Growing the input satisfies both: the visible track
     stays 6px and the thumb 26px, only the hit area grows. */
  height: 44px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  &::-webkit-slider-runnable-track { height: 6px; border-radius: ${radius.bar}; background: ${color.borderSoft}; }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 26px; width: 26px; margin-top: -10px;
    border-radius: 50%; background: ${color.brand};
    border: 3px solid #fff; box-shadow: ${shadow.sliderThumb}; cursor: pointer;
  }
  &::-moz-range-track { height: 6px; border-radius: ${radius.bar}; background: ${color.borderSoft}; }
  &::-moz-range-thumb {
    height: 20px; width: 20px; border-radius: 50%;
    background: ${color.brand}; border: 3px solid #fff; cursor: pointer;
  }
`;
const Submit = styled.button`
  width: 100%;
  min-height: 48px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #fff;
  background: ${color.brand};
  border: 0;
  border-radius: ${radius.control};
  cursor: pointer;
  &:hover { background: ${color.brandHover}; }
`;
const Tile = styled.div`
  background: ${color.tint};
  border: 1px solid ${color.tintBorder};
  border-radius: ${radius.control};
  padding: 10px 8px;
  display: grid;
  gap: 3px;
  justify-items: center;
`;
const TileLabel = styled.span`font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: ${color.label};`;
const TileValue = styled.span`font-size: 19px; font-weight: 700; color: ${(p) => p.tone || color.brand};`;
const Track = styled.div`flex: 1; height: 22px; background: ${color.tint}; border-radius: ${radius.bar}; overflow: hidden;`;
const Fill = styled.div`height: 100%; border-radius: ${radius.bar};`;
const SleeperBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid ${color.borderSoft};
  border-radius: ${radius.control};
  padding: 12px;
`;

function Distribution({ player, budget }) {
  const win = winningBucketIndex(player.buckets, player.mode);
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <Eyebrow>DISTRIBUTION</Eyebrow>
      {player.buckets.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 'none', width: 54, fontSize: 12, fontWeight: 600, color: color.text, textAlign: 'right' }}>
            {formatRange(b.loPct, b.hiPct, budget)}
          </span>
          <Track>
            <Fill style={{ width: `${barWidth(b.bids, player.buckets)}%`, background: bucketColor(i, win) }} />
          </Track>
          <span style={{ flex: 'none', width: 60, fontSize: 12, fontWeight: 600, color: color.label }}>
            {bucketShare(b.bids, player.count)}% · {b.bids}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 14, fontSize: 11, fontWeight: 600, color: color.textMuted, paddingLeft: 64 }}>
        {[['Budget', color.budget], ['Winning', color.winning], ['Safe', color.safe]].map(([label, c]) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PlayerCard({ player, budget, teams, value, onChange, onSubmit, submittedPct }) {
  const done = submittedPct != null;
  const win = winningBucketIndex(player.buckets, player.mode);
  const winBucket = win >= 0 ? player.buckets[win] : null;

  return (
    <Card>
      <div style={{ display: 'grid', gap: 10 }}>
        <Frame>
          {player.image && (
            <img
              src={player.image}
              alt=""
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center', display: 'block' }}
            />
          )}
        </Frame>
        <div style={{ display: 'grid', gap: 2, textAlign: 'center' }}>
          <Name>{player.name}</Name>
          <Meta>{player.identity || player.meta}</Meta>
          {player.matchup ? <Matchup>{player.matchup}</Matchup> : null}
          {player.sleeperAdds ? (
            <Demand>{formatCount(player.sleeperAdds)} adds on Sleeper</Demand>
          ) : null}
        </div>
      </div>

      {!done && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ borderTop: `1px solid ${color.divider}`, paddingTop: 12 }}>
            <Eyebrow>YOUR BID</Eyebrow>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 92, display: 'grid', gap: 2 }}>
              <BigFigure>{formatDollars(value, budget)}</BigFigure>
              <Sub>{value}% of ${budget}</Sub>
            </div>
            <Slider
              type="range"
              min="0"
              max="60"
              step="1"
              value={value}
              aria-label={`Bid on ${player.name}, percent of FAAB`}
              onChange={(e) => onChange(Number(e.target.value))}
            />
          </div>
          <Submit onClick={onSubmit}>SUBMIT BID</Submit>
        </div>
      )}

      {done && (
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Deliberately small, not a banner. Edit is absent by decision: the
              API records one bid per browser per week and a resubmit is a
              no-op, so offering Edit would promise a change that never lands. */}
          <span style={{ fontSize: 12, fontWeight: 600, color: color.confirm }}>
            You bid {formatDollars(submittedPct, budget)} · {submittedPct}% of your ${budget} FAAB · {teams}-team
          </span>

          {!player.hasData ? (
            <div style={{ background: color.tint, border: `1px solid ${color.tintBorder}`, borderRadius: radius.control, padding: 12, fontSize: 13, fontWeight: 600, color: color.label }}>
              You're the first bid on this player.
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <Eyebrow>FROM FAABLAB BIDDERS</Eyebrow>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <Tile><TileLabel>MEDIAN</TileLabel><TileValue>{formatDollars(player.median, budget)}</TileValue></Tile>
                  <Tile>
                    <TileLabel>WINNING</TileLabel>
                    <TileValue tone={color.winning}>
                      {winBucket ? formatRange(winBucket.loPct, winBucket.hiPct, budget) : '—'}
                    </TileValue>
                  </Tile>
                  <Tile><TileLabel>BIDS</TileLabel><TileValue>{formatCount(player.count)}</TileValue></Tile>
                </div>
              </div>
              <Distribution player={player} budget={budget} />
            </>
          )}

          {player.sleeper && (
            <SleeperBox>
              <div style={{ display: 'grid', gap: 3 }}>
                <Eyebrow>AVERAGE BID ON SLEEPER</Eyebrow>
                <span style={{ fontSize: 12, fontWeight: 500, color: color.textMuted }}>
                  across {formatCount(player.sleeper.leagues)} leagues
                </span>
              </div>
              <span style={{ flex: 'none', fontSize: 34, fontWeight: 700, lineHeight: 1, color: color.safe }}>
                ${toDollars(player.sleeper.pct, budget)}
              </span>
            </SleeperBox>
          )}
        </div>
      )}
    </Card>
  );
}
