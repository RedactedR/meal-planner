import { useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, useStyles, useTheme } from '../theme';
import { DAY_NAMES, useAppState } from '../AppState';
import { DIFFICULTY, effectiveRecipe, getRecipe, isBalanced, stepText } from '../data/recipes';
import { cookingQty, formatQty } from '../grocery';
import { isExcluded } from '../recipeFilters';
import { money, recipeCosts } from '../pricing';
import { youtubeEmbedUrl, youtubeSearchUrl } from '../online';
import { ToastProvider, useToast } from './Toast';
import Stars from './Stars';
import CostBreakdown from './CostBreakdown';
import VideoPlayer, { openVideo } from './VideoPlayer';
import { Pill, StockIcon } from './Badges';
import { dateKey } from '../nutrition';
import { stepTimers, stepsWithIngredients } from '../cooking';
import CookMode from './CookMode';
import { TimerBar, TimerButtons, TimerProvider } from './Timers';

// Full-screen view of one recipe: your week, rating, cost breakdown,
// nutrition, ingredients (with stock icons), in-depth steps with pro
// tips and technique videos, and the homemade-sauce option.
export default function RecipeDetail({ recipe, onClose }) {
  return (
    <Modal visible={!!recipe} animationType="slide" onRequestClose={onClose}>
      <ToastProvider>
        <TimerProvider>{recipe && <DetailContent baseRecipe={recipe} onClose={onClose} />}</TimerProvider>
      </ToastProvider>
    </Modal>
  );
}

