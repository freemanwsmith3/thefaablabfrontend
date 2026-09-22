import React from 'react';
import styled from '@emotion/styled';
import { color, radius, shadow, TOUCH_MIN } from '../../design/tokens';

const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background: #fff;
  border-top: 2px solid ${color.brand};
  box-shadow: ${shadow.bottomBar};
`;
const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  /* The safe-area inset matters on iPhone: without it the home indicator
     overlaps the controls. */
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 14px;
`;
const Track = styled.div`height: 6px; border-radius: ${radius.bar}; background: #e0e9ec; overflow: hidden;`;
const Action = styled.button`
  flex: none;
  min-height: ${TOUCH_MIN}px;
  padding: 0 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: ${color.brand};
  background: #fff;
  border: 2px solid ${color.brand};
  border-radius: ${radius.control};
  cursor: pointer;
  &:hover { background: ${color.tint}; }
`;

export default function BottomBar({ doneCount, total, onTop }) {
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const complete = total > 0 && doneCount === total;
  return (
    <Bar>
      <Inner>
        <div style={{ flex: 1, display: 'grid', gap: 6, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: color.brand }}>
            {doneCount} {doneCount === 1 ? 'bid' : 'bids'} submitted
          </div>
          <Track>
            <div style={{ height: '100%', background: color.winning, width: `${pct}%` }} />
          </Track>
        </div>
        <Action onClick={onTop}>{complete ? 'Share' : 'Top'}</Action>
      </Inner>
    </Bar>
  );
}
