import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CUISINES, RECIPES } from '../data/recipes';
import { allowedRecipes, SORTS, sortRecipes } from '../recipeFilters';
import { useAppState } from '../AppState';
import RecipeCard from '../components/RecipeCard';
import { radius, useStyles, useTheme } from '../theme';

export default function RecipesScreen({ onOpenRecipe }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const { settings, ratings, updateSettings } = useAppState();
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [sort, setSort] = useState('rating');

  const allowed = useMemo(() => allowedRecipes(settings), [settings]);
  const hiddenCount = RECIPES.length - allowed.length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = allowed.filter((r) => {
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    });
    return sortRecipes(filtered, ratings, sort);
  }, [allowed, query, cuisine, sort, ratings]);

  const header = (
    <View>
      <Text style={styles.title}>Recipes</Text>
      <Text style={styles.subtitle}>Try something new this week</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search recipes or ingredients"
        placeholderTextColor={colors.muted}
        style={styles.search}
        clearButtonMode="while-editing"
        keyboardAppearance={colors.mode}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CUISINES.map((c) => (
          <Pressable key={c} onPress={() => setCuisine(c)} style={[styles.chip, cuisine === c && styles.chipActive]}>
            <Text style={[styles.chipText, cuisine === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.toolbar}>
        <View style={styles.segment}>
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSort(s.key)}
              style={[styles.segmentBtn, sort === s.key && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, sort === s.key && styles.segmentTextActive]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => updateSettings({ balancedOnly: !settings.balancedOnly })}
          style={[styles.toggle, settings.balancedOnly && styles.toggleOn]}
        >
          <Text style={[styles.toggleText, settings.balancedOnly && { color: colors.onPrimary }]}>
            {settings.balancedOnly ? '✓ ' : ''}Balanced
          </Text>
        </Pressable>
      </View>

      {hiddenCount > 0 && (
        <Text style={styles.hidden}>
          {hiddenCount} {hiddenCount === 1 ? 'recipe is' : 'recipes are'} hidden by your Settings or the Balanced filter.
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      data={results}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 20 }}>
          <RecipeCard recipe={item} onPress={() => onOpenRecipe(item)} />
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListEmptyComponent={<Text style={styles.empty}>No recipes match.</Text>}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const makeStyles = (c) => ({
  title: { fontSize: 30, fontWeight: '800', color: c.text, paddingHorizontal: 20, marginTop: 8 },
  subtitle: { fontSize: 15, color: c.muted, paddingHorizontal: 20, marginTop: 2 },
  search: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: c.text,
  },
  chips: { paddingHorizontal: 20, paddingTop: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  chipActive: { backgroundColor: c.text, borderColor: c.text },
  chipText: { color: c.text, fontWeight: '600' },
  chipTextActive: { color: c.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  segment: { flexDirection: 'row', backgroundColor: c.border, borderRadius: 999, padding: 3 },
  segmentBtn: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  segmentActive: { backgroundColor: c.surface },
  segmentText: { color: c.muted, fontWeight: '600', fontSize: 13 },
  segmentTextActive: { color: c.text },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.primary,
  },
  toggleOn: { backgroundColor: c.primary },
  toggleText: { color: c.primary, fontWeight: '700', fontSize: 13 },
  hidden: { fontSize: 13, color: c.muted, paddingHorizontal: 20, marginBottom: 10 },
  empty: { textAlign: 'center', color: c.muted, marginTop: 40 },
});
