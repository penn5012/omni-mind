export const AppColors = {
  bgPrimary: '#0B0F17',
  bgSurface: '#161C28',
  bgElevated: '#1E2638',
  borderSubtle: '#2A344B',
  accentPrimary: '#6366F1',
  accentCyan: '#06B6D4',
  statusSuccess: '#10B981',
  statusWarning: '#F59E0B',
  statusError: '#EF4444',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  white: '#FFFFFF',
  overlayDark: 'rgba(0, 0, 0, 0.55)',
  cyanTint: 'rgba(6, 182, 212, 0.18)',
  warningTint: 'rgba(245, 158, 11, 0.16)',
  successTint: 'rgba(16, 185, 129, 0.16)',
  errorTint: 'rgba(239, 68, 68, 0.16)',
} as const;

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const AppRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const AppTypography = {
  fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
  headlineSize: 20,
  titleSize: 16,
  bodySize: 14,
  captionSize: 12,
} as const;