function DetailContent({ baseRecipe, onClose }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const {
    days, plan, settings, ratings, inventory, savedRecipes,
    setMeal, rate, consumeInventory, updateSettings, saveRecipe, removeSavedRecipe, logFood, snackList, setSnackCount,
  } = useAppState();
  const [video, setVideo] = useState(null); // { url, title }
  const [cooking, setCooking] = useState(false);

  const recipe = effectiveRecipe(baseRecipe, settings);
  // Snacks are made as a whole batch; meals scale to your people.
  const snack = baseRecipe.course === 'snack';
  const portions = snack ? baseRecipe.servings : settings.portions;
  const batches = snackList[baseRecipe.id] || 0;
  const isOnline = !!baseRecipe.source;
  const isSaved = isOnline && !!savedRecipes[baseRecipe.id];
  const freeDays = days.filter((d) => !plan.meals[d]).length;
  const excluded = isExcluded(baseRecipe, settings);
  const cost = recipeCosts(recipe, portions, inventory, settings);
  const stockByName = Object.fromEntries(cost.items.map((i) => [i.name, i.status]));
  const swapByName = Object.fromEntries(cost.items.filter((i) => i.using).map((i) => [i.name, i.using]));
  const diff = DIFFICULTY[recipe.difficulty];

  // Cost with and without the homemade sauce, to show what scratch saves.
  const scratchCompare =
    baseRecipe.scratch &&
    (() => {
      const bought = recipeCosts(baseRecipe, portions, {}).total;
      const homemade = recipeCosts(effectiveRecipe(baseRecipe, { scratchSauces: true }), portions, {}).total;
      return { bought, homemade };
    })();

  function play(url, title) {
    openVideo(url, (u) => setVideo({ url: u, title }));
  }

  function ensureSaved() {
    if (isOnline && !isSaved) saveRecipe(baseRecipe);
  }

  function logServing() {
    logFood(dateKey(), {
      name: recipe.name,
      emoji: recipe.emoji,
      calories: n.calories,
      protein: n.protein,
      recipeId: recipe.id,
    });
    toast('Logged to Today ✓');
  }

  function markCooked() {
    const used = cost.items.filter((i) => i.have > 0 && i.need != null);
    if (used.length === 0) return toast('Nothing from your Kitchen to take out');
    Alert.alert('Cooked it?', `Take the ingredients for ${portions} out of your Kitchen inventory.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update Kitchen',
        onPress: () => {
          consumeInventory(used.map((i) => ({ name: i.using || i.name, unit: i.unit, qty: Math.min(i.have, i.need) })));
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
      ensureSaved();
      setMeal(day, recipe.id);
      const replaced = current && getRecipe(current);
      toast(
        replaced
          ? `Swapped ${replaced.name} for ${recipe.name} on ${DAY_NAMES[day]}`
          : `Added ${recipe.name} to ${DAY_NAMES[day]} ✓`
      );
    }
  }

  function toggleSaved() {
    if (isSaved) {
      removeSavedRecipe(baseRecipe.id);
      toast('Removed from your recipes');
    } else {
      saveRecipe(baseRecipe);
      toast('Saved to your recipes ✓');
    }
  }

  const n = recipe.nutrition;
  const stepUses = stepsWithIngredients(recipe);
  let lastPart = null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {isOnline ? (
          <Pressable onPress={toggleSaved} hitSlop={12}>
            <Text style={styles.close}>{isSaved ? '★ Saved' : '☆ Save recipe'}</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.hero} />
        ) : (
          <Text style={styles.emoji}>{recipe.emoji}</Text>
        )}
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.meta}>
          {[recipe.cuisine, recipe.minutes ? `${recipe.minutes} min` : null]
            .filter(Boolean)
            .join(' · ')}
          {snack ? ` · makes ${portions} snacks` : cost.priced ? ` · amounts for ${portions} ${portions === 1 ? 'person' : 'people'}` : ''}
        </Text>
        <View style={styles.pills}>
          {diff && <Pill label={diff.label} tone={diff.tone} />}
          {recipe.onePan && <Pill label="🍳 One pan — easy cleanup" tone="accent" />}
          {isBalanced(recipe) && <Pill label="Balanced" />}
          <Pill label={`${cost.inStockCount}/${cost.items.length} in stock`} tone={cost.inStockCount ? 'primary' : 'warn'} />
        </View>

        {isOnline && (
          <Pressable onPress={() => Linking.openURL(recipe.sourceUrl)} style={styles.sourceRow}>
            <Text style={styles.sourceText}>
              From {recipe.sourceName} · <Text style={{ textDecorationLine: 'underline' }}>View original</Text>
            </Text>
          </Pressable>
        )}

        {recipe.videoId && (
          <Pressable
            onPress={() => play(youtubeEmbedUrl(recipe.videoId), recipe.name)}
            style={({ pressed }) => [styles.videoBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.videoBtnText}>▶ Watch the full recipe video</Text>
          </Pressable>
        )}

        {excluded && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Heads up: this recipe has something on your allergy or avoid list in Settings.
            </Text>
          </View>
        )}

        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Your rating</Text>
          <Stars
            value={ratings[recipe.id] || 0}
            size={26}
            onRate={(s) => {
              ensureSaved();
              rate(recipe.id, s);
            }}
          />
        </View>

        {snack ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Snack list</Text>
              <Text style={styles.sectionNote}>Makes {recipe.servings} snacks</Text>
            </View>
            <View style={[styles.card, styles.snackRow]}>
              <Text style={[styles.weekMeal, { flex: 1 }]}>
                {batches ? `${batches} ${batches === 1 ? 'batch' : 'batches'} on your grocery list` : 'Add the ingredients to your grocery list'}
              </Text>
              {batches > 0 && (
                <Pressable onPress={() => setSnackCount(recipe.id, batches - 1)} style={styles.qtyBtn} hitSlop={6}>
                  <Text style={styles.qtyText}>−</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  setSnackCount(recipe.id, batches + 1);
                  if (!batches) toast('Added to your grocery list ✓');
                }}
                style={[styles.weekBtn, styles.weekBtnOn]}
              >
                <Text style={[styles.weekBtnText, { color: colors.onPrimary }]}>{batches ? '+1' : 'Add'}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
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
          </>
        )}

        {baseRecipe.scratch && (
          <View style={styles.scratchCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scratchTitle}>🥣 {baseRecipe.scratch.title}</Text>
              <Text style={styles.scratchText}>
                Instead of buying {baseRecipe.scratch.replaces.join(' and ').toLowerCase()}, make it yourself.
                {scratchCompare
                  ? ` Ingredients cost about ${money(scratchCompare.homemade)} vs ${money(scratchCompare.bought)} with store-bought — and most of them last for many more meals.`
                  : ''}
              </Text>
            </View>
            <Switch
              value={!!settings.scratchSauces}
              onValueChange={(v) => updateSettings({ scratchSauces: v })}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
        )}

        {cost.priced ? (
          <>
            <Text style={styles.section}>Cost breakdown</Text>
            <CostBreakdown cost={cost} portions={portions} servingWord={snack ? "snack" : "serving"} />
          </>
        ) : (
          <Text style={[styles.footnote, { marginTop: 18 }]}>
            Online recipes don't have prices yet — they'll appear once we connect live King Soopers prices. ✓ icons
            still show what's in your Kitchen.
          </Text>
        )}

        {n && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Nutrition per serving</Text>
              {isBalanced(recipe) && <Text style={styles.balanced}>Balanced meal</Text>}
            </View>
            <Pressable onPress={logServing} style={({ pressed }) => [styles.logBtn, pressed && { opacity: 0.7 }]}>
              <Text style={styles.logText}>+ Log a serving to Today ({n.calories} cal · {n.protein}g protein)</Text>
            </Pressable>
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
        {recipe.ingredients.map((ing, i) => (
          <View key={`${ing.name}-${i}`} style={styles.ingRow}>
            <StockIcon status={stockByName[ing.name]} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ingNameText}>{ing.name}</Text>
              {swapByName[ing.name] ? (
                <Text style={styles.swapNote}>🔄 Using your {swapByName[ing.name].toLowerCase()}</Text>
              ) : null}
            </View>
            <Text style={styles.ingQty}>
              {ing.qty == null ? ing.measure || '' : displayAmount(ing, recipe, portions)}
            </Text>
          </View>
        ))}

        <Pressable onPress={() => setCooking(true)} style={({ pressed }) => [styles.cookBtn, pressed && { opacity: 0.8 }]}>
          <Text style={styles.cookBtnText}>👨‍🍳 Start cooking — step by step</Text>
          <Text style={styles.cookBtnSub}>Prep checklist, one step at a time, timers, screen stays on</Text>
        </Pressable>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Instructions</Text>
          <Pressable onPress={() => updateSettings({ showTips: !settings.showTips })} hitSlop={8}>
            <Text style={styles.sectionNote}>{settings.showTips ? 'Hide tips' : 'Show tips'}</Text>
          </Pressable>
        </View>
        {recipe.steps.map((step, i) => {
          const s = typeof step === 'string' ? { text: step } : step;
          const part = s.part || (recipe.usingScratch ? 'The main recipe' : null);
          const header = part && part !== lastPart ? part : null;
          lastPart = part;
          return (
            <View key={i}>
              {header && <Text style={styles.partHeader}>{header}</Text>}
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>{i + 1}</Text>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={styles.stepText}>{stepText(s)}</Text>
                  {stepUses[i]?.length > 0 && (
                    <Text style={styles.stepUses}>
                      {stepUses[i]
                        .map(({ ing, shared }) =>
                          `${ing.qty == null ? ing.measure || '' : displayAmount(ing, recipe, portions)} ${ing.name.toLowerCase()}${shared ? ' (total)' : ''}`.trim()
                        )
                        .join(' · ')}
                    </Text>
                  )}
                  <TimerButtons timers={stepTimers(s)} stepNumber={i + 1} recipeName={recipe.name} />
                  {settings.showTips && s.tip && (
                    <View style={styles.tip}>
                      <Text style={styles.tipLabel}>💡 PRO TIP</Text>
                      <Text style={styles.tipText}>{s.tip}</Text>
                    </View>
                  )}
                  {s.watch && (
                    <Pressable onPress={() => play(youtubeSearchUrl(s.watch), s.watch)} style={styles.watchBtn} hitSlop={4}>
                      <Text style={styles.watchText}>▶ Watch how</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        <Pressable onPress={markCooked} style={({ pressed }) => [styles.cookedBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.cookedText}>I cooked this — update my Kitchen</Text>
        </Pressable>
      </ScrollView>
      <TimerBar />
      <VideoPlayer url={video?.url} title={video?.title} onClose={() => setVideo(null)} />
      <CookMode
        visible={cooking}
        recipe={recipe}
        amountOf={(ing) => (ing.qty == null ? ing.measure || '' : displayAmount(ing, recipe, portions))}
        showTips={settings.showTips}
        onClose={() => setCooking(false)}
        onFinish={markCooked}
      />
    </SafeAreaView>
  );
}

// Shows the recipe's own wording ("1 tsp") scaled to your portions, even
// when the Kitchen tracks that item in another unit.
function displayAmount(ing, recipe, portions) {
  if (ing.displayUnit) {
    const q = (ing.displayQty * portions) / recipe.servings;
    return formatQty(Math.max(0.25, Math.round(q * 4) / 4), ing.displayUnit);
  }
  return formatQty(cookingQty(ing, recipe, portions), ing.unit);
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.background },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between' },
  hero: { width: '100%', height: 220, borderRadius: radius.md, backgroundColor: c.border },
  sourceRow: { marginTop: 12 },
  sourceText: { fontSize: 14, color: c.primary, fontWeight: '600' },
  videoBtn: { marginTop: 14, backgroundColor: c.danger, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  videoBtnText: { color: c.mode === 'dark' ? '#3D1F1D' : '#fff', fontWeight: '800', fontSize: 16 },
  scratchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    backgroundColor: c.accentSoft,
    borderRadius: radius.md,
    padding: 14,
  },
  scratchTitle: { fontSize: 15, fontWeight: '700', color: c.text },
  scratchText: { fontSize: 13, color: c.text, marginTop: 4, lineHeight: 19 },
  partHeader: { fontSize: 15, fontWeight: '800', color: c.accent, marginTop: 6, marginBottom: 10 },
  tip: { backgroundColor: c.warnSoft, borderRadius: radius.sm, padding: 10, borderLeftWidth: 3, borderLeftColor: c.warn },
  tipLabel: { fontSize: 11, fontWeight: '800', color: c.warn, letterSpacing: 0.6 },
  tipText: { fontSize: 14, color: c.text, lineHeight: 20, marginTop: 3 },
  watchBtn: { alignSelf: 'flex-start', backgroundColor: c.dangerSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  watchText: { color: c.danger, fontWeight: '700', fontSize: 13 },
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
  snackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 18, color: c.text, fontWeight: '700' },
  cookBtn: { marginTop: 22, backgroundColor: c.primary, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  cookBtnText: { color: c.onPrimary, fontWeight: '800', fontSize: 17 },
  cookBtnSub: { color: c.onPrimary, opacity: 0.85, fontSize: 12, marginTop: 3 },
  stepUses: { fontSize: 13, color: c.muted, lineHeight: 19 },
  logBtn: { marginTop: 10, paddingVertical: 10, borderRadius: radius.sm, backgroundColor: c.accentSoft, alignItems: 'center' },
  logText: { color: c.accent, fontWeight: '700', fontSize: 14 },
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
  ingNameText: { fontSize: 15, color: c.text },
  swapNote: { fontSize: 12, color: c.primary, marginTop: 2, fontWeight: '600' },
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
