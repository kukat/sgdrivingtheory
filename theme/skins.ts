import type { TestId } from '@/lib/tests';
import type { TextStyle } from 'react-native';

export const SKIN_IDS = ['system', 'handbook', 'night'] as const;
export type SkinId = (typeof SKIN_IDS)[number];

export type ColorScheme = 'light' | 'dark';

export type SkinColors = {
  background: string;
  surface: string;
  card: string;
  label: string;
  secondary: string;
  separator: string;
  accent: string;
  onAccent: string;
  button: string;
  onButton: string;
  ghostBorder: string;
  correct: string;
  correctBg: string;
  wrong: string;
  wrongBg: string;
  progressTrack: string;
  badge: string;
  onBadge: string;
  testTint: Record<TestId, string>;
};

export type ResolvedSkin = {
  id: SkinId;
  name: string;
  blurb: string;
  scheme: ColorScheme;
  colors: SkinColors;
  displayFont: string | undefined;
  radius: {
    card: number;
    button: number;
    badge: number;
    glyph: number;
  };
  type: {
    kicker: TextStyle;
    display: TextStyle;
    title: TextStyle;
    headline: TextStyle;
    body: TextStyle;
    caption: TextStyle;
  };
};

export const SKIN_META: Record<
  SkinId,
  { name: string; blurb: string; preview: [string, string, string] }
> = {
  system: {
    name: 'System',
    blurb: 'Native grouped lists. Follows light and dark mode.',
    preview: ['#C7C7CC', '#007AFF', '#34C759'],
  },
  handbook: {
    name: 'Handbook',
    blurb: 'Paper, serif titles, chapter numbers.',
    preview: ['#EFE6D4', '#B54412', '#1B1610'],
  },
  night: {
    name: 'Night road',
    blurb: 'Dark cabin, road-mark yellow, highway plates.',
    preview: ['#0B0F14', '#F5C518', '#3DDC84'],
  },
};

function serifFamily() {
  return process.env.EXPO_OS === 'ios' ? 'Iowan Old Style' : 'serif';
}

function systemLight(): SkinColors {
  return {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    label: '#000000',
    secondary: '#6C6C70',
    separator: 'rgba(60, 60, 67, 0.12)',
    accent: '#007AFF',
    onAccent: '#FFFFFF',
    button: '#007AFF',
    onButton: '#FFFFFF',
    ghostBorder: 'rgba(60, 60, 67, 0.18)',
    correct: '#34C759',
    correctBg: 'rgba(52, 199, 89, 0.14)',
    wrong: '#FF3B30',
    wrongBg: 'rgba(255, 59, 48, 0.12)',
    progressTrack: 'rgba(120, 120, 128, 0.16)',
    badge: 'rgba(120, 120, 128, 0.16)',
    onBadge: '#000000',
    testTint: { btt: '#FF9F0A', ftt: '#30B0C7', rtt: '#007AFF' },
  };
}

function systemDark(): SkinColors {
  return {
    background: '#000000',
    surface: '#1C1C1E',
    card: '#1C1C1E',
    label: '#FFFFFF',
    secondary: '#98989D',
    separator: 'rgba(84, 84, 88, 0.65)',
    accent: '#0A84FF',
    onAccent: '#FFFFFF',
    button: '#0A84FF',
    onButton: '#FFFFFF',
    ghostBorder: 'rgba(84, 84, 88, 0.65)',
    correct: '#30D158',
    correctBg: 'rgba(48, 209, 88, 0.16)',
    wrong: '#FF453A',
    wrongBg: 'rgba(255, 69, 58, 0.16)',
    progressTrack: 'rgba(120, 120, 128, 0.32)',
    badge: 'rgba(120, 120, 128, 0.32)',
    onBadge: '#FFFFFF',
    testTint: { btt: '#FF9F0A', ftt: '#64D2FF', rtt: '#0A84FF' },
  };
}

