// Design tokens from the redesign handoff (README.md "Design tokens").
// These are the spec: exact values, not approximations. Anything visual should
// read from here rather than hardcoding a hex.

export const color = {
  brand: '#035e7b',        // header, card borders, headings, primary button
  brandDark: '#02495f',    // week strip
  brandHover: '#02465c',   // primary button hover
  page: '#EBEBEB',         // body
  card: '#ffffff',
  tint: '#f2f7f9',         // stat tiles, bar tracks
  tintBorder: '#dceaee',
  border: '#b7d3dc',       // inactive pills, inputs
  borderSoft: '#cfe0e6',   // photo frame, slider track
  divider: '#e3ecef',
  text: '#14343f',
  textMuted: '#4d707c',
  label: '#5593a6',        // eyebrows, captions
  onTealMuted: '#bfe0ea',
  budget: '#ef4444',       // buckets below the winning bucket
  winning: '#10b981',      // winning bucket, progress fill
  safe: '#3b82f6',         // buckets above, Sleeper figure
  confirm: '#0b7150',      // "You bid ..."
};

export const font = {
  family: "Barlow, system-ui, sans-serif",
  // role: [size, weight]
  playerName: ['20px', 700],
  bigFigure: ['34px', 700],
  tileValue: ['19px', 700],
  leagueSummary: ['16px', 600],
  body: ['15px', 500],
  playerMeta: ['15px', 600],
  pill: ['14px', 600],
};

export const space = [2, 4, 6, 8, 10, 12, 14, 16, 20];
export const gutter = 14;

export const radius = {
  bar: '3px',
  control: '6px',
  card: '8px',
  pill: '999px',
};

export const shadow = {
  header: '0 2px 10px rgba(0,0,0,.18)',
  filterBar: '0 8px 12px -8px rgba(0,0,0,.18)',
  bottomBar: '0 -4px 16px rgba(0,0,0,.12)',
  sliderThumb: '0 1px 4px rgba(0,0,0,.35)',
};

// Nothing interactive may be smaller than this.
export const TOUCH_MIN = 44;
// Viewport width at which the nav switches to a hamburger.
export const NAV_BREAKPOINT = 760;
// The fixed bottom bar's clearance, applied as body padding-bottom.
export const BOTTOM_BAR_CLEARANCE = 104;
