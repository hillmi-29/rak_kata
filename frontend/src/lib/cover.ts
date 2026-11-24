import type { CSSProperties } from 'react';

export const COVER_PALETTE = [
  '#B3173B',
  '#14213D',
  '#D9A404',
  '#2F5D50',
  '#B4532A',
  '#6B8CAE',
  '#5E3A5D',
  '#1F5F63',
  '#C97B63',
  '#8B5E3C',
  '#1B1B1F',
  '#A7B79A',
  '#EFE4D2',
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(char => char + char)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function isLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

export function resolveCoverColor(seed: string, coverColor?: string | null): string {
  if (coverColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(coverColor)) return coverColor;
  return COVER_PALETTE[hashString(seed) % COVER_PALETTE.length];
}

export function coverTheme(seed: string, coverColor?: string | null) {
  const color = resolveCoverColor(seed, coverColor);
  const ink = isLight(color) ? '#1B1B1F' : '#FAF6EF';
  const mutedInk = isLight(color) ? 'rgba(27,27,31,0.66)' : 'rgba(250,246,239,0.72)';
  return {
    color,
    ink,
    mutedInk,
    variant: hashString(seed) % 4,
    style: {
      '--cover': color,
      '--cover-ink': ink,
    } as CSSProperties,
  };
}

export function titleSize(title: string): string {
  const length = title.length;
  if (length > 42) return '10.5cqw';
  if (length > 30) return '12.2cqw';
  if (length > 20) return '14.5cqw';
  if (length > 12) return '17cqw';
  return '20cqw';
}

export function spineWidth(pages?: number | null): number {
  const pageCount = pages || 300;
  return Math.max(20, Math.min(46, Math.round(17 + pageCount / 22)));
}

export function spineHeight(title: string, index: number): number {
  const base = 122 + (hashString(title) % 26);
  return Math.min(158, base + (index % 3) * 5);
}

export function coverVariantClass(variant: number): string {
  return `cover-motif cover-motif-${variant}`;
}
