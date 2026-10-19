import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CUISINES, RECIPES } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';
import { colors, radius } from '../theme';

export default function RecipesScreen({ onOpenRecipe }) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RECIPES.filter((r) => {
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [query, cuisine]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Recipes</Text>
      <Text style={styles.subtitle}>Try something new this week</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search recipes or ingredients"
        placeholderTextColor={colors.muted}
        style={styles.search}
        clearButtonMode="while-editing"
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CUISINES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCuisine(c)}
              style={[styles.chip, cuisine === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, cuisine === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RecipeCard recipe={item} onPress={() => onOpenRecipe(item)} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>No recipes match that search.</Text>}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, paddingHorizontal: 20, marginTop: 8 },
  subtitle: { fontSize: 15, color: colors.muted, paddingHorizontal: 20, marginTop: 2 },
  search: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  chips: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
