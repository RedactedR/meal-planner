import { Text, View } from 'react-native';
import { CATEGORIES } from '../data/ingredients';
import { formatQty } from '../grocery';
import { money } from '../pricing';
import { approxAmount, packageWord, packLabel } from '../packages';
import { radius, useStyles, useTheme } from '../theme';
import { StockIcon } from './Badges';

// Two prices for every recipe:
//   All ingredients – every package you'd buy with an empty kitchen
//   This recipe     – just the amounts the recipe uses (1 tbsp of a $5 bottle ≈ 15¢)
// …plus what you'd actually pay after what's in your Kitchen, and a
// line per ingredient.
export default function CostBreakdown({ cost, portions, servingWord = 'serving' }) {
  const styles = useStyles(makeStyles);
  const c = useTheme();
  const items = [...cost.items].sort((a, b) => (b.usedValue || 0) - (a.usedValue || 0));
  const max = Math.max(...items.map((i) => i.usedValue || 0), 0.01);
  const sections = CATEGORIES.filter((cat) => cost.usedByCategory[cat.key] > 0.005);

  return (
    <View>
      <View style={styles.grid}>
        <Tile label="All ingredients" sub="every package, full price" value={money(cost.total)} />
        <Tile label="This recipe" sub="only what it uses" value={money(cost.usedValue)} strong />
        <Tile label={`Per ${servingWord}`} sub={`${portions} ${servingWord}s`} value={money(cost.perServing)} />
        <Tile
          label="You pay today"
          sub={cost.savings > 0.005 ? `${money(cost.savings)} already in your Kitchen` : 'nothing in your Kitchen yet'}
          value={money(cost.youPay)}
          accent
        />
      </View>
      <Text style={styles.explain}>
        You buy whole packages, so the first time costs more. What the recipe doesn't use stays in your Kitchen and makes
        the next meal cheaper.
      </Text>

      <View style={styles.stack}>
        {sections.map((cat) => (
          <View key={cat.key} style={{ flex: cost.usedByCategory[cat.key], backgroundColor: c.categories[cat.key] }} />
        ))}
      </View>
      <View style={styles.legend}>
        {sections.map((cat) => (
          <View key={cat.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c.categories[cat.key] }]} />
            <Text style={styles.legendText}>
              {cat.label} {money(cost.usedByCategory[cat.key])}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.headRow}>
        <Text style={styles.headText}>Ingredient</Text>
        <Text style={styles.headText}>Recipe uses</Text>
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
                <Text style={styles.cost}>{money(i.usedValue || 0)}</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={{
                    width: `${Math.max(3, ((i.usedValue || 0) / max) * 100)}%`,
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: c.categories[i.category],
                  }}
                />
              </View>
              <Text style={styles.detail}>
                Uses {formatQty(Math.round(i.need * 100) / 100, i.unit)} of a {money(i.packPrice)}{' '}
                {packageWord(i.using || i.name)}
              </Text>
              <Text style={[styles.detail, i.buyPacks === 0 ? { color: c.primary } : null]}>
                {i.buyPacks === 0
                  ? `✓ ${i.using ? `Using your ${i.using.toLowerCase()}` : 'You have it'}`
                  : `Buy ${packLabel(i.name, i.unit, i.buyPacks)} · ${money(i.buyCost)}`}
                {i.leftover > 0.01 ? ` · ${leftoverText(i)} left after` : ''}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.footnote}>
        Estimated King Soopers prices. Live prices show when you send your list to your cart.
      </Text>
    </View>
  );

  function Tile({ label, sub, value, strong, accent }) {
    return (
      <View style={[styles.tile, strong && styles.tileStrong]}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={[styles.tileValue, strong && { color: c.primary }, accent && { color: c.accent }]}>{value}</Text>
        <Text style={styles.tileSub}>{sub}</Text>
      </View>
    );
  }
}

function leftoverText(i) {
  const approx = approxAmount(i.using && i.buyPacks === 0 ? i.using : i.name, i.leftover);
  if (approx) return approx;
  return formatQty(Math.round(i.leftover * 100) / 100, i.unit);
}

const makeStyles = (c) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '48.5%',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tileStrong: { borderColor: c.primary, backgroundColor: c.primarySoft },
  tileLabel: { fontSize: 12, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  tileValue: { fontSize: 22, fontWeight: '800', color: c.text, marginTop: 2 },
  tileSub: { fontSize: 11, color: c.muted, marginTop: 1 },
  explain: { fontSize: 12, color: c.muted, marginTop: 10, lineHeight: 17 },
  stack: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 14, gap: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 12, color: c.muted },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingLeft: 30 },
  headText: { fontSize: 11, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  list: { marginTop: 8, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 14, color: c.text, flex: 1 },
  cost: { fontSize: 14, color: c.text, fontWeight: '700' },
  track: { height: 6, backgroundColor: c.border, borderRadius: 3, marginTop: 5, overflow: 'hidden' },
  detail: { fontSize: 12, color: c.muted, marginTop: 3 },
  footnote: { fontSize: 12, color: c.muted, marginTop: 12, lineHeight: 17 },
});
