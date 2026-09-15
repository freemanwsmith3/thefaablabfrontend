import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { color, shadow, TOUCH_MIN, NAV_BREAKPOINT } from '../../design/tokens';
// The SVG is the wordmark at its true aspect ratio; logo.png is a 1:1
// square with the mark small inside it, which renders as a tiny box at 56px.
import logo from '../../assets/svg/logo.svg';

// Routes that exist in App.js. The previous version pointed at #anchors that
// went nowhere, so the menu opened and did nothing.
const LINKS = [
  { to: '/thisyear', label: 'PREVIOUS WEEKS' },
  { to: '/history', label: 'LAST SEASON' },
  { to: '/rankings', label: 'RANKINGS' },
  { to: '/about', label: 'ABOUT' },
];

// Deliberately not sticky: mobile viewport height is scarce and the filter bar
// is the only thing that pins.
const Bar = styled.div`
  position: relative;
  z-index: 30;
  background: ${color.brand};
  box-shadow: ${shadow.header};
`;
const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
`;
const NavLink = styled(Link)`
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-decoration: none;
  &:hover { color: ${color.onTealMuted}; }
`;
const MenuButton = styled.button`
  margin-left: auto;
  width: ${TOUCH_MIN}px;
  height: ${TOUCH_MIN}px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 5px;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
`;
const Rule = styled.span`
  width: 24px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
`;
const StackedNav = styled.nav`
  display: grid;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;
const StackedLink = styled(Link)`
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-decoration: none;
  padding: 15px 14px;
  &:not(:last-of-type) { border-bottom: 1px solid rgba(255, 255, 255, 0.12); }
`;
const WeekStrip = styled.div`background: ${color.brandDark};`;
const WeekInner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const WeekPill = styled.span`
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 5px 10px;
  border-radius: 999px;
`;
const Closes = styled.span`
  color: ${color.onTealMuted};
  font-size: 13px;
  font-weight: 500;
`;

export default function SiteHeader({ week, closesAt, narrow, menuOpen, onToggleMenu }) {
  return (
    <Bar>
      <Inner>
        <img src={logo} alt="FAABLab" style={{ height: 56, width: 'auto', display: 'block' }} />
        {!narrow && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 'auto' }}>
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
            ))}
          </nav>
        )}
        {narrow && (
          <MenuButton aria-label="Menu" aria-expanded={menuOpen} onClick={onToggleMenu}>
            <Rule /><Rule /><Rule />
          </MenuButton>
        )}
      </Inner>
      {narrow && menuOpen && (
        <StackedNav>
          {LINKS.map((l) => (
            <StackedLink key={l.to} to={l.to} onClick={onToggleMenu}>
              {l.label}
            </StackedLink>
          ))}
        </StackedNav>
      )}
      <WeekStrip>
        <WeekInner>
          <WeekPill>WEEK {week}</WeekPill>
          {closesAt && <Closes>{closesAt}</Closes>}
        </WeekInner>
      </WeekStrip>
    </Bar>
  );
}
export { NAV_BREAKPOINT };
