import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { importFromLink, mealDbByCategory, mealDbCategories, mealDbLookup, mealDbRandom, searchMealDb } from '../online';
import { isExcluded } from '../recipeFilters';
import { useAppState } from '../AppState';
import RecipeCard from '../components/RecipeCard';
import { useToast } from '../components/Toast';
import { radius, useStyles, useTheme } from '../theme';

// Sites to import from. Import reads the recipe data these sites publish;
// subscriber-only sites only work for pages you can open without logging in.
const IMPORT_SITES = [
  { name: 'Serious Eats', url: 'https://www.seriouseats.com' },
  { name: 'Budget Bytes', url: 'https://www.budgetbytes.com' },
  { name: 'Allrecipes', url: 'https://www.allrecipes.com' },
  { name: 'Bon Appétit', url: 'https://www.bonappetit.com/recipes' },
  { name: 'HelloFresh', url: 'https://www.hellofresh.com/recipes' },
  { name: 'Blue Apron', url: 'https://www.blueapron.com/cookbook' },
  { name: "America's Test Kitchen", url: 'https://www.americastestkitchen.com' },
];

export default function OnlineBrowser({ onOpenRecipe, importOnly = false }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { settings, saveRecipe } = useAppState();

  const [link, setLink] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [heading, setHeading] = useState('Ideas for tonight');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [opening, setOpening] = useState(null);

  async function load(label, fn) {
    setLoading(true);
    setError(null);
    setHeading(label);
    try {
      setResults(await fn());
    } catch (e) {
      setResults([]);
      setError("Couldn't reach the recipe database. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (importOnly) return;
    mealDbCategories().then(setCategories).catch(() => {});
    load('Ideas for tonight', () => mealDbRandom(8));
  }, []);

  function search() {
    const q = query.trim();
    if (!q) return;
    setCategory(null);
    load(`Results for "${q}"`, () => searchMealDb(q));
  }

  function pickCategory(c) {
    setCategory(c);
    setQuery('');
    load(c, () => mealDbByCategory(c));
  }

  async function open(r) {
    if (!r.partial) return onOpenRecipe(r);
    setOpening(r.id);
    try {
      onOpenRecipe(await mealDbLookup(r.mealDbId));
    } catch {
      toast("Couldn't load that recipe");
    } finally {
      setOpening(null);
    }
  }

  async function doImport() {
    setImporting(true);
    setImportError(null);
    try {
      const recipe = await importFromLink(link);
      saveRecipe(recipe);
      setLink('');
      toast(`Imported ${recipe.name} ✓`);
      onOpenRecipe(recipe);
    } catch (e) {
      setImportError(e.message);
    } finally {
      setImporting(false);
    }
  }

  // Full results can be checked against allergies; partial ones are
  // checked once opened.
  const visible = useMemo(
    () => results.filter((r) => r.partial || !isExcluded(r, settings)),
    [results, settings]
  );
  const hidden = results.length - visible.length;

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔗 Import from a recipe site</Text>
        <Text style={styles.cardText}>
          Paste a link to any recipe page. The app reads its ingredients and steps and keeps a link back to the original.
        </Text>
        <View style={styles.row}>
          <TextInput
            value={link}
            onChangeText={setLink}
            placeholder="https://www.seriouseats.com/..."
            placeholderTextColor={colors.muted}
            style={[styles.input, { flex: 1 }]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            keyboardAppearance={colors.mode}
            onSubmitEditing={doImport}
          />
          <Pressable onPress={doImport} disabled={importing || !link.trim()} style={[styles.btn, (!link.trim() || importing) && { opacity: 0.5 }]}>
            {importing ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.btnText}>Import</Text>}
          </Pressable>
        </View>
        {importError && <Text style={styles.error}>{importError}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {IMPORT_SITES.map((s) => (
            <Pressable key={s.name} onPress={() => Linking.openURL(s.url)} style={styles.site}>
              <Text style={styles.siteText}>{s.name} ↗</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.footnote}>
          Tap a site to browse it, then copy a recipe's link here. Subscriber-only sites like America's Test Kitchen only
          import pages that open without logging in.
        </Text>
      </View>

      {importOnly ? null : (
      <>
      <Text style={styles.section}>🌐 Browse thousands of recipes</Text>
      <View style={[styles.row, { paddingHorizontal: 20 }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          placeholder="Search, e.g. curry, lasagna"
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1 }]}
          returnKeyType="search"
          keyboardAppearance={colors.mode}
        />
        <Pressable onPress={search} style={styles.btn}>
          <Text style={styles.btnText}>Search</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Pressable
          onPress={() => {
            setCategory(null);
            load('Ideas for tonight', () => mealDbRandom(8));
          }}
          style={[styles.chip, !category && heading === 'Ideas for tonight' && styles.chipActive]}
        >
          <Text style={[styles.chipText, !category && heading === 'Ideas for tonight' && styles.chipTextActive]}>🎲 Surprise</Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable key={c} onPress={() => pickCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.heading}>{heading}</Text>
      {loading && <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />}
      {error && <Text style={[styles.error, { paddingHorizontal: 20 }]}>{error}</Text>}
      {!loading && !error && visible.length === 0 && <Text style={styles.empty}>No recipes found.</Text>}
      {hidden > 0 && (
        <Text style={styles.hidden}>
          {hidden} hidden because of your allergy or avoid settings.
        </Text>
      )}
      <View style={{ paddingHorizontal: 20 }}>
        {visible.map((r) =>
          r.partial ? (
            <View key={r.id} style={styles.partial}>
              <RecipeCard recipe={{ ...r, ingredients: [], steps: [] }} onPress={() => open(r)} />
              {opening === r.id && <ActivityIndicator style={styles.spinner} color={colors.primary} />}
            </View>
          ) : (
            <RecipeCard key={r.id} recipe={r} onPress={() => open(r)} />
          )
        )}
      </View>
      <Text style={styles.credit}>Recipe database by TheMealDB.com</Text>
      </>
      )}
    </View>
  );
}

const makeStyles = (c) => ({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: c.text },
  cardText: { fontSize: 13, color: c.muted, lineHeight: 19 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: c.text,
  },
  btn: { backgroundColor: c.primary, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: 'center', minWidth: 80, alignItems: 'center' },
  btnText: { color: c.onPrimary, fontWeight: '700' },
  error: { color: c.danger, fontSize: 13, lineHeight: 18 },
  site: { borderWidth: 1, borderColor: c.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  siteText: { color: c.text, fontSize: 13, fontWeight: '600' },
  footnote: { fontSize: 12, color: c.muted, lineHeight: 17 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: c.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  chips: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  chipActive: { backgroundColor: c.text, borderColor: c.text },
  chipText: { color: c.text, fontWeight: '600' },
  chipTextActive: { color: c.background },
  heading: { fontSize: 18, fontWeight: '700', color: c.text, paddingHorizontal: 20, marginBottom: 10 },
  empty: { color: c.muted, textAlign: 'center', marginTop: 20 },
  hidden: { fontSize: 13, color: c.muted, paddingHorizontal: 20, marginBottom: 8 },
  partial: { position: 'relative' },
  spinner: { position: 'absolute', right: 16, top: 26 },
  credit: { fontSize: 12, color: c.muted, textAlign: 'center', marginTop: 8, marginBottom: 20 },
});
