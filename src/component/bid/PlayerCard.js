import React from 'react';
import styled from '@emotion/styled';
import { color, radius, TOUCH_MIN } from '../../design/tokens';
import { formatCount, formatDollars, formatRange, toDollars, toPercent } from '../../lib/money';
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
const Sub = styled.span`font-size: 11px; font-weight: 600; color: ${color.label};`;
const BidField = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: ${TOUCH_MIN}px;
  padding: 4px 14px;
  background: #fff;
  border: 2px solid ${(p) => (p.invalid ? color.winning : color.borderSoft)};
  border-radius: ${radius.control};
  &:focus-within { border-color: ${color.brand}; }
`;
const Prefix = styled.span`
  font-size: 30px; font-weight: 700; line-height: 1; color: ${color.label};
`;
/* A plain text box, deliberately empty. An earlier build seeded a slider with
   the crowd median, which let a bidder submit the crowd's own answer back as
   their bid -- the one input that tells us nothing. Typing is the point. */
const BidInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  color: ${color.brand};
  padding: 6px 0;
  &::placeholder { color: ${color.borderSoft}; font-weight: 600; }
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
  &:disabled { background: ${color.borderSoft}; cursor: not-allowed; }
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

export default function PlayerCard({ player, budget, value, onChange, onSubmit, submittedPct }) {
  const done = submittedPct != null;
  const pct = toPercent(value, budget);
  // Distinguished from a merely empty box so the reason can be named.
  const overBudget = value !== '' && Number(value) > budget;
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
        </div>
      </div>

      {!done && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ borderTop: `1px solid ${color.divider}`, paddingTop: 12 }}>
            <Eyebrow>YOUR BID</Eyebrow>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <BidField invalid={overBudget}>
              <Prefix>$</Prefix>
              <BidInput
                type="text"
                inputMode="numeric"
                value={value}
                aria-label={`Bid on ${player.name}, in dollars of your $${budget} FAAB`}
                // Digits only: strips pasted text and blocks the minus sign and
                // exponent notation that type="number" would otherwise accept.
                onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </BidField>
            <Sub>
              {overBudget
                ? `More than your $${budget} FAAB`
                : pct == null
                  ? `of your $${budget} FAAB`
                  : `${pct}% of your $${budget} FAAB`}
            </Sub>
          </div>
          <Submit onClick={onSubmit} disabled={pct == null}>SUBMIT BID</Submit>
        </div>
      )}

      {done && (
        <div style={{ display: 'grid', gap: 14 }}>
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
