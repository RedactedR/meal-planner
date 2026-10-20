import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATALOG, CATEGORIES, catalogItem, keyOf } from '../data/ingredients';
import { formatQty } from '../grocery';
import { approxAmount, packOf } from '../packages';
import { money } from '../pricing';
import { useAppState } from '../AppState';
import { useToast } from '../components/Toast';
import { radius, useStyles, useTheme } from '../theme';

const CATALOG_LIST = Object.values(CATALOG).sort((a, b) => a.name.localeCompare(b.name));

// − and + move a quarter package at a time for things like a jar of
// paprika (24 tsp), and one at a time for things you count.
function stepFor(item) {
  const pack = packOf(item.name);
  if (item.unit !== '' && pack >= 4) return pack / 4;
  if (item.unit === 'lb') return 0.25;
  if (item.unit === 'cup') return 0.5;
  return 1;
}

// Your kitchen inventory: what you have, how much, grouped by store section.
export default function KitchenScreen() {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { inventory, kitchenSetup, setInventoryQty, addToInventory, finishKitchenSetup } = useAppState();
  const [setupOpen, setSetupOpen] = useState(false);
  const [query, setQuery] = useState('');

  const items = Object.values(inventory);
  const value = items.reduce((s, i) => s + i.qty * (catalogItem(i.name)?.price ?? 0), 0);
  const groups = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.key).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length);

  const suggestions = useMemo(() => {
    const q = keyOf(query);
    if (!q) return [];
    return CATALOG_LIST.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  function addItem(name) {
    const info = catalogItem(name);
    const unit = info?.unit ?? '';
    addToInventory([{ name, unit, qty: info?.pack ?? 1 }]);
    setQuery('');
    toast(`Added ${info?.name ?? name.trim()} to your Kitchen ✓`);
  }

  function change(item, delta) {
    const next = item.qty + delta;
    if (next <= 0) {
      Alert.alert(`Remove ${item.name}?`, 'It will come off your Kitchen list.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setInventoryQty(item.name, item.unit, 0) },
      ]);
    } else {
      setInventoryQty(item.name, item.unit, next);
    }
  }

  if (!kitchenSetup) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Kitchen</Text>
        <View style={styles.welcome}>
          <Text style={{ fontSize: 52 }}>🏠</Text>
          <Text style={styles.welcomeTitle}>What's already in your kitchen?</Text>
          <Text style={styles.welcomeText}>
            Tick what you have once, and the app keeps track from there: groceries you buy get added, meals you cook get
            taken out. You'll see which recipes are cheaper because you already have the ingredients.
          </Text>
          <Pressable onPress={() => setSetupOpen(true)} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Set up my kitchen</Text>
          </Pressable>
          <Pressable onPress={() => finishKitchenSetup([])} hitSlop={10}>
            <Text style={styles.skip}>Skip — start with an empty kitchen</Text>
          </Pressable>
        </View>
        <KitchenSetup visible={setupOpen} onClose={() => setSetupOpen(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Kitchen</Text>
        <Text style={styles.subtitle}>
          {items.length} items · about {money(value)} worth of food
        </Text>

        <View style={styles.addWrap}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => query.trim() && addItem(suggestions[0]?.name ?? query)}
            placeholder="Add an item, e.g. eggs"
            placeholderTextColor={colors.muted}
            style={styles.input}
            keyboardAppearance={colors.mode}
            returnKeyType="done"
          />
          {query.trim().length > 0 && (
            <View style={styles.suggestBox}>
              {suggestions.map((s) => (
                <Pressable key={s.name} onPress={() => addItem(s.name)} style={styles.suggestRow}>
                  <Text style={styles.suggestText}>{s.name}</Text>
                  <Text style={styles.suggestSub}>+ {formatQty(s.pack, s.unit)}</Text>
                </Pressable>
              ))}
              {!suggestions.some((s) => keyOf(s.name) === keyOf(query)) && (
                <Pressable onPress={() => addItem(query)} style={styles.suggestRow}>
                  <Text style={styles.suggestText}>Add "{query.trim()}"</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {groups.length === 0 && <Text style={styles.empty}>Your kitchen is empty. Add items above.</Text>}

        {groups.map((g) => (
          <View key={g.key}>
            <Text style={styles.section}>
              {g.emoji} {g.label}
            </Text>
            <View style={styles.card}>
              {g.items.map((item, i) => (
                <View key={item.name} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    {approxAmount(item.name, item.qty) && (
                      <Text style={styles.approx}>{approxAmount(item.name, item.qty)}</Text>
                    )}
                  </View>
                  <Pressable onPress={() => change(item, -stepFor(item))} style={styles.stepBtn} hitSlop={6}>
                    <Text style={styles.stepText}>−</Text>
                  </Pressable>
                  <Text style={styles.qty}>{formatQty(Math.round(item.qty * 100) / 100, item.unit)}</Text>
                  <Pressable onPress={() => change(item, stepFor(item))} style={styles.stepBtn} hitSlop={6}>
                    <Text style={styles.stepText}>+</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Pressable onPress={() => setSetupOpen(true)} style={{ alignSelf: 'center', marginTop: 24 }}>
          <Text style={styles.link}>Add more from the checklist</Text>
        </Pressable>
      </ScrollView>
      <KitchenSetup visible={setupOpen} onClose={() => setSetupOpen(false)} />
    </View>
  );
}

// First-time (or later) checklist of every ingredient the recipes use.
function KitchenSetup({ visible, onClose }) {
  const styles = useStyles(makeStyles);
  const toast = useToast();
  const { inventory, finishKitchenSetup } = useAppState();
  const [picked, setPicked] = useState(new Set());

  function toggle(key) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function done() {
    const items = [...picked].map((key) => {
      const info = CATALOG[key];
      return { name: info.name, unit: info.unit, qty: info.pack };
    });
    finishKitchenSetup(items);
    setPicked(new Set());
    onClose();
    toast(items.length ? `Added ${items.length} items to your Kitchen ✓` : 'Kitchen ready');
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.link}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>What do you have?</Text>
          <Pressable onPress={done} hitSlop={12}>
            <Text style={[styles.link, { fontWeight: '800' }]}>Done{picked.size ? ` (${picked.size})` : ''}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <Text style={styles.subtitleFlush}>
            Tap everything you have right now. We'll assume a typical package of each; you can fine-tune amounts on the
            Kitchen tab after.
          </Text>
          {CATEGORIES.filter((c) => c.key !== 'other').map((cat) => {
            const list = CATALOG_LIST.filter((i) => i.category === cat.key && !inventory[keyOf(i.name)]);
            if (!list.length) return null;
            return (
              <View key={cat.key}>
                <Text style={[styles.section, { paddingHorizontal: 0 }]}>
                  {cat.emoji} {cat.label}
                </Text>
                <View style={styles.chips}>
                  {list.map((i) => {
                    const key = keyOf(i.name);
                    const on = picked.has(key);
                    return (
                      <Pressable key={key} onPress={() => toggle(key)} style={[styles.chip, on && styles.chipOn]}>
                        <Text style={[styles.chipText, on && styles.chipTextOn]}>
                          {on ? '✓ ' : ''}
                          {i.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (c) => ({
  title: { fontSize: 30, fontWeight: '800', color: c.text, paddingHorizontal: 20, marginTop: 8 },
  subtitle: { fontSize: 15, color: c.muted, paddingHorizontal: 20, marginTop: 2 },
  subtitleFlush: { fontSize: 14, color: c.muted, lineHeight: 20, marginTop: 4 },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center' },
  welcomeText: { fontSize: 15, color: c.muted, textAlign: 'center', lineHeight: 22 },
  primaryBtn: {
    backgroundColor: c.primary,
    borderRadius: radius.md,
    paddingVertical: 15,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  primaryText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
  skip: { color: c.muted, marginTop: 6 },
  addWrap: { marginHorizontal: 20, marginTop: 16 },
  input: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: c.text,
  },
  suggestBox: {
    marginTop: 6,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  suggestText: { color: c.text, fontSize: 15 },
  suggestSub: { color: c.primary, fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: c.muted, marginTop: 40 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: c.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 22,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 9 },
  rowBorder: { borderTopWidth: 1, borderTopColor: c.border },
  rowName: { fontSize: 15, color: c.text },
  approx: { fontSize: 12, color: c.muted, marginTop: 2 },
  qty: { minWidth: 70, textAlign: 'center', fontSize: 14, color: c.text, fontWeight: '600' },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 18, color: c.text, fontWeight: '700', lineHeight: 20 },
  link: { color: c.primary, fontWeight: '600', fontSize: 15 },
  modal: { flex: 1, backgroundColor: c.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  chipOn: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.text, fontWeight: '600', fontSize: 14 },
  chipTextOn: { color: c.onPrimary },
});
