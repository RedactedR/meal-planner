import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { effectiveRecipe, isBudget, isVegetarian } from '../data/recipes';
import { allowedRecipes } from '../recipeFilters';
import { useAppState } from '../AppState';
import RecipeCard from '../components/RecipeCard';
import { useToast } from '../components/Toast';
import { money, recipeCosts } from '../pricing';
import { CAT, glow, radius, useStyles, useTheme } from '../theme';

const SORTS = [
  { key: 'cheap', label: 'Cheapest' },
  { key: 'filling', label: 'Most filling' },
  { key: 'protein', label: 'Most protein' },
];
const KINDS = ['All', 'Meatless', 'With meat'];

const TIPS = [
  ['🫘', 'Dried beans cost about a third of canned. Cook a big pot on the weekend and freeze it in portions.'],
  ['🍚', 'Buy rice, oats and pasta in the biggest bag you can store — it never goes bad.'],
  ['🍗', 'Leg quarters and drumsticks are the cheapest meat per pound. Simmer the bones for free broth.'],
  ['🥬', 'Cabbage, carrots, onions and potatoes last weeks in the fridge and stretch every meal.'],
  ['🧊', 'Frozen vegetables are picked ripe, cost less than fresh and never spoil before you use them.'],
  ['🥄', 'Bouillon instead of carton broth saves about $3 a pot.'],
];

