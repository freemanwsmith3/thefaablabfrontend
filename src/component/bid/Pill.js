import styled from '@emotion/styled';
import { color, radius, TOUCH_MIN } from '../../design/tokens';

/** Shared pill: league presets and position filters use the same control. */
const Pill = styled.button`
  min-height: ${TOUCH_MIN}px;
  padding: 0 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: ${radius.control};
  cursor: pointer;
  white-space: nowrap;
  color: ${(p) => (p.selected ? '#fff' : color.brand)};
  background: ${(p) => (p.selected ? color.brand : '#fff')};
  border: 2px solid ${(p) => (p.selected ? color.brand : color.border)};
`;
export default Pill;
