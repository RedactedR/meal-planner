import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { getRecipe } from '../data/recipes';
import { buildGroceryList, formatQty } from '../grocery';
import { useAppState } from '../AppState';
import { radius, useStyles } from '../theme';

function Check({ on, styles }) {
  return <View style={[styles.check, on && styles.checkOn]}>{on && <Text style={styles.checkMark}>✓</Text>}</View>;
}

export default function GroceryScreen() {
  const styles = useStyles(makeStyles);
  const { plan, days, settings } = useAppState();

  // Remember what the user unticked, so new meals start ticked.
  const [skippedDays, setSkippedDays] = useState(new Set());
  const [skippedItems, setSkippedItems] = useState(new Set());

  const planned = days.map((day) => ({ day, recipe: getRecipe(plan.meals[day]) })).filter((p) => p.recipe);
  const selected = planned.filter((p) => !skippedDays.has(p.day));
  const selectedIds = selected.map((p) => p.recipe.id).join(',');
  const items = useMemo(
    () => buildGroceryList(selectedIds ? selectedIds.split(',') : [], settings.portions),
    [selectedIds, settings.portions]
  );
  const itemsToBuy = items.filter((i) => !skippedItems.has(i.key));
  const allSelected = selected.length === planned.length;

  function toggle(setter, key) {
    setter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setSkippedDays(allSelected ? new Set(planned.map((p) => p.day)) : new Set());
  }

  function sendToCart() {
    Alert.alert(
      'King Soopers cart',
      `${itemsToBuy.length} items are ready. Sending them to your King Soopers cart is the next feature we're building.`
    );
  }

  if (planned.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Groceries</Text>
        <View style={styles.emptyWrap}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
          <Text style={styles.emptyTitle}>Nothing planned yet</Text>
          <Text style={styles.emptyText}>Add some recipes to your week and your shopping list will build itself here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>Groceries</Text>
      <Text style={styles.subtitle}>
        Amounts for {settings.portions} {settings.portions === 1 ? 'person' : 'people'} per meal
      </Text>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        <View style={styles.sectionRow}>
          <Text style={styles.section}>Meals</Text>
          <Pressable onPress={toggleAll} hitSlop={8}>
            <Text style={styles.link}>{allSelected ? 'Select none' : 'Select all'}</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          {planned.map(({ day, recipe }, i) => {
            const on = !skippedDays.has(day);
            return (
              <Pressable
                key={day}
                onPress={() => toggle(setSkippedDays, day)}
                style={[styles.row, i > 0 && styles.rowBorder]}
              >
                <Check on={on} styles={styles} />
                <Text style={styles.rowEmoji}>{recipe.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowText, !on && styles.off]}>{recipe.name}</Text>
                  <Text style={styles.rowSub}>{day}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.section, { marginTop: 24 }]}>Shopping list · {itemsToBuy.length} items</Text>
        <Text style={styles.hint}>Untick anything you already have at home.</Text>
        {items.length > 0 && (
          <View style={styles.card}>
            {items.map((item, i) => {
              const on = !skippedItems.has(item.key);
              return (
                <Pressable
                  key={item.key}
                  onPress={() => toggle(setSkippedItems, item.key)}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                >
                  <Check on={on} styles={styles} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowText, !on && styles.off]}>{item.name}</Text>
                    {item.recipes.length > 1 && <Text style={styles.rowSub}>For {item.recipes.length} recipes</Text>}
                  </View>
                  <Text style={[styles.qty, !on && styles.off]}>{formatQty(item.qty, item.unit)}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={sendToCart}
          disabled={itemsToBuy.length === 0}
          style={({ pressed }) => [styles.cartBtn, itemsToBuy.length === 0 && { opacity: 0.4 }, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.cartText}>Add {itemsToBuy.length} items to King Soopers cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c) => ({
  title: { fontSize: 30, fontWeight: '800', color: c.text, paddingHorizontal: 20, marginTop: 8 },
  subtitle: { fontSize: 15, color: c.muted, paddingHorizontal: 20, marginTop: 2, marginBottom: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: c.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  link: { color: c.primary, fontWeight: '600', marginBottom: 8 },
  hint: { color: c.muted, fontSize: 13, marginBottom: 10, marginTop: -4 },
  card: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: c.border },
  rowEmoji: { fontSize: 22 },
  rowText: { fontSize: 15, color: c.text, fontWeight: '500' },
  rowSub: { fontSize: 12, color: c.muted, marginTop: 2 },
  qty: { fontSize: 14, color: c.muted },
  off: { color: c.muted, textDecorationLine: 'line-through' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: c.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: c.primary, borderColor: c.primary },
  checkMark: { color: c.onPrimary, fontSize: 13, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: c.background,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  cartBtn: { backgroundColor: c.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  cartText: { color: c.onPrimary, fontSize: 16, fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 12 },
  emptyText: { fontSize: 15, color: c.muted, textAlign: 'center', marginTop: 6, lineHeight: 22 },
});
