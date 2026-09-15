import React from 'react';
import styled from '@emotion/styled';
import Pill from './Pill';
import { color, radius, TOUCH_MIN } from '../../design/tokens';

const TEAM_PRESETS = [10, 12, 14];
const BUDGET_PRESETS = [100, 200, 1000];

const Card = styled.div`
  background: ${color.card};
  border: 2px solid ${color.brand};
  border-radius: ${radius.card};
  overflow: hidden;
`;
const HeaderRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: none;
  border: 0;
  padding: 14px 16px;
  min-height: 56px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
`;
const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: ${color.label};
`;
const Summary = styled.span`font-size: 16px; font-weight: 600; color: ${color.brand};`;
const Chip = styled.span`
  flex: none;
  font-size: 13px;
  font-weight: 600;
  color: ${color.brand};
  border: 1px solid ${color.border};
  border-radius: 999px;
  padding: 8px 12px;
`;
const Body = styled.div`
  padding: 4px 16px 18px;
  display: grid;
  gap: 16px;
  border-top: 1px solid ${color.divider};
`;
const Group = styled.div`display: grid; gap: 8px;`;
const GroupLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${color.label};
`;
const Options = styled.div`display: flex; flex-wrap: wrap; align-items: center; gap: 8px;`;
const Custom = styled.input`
  width: ${(p) => p.width}px;
  min-height: ${TOUCH_MIN}px;
  box-sizing: border-box;
  padding: 0 10px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: ${color.brand};
  background: #fff;
  border: 2px solid ${color.border};
  border-radius: ${radius.control};
  outline: none;
  &:focus { border-color: ${color.brand}; }
`;

const clamp = (v, lo, hi, fallback) => {
  const n = Number(v);
  if (!n) return fallback;
  return Math.max(lo, Math.min(hi, n));
};

export default function LeagueSetup({ league, onChange, open, onToggle }) {
  const { teams, budget } = league;
  return (
    <Card>
      <HeaderRow onClick={onToggle} aria-expanded={open}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Eyebrow>ENTER YOUR LEAGUE SETTINGS</Eyebrow>
          <Summary>{teams} teams · ${budget} FAAB</Summary>
        </span>
        <Chip>{open ? 'Done' : 'Change'}</Chip>
      </HeaderRow>
      {open && (
        <Body>
          <Group style={{ paddingTop: 14 }}>
            <GroupLabel>TEAMS</GroupLabel>
            <Options>
              {TEAM_PRESETS.map((n) => (
                <Pill key={n} selected={teams === n} onClick={() => onChange({ teams: n })}>
                  {n}
                </Pill>
              ))}
              <Custom
                width={84}
                type="number"
                min="2"
                max="32"
                placeholder="Other"
                value={TEAM_PRESETS.includes(teams) ? '' : teams}
                onChange={(e) => onChange({ teams: clamp(e.target.value, 2, 32, 12) })}
              />
            </Options>
          </Group>
          <Group>
            <GroupLabel>FAAB BUDGET</GroupLabel>
            <Options>
              {BUDGET_PRESETS.map((n) => (
                <Pill key={n} selected={budget === n} onClick={() => onChange({ budget: n })}>
                  ${n}
                </Pill>
              ))}
              <Custom
                width={96}
                type="number"
                min="1"
                max="10000"
                placeholder="Other"
                value={BUDGET_PRESETS.includes(budget) ? '' : budget}
                onChange={(e) => onChange({ budget: clamp(e.target.value, 1, 10000, 100) })}
              />
            </Options>
          </Group>
        </Body>
      )}
    </Card>
  );
}
