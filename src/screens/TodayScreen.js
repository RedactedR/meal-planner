import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../AppState';
import { allRecipes, getRecipe } from '../data/recipes';
import { allowedRecipes } from '../recipeFilters';
import {
  AIMS, QUICK_FOODS, addDays, dateKey, dayLabel, suggestGoals, totals, weekdayOf,
} from '../nutrition';
import { gapPlans } from '../gapPlanner';
import { STORE_SNACKS } from '../data/snacks';
import { StoreSnackCard, useSnackActions } from '../components/StoreSnacks';
import { useToast } from '../components/Toast';
import { CAT, glow, radius, useStyles, useTheme } from '../theme';

// Daily calorie & protein tracker.
export default function TodayScreen({ onOpenRecipe }) {
  const styles = useStyles(makeStyles);
  const toast = useToast();
  const { goals, foodLog, plan, settings, logFood, removeFood, updateSettings } = useAppState();
  const { eat } = useSnackActions();
  const [date, setDate] = useState(dateKey());
  const [addOpen, setAddOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const today = dateKey();
  const entries = foodLog[date] || [];
  const t = totals(entries);
  const calLeft = goals ? goals.calories - t.calories : 0;
  const proteinLeft = goals ? goals.protein - t.protein : 0;

  const planned = getRecipe(plan.meals[weekdayOf(date)]);
  const plannedLogged = planned && entries.some((e) => e.recipeId === planned.id);

  const keto = !!settings.ketoToday;
  const gap = useMemo(
    () =>
      goals
        ? gapPlans({
            proteinLeft,
            caloriesLeft: calLeft,
            recipes: allowedRecipes(settings, { includeSnacks: true }),
            keto,
          })
        : { plans: [], fallback: [] },
    [goals, proteinLeft, calLeft, settings, keto]
  );

  // Log every item in a plan (store snacks also come out of your Kitchen).
  function logPlan(p) {
    for (const f of p.items) {
      if (f.kind === 'store') eat(f.ref, date);
      else
        logFood(date, {
          name: f.name,
          emoji: f.emoji,
          calories: f.calories,
          protein: f.protein,
          recipeId: f.id,
        });
    }
    if (p.items.some((f) => f.kind !== 'store')) toast('Logged ✓');
  }

  function log(entry) {
    logFood(date, entry);
    toast(`Logged ${entry.name} ✓`);
  }

  function confirmRemove(e) {
    Alert.alert(`Remove ${e.name}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFood(date, e.id) },
    ]);
  }

  if (!goals) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Today</Text>
        <View style={styles.welcome}>
          <Text style={{ fontSize: 52 }}>💪</Text>
          <Text style={styles.welcomeTitle}>Track calories & protein</Text>
          <Text style={styles.welcomeText}>
            Set a daily goal, then log what you eat — recipes from the app in one tap, or quick foods like a protein
            shake. You'll see what's left for the day and which meals fit it.
          </Text>
          <Pressable onPress={() => setGoalsOpen(true)} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Set my goals</Text>
          </Pressable>
        </View>
        <GoalsSetup visible={goalsOpen} onClose={() => setGoalsOpen(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.dateRow}>
          <Pressable onPress={() => setDate(addDays(date, -1))} hitSlop={12} style={styles.arrow}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text style={styles.title2}>{dayLabel(date)}</Text>
          <Pressable
            onPress={() => date < today && setDate(addDays(date, 1))}
            hitSlop={12}
            style={[styles.arrow, date >= today && { opacity: 0.25 }]}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.meters}>
          <Meter label="Calories" value={t.calories} goal={goals.calories} unit="" />
          <Meter label="Protein" value={t.protein} goal={goals.protein} unit="g" strong />
        </View>
        <Text style={styles.leftText}>
          {calLeft >= 0 ? `${Math.round(calLeft)} calories left` : `${Math.round(-calLeft)} calories over`}
          {' · '}
          {proteinLeft > 0 ? `${Math.round(proteinLeft)}g protein to go` : 'protein goal hit 🎉'}
        </Text>

        {planned && !plannedLogged && planned.nutrition && (
          <Pressable
            onPress={() =>
              log({
                name: planned.name,
                emoji: planned.emoji,
                calories: planned.nutrition.calories,
                protein: planned.nutrition.protein,
                recipeId: planned.id,
              })
            }
            style={styles.plannedCard}
          >
            <Text style={{ fontSize: 26 }}>{planned.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.plannedLabel}>On your week for {weekdayOf(date)}</Text>
              <Text style={styles.plannedName}>{planned.name}</Text>
              <Text style={styles.sub}>
                {planned.nutrition.calories} cal · {planned.nutrition.protein}g protein per serving
              </Text>
            </View>
            <Text style={styles.link}>+ Log</Text>
          </Pressable>
        )}

        <Text style={styles.section}>What you ate · {entries.length}</Text>
        <View style={styles.card}>
          {entries.length === 0 && <Text style={styles.empty}>Nothing logged yet.</Text>}
          {entries.map((e, i) => (
            <Pressable
              key={e.id}
              onPress={() => (e.recipeId && getRecipe(e.recipeId) ? onOpenRecipe(getRecipe(e.recipeId)) : null)}
              onLongPress={() => confirmRemove(e)}
              style={[styles.row, i > 0 && styles.rowBorder]}
            >
              <Text style={{ fontSize: 22 }}>{e.emoji || '🍽️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>
                  {e.name}
                  {e.servings && e.servings !== 1 ? ` ×${e.servings}` : ''}
                </Text>
                <Text style={styles.sub}>
                  {Math.round(e.calories * (e.servings || 1))} cal · {Math.round(e.protein * (e.servings || 1))}g protein
                </Text>
              </View>
              <Pressable onPress={() => confirmRemove(e)} hitSlop={10}>
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => setAddOpen(true)} style={[styles.primaryBtn, styles.addBtn]}>
          <Text style={styles.primaryText}>+ Add food</Text>
        </Pressable>

        {proteinLeft > 0 && (
          <>
            <View style={styles.gapHeader}>
              <Text style={[styles.section, { paddingHorizontal: 0, marginBottom: 0, flex: 1 }]}>
                Close the gap · {Math.round(proteinLeft)}g to go
              </Text>
              <Pressable
                onPress={() => updateSettings({ ketoToday: !keto })}
                style={[styles.chip, keto && styles.chipOn, { marginTop: 18 }]}
              >
                <Text style={[styles.chipText, keto && styles.chipTextOn]}>{keto ? '✓ ' : ''}🥑 Keto</Text>
              </Pressable>
            </View>
            <Text style={[styles.sub, { paddingHorizontal: 20, marginBottom: 10 }]}>
              {gap.plans.length
                ? `Ways to get ${Math.round(proteinLeft)}g more protein within your ${Math.max(0, Math.round(calLeft))} calories left.`
                : calLeft <= 0
                ? "You're out of calories for today — these get you the most protein for the fewest calories."
                : "Nothing covers it all within your calories — these get you closest."}
            </Text>
            <View style={{ paddingHorizontal: 20 }}>
              {(gap.plans.length ? gap.plans : gap.fallback).map((p, i) => (
                <View key={i} style={styles.planCard}>
                  <View style={{ flex: 1, gap: 4 }}>
                    {p.items.map((f, j) => (
                      <Pressable
                        key={`${f.id}-${j}`}
                        onPress={() => (f.kind === 'recipe' ? onOpenRecipe(f.ref) : null)}
                        hitSlop={4}
                      >
                        <Text style={styles.planItem} numberOfLines={1}>
                          {j > 0 ? '+ ' : ''}
                          {f.emoji} {f.name}
                          <Text style={styles.planItemSub}>
                            {'  '}
                            {f.protein}g · {f.calories} cal{f.kind === 'store' ? ' · 🛒 store' : ''}
                          </Text>
                        </Text>
                      </Pressable>
                    ))}
                    <Text style={styles.planTotal}>
                      = {Math.round(p.protein)}g protein · {Math.round(p.calories)} cal
                    </Text>
                  </View>
                  <Pressable onPress={() => logPlan(p)} style={styles.planLog} hitSlop={6}>
                    <Text style={styles.planLogText}>+ Log</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}

        <WeekChart foodLog={foodLog} goals={goals} endDate={today} />

        <Pressable onPress={() => setGoalsOpen(true)} style={{ alignSelf: 'center', marginTop: 20 }}>
          <Text style={styles.link}>
            Goals: {goals.calories} cal · {goals.protein}g protein — edit
          </Text>
        </Pressable>
        <Text style={styles.footnote}>
          Recipe numbers are estimates per serving. Long-press an item to remove it.
        </Text>
      </ScrollView>

      <AddFood visible={addOpen} onClose={() => setAddOpen(false)} onLog={log} onLogSnack={(s) => eat(s, date)} />
      <GoalsSetup visible={goalsOpen} onClose={() => setGoalsOpen(false)} />
    </View>
  );
}

function Meter({ label, value, goal, unit, strong }) {
  const styles = useStyles(makeStyles);
  const c = useTheme();
  const pct = goal > 0 ? value / goal : 0;
  const over = label === 'Calories' && pct > 1.05;
  const color = over ? c.warn : strong ? CAT.protein : c.mode === 'dark' ? c.text : c.primary;
  return (
    <View style={[styles.meter, strong && { borderColor: CAT.protein + '66' }, strong && glow(CAT.protein, c.mode, 30, '22')]}>
      <Text style={styles.meterLabel}>{label}</Text>
      <Text style={styles.meterValue}>
        {Math.round(value)}
        {unit}
        <Text style={styles.meterGoal}>
          {' '}
          / {goal}
          {unit}
        </Text>
      </Text>
      <View style={styles.track}>
        <View style={[{ width: `${Math.min(100, pct * 100)}%`, height: '100%', backgroundColor: color, borderRadius: 6 }, strong && glow(color, c.mode, 10, 'AA')]} />
      </View>
    </View>
  );
}

// Protein for the last 7 days, with the goal as a line.
function WeekChart({ foodLog, goals, endDate }) {
  const styles = useStyles(makeStyles);
  const c = useTheme();
  const days = Array.from({ length: 7 }, (_, i) => addDays(endDate, i - 6));
  const data = days.map((d) => ({ d, ...totals(foodLog[d]) }));
  if (data.every((x) => x.calories === 0)) return null;
  const max = Math.max(goals.protein * 1.25, ...data.map((x) => x.protein));
  const H = 110;
  const hit = data.filter((x) => x.protein >= goals.protein).length;

  return (
    <View>
      <Text style={styles.section}>Last 7 days · protein</Text>
      <View style={[styles.card, { padding: 14 }]}>
        <View style={{ height: H, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <View
            style={{
              position: 'absolute', left: 0, right: 0, bottom: (goals.protein / max) * H,
              borderTopWidth: 1, borderStyle: 'dashed', borderColor: c.muted,
            }}
          />
          {data.map((x) => (
            <View key={x.d} style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: '70%',
                  height: Math.max(2, (x.protein / max) * H),
                  backgroundColor: x.protein >= goals.protein ? c.accent : c.border,
                  borderRadius: 4,
                }}
              />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          {data.map((x) => (
            <View key={x.d} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.chartDay}>{weekdayOf(x.d).slice(0, 2)}</Text>
              <Text style={styles.chartNum}>{x.calories ? Math.round(x.protein) : '–'}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.sub, { marginTop: 8 }]}>
          Hit your {goals.protein}g goal {hit} of 7 days (dashed line).
        </Text>
      </View>
    </View>
  );
}

const SERVINGS = [0.5, 1, 1.5, 2];

function AddFood({ visible, onClose, onLog, onLogSnack }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const [tab, setTab] = useState('quick');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const [servings, setServings] = useState(1);
  const [custom, setCustom] = useState({ name: '', calories: '', protein: '' });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allRecipes().filter((r) => r.nutrition && (!q || r.name.toLowerCase().includes(q)));
    return list.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 60);
  }, [query, visible]);

  function close() {
    setPicked(null);
    setQuery('');
    setServings(1);
    onClose();
  }

  function logRecipe() {
    onLog({
      name: picked.name,
      emoji: picked.emoji,
      calories: picked.nutrition.calories,
      protein: picked.nutrition.protein,
      servings,
      recipeId: picked.id,
    });
    close();
  }

  function logCustom() {
    const calories = Number(custom.calories) || 0;
    const protein = Number(custom.protein) || 0;
    if (!custom.name.trim() || (!calories && !protein)) return;
    onLog({ name: custom.name.trim(), emoji: '🍽️', calories, protein });
    setCustom({ name: '', calories: '', protein: '' });
    close();
  }

  const input = (props) => (
    <TextInput
      placeholderTextColor={colors.muted}
      keyboardAppearance={colors.mode}
      style={styles.input}
      {...props}
    />
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Pressable onPress={close} hitSlop={12}>
            <Text style={styles.link}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Add food</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.tabs}>
          {[
            ['quick', 'Quick add'],
            ['recipes', 'Recipes'],
            ['custom', 'Custom'],
          ].map(([key, label]) => (
            <Pressable key={key} onPress={() => setTab(key)} style={[styles.tabBtn, tab === key && styles.tabOn]}>
              <Text style={[styles.tabText, tab === key && styles.tabTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'quick' && (
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
            <Text style={styles.label}>Snacks from the store</Text>
            {STORE_SNACKS.map((s) => (
              <StoreSnackCard
                key={s.id}
                snack={s}
                compact
                onLog={(snack) => {
                  onLogSnack(snack);
                  close();
                }}
              />
            ))}
            <Text style={[styles.label, { marginBottom: 8 }]}>Other quick foods</Text>
            <View style={styles.card0}>
              {QUICK_FOODS.map((f, i) => (
                <Pressable
                  key={f.name}
                  onPress={() => {
                    onLog(f);
                    close();
                  }}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                >
                  <Text style={{ fontSize: 22 }}>{f.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{f.name}</Text>
                    <Text style={styles.sub}>
                      {f.calories} cal · {f.protein}g protein
                    </Text>
                  </View>
                  <Text style={styles.link}>+</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        {tab === 'recipes' && (
          <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 20 }}>
              {input({ value: query, onChangeText: setQuery, placeholder: 'Search recipes', returnKeyType: 'search' })}
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 10 }} keyboardShouldPersistTaps="handled">
              <View style={styles.card0}>
                {results.map((r, i) => (
                  <Pressable
                    key={r.id}
                    onPress={() => setPicked(r)}
                    style={[styles.row, i > 0 && styles.rowBorder, picked?.id === r.id && styles.rowPicked]}
                  >
                    <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{r.name}</Text>
                      <Text style={styles.sub}>
                        {r.nutrition.calories} cal · {r.nutrition.protein}g protein
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {picked && (
              <View style={styles.bottomBar}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {picked.name}
                </Text>
                <View style={styles.servingRow}>
                  {SERVINGS.map((s) => (
                    <Pressable key={s} onPress={() => setServings(s)} style={[styles.chip, servings === s && styles.chipOn]}>
                      <Text style={[styles.chipText, servings === s && styles.chipTextOn]}>
                        {s === 0.5 ? '½' : s === 1.5 ? '1½' : s} serving{s > 1 ? 's' : ''}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={logRecipe} style={[styles.primaryBtn, { marginTop: 10, alignItems: 'center' }]}>
                  <Text style={styles.primaryText}>
                    Log · {Math.round(picked.nutrition.calories * servings)} cal ·{' '}
                    {Math.round(picked.nutrition.protein * servings)}g protein
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {tab === 'custom' && (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.sub}>For anything else — check the label or a quick search.</Text>
            {input({ value: custom.name, onChangeText: (name) => setCustom({ ...custom, name }), placeholder: 'What did you eat?' })}
            {input({
              value: custom.calories,
              onChangeText: (calories) => setCustom({ ...custom, calories: calories.replace(/[^0-9]/g, '') }),
              placeholder: 'Calories',
              keyboardType: 'number-pad',
            })}
            {input({
              value: custom.protein,
              onChangeText: (protein) => setCustom({ ...custom, protein: protein.replace(/[^0-9]/g, '') }),
              placeholder: 'Protein (g)',
              keyboardType: 'number-pad',
            })}
            <Pressable onPress={logCustom} style={[styles.primaryBtn, { alignItems: 'center' }]}>
              <Text style={styles.primaryText}>Log it</Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function GoalsSetup({ visible, onClose }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { goals, setGoals } = useAppState();
  const [weight, setWeight] = useState(goals?.weight ? String(goals.weight) : '');
  const [aim, setAim] = useState(goals?.aim || 'build');
  const [calories, setCalories] = useState(goals ? String(goals.calories) : '');
  const [protein, setProtein] = useState(goals ? String(goals.protein) : '');

  function recalc(w, a) {
    const n = Number(w);
    if (n >= 80 && n <= 500) {
      const s = suggestGoals(n, a);
      setCalories(String(s.calories));
      setProtein(String(s.protein));
    }
  }

  function save() {
    const cal = Number(calories);
    const pro = Number(protein);
    if (!cal || !pro) return Alert.alert('Add your goals', 'Enter your weight, or type a calorie and protein goal.');
    setGoals({ calories: cal, protein: pro, weight: Number(weight) || null, aim });
    toast('Goals saved ✓');
    onClose();
  }

  const num = (value, set, placeholder) => (
    <TextInput
      value={value}
      onChangeText={(v) => set(v.replace(/[^0-9]/g, ''))}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      keyboardAppearance={colors.mode}
      keyboardType="number-pad"
      style={styles.input}
    />
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.link}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Your goals</Text>
          <Pressable onPress={save} hitSlop={12}>
            <Text style={[styles.link, { fontWeight: '800' }]}>Save</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Your weight (lb)</Text>
          {num(weight, (w) => {
            setWeight(w);
            recalc(w, aim);
          }, 'e.g. 180')}

          <Text style={styles.label}>Your aim</Text>
          {AIMS.map((a) => (
            <Pressable
              key={a.key}
              onPress={() => {
                setAim(a.key);
                recalc(weight, a.key);
              }}
              style={[styles.aim, aim === a.key && styles.aimOn]}
            >
              <Text style={styles.rowName}>
                {aim === a.key ? '● ' : '○ '}
                {a.label}
              </Text>
              <Text style={styles.sub}>{a.note}</Text>
            </Pressable>
          ))}

          <Text style={styles.label}>Daily calories</Text>
          {num(calories, setCalories, 'e.g. 2500')}
          <Text style={styles.label}>Daily protein (g)</Text>
          {num(protein, setProtein, 'e.g. 180')}

          <Text style={styles.footnoteFlush}>
            Filled in from common starting points for people who work out a few times a week: about 15 calories per
            pound to maintain, and 0.8–1 g of protein per pound. Everyone's different — watch the scale for 2–3 weeks
            and adjust. A doctor or dietitian can tailor this to you.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (c) => ({
  title: { fontSize: 30, fontWeight: '800', color: c.text, paddingHorizontal: 20, marginTop: 8 },
  title2: { fontSize: 24, fontWeight: '800', color: c.text, flex: 1, textAlign: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginTop: 8 },
  arrow: { width: 44, alignItems: 'center' },
  arrowText: { fontSize: 32, color: c.primary, fontWeight: '600' },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center' },
  welcomeText: { fontSize: 15, color: c.muted, textAlign: 'center', lineHeight: 22 },
  primaryBtn: { backgroundColor: c.primary, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 24 },
  primaryText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
  addBtn: { marginHorizontal: 20, marginTop: 12, alignItems: 'center' },
  meters: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 14 },
  meter: {
    flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 22, padding: 16,
  },
  meterLabel: { fontSize: 12, color: c.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  meterValue: { fontSize: 24, fontWeight: '800', color: c.text, marginTop: 4 },
  meterGoal: { fontSize: 14, fontWeight: '600', color: c.muted },
  track: { height: 12, backgroundColor: c.border, borderRadius: 6, marginTop: 12 },
  leftText: { fontSize: 14, color: c.muted, textAlign: 'center', marginTop: 10 },
  plannedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 16, padding: 14,
    borderRadius: radius.md, backgroundColor: c.primarySoft,
  },
  plannedLabel: { fontSize: 12, color: c.primary, fontWeight: '700' },
  plannedName: { fontSize: 16, color: c.text, fontWeight: '700', marginTop: 2 },
  section: {
    fontSize: 13, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 22, marginBottom: 8, paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
    overflow: 'hidden',
  },
  card0: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  empty: { color: c.muted, padding: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  rowBorder: { borderTopWidth: 1, borderTopColor: c.border },
  rowPicked: { backgroundColor: c.primarySoft },
  rowName: { fontSize: 15, color: c.text, fontWeight: '600' },
  sub: { fontSize: 13, color: c.muted, marginTop: 2 },
  remove: { fontSize: 16, color: c.muted, paddingHorizontal: 4 },
  link: { color: c.primary, fontWeight: '700', fontSize: 15 },
  chartDay: { fontSize: 11, color: c.muted, fontWeight: '700' },
  chartNum: { fontSize: 11, color: c.text },
  footnote: { fontSize: 12, color: c.muted, textAlign: 'center', marginTop: 10, paddingHorizontal: 30 },
  footnoteFlush: { fontSize: 12, color: c.muted, lineHeight: 18, marginTop: 10 },
  modal: { flex: 1, backgroundColor: c.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: c.border, borderRadius: 10, padding: 3 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabOn: { backgroundColor: c.surface },
  tabText: { color: c.muted, fontWeight: '600' },
  tabTextOn: { color: c.text },
  input: {
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: radius.md, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 16, color: c.text,
  },
  label: { fontSize: 13, fontWeight: '700', color: c.muted, marginTop: 8 },
  aim: { padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  gapHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 8 },
  planCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: c.border, padding: 12, marginBottom: 10,
  },
  planItem: { fontSize: 15, color: c.text, fontWeight: '600' },
  planItemSub: { fontSize: 12, color: c.muted, fontWeight: '400' },
  planTotal: { fontSize: 13, color: c.accent, fontWeight: '700', marginTop: 2 },
  planLog: { backgroundColor: c.accentSoft, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 12 },
  planLogText: { color: c.accent, fontWeight: '700' },
  aimOn: { borderColor: c.primary, backgroundColor: c.primarySoft },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface },
  servingRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: c.border },
  chipOn: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.text, fontWeight: '600', fontSize: 13 },
  chipTextOn: { color: c.onPrimary },
});
