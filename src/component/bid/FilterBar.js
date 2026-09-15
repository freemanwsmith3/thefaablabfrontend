import React from 'react';
import styled from '@emotion/styled';
import Pill from './Pill';
import { color, radius, shadow } from '../../design/tokens';

export const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE'];

// The only pinned element at the top of the page.
const Bar = styled.div`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${color.page};
  box-shadow: ${shadow.filterBar};
`;
const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 10px 14px;
  display: grid;
  gap: 8px;
`;
const Search = styled.input`
  width: 100%;
  box-sizing: border-box;
  min-height: 46px;
  padding: 0 14px;
  font-family: inherit;
  /* 16px avoids iOS zoom-on-focus. */
  font-size: 16px;
  color: ${color.text};
  background: #fff;
  border: 1px solid ${color.border};
  border-radius: ${radius.card};
  outline: none;
  &:focus { border-color: ${color.brand}; }
`;
const Chips = styled.div`display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;`;

export default function FilterBar({ query, onQuery, pos, onPos }) {
  return (
    <Bar>
      <Inner>
        <Search
          type="search"
          placeholder="Search by player name"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        <Chips>
          {POSITIONS.map((p) => (
            <Pill key={p} selected={pos === p} onClick={() => onPos(p)}>
              {p === 'ALL' ? 'All' : p}
            </Pill>
          ))}
        </Chips>
      </Inner>
    </Bar>
  );
}
