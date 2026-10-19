import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, useStyles, useTheme } from '../theme';
import { DAY_NAMES, useAppState } from '../AppState';
import { getRecipe, isBalanced } from '../data/recipes';
import { cookingQty, formatQty } from '../grocery';
import { isExcluded } from '../recipeFilters';
import { ToastProvider, useToast } from './Toast';
import Stars from './Stars';
import CostBreakdown from './CostBreakdown';
import { Pill, StockIcon } from './Badges';
import { recipeCosts } from '../pricing';

// Full-screen view of one recipe: your week, rating, cost breakdown,
// nutrition, ingredients (with stock icons) and steps.
export default function RecipeDetail({ recipe, onClose }) {
  return (
    <Modal visible={!!recipe} animationType="slide" onRequestClose={onClose}>
      <ToastProvider>{recipe && <DetailContent recipe={recipe} onClose={onClose} />}</ToastProvider>
    </Modal>
  );
}

function DetailContent({ recipe, onClose }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { days, plan, settings, ratings, inventory, setMeal, rate, consumeInventory } = useAppState();
  const portions = settings.portions;
  const freeDays = days.filter((d) => !plan.meals[d]).length;
  const excluded = isExcluded(recipe, settings);
  const cost = recipeCosts(recipe, portions, inventory);
  const stockByName = Object.fromEntries(cost.items.map((i) => [i.name, i.status]));

  function markCooked() {
    const used = cost.items.filter((i) => i.have > 0);
    if (used.length === 0) return toast('Nothing from your Kitchen to take out');
    Alert.alert('Cooked it?', `Take the ingredients for ${portions} out of your Kitchen inventory.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update Kitchen',
        onPress: () => {
          consumeInventory(used.map((i) => ({ name: i.name, unit: i.unit, qty: Math.min(i.have, i.need) })));
          toast(`Updated your Kitchen (${used.length} items) ✓`);
        },
      },
    ]);
  }

  function toggleDay(day) {
    const current = plan.meals[day];
    if (current === recipe.id) {
      setMeal(day, null);
      toast(`Removed from ${DAY_NAMES[day]}`);
    } else {
      setMeal(day, recipe.id);
      const replaced = current && getRecipe(current);
      toast(
        replaced
          ? `Swapped ${replaced.name} for ${recipe.name} on ${DAY_NAMES[day]}`
          : `Added ${recipe.name} to ${DAY_NAMES[day]} ✓`
      );
    }
  }

  const n = recipe.nutrition;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.emoji}>{recipe.emoji}</Text>
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.meta}>
          {recipe.cuisine} · {recipe.minutes} min · amounts for {portions} {portions === 1 ? 'person' : 'people'}
        </Text>
        <View style={styles.pills}>
          {recipe.onePan && <Pill label="🍳 One pan — easy cleanup" tone="accent" />}
          {isBalanced(recipe) && <Pill label="Balanced" />}
          <Pill label={`${cost.inStockCount}/${cost.items.length} in stock`} tone={cost.inStockCount ? 'primary' : 'warn'} />
        </View>

        {excluded && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Heads up: this recipe has something on your avoid list in Settings.
            </Text>
          </View>
        )}

        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Your rating</Text>
          <Stars value={ratings[recipe.id] || 0} size={26} onRate={(s) => rate(recipe.id, s)} />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Your week</Text>
          <Text style={styles.sectionNote}>
            {freeDays === 0 ? 'Week is full' : `${freeDays} ${freeDays === 1 ? 'day' : 'days'} free`}
          </Text>
        </View>
        <View style={styles.card}>
          {days.map((day, i) => {
            const current = getRecipe(plan.meals[day]);
            const isThis = current?.id === recipe.id;
            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                style={({ pressed }) => [styles.weekRow, i > 0 && styles.rowBorder, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.weekDay}>{day}</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.weekMeal, !current && { color: colors.muted, fontStyle: 'italic' }]}
                >
                  {current ? `${current.emoji} ${current.name}` : 'Free'}
                </Text>
                <View style={[styles.weekBtn, isThis ? styles.weekBtnOn : current ? styles.weekBtnSwap : null]}>
                  <Text style={[styles.weekBtnText, isThis && { color: colors.onPrimary }]}>
                    {isThis ? '✓ Added' : current ? 'Swap' : 'Add'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Cost breakdown</Text>
        <CostBreakdown cost={cost} portions={portions} />

        {n && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Nutrition per serving</Text>
              {isBalanced(recipe) && <Text style={styles.balanced}>Balanced meal</Text>}
            </View>
            <View style={styles.nutriGrid}>
              {[
                ['Calories', n.calories, ''],
                ['Protein', n.protein, 'g'],
                ['Carbs', n.carbs, 'g'],
                ['Fat', n.fat, 'g'],
                ['Fiber', n.fiber, 'g'],
                ['Veg', n.veg, ' cups'],
              ].map(([label, value, unit]) => (
                <View key={label} style={styles.nutriCell}>
                  <Text style={styles.nutriValue}>
                    {value}
                    {unit}
                  </Text>
                  <Text style={styles.nutriLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.footnote}>Estimates. Exact numbers depend on brands and portions.</Text>
          </>
        )}

        <Text style={styles.section}>Ingredients</Text>
        {recipe.ingredients.map((ing) => (
          <View key={ing.name} style={styles.ingRow}>
            <StockIcon status={stockByName[ing.name]} size={18} />
            <Text style={styles.ingName}>{ing.name}</Text>
            <Text style={styles.ingQty}>{formatQty(cookingQty(ing, recipe, portions), ing.unit)}</Text>
          </View>
        ))}

        <Text style={styles.section}>Instructions</Text>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}

        <Pressable onPress={markCooked} style={({ pressed }) => [styles.cookedBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.cookedText}>I cooked this — update my Kitchen</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.background },
  header: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'flex-end' },
  close: { fontSize: 16, color: c.primary, fontWeight: '600' },
  body: { paddingHorizontal: 20, paddingBottom: 60 },
  emoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '700', color: c.text, marginTop: 8 },
  meta: { fontSize: 14, color: c.muted, marginTop: 4 },
  warning: { backgroundColor: c.dangerSoft, borderRadius: radius.sm, padding: 12, marginTop: 14 },
  warningText: { color: c.danger, fontWeight: '600' },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: 14,
  },
  rateLabel: { fontSize: 15, fontWeight: '600', color: c.text },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: c.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 28,
    marginBottom: 10,
  },
  sectionNote: { fontSize: 13, color: c.primary, fontWeight: '600' },
  balanced: { fontSize: 13, color: c.primary, fontWeight: '700' },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden',
  },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  rowBorder: { borderTopWidth: 1, borderTopColor: c.border },
  weekDay: { width: 36, fontWeight: '700', color: c.text },
  weekMeal: { flex: 1, color: c.text, fontSize: 14 },
  weekBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: c.primarySoft,
  },
  weekBtnSwap: { backgroundColor: c.accentSoft },
  weekBtnOn: { backgroundColor: c.primary },
  weekBtnText: { fontSize: 13, fontWeight: '700', color: c.primary },
  nutriGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nutriCell: {
    width: '31%',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nutriValue: { fontSize: 17, fontWeight: '700', color: c.text },
  nutriLabel: { fontSize: 12, color: c.muted, marginTop: 2 },
  footnote: { fontSize: 12, color: c.muted, marginTop: 8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  cookedBtn: {
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: c.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cookedText: { color: c.primary, fontWeight: '700', fontSize: 15 },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  ingName: { fontSize: 15, color: c.text, flex: 1 },
  ingQty: { fontSize: 15, color: c.muted },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: c.primarySoft,
    color: c.primary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '700',
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22, color: c.text },
});
