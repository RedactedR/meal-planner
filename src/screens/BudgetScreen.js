import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { effectiveRecipe, getRecipe, isBudget, isVegetarian } from '../data/recipes';
import { allowedRecipes } from '../recipeFilters';
import { DAY_NAMES, useAppState } from '../AppState';
import RecipeCard from '../components/RecipeCard';
import { useToast } from '../components/Toast';
import { money, recipeCosts } from '../pricing';
import { CAT, glow, radius, useStyles, useTheme } from '../theme';
import { BudgetInput, meterColor } from '../components/BudgetMeter';
import { planWithinBudget, staplesSpend, weekSpend } from '../budgetPlan';

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

// Cheap, filling meals ranked by what they cost to buy at the store
// (whole packages of what you're missing), a weekly budget, a one-tap
// plan that fits it, and money-saving tips.
export default function BudgetScreen({ onOpenRecipe }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { settings, inventory, days, plan, setMeals, snackList, updateSettings } = useAppState();
  const [planning, setPlanning] = useState(false);
  const [sort, setSort] = useState('cheap');
  const [kind, setKind] = useState('All');

  const meals = useMemo(() => {
    return allowedRecipes(settings)
      .filter(isBudget)
      .map((r) => {
        const cost = recipeCosts(effectiveRecipe(r, settings), settings.portions, inventory, settings);
        // What you'd spend at the store: whole packages of what's missing.
        const buy = cost.priced ? cost.youPay : Infinity;
        return { recipe: r, cost, buy };
      });
  }, [settings, inventory]);

  const shown = useMemo(() => {
    const list = meals.filter(({ recipe }) =>
      kind === 'All' ? true : kind === 'Meatless' ? isVegetarian(recipe) : !isVegetarian(recipe)
    );
    // Per dollar you'd spend: whole meal's calories or protein / cost to buy.
    const per = (m, key) => ((m.recipe.nutrition?.[key] || 0) * settings.portions) / Math.max(m.buy, 0.5);
    if (sort === 'filling') return [...list].sort((a, b) => per(b, 'calories') - per(a, 'calories'));
    if (sort === 'protein') return [...list].sort((a, b) => per(b, 'protein') - per(a, 'protein'));
    return [...list].sort((a, b) => a.buy - b.buy);
  }, [meals, sort, kind]);

  const budget = settings.weeklyBudget || 0;
  const plannedIds = days.map((d) => plan.meals[d]).filter(Boolean);
  const plannedKey = plannedIds.join(',');

  // What this week's grocery list costs: every package for the planned
  // meals and the snack list, minus what's already in your Kitchen.
  const spend = useMemo(() => {
    const total = weekSpend(plannedIds, settings, inventory, snackList);
    const meals = weekSpend(plannedIds, settings, inventory, {});
    const staples = staplesSpend(plannedIds, settings, inventory, snackList);
    return { total, meals, snacks: Math.max(0, total - meals), staples };
  }, [plannedKey, settings, inventory, snackList]);

  const cheapest = meals.length ? Math.min(...meals.map((m) => m.buy)) : 0;

  // Fill the week with the best dinners that fit the budget (or the
  // cheapest week when no budget is set). Runs after a frame so the
  // "Planning…" spinner shows while it works.
  function planWeek() {
    const run = () => {
      setPlanning(true);
      setTimeout(() => {
        const result = planWithinBudget({
          candidates: meals.map((m) => m.recipe),
          dayCount: days.length,
          budget: budget || 0,
          settings,
          inventory,
          snackList,
        });
        setPlanning(false);
        const apply = () => {
          setMeals(Object.fromEntries(days.map((d, i) => [d, result.ids[i] || null])));
          toast(`Planned ${result.ids.length} dinners · ${money(result.total)} ✓`);
        };
        if (budget && result.over) {
          Alert.alert(
            'That budget is tight',
            `The cheapest week the app can find costs ${money(result.total)} — ${money(result.total - budget)} over your ${money(budget)}. ` +
              'Adding pantry basics you already have to your Kitchen (oil, salt, spices) usually brings it down a lot.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Plan cheapest anyway', onPress: apply },
            ]
          );
          return;
        }
        apply();
      }, 30);
    };
    const taken = plannedIds.length;
    if (!taken) return run();
    Alert.alert('Replace your week?', `This swaps out the ${taken} ${taken === 1 ? 'meal' : 'meals'} already planned.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Replace', onPress: run },
    ]);
  }

  const over = budget > 0 && spend.total > budget + 0.005;
  const barColor = budget > 0 ? meterColor(spend.total, budget) : CAT.budget;

  const header = (
    <View>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Budget</Text>
          <Text style={styles.subtitle}>
            {meals.length} cheap meals · from {money(cheapest)} to buy
          </Text>
        </View>
        <View style={styles.budgetBox}>
          <Text style={styles.budgetLabel}>Weekly budget</Text>
          <BudgetInput value={budget} onChange={(weeklyBudget) => updateSettings({ weeklyBudget })} />
        </View>
      </View>

      <View style={[styles.hero, glow(CAT.budget, colors.mode, 40, '55')]}>
        <View style={styles.heroTop}>
          <Text style={styles.heroLabel}>
            This week · {plannedIds.length} of {days.length} dinners for {settings.portions}
          </Text>
          {budget > 0 && (
            <Text style={[styles.heroLeft, over && { color: '#7A0A0E' }]}>
              {over ? `${money(spend.total - budget)} over` : `${money(budget - spend.total)} left`}
            </Text>
          )}
        </View>
        <View style={styles.heroRow}>
          <Text style={styles.heroValue}>{money(spend.total)}</Text>
          {budget > 0 && <Text style={styles.heroOf}>of {money(budget)}</Text>}
        </View>
        {budget > 0 && (
          <View style={styles.heroTrack}>
            <View
              style={{
                width: `${Math.min(100, (spend.total / budget) * 100)}%`,
                height: '100%',
                borderRadius: 6,
                backgroundColor: barColor === CAT.budget ? colors.ink : barColor,
              }}
            />
          </View>
        )}
        <Text style={styles.heroSplit}>
          Meals {money(spend.meals)} · Snacks {money(spend.snacks)} · Kitchen items free
        </Text>
        {spend.staples >= 1 && (
          <Text style={styles.heroNote}>
            Includes {money(spend.staples)} of pantry basics (oil, salt, spices) that last for months.
          </Text>
        )}
        {plannedIds.length > 0 && (
          <View style={styles.weekList}>
            {days.map((d, i) => {
              const r = getRecipe(plan.meals[d]);
              if (!r) return null;
              return (
                <Pressable key={d} onPress={() => onOpenRecipe(r)} style={[styles.weekRow, i > 0 && styles.weekRowLine]}>
                  <Text style={styles.weekDay}>{(DAY_NAMES[d] || d).slice(0, 3)}</Text>
                  <Text style={styles.weekName} numberOfLines={1}>
                    {r.emoji} {r.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <Pressable onPress={planWeek} disabled={planning} style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.8 }]}>
          {planning ? (
            <ActivityIndicator color={CAT.budget} />
          ) : (
            <Text style={styles.heroBtnText}>{budget > 0 ? `Plan my week under ${money(budget)}` : 'Plan my cheapest week'}</Text>
          )}
        </Pressable>
        <Text style={styles.heroHint}>
          {budget > 0
            ? 'Picks the most protein and variety that still fits. Counts everything on your grocery list, snacks too.'
            : 'Set a weekly budget above and the app will plan the best week that fits it.'}
        </Text>
      </View>

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
          ? 'Cheapest to buy first — whole packages, minus what’s already in your Kitchen.'
          : sort === 'filling'
          ? 'Most calories for the money you’d spend first.'
          : 'Most protein for the money you’d spend first.'}
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
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: 8, gap: 12 },
  title: { fontSize: 30, fontWeight: '800', color: c.text, letterSpacing: -0.8 },
  subtitle: { fontSize: 14, color: c.muted, marginTop: 2 },
  budgetBox: { alignItems: 'flex-end', gap: 4 },
  budgetLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', color: c.muted },
  hero: { marginHorizontal: 20, marginTop: 16, backgroundColor: CAT.budget, borderRadius: 24, padding: 18, gap: 8 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  heroLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', color: c.ink, opacity: 0.75, flexShrink: 1 },
  heroLeft: { fontSize: 13, fontWeight: '800', color: c.ink },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  heroValue: { fontSize: 38, fontWeight: '800', color: c.ink, letterSpacing: -1 },
  heroOf: { fontSize: 16, fontWeight: '700', color: c.ink, opacity: 0.7 },
  heroTrack: { height: 12, borderRadius: 6, backgroundColor: 'rgba(11,13,20,0.16)', overflow: 'hidden' },
  heroSplit: { fontSize: 12.5, fontWeight: '700', color: c.ink, opacity: 0.8 },
  heroNote: { fontSize: 12.5, fontWeight: '600', color: c.ink, opacity: 0.8, lineHeight: 17 },
  heroHint: { fontSize: 12, fontWeight: '600', color: c.ink, opacity: 0.7, textAlign: 'center', lineHeight: 17 },
  weekList: { backgroundColor: 'rgba(11,13,20,0.10)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 2 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  weekRowLine: { borderTopWidth: 1, borderTopColor: 'rgba(11,13,20,0.12)' },
  weekDay: { width: 34, fontSize: 12, fontWeight: '800', color: c.ink, opacity: 0.7 },
  weekName: { flex: 1, fontSize: 13.5, fontWeight: '700', color: c.ink },
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