// Cheap, filling meals: what a serving costs after what's already in
// your Kitchen, a one-tap "cheapest week" plan, and money-saving tips.
export default function BudgetScreen({ onOpenRecipe }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { settings, inventory, days, plan, setMeals } = useAppState();
  const [sort, setSort] = useState('cheap');
  const [kind, setKind] = useState('All');

  const meals = useMemo(() => {
    return allowedRecipes(settings)
      .filter(isBudget)
      .map((r) => {
        const cost = recipeCosts(effectiveRecipe(r, settings), settings.portions, inventory, settings);
        // What one serving costs you today: already-owned food is free.
        const serving = cost.priced ? Math.min(cost.perServing, cost.youPay / settings.portions) : Infinity;
        return { recipe: r, cost, serving };
      });
  }, [settings, inventory]);

  const shown = useMemo(() => {
    const list = meals.filter(({ recipe }) =>
      kind === 'All' ? true : kind === 'Meatless' ? isVegetarian(recipe) : !isVegetarian(recipe)
    );
    const per = (m, key) => (m.recipe.nutrition?.[key] || 0) / Math.max(m.serving, 0.01);
    if (sort === 'filling') return [...list].sort((a, b) => per(b, 'calories') - per(a, 'calories'));
    if (sort === 'protein') return [...list].sort((a, b) => per(b, 'protein') - per(a, 'protein'));
    return [...list].sort((a, b) => a.serving - b.serving);
  }, [meals, sort, kind]);

  // The cheapest week: the N cheapest budget dinners, one per planned day.
  const week = useMemo(() => {
    const picks = [...meals].sort((a, b) => a.serving - b.serving).slice(0, days.length);
    const total = picks.reduce((s, m) => s + m.serving * settings.portions, 0);
    return { picks, total, perServing: picks.length ? total / (picks.length * settings.portions) : 0 };
  }, [meals, days.length, settings.portions]);

  const cheapest = meals.length ? Math.min(...meals.map((m) => m.serving)) : 0;

  function planWeek() {
    const apply = () => {
      setMeals(Object.fromEntries(days.map((d, i) => [d, week.picks[i]?.recipe.id || null])));
      toast(`Planned ${week.picks.length} budget dinners ✓`);
    };
    const taken = days.filter((d) => plan.meals[d]).length;
    if (!taken) return apply();
    Alert.alert('Replace your week?', `This swaps out the ${taken} ${taken === 1 ? 'meal' : 'meals'} already planned.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Replace', onPress: apply },
    ]);
  }

  const header = (
    <View>
      <Text style={styles.title}>Budget</Text>
      <Text style={styles.subtitle}>
        {meals.length} cheap, filling meals · from {money(cheapest)} a serving
      </Text>

      {week.picks.length > 0 && (
        <View style={[styles.hero, glow(CAT.budget, colors.mode, 40, '55')]}>
          <Text style={styles.heroLabel}>Cheapest week</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroValue}>{money(week.total)}</Text>
            <Text style={styles.heroSide}>
              {week.picks.length} dinners for {settings.portions}
              {'\n'}
              {money(week.perServing)} a serving
            </Text>
          </View>
          <Text style={styles.heroList} numberOfLines={2}>
            {week.picks.map((m) => m.recipe.name).join(' · ')}
          </Text>
          <Pressable onPress={planWeek} style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.heroBtnText}>Plan my week with these</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.segment}>
        {SORTS.map((s) => (
          <Pressable key={s.key} onPress={() => setSort(s.key)} style={[styles.segmentBtn, sort === s.key && styles.segmentOn]}>
            <Text style={[styles.segmentText, sort === s.key && styles.segmentTextOn]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.kinds}>
        {KINDS.map((k) => (
          <Pressable key={k} onPress={() => setKind(k)} style={[styles.kind, kind === k && styles.kindOn]}>
            <Text style={[styles.kindText, kind === k && styles.kindTextOn]}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>
        {sort === 'cheap'
          ? 'Cheapest first, counting what’s already in your Kitchen.'
          : sort === 'filling'
          ? 'Most calories per dollar first — the best fuel for the money.'
          : 'Most protein per dollar first.'}
      </Text>
    </View>
  );

  const footer = (
    <View style={styles.tips}>
      <Text style={styles.tipsTitle}>Stretch every dollar</Text>
      {TIPS.map(([icon, text]) => (
        <View key={icon} style={styles.tip}>
          <Text style={styles.tipIcon}>{icon}</Text>
          <Text style={styles.tipText}>{text}</Text>
        </View>
      ))}
    </View>
  );

  const data = shown.length % 2 ? [...shown, null] : shown;

  return (
    <FlatList
      data={data}
      keyExtractor={(m, i) => (m ? m.recipe.id : `filler-${i}`)}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={<Text style={styles.empty}>No budget meals match your Settings.</Text>}
      renderItem={({ item }) =>
        item ? <RecipeCard variant="tile" recipe={item.recipe} onPress={() => onOpenRecipe(item.recipe)} /> : <View style={{ flex: 1 }} />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const makeStyles = (c) => ({
  title: { fontSize: 30, fontWeight: '800', color: c.text, paddingHorizontal: 20, marginTop: 8, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: c.muted, paddingHorizontal: 20, marginTop: 2 },
  hero: { marginHorizontal: 20, marginTop: 16, backgroundColor: CAT.budget, borderRadius: 24, padding: 18, gap: 8 },
  heroLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', color: c.ink, opacity: 0.75 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroValue: { fontSize: 38, fontWeight: '800', color: c.ink, letterSpacing: -1 },
  heroSide: { fontSize: 13, fontWeight: '800', color: c.ink, textAlign: 'right', lineHeight: 18 },
  heroList: { fontSize: 13, fontWeight: '600', color: c.ink, opacity: 0.8, lineHeight: 18 },
  heroBtn: { marginTop: 4, backgroundColor: c.ink, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  heroBtnText: { color: CAT.budget, fontSize: 15, fontWeight: '800' },
  segment: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
    borderRadius: 999, padding: 3,
  },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  segmentOn: { backgroundColor: c.text },
  segmentText: { color: c.muted, fontWeight: '700', fontSize: 13 },
  segmentTextOn: { color: c.mode === 'dark' ? c.ink : c.background, fontWeight: '800' },
  kinds: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  kind: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: c.border },
  kindOn: { backgroundColor: CAT.budget, borderColor: CAT.budget },
  kindText: { color: c.text, fontWeight: '700', fontSize: 13 },
  kindTextOn: { color: c.ink, fontWeight: '800' },
  hint: { fontSize: 13, color: c.muted, paddingHorizontal: 20, marginTop: 10, marginBottom: 12 },
  gridRow: { paddingHorizontal: 20, gap: 10 },
  empty: { textAlign: 'center', color: c.muted, marginTop: 30 },
  tips: {
    marginHorizontal: 20, marginTop: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
    borderRadius: radius.lg, padding: 16, gap: 12,
  },
  tipsTitle: { fontSize: 17, fontWeight: '800', color: c.text },
  tip: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipIcon: { fontSize: 18 },
  tipText: { flex: 1, fontSize: 14, color: c.text, lineHeight: 20 },
});
