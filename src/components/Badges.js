import { Text, View } from 'react-native';
import { useTheme } from '../theme';

// Little round icon: ✓ in stock, ½ some in stock, 🛒 need to buy.
export function StockIcon({ status, size = 20 }) {
  const c = useTheme();
  const look = {
    full: { bg: c.primarySoft, fg: c.primary, label: '✓' },
    partial: { bg: c.warnSoft, fg: c.warn, label: '½' },
    none: { bg: c.border, fg: c.muted, label: '+' },
  }[status];
  return (
    <View
      accessibilityLabel={status === 'full' ? 'In stock' : status === 'partial' ? 'Some in stock' : 'Need to buy'}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: look.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: look.fg, fontSize: size * 0.6, fontWeight: '800' }}>{look.label}</Text>
    </View>
  );
}

// Small rounded label, e.g. "Balanced" or "🍳 One pan".
export function Pill({ label, tone = 'primary' }) {
  const c = useTheme();
  const tones = {
    primary: [c.primarySoft, c.primary],
    accent: [c.accentSoft, c.accent],
    warn: [c.warnSoft, c.warn],
  };
  const [bg, fg] = tones[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: fg }}>{label}</Text>
    </View>
  );
}
