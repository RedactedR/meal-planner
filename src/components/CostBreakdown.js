import { Text, View } from 'react-native';
import { CATEGORIES } from '../data/ingredients';
import { formatQty } from '../grocery';
import { money } from '../pricing';
import { radius, useStyles, useTheme } from '../theme';
import { StockIcon } from './Badges';

// Visual breakdown of a recipe's cost: a stacked bar by store section,
// then every ingredient with its own bar, price and stock icon.
export default function CostBreakdown({ cost, portions }) {
  const styles = useStyles(makeStyles);
  const c = useTheme();
  const max = Math.max(...cost.items.map((i) => i.cost), 0.01);
  const sections = CATEGORIES.filter((cat) => cost.byCategory[cat.key] > 0);
  const items = [...cost.items].sort((a, b) => b.cost - a.cost);

  return (
    <View>
      <View style={styles.summary}>
        <View style={styles.summaryCell}>
          <Text style={styles.big}>{money(cost.total)}</Text>
          <Text style={styles.small}>total</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={styles.big}>{money(cost.perServing)}</Text>
          <Text style={styles.small}>per serving</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={[styles.big, { color: c.primary }]}>{money(cost.youPay)}</Text>
          <Text style={styles.small}>{cost.savings > 0.005 ? `after ${money(cost.savings)} on hand` : 'to buy'}</Text>
        </View>
      </View>

      <View style={styles.stack}>
        {sections.map((cat) => (
          <View
            key={cat.key}
            style={{ flex: cost.byCategory[cat.key], backgroundColor: c.categories[cat.key] }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {sections.map((cat) => (
          <View key={cat.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c.categories[cat.key] }]} />
            <Text style={styles.legendText}>
              {cat.label} {money(cost.byCategory[cat.key])}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {items.map((i) => (
          <View key={i.name} style={styles.row}>
            <StockIcon status={i.status} />
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name} numberOfLines={1}>
                  {i.name}
                </Text>
                <Text style={styles.cost}>{money(i.cost)}</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={{
                    width: `${Math.max(3, (i.cost / max) * 100)}%`,
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: c.categories[i.category],
                    opacity: i.status === 'full' ? 0.35 : 1,
                  }}
                />
              </View>
              {i.have > 0 && (
                <Text style={styles.have}>
                  You have {formatQty(Math.round(i.have * 100) / 100, i.unit)}
                  {i.status === 'partial' ? ' — not quite enough' : ''}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.footnote}>
        Estimated King Soopers prices for {portions} {portions === 1 ? 'serving' : 'servings'}, counting only the
        amount the recipe uses. Live prices come when we connect your King Soopers account.
      </Text>
    </View>
  );
}

const makeStyles = (c) => ({
  summary: { flexDirection: 'row', gap: 8 },
  summaryCell: {
    flex: 1,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  big: { fontSize: 17, fontWeight: '800', color: c.text },
  small: { fontSize: 11, color: c.muted, marginTop: 2, textAlign: 'center' },
  stack: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 14, gap: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 12, color: c.muted },
  list: { marginTop: 14, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 14, color: c.text, flex: 1 },
  cost: { fontSize: 14, color: c.text, fontWeight: '600' },
  track: { height: 6, backgroundColor: c.border, borderRadius: 3, marginTop: 5, overflow: 'hidden' },
  have: { fontSize: 12, color: c.muted, marginTop: 3 },
  footnote: { fontSize: 12, color: c.muted, marginTop: 12, lineHeight: 17 },
});
