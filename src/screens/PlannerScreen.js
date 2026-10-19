import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRecipe } from '../data/recipes';
import { allowedRecipes, sortRecipes } from '../recipeFilters';
import { DAY_NAMES, useAppState } from '../AppState';
import RecipeCard from '../components/RecipeCard';
import { useToast } from '../components/Toast';
import { radius, useStyles, useTheme } from '../theme';

export default function PlannerScreen({ onOpenRecipe }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { plan, days, settings, ratings, setMeal, setMeals, setDayCount, clearWeek } = useAppState();
  const [pickingDay, setPickingDay] = useState(null);

  const choices = useMemo(
    () => sortRecipes(allowedRecipes(settings), ratings, 'rating'),
    [settings, ratings]
  );
  const plannedCount = days.filter((d) => plan.meals[d]).length;

  function pick(day, recipe) {
    const replaced = getRecipe(plan.meals[day]);
    setMeal(day, recipe.id);
    setPickingDay(null);
    toast(
      replaced
        ? `Swapped in ${recipe.name} for ${DAY_NAMES[day]}`
        : `Added ${recipe.name} to ${DAY_NAMES[day]} ✓`
    );
  }

  function surpriseMe() {
    const used = new Set(days.map((d) => plan.meals[d]).filter(Boolean));
    const pool = choices.filter((r) => !used.has(r.id)).sort(() => Math.random() - 0.5);
    const empty = days.filter((d) => !plan.meals[d]);
    if (empty.length === 0) return toast('Your week is already full');
    if (pool.length === 0) return toast('No more recipes match your Settings');
    const fills = {};
    empty.forEach((d) => {
      if (pool.length) fills[d] = pool.pop().id;
    });
    setMeals(fills);
    const n = Object.keys(fills).length;
    toast(`Added ${n} ${n === 1 ? 'meal' : 'meals'} to your week ✓`);
  }

  function remove(day) {
    setMeal(day, null);
    toast(`Cleared ${DAY_NAMES[day]}`);
  }

  function confirmClear() {
    Alert.alert('Clear this week?', 'This removes every planned meal.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearWeek },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>This Week</Text>
      <Text style={styles.subtitle}>
        {plannedCount} of {days.length} dinners planned · {settings.portions}{' '}
        {settings.portions === 1 ? 'person' : 'people'}
      </Text>

      <View style={styles.toolbar}>
        <View style={styles.segment}>
          {[5, 7].map((n) => (
            <Pressable
              key={n}
              onPress={() => setDayCount(n)}
              style={[styles.segmentBtn, plan.dayCount === n && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, plan.dayCount === n && styles.segmentTextActive]}>{n} days</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={surpriseMe} style={styles.toolBtn}>
          <Text style={styles.toolBtnText}>🎲 Surprise me</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {days.map((day) => {
          const recipe = getRecipe(plan.meals[day]);
          return (
            <View key={day} style={{ marginBottom: 6 }}>
              <Text style={styles.dayLabel}>{DAY_NAMES[day]}</Text>
              {recipe ? (
                <RecipeCard
                  recipe={recipe}
                  onPress={() => onOpenRecipe(recipe)}
                  right={
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <Pressable onPress={() => setPickingDay(day)} hitSlop={8} style={styles.iconBtn}>
                        <Text style={styles.iconText}>⇄</Text>
                      </Pressable>
                      <Pressable onPress={() => remove(day)} hitSlop={8} style={styles.iconBtn}>
                        <Text style={styles.iconText}>✕</Text>
                      </Pressable>
                    </View>
                  }
                />
              ) : (
                <Pressable onPress={() => setPickingDay(day)} style={styles.emptySlot}>
                  <Text style={styles.emptyText}>+ Pick a recipe</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {plannedCount > 0 && (
          <Pressable onPress={confirmClear} style={{ alignSelf: 'center', marginTop: 12 }}>
            <Text style={{ color: colors.muted }}>Clear week</Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal visible={!!pickingDay} animationType="slide" onRequestClose={() => setPickingDay(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.pickerHeader}>
            <View>
              <Text style={styles.pickerTitle}>{DAY_NAMES[pickingDay]}</Text>
              <Text style={styles.pickerSub}>Top rated first</Text>
            </View>
            <Pressable onPress={() => setPickingDay(null)} hitSlop={12}>
              <Text style={styles.close}>Cancel</Text>
            </Pressable>
          </View>
          <FlatList
            data={choices}
            keyExtractor={(r) => r.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            renderItem={({ item }) => <RecipeCard recipe={item} onPress={() => pick(pickingDay, item)} />}
            ListEmptyComponent={
              <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>
                No recipes match your Settings.
              </Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const makeStyles = (c) => ({
  title: { fontSize: 30, fontWeight: '800', color: c.text, paddingHorizontal: 20, marginTop: 8 },
  subtitle: { fontSize: 15, color: c.muted, paddingHorizontal: 20, marginTop: 2 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  segment: { flexDirection: 'row', backgroundColor: c.border, borderRadius: 999, padding: 3 },
  segmentBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  segmentActive: { backgroundColor: c.surface },
  segmentText: { color: c.muted, fontWeight: '600' },
  segmentTextActive: { color: c.text },
  toolBtn: { backgroundColor: c.accentSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  toolBtnText: { color: c.accent, fontWeight: '700' },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 6,
  },
  emptySlot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.border,
    borderRadius: radius.md,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: { color: c.primary, fontWeight: '600', fontSize: 15 },
  iconBtn: { padding: 6 },
  iconText: { fontSize: 16, color: c.muted },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pickerTitle: { fontSize: 22, fontWeight: '700', color: c.text },
  pickerSub: { fontSize: 13, color: c.muted, marginTop: 2 },
  close: { fontSize: 16, color: c.primary, fontWeight: '600' },
});
