import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { ALLERGENS, BALANCED_RULES } from '../data/recipes';
import { PORTION_OPTIONS, useAppState } from '../AppState';
import { useToast } from '../components/Toast';
import { radius, useStyles, useTheme } from '../theme';

const THEMES = [
  { key: 'system', label: 'Match phone' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { settings, updateSettings } = useAppState();
  const [food, setFood] = useState('');

  function addFood() {
    const word = food.trim();
    if (!word) return;
    if (settings.avoid.some((w) => w.toLowerCase() === word.toLowerCase())) {
      setFood('');
      return toast(`${word} is already on your list`);
    }
    updateSettings({ avoid: [...settings.avoid, word] });
    setFood('');
    toast(`We'll never suggest ${word}`);
  }

  function removeFood(word) {
    updateSettings({ avoid: settings.avoid.filter((w) => w !== word) });
  }

  function toggleAllergen(key) {
    const has = settings.allergens.includes(key);
    updateSettings({ allergens: has ? settings.allergens.filter((a) => a !== key) : [...settings.allergens, key] });
  }

  function Segmented({ options, value, onChange }) {
    return (
      <View style={styles.segment}>
        {options.map((o) => (
          <Pressable
            key={String(o.key)}
            onPress={() => onChange(o.key)}
            style={[styles.segmentBtn, value === o.key && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, value === o.key && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.section}>Appearance</Text>
      <View style={styles.card}>
        <Segmented options={THEMES} value={settings.theme} onChange={(theme) => updateSettings({ theme })} />
      </View>

      <Text style={styles.section}>Portion size</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>How many people each meal should feed. Recipes and your grocery list scale to match.</Text>
        <Segmented
          options={PORTION_OPTIONS.map((n) => ({ key: n, label: n === 1 ? 'Just me' : `${n}` }))}
          value={settings.portions}
          onChange={(portions) => updateSettings({ portions })}
        />
      </View>

      <Text style={styles.section}>Nutrition</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Balanced meals only</Text>
            <Text style={styles.cardText}>
              Only show and suggest dinners with at least {BALANCED_RULES.minProtein}g protein, {BALANCED_RULES.minFiber}g
              fiber, {BALANCED_RULES.minVeg} cups of vegetables and {BALANCED_RULES.minCalories}–
              {BALANCED_RULES.maxCalories} calories per serving.
            </Text>
          </View>
          <Switch
            value={settings.balancedOnly}
            onValueChange={(balancedOnly) => updateSettings({ balancedOnly })}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <Text style={styles.section}>Cooking</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Show pro tips</Text>
            <Text style={styles.cardText}>
              Chef tricks under recipe steps — like saving the browned bits in the pan for a sauce.
            </Text>
          </View>
          <Switch
            value={!!settings.showTips}
            onValueChange={(showTips) => updateSettings({ showTips })}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Make sauces from scratch</Text>
            <Text style={styles.cardText}>
              Swap store-bought sauces and seasoning packets for homemade versions. Grocery lists and costs update to match.
            </Text>
          </View>
          <Switch
            value={!!settings.scratchSauces}
            onValueChange={(scratchSauces) => updateSettings({ scratchSauces })}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <Text style={styles.section}>Allergies</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Recipes containing these are never listed or suggested.</Text>
        <View style={styles.chips}>
          {ALLERGENS.map((a) => {
            const on = settings.allergens.includes(a.key);
            return (
              <Pressable key={a.key} onPress={() => toggleAllergen(a.key)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {on ? '✕ ' : ''}
                  {a.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.footnote}>
          Always check product labels. Sauces, seasonings and breads can contain allergens that vary by brand.
        </Text>
      </View>

      <Text style={styles.section}>Foods to avoid</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Anything you don't like. Recipes that use it are never suggested.</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={food}
            onChangeText={setFood}
            onSubmitEditing={addFood}
            placeholder="e.g. mushrooms, cilantro"
            placeholderTextColor={colors.muted}
            style={styles.input}
            returnKeyType="done"
            keyboardAppearance={colors.mode}
            autoCapitalize="none"
          />
          <Pressable onPress={addFood} style={styles.addBtn}>
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
        {settings.avoid.length > 0 && (
          <View style={styles.chips}>
            {settings.avoid.map((w) => (
              <Pressable key={w} onPress={() => removeFood(w)} style={[styles.chip, styles.chipOn]}>
                <Text style={[styles.chipText, styles.chipTextOn]}>✕ {w}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = (c) => ({
  title: { fontSize: 30, fontWeight: '800', color: c.text, paddingHorizontal: 20, marginTop: 8 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: c.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 26,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 4 },
  cardText: { fontSize: 14, color: c.muted, lineHeight: 20 },
  footnote: { fontSize: 12, color: c.muted, lineHeight: 17 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  segment: { flexDirection: 'row', backgroundColor: c.border, borderRadius: 999, padding: 3 },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  segmentActive: { backgroundColor: c.background },
  segmentText: { color: c.muted, fontWeight: '600' },
  segmentTextActive: { color: c.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  chipOn: { backgroundColor: c.dangerSoft, borderColor: c.dangerSoft },
  chipText: { color: c.text, fontWeight: '600', fontSize: 14 },
  chipTextOn: { color: c.danger },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: c.text,
  },
  addBtn: { backgroundColor: c.primary, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: 'center' },
  addText: { color: c.onPrimary, fontWeight: '700' },
});
