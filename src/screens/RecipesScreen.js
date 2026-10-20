import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { allRecipes, cuisinesOf, effectiveRecipe, matchesCuisine } from '../data/recipes';
import { allowedRecipes, isExcluded, SORTS, sortRecipes } from '../recipeFilters';
import { mealDbByCuisine, mealDbLookup, mealDbRandom, searchMealDb } from '../online';
import { useAppState } from '../AppState';
import RecipeCard from '../components/RecipeCard';
import OnlineBrowser from './OnlineBrowser';
import { money, recipeCosts } from '../pricing';
import { radius, useStyles, useTheme } from '../theme';

export default function RecipesScreen({ onOpenRecipe, onGoToKitchen }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const { settings, ratings, inventory, kitchenSetup, updateSettings } = useAppState();
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [sort, setSort] = useState('rating');
  const [importOpen, setImportOpen] = useState(false);
  const web = useWebRecipes(query, cuisine, settings);

  const allowed = useMemo(() => allowedRecipes(settings), [settings]);

  // Price of each allowed recipe after what's already in your Kitchen.
  const costs = useMemo(
    () => Object.fromEntries(allowed.map((r) => [r.id, recipeCosts(effectiveRecipe(r, settings), settings.portions, inventory)])),
    [allowed, settings, inventory]
  );
  const deals = useMemo(
    () =>
      allowed
        .filter((r) => costs[r.id].priced && costs[r.id].savings >= 0.5)
        .sort((a, b) => costs[b.id].savings / costs[b.id].total - costs[a.id].savings / costs[a.id].total),
    [allowed, costs]
  );
  const everything = allRecipes();
  const hiddenCount = everything.length - allowed.length;
  const CUISINES = useMemo(() => cuisinesOf(everything), [everything.length]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = allowed.filter((r) => {
      if (!matchesCuisine(r, cuisine)) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.cuisine || '').toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    });
    if (sort === 'deal') {
      const pay = (r) => (costs[r.id].priced ? costs[r.id].youPay : Infinity);
      return [...filtered].sort((a, b) => pay(a) - pay(b));
    }
    return sortRecipes(filtered, ratings, sort);
  }, [allowed, query, cuisine, sort, ratings, costs]);

  const sorts = [...SORTS.slice(0, 1), { key: 'deal', label: 'Best deal' }, ...SORTS.slice(1)];

  const top = (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Recipes</Text>
        <Pressable onPress={() => setImportOpen(true)} style={styles.importBtn} hitSlop={6}>
          <Text style={styles.importText}>🔗 Import</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>{everything.length} recipes, plus thousands more from the web</Text>
    </View>
  );

  const header = (
    <View>
      {top}

      {!kitchenSetup ? (
        <Pressable onPress={onGoToKitchen} style={styles.banner}>
          <Text style={styles.bannerTitle}>🏠 Tell us what's in your kitchen</Text>
          <Text style={styles.bannerText}>We'll show discounted meals that use what you already have.</Text>
        </Pressable>
      ) : deals.length > 0 ? (
        <View>
          <Text style={styles.dealsTitle}>Deals from your kitchen</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsRow}>
            {deals.slice(0, 8).map((r) => {
              const c = costs[r.id];
              return (
                <Pressable key={r.id} onPress={() => onOpenRecipe(r)} style={styles.deal}>
                  <Text style={styles.dealEmoji}>{r.emoji}</Text>
                  <Text style={styles.dealName} numberOfLines={2}>
                    {r.name}
                  </Text>
                  <View style={styles.dealPrices}>
                    <Text style={styles.dealOld}>{money(c.total)}</Text>
                    <Text style={styles.dealNew}>{money(c.youPay)}</Text>
                  </View>
                  <Text style={styles.dealOff}>{Math.round((c.savings / c.total) * 100)}% off with what you have</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

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
          {sorts.map((s) => (
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

  async function openWeb(r) {
    if (!r.partial) return onOpenRecipe(r);
    web.setOpening(r.id);
    try {
      const full = await mealDbLookup(r.mealDbId);
      onOpenRecipe(full);
    } catch {
      // Leave it; the card stays tappable.
    } finally {
      web.setOpening(null);
    }
  }

  const footer = (
    <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
      <Text style={styles.webTitle}>🌐 More from the web</Text>
      <Text style={styles.webSub}>
        {query.trim().length >= 2
          ? `Results for "${query.trim()}"`
          : cuisine !== 'All'
          ? `${cuisine} recipes from TheMealDB`
          : 'Ideas from TheMealDB. Search or pick a cuisine to see more.'}
      </Text>
      {web.loading && <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />}
      {web.error && <Text style={styles.webSub}>{web.error}</Text>}
      {!web.loading && !web.error && web.results.length === 0 && (
        <Text style={styles.webSub}>Nothing on the web for that yet.</Text>
      )}
      {web.results.map((r) => (
        <View key={r.id}>
          <RecipeCard recipe={r.partial ? { ...r, ingredients: [], steps: [] } : r} onPress={() => openWeb(r)} />
          {web.opening === r.id && <ActivityIndicator style={styles.webSpinner} color={colors.primary} />}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <RecipeCard recipe={item} onPress={() => onOpenRecipe(item)} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>None of your recipes match. Try the web results below.</Text>}
        keyboardShouldPersistTaps="handled"
      />
      <Modal visible={importOpen} animationType="slide" onRequestClose={() => setImportOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import a recipe</Text>
            <Pressable onPress={() => setImportOpen(false)} hitSlop={12}>
              <Text style={styles.modalClose}>Close</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <OnlineBrowser
              importOnly
              onOpenRecipe={(r) => {
                setImportOpen(false);
                onOpenRecipe(r);
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// Online recipes that match what you're looking at: your search, the
// cuisine you picked, or a few random ideas. Hides ones you've already
// saved and ones that clash with your allergy or avoid lists.
function useWebRecipes(query, cuisine, settings) {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [opening, setOpening] = useState(null);
  const ideas = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        let list;
        if (q.length >= 2) list = await searchMealDb(q);
        else if (cuisine !== 'All') list = (await mealDbByCuisine(cuisine)).slice(0, 25);
        else {
          if (!ideas.current) ideas.current = await mealDbRandom(6);
          list = ideas.current;
        }
        if (!cancelled) setRaw(list);
      } catch {
        if (!cancelled) {
          setRaw([]);
          setError("Couldn't reach online recipes. Check your connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, q ? 500 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, cuisine]);

  const results = useMemo(() => {
    const saved = new Set(allRecipes().map((r) => r.id));
    return raw.filter((r) => !saved.has(r.id) && (r.partial || !isExcluded(r, settings)));
  }, [raw, settings]);

  return { results, loading, error, opening, setOpening };
}

const makeStyles = (c) => ({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 },
  importBtn: { borderWidth: 1, borderColor: c.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  importText: { color: c.text, fontWeight: '600', fontSize: 13 },
  webTitle: { fontSize: 18, fontWeight: '800', color: c.text, marginTop: 14 },
  webSub: { fontSize: 13, color: c.muted, marginTop: 2, marginBottom: 10 },
  webSpinner: { position: 'absolute', right: 16, top: 26 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: c.text },
  modalClose: { color: c.primary, fontWeight: '700', fontSize: 16 },
  modeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 14 },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  modeActive: { backgroundColor: c.primary, borderColor: c.primary },
  modeText: { fontWeight: '700', color: c.text, fontSize: 14 },
  modeTextActive: { color: c.onPrimary },
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
    flexWrap: 'wrap',
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
  banner: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: c.primarySoft,
    borderRadius: radius.md,
    padding: 14,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: c.primary },
  bannerText: { fontSize: 13, color: c.text, marginTop: 4 },
  dealsTitle: { fontSize: 13, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 20, marginTop: 18 },
  dealsRow: { paddingHorizontal: 20, paddingTop: 10, gap: 10 },
  deal: {
    width: 150,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: 12,
  },
  dealEmoji: { fontSize: 28 },
  dealName: { fontSize: 14, fontWeight: '600', color: c.text, marginTop: 6, minHeight: 36 },
  dealPrices: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  dealOld: { fontSize: 12, color: c.muted, textDecorationLine: 'line-through' },
  dealNew: { fontSize: 16, fontWeight: '800', color: c.primary },
  dealOff: { fontSize: 11, color: c.primary, fontWeight: '600', marginTop: 2 },
  hidden: { fontSize: 13, color: c.muted, paddingHorizontal: 20, marginBottom: 10 },
  empty: { textAlign: 'center', color: c.muted, marginTop: 40 },
});
