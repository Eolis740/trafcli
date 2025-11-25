export const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`;

export const formatNumber = (value: number): string => value.toLocaleString();

export const formatMs = (value: number): string => `${value.toFixed(2)}`;

export const clampNumber = (value: number): number => (Number.isFinite(value) ? value : 0);
