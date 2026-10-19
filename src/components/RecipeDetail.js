import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';
import { formatQty } from '../grocery';

// Full-screen view of one recipe, with buttons to put it on a day.
export default function RecipeDetail({ recipe, onClose, days, meals, onAddToDay }) {
  return (
    <Modal visible={!!recipe} animationType="slide" onRequestClose={onClose}>
      {recipe && (
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
              {recipe.cuisine} · {recipe.minutes} min · serves {recipe.servings}
            </Text>

            <Text style={styles.section}>Add to your week</Text>
            <View style={styles.dayRow}>
              {days.map((day) => {
                const active = meals[day] === recipe.id;
                return (
                  <Pressable
                    key={day}
                    onPress={() => onAddToDay(day, active ? null : recipe.id)}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>Ingredients</Text>
            {recipe.ingredients.map((ing) => (
              <View key={ing.name} style={styles.ingRow}>
                <Text style={styles.ingName}>{ing.name}</Text>
                <Text style={styles.ingQty}>{formatQty(ing.qty, ing.unit)}</Text>
              </View>
            ))}

            <Text style={styles.section}>Steps</Text>
            {recipe.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNum}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'flex-end' },
  close: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  body: { paddingHorizontal: 20, paddingBottom: 40 },
  emoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 8 },
  meta: { fontSize: 14, color: colors.muted, marginTop: 4 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 28,
    marginBottom: 10,
  },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { color: colors.text, fontWeight: '600' },
  dayTextActive: { color: '#fff' },
  ingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingName: { fontSize: 15, color: colors.text },
  ingQty: { fontSize: 15, color: colors.muted },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '700',
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22, color: colors.text },
});
