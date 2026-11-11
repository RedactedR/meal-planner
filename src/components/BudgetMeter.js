import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { money } from '../pricing';
import { CAT, useStyles, useTheme } from '../theme';

// Bar that fills toward your weekly budget: gold while there's room,
// orange when you're close, red once you're over.
export function meterColor(spent, budget) {
  if (spent > budget + 0.005) return CAT.classic;
  if (spent >= budget * 0.9) return CAT.protein;
  return CAT.budget;
}

export default function BudgetMeter({ spent, budget, label = 'This week', compact }) {
  const styles = useStyles(makeStyles);
  const color = meterColor(spent, budget);
  const over = spent > budget + 0.005;
  const pct = budget > 0 ? Math.min(1, spent / budget) : 0;
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.row}>
        <Text style={styles.label}>
          {label} · <Text style={styles.strong}>{money(spent)}</Text> of {money(budget)}
        </Text>
        <Text style={[styles.left, { color }]}>{over ? `${money(spent - budget)} over` : `${money(budget - spent)} left`}</Text>
      </View>
      <View style={styles.track}>
        <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 4, backgroundColor: color }} />
      </View>
    </View>
  );
}

// "$ [ 50 ]" box. Saves when you finish typing; empty or 0 clears the budget.
export function BudgetInput({ value, onChange, style }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const [text, setText] = useState(value ? String(value) : '');
  return (
    <View style={[styles.inputBox, style]}>
      <Text style={styles.dollar}>$</Text>
      <TextInput
        value={text}
        onChangeText={(t) => setText(t.replace(/[^0-9.]/g, ''))}
        onEndEditing={() => {
          const n = parseFloat(text);
          const next = Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
          if (next !== (value || 0)) onChange(next);
        }}
        placeholder="0"
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
        keyboardAppearance={colors.mode}
        returnKeyType="done"
        style={styles.input}
        accessibilityLabel="Weekly food budget"
      />
    </View>
  );
}

const makeStyles = (c) => ({
  wrap: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12, gap: 8 },
  compact: { marginHorizontal: 20, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  label: { fontSize: 13, color: c.muted, fontWeight: '600', flexShrink: 1 },
  strong: { color: c.text, fontWeight: '800' },
  left: { fontSize: 13, fontWeight: '800' },
  track: { height: 8, borderRadius: 4, backgroundColor: c.border, overflow: 'hidden' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 2, height: 46, paddingHorizontal: 12, borderRadius: 14,
    backgroundColor: c.surface, borderWidth: 1.5, borderColor: CAT.budget,
  },
  dollar: { fontSize: 20, fontWeight: '800', color: CAT.budget },
  input: { minWidth: 60, fontSize: 20, fontWeight: '800', color: c.text, paddingVertical: 0 },
});
