/** Central toolbar option lists — extend here when adding formats. */

export const HEADING_OPTIONS = [
  { label: 'Paragraph', value: false as const },
  { label: 'Heading 1', value: 1 as const },
  { label: 'Heading 2', value: 2 as const },
  { label: 'Heading 3', value: 3 as const },
  { label: 'Heading 4', value: 4 as const },
] as const;

export type HeadingValue = (typeof HEADING_OPTIONS)[number]['value'];

export const SIZE_OPTIONS = ['12px', '14px', '16px', '18px', '24px', '32px'] as const;
export type SizeValue = (typeof SIZE_OPTIONS)[number];

export const TEXT_COLORS = [
  '#0f172a',
  '#334155',
  '#64748b',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#0ea5e9',
  '#a855f7',
] as const;

export const HIGHLIGHT_COLORS = [
  'transparent',
  '#fef08a',
  '#bbf7d0',
  '#bae6fd',
  '#fbcfe8',
  '#fecaca',
  '#e2e8f0',
] as const;

/** Max insert-table picker size (rows × cols). */
export const TABLE_GRID_MAX = 8;