function handbookColors(): SkinColors {
  return {
    background: '#EFE6D4',
    surface: '#FFF8EB',
    card: '#FFF8EB',
    label: '#1B1610',
    secondary: '#7A7164',
    separator: 'rgba(80, 60, 30, 0.14)',
    accent: '#B54412',
    onAccent: '#FFF8EB',
    button: '#1B1610',
    onButton: '#F7F0E2',
    ghostBorder: 'rgba(27, 22, 16, 0.28)',
    correct: '#2F6A3A',
    correctBg: '#E4F0D8',
    wrong: '#B42318',
    wrongBg: '#F8D9D4',
    progressTrack: 'rgba(80, 60, 30, 0.12)',
    badge: 'transparent',
    onBadge: '#7A7164',
    testTint: { btt: '#B54412', ftt: '#2F6A6A', rtt: '#3B4A8A' },
  };
}

function nightColors(): SkinColors {
  return {
    background: '#0B0F14',
    surface: '#141A22',
    card: '#141A22',
    label: '#F3EEE4',
    secondary: '#8B97A6',
    separator: '#243040',
    accent: '#F5C518',
    onAccent: '#111111',
    button: '#F5C518',
    onButton: '#111111',
    ghostBorder: '#3A4656',
    correct: '#3DDC84',
    correctBg: '#12261C',
    wrong: '#FF4D3A',
    wrongBg: '#2A1210',
    progressTrack: '#1C2530',
    badge: '#0B0F14',
    onBadge: '#F5C518',
    testTint: { btt: '#F5C518', ftt: '#4EC3D8', rtt: '#7AA2FF' },
  };
}

function systemType(colors: SkinColors): ResolvedSkin['type'] {
  return {
    kicker: {
      fontSize: 13,
      fontWeight: '400',
      letterSpacing: 0.2,
      textTransform: 'uppercase',
      color: colors.secondary,
    },
    display: { fontSize: 34, fontWeight: '700', letterSpacing: -0.6, color: colors.label },
    title: { fontSize: 22, fontWeight: '600', color: colors.label },
    headline: { fontSize: 17, fontWeight: '600', color: colors.label },
    body: { fontSize: 17, fontWeight: '400', color: colors.label },
    caption: { fontSize: 13, fontWeight: '400', color: colors.secondary },
  };
}

function handbookType(colors: SkinColors): ResolvedSkin['type'] {
  const serif = serifFamily();
  return {
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: colors.accent,
      fontFamily: undefined,
    },
    display: {
      fontSize: 40,
      fontWeight: '600',
      letterSpacing: -0.8,
      color: colors.label,
      fontFamily: serif,
    },
    title: {
      fontSize: 26,
      fontWeight: '600',
      letterSpacing: -0.4,
      color: colors.label,
      fontFamily: serif,
    },
    headline: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.label,
      fontFamily: serif,
    },
    body: { fontSize: 16, fontWeight: '400', color: colors.label },
    caption: { fontSize: 13, fontWeight: '400', color: colors.secondary },
  };
}

function nightType(colors: SkinColors): ResolvedSkin['type'] {
  return {
    kicker: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: colors.accent,
    },
    display: {
      fontSize: 48,
      fontWeight: '700',
      letterSpacing: -1,
      color: colors.label,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.label,
    },
    headline: { fontSize: 16, fontWeight: '600', color: colors.label },
    body: { fontSize: 16, fontWeight: '400', color: colors.label },
    caption: { fontSize: 13, fontWeight: '400', color: colors.secondary },
  };
}

export function isSkinId(value: string | null | undefined): value is SkinId {
  return value === 'system' || value === 'handbook' || value === 'night';
}

export function resolveSkin(id: SkinId, osScheme: ColorScheme): ResolvedSkin {
  if (id === 'handbook') {
    const colors = handbookColors();
    return {
      id,
      ...SKIN_META.handbook,
      scheme: 'light',
      colors,
      displayFont: serifFamily(),
      radius: { card: 6, button: 4, badge: 0, glyph: 7 },
      type: handbookType(colors),
    };
  }

  if (id === 'night') {
    const colors = nightColors();
    return {
      id,
      ...SKIN_META.night,
      scheme: 'dark',
      colors,
      displayFont: undefined,
      radius: { card: 4, button: 4, badge: 2, glyph: 2 },
      type: nightType(colors),
    };
  }

  const scheme = osScheme;
  const colors = scheme === 'dark' ? systemDark() : systemLight();
  return {
    id: 'system',
    ...SKIN_META.system,
    scheme,
    colors,
    displayFont: undefined,
    radius: { card: 10, button: 14, badge: 999, glyph: 7 },
    type: systemType(colors),
  };
}
