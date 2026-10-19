import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RECIPES, getRecipe } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';
import { colors, radius } from '../theme';

const DAY_NAMES = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

export default function PlannerScreen({ planState, onOpenRecipe }) {
  const { plan, days, setMeal, setDayCount, clearWeek } = planState;
  const [pickingDay, setPickingDay] = useState(null);

  const plannedCount = days.filter((d) => plan.meals[d]).length;

  function surpriseMe() {
    const used = new Set(days.map((d) => plan.meals[d]).filter(Boolean));
    const pool = RECIPES.filter((r) => !used.has(r.id)).sort(() => Math.random() - 0.5);
    days.forEach((d) => {
      if (!plan.meals[d] && pool.length) setMeal(d, pool.pop().id);
    });
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
        {plannedCount} of {days.length} dinners planned
      </Text>

      <View style={styles.toolbar}>
        <View style={styles.segment}>
          {[5, 7].map((n) => (
            <Pressable
              key={n}
              onPress={() => setDayCount(n)}
              style={[styles.segmentBtn, plan.dayCount === n && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, plan.dayCount === n && styles.segmentTextActive]}>
                {n} days
              </Text>
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
                      <Pressable onPress={() => setMeal(day, null)} hitSlop={8} style={styles.iconBtn}>
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

      <Modal
        visible={!!pickingDay}
        animationType="slide"
        onRequestClose={() => setPickingDay(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{DAY_NAMES[pickingDay]}</Text>
            <Pressable onPress={() => setPickingDay(null)} hitSlop={12}>
              <Text style={styles.close}>Cancel</Text>
            </Pressable>
          </View>
          <FlatList
            data={RECIPES}
            keyExtractor={(r) => r.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() => {
                  setMeal(pickingDay, item.id);
                  setPickingDay(null);
                }}
              />
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '800', color: colors.text, paddingHorizontal: 20, marginTop: 8 },
  subtitle: { fontSize: 15, color: colors.muted, paddingHorizontal: 20, marginTop: 2 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 999,
    padding: 3,
  },
  segmentBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { color: colors.muted, fontWeight: '600' },
  segmentTextActive: { color: colors.text },
  toolBtn: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  toolBtnText: { color: colors.accent, fontWeight: '700' },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 6,
  },
  emptySlot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  iconBtn: { padding: 6 },
  iconText: { fontSize: 16, color: colors.muted },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pickerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  close: { fontSize: 16, color: colors.primary, fontWeight: '600' },
});
