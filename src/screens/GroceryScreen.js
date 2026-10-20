import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { getRecipe } from '../data/recipes';
import { boughtQty, buildGroceryList, formatQty, itemAmount } from '../grocery';
import { money } from '../pricing';
import { useAppState } from '../AppState';
import { useToast } from '../components/Toast';
import { StockIcon } from '../components/Badges';
import CartMatcher from '../components/CartMatcher';
import { radius, useStyles } from '../theme';

function Check({ on, styles }) {
  return <View style={[styles.check, on && styles.checkOn]}>{on && <Text style={styles.checkMark}>✓</Text>}</View>;
}

export default function GroceryScreen() {
  const styles = useStyles(makeStyles);
  const toast = useToast();
  const { plan, days, settings, inventory, addToInventory, kroger } = useAppState();
  const [cartOpen, setCartOpen] = useState(false);
  const connected = !!(kroger.serverUrl && kroger.tokens?.accessToken && kroger.store);

  // Remember what the user unticked, so new meals start ticked.
  const [skippedDays, setSkippedDays] = useState(new Set());
  const [skippedItems, setSkippedItems] = useState(new Set());

  const planned = days.map((day) => ({ day, recipe: getRecipe(plan.meals[day]) })).filter((p) => p.recipe);
  const selected = planned.filter((p) => !skippedDays.has(p.day));
  const selectedIds = selected.map((p) => p.recipe.id).join(',');
  const items = useMemo(
    () => buildGroceryList(selectedIds ? selectedIds.split(',') : [], settings.portions, inventory, settings),
    [selectedIds, settings, inventory]
  );
  const needed = items.filter((i) => i.qty > 0);
  const onHand = items.filter((i) => i.qty === 0);
  const itemsToBuy = needed.filter((i) => !skippedItems.has(i.key));
  const estTotal = itemsToBuy.reduce((s, i) => s + i.price, 0);
  const unpricedCount = itemsToBuy.filter((i) => i.unpriced).length;
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

  function markBought() {
    Alert.alert(
      'Add to your Kitchen?',
      `Adds the ${itemsToBuy.length} ticked items to your Kitchen inventory, in whole packages (a head of garlic, a full bag of rice).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            addBought(itemsToBuy);
          },
        },
      ]
    );
  }

  function addBought(list) {
    addToInventory(list.map((i) => ({ name: i.name, unit: i.unit, qty: boughtQty(i) })));
    setSkippedItems(new Set());
    toast(`Added ${list.length} items to your Kitchen ✓`);
  }

  function sendToCart() {
    setCartOpen(true);
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
        Amounts for {settings.portions} {settings.portions === 1 ? 'person' : 'people'} per meal, minus what's in your Kitchen
      </Text>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 170 }}>
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

        <Text style={[styles.section, { marginTop: 24 }]}>
          To buy · {itemsToBuy.length} items · est. {money(estTotal)}
          {unpricedCount ? ` + ${unpricedCount} unpriced` : ''}
        </Text>
        <Text style={styles.hint}>Untick anything you don't want to buy.</Text>
        {needed.length > 0 ? (
          <View style={styles.card}>
            {needed.map((item, i) => {
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
                    <Text style={styles.rowSub}>
                      {item.have > 0
                        ? `You have ${formatQty(item.have, item.haveUnit)}${item.using ? ` ${item.using.toLowerCase()}` : ''} · `
                        : ''}
                      {item.recipes.length > 1 ? `for ${item.recipes.length} recipes` : item.recipes[0]}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.qty, !on && styles.off]}>{itemAmount(item)}</Text>
                    <Text style={styles.rowSub}>{item.unpriced ? 'no price yet' : money(item.price)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={styles.hint}>You already have everything for these meals. 🎉</Text>
        )}

        {onHand.length > 0 && (
          <>
            <Text style={[styles.section, { marginTop: 24 }]}>Already in your kitchen · {onHand.length}</Text>
            <View style={styles.card}>
              {onHand.map((item, i) => (
                <View key={item.key} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <StockIcon status="full" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowText}>{item.name}</Text>
                    {item.using ? <Text style={styles.rowSub}>🔄 using your {item.using.toLowerCase()}</Text> : null}
                  </View>
                  <Text style={styles.rowSub}>have {formatQty(item.have, item.haveUnit)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={sendToCart}
          disabled={itemsToBuy.length === 0}
          style={({ pressed }) => [styles.cartBtn, itemsToBuy.length === 0 && { opacity: 0.4 }, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.cartText}>
            {connected ? `Add ${itemsToBuy.length} items to King Soopers cart` : `Send ${itemsToBuy.length} items to King Soopers`}
          </Text>
        </Pressable>
        <Pressable
          onPress={markBought}
          disabled={itemsToBuy.length === 0}
          style={({ pressed }) => [styles.boughtBtn, itemsToBuy.length === 0 && { opacity: 0.4 }, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.boughtText}>I bought these — add to my Kitchen</Text>
        </Pressable>
      </View>
      <CartMatcher visible={cartOpen} items={itemsToBuy} onClose={() => setCartOpen(false)} onMarkBought={addBought} />
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
  qty: { fontSize: 14, color: c.text, fontWeight: '600' },
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
    gap: 10,
    backgroundColor: c.background,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  cartBtn: { backgroundColor: c.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
  cartText: { color: c.onPrimary, fontSize: 16, fontWeight: '700' },
  boughtBtn: {
    borderWidth: 1.5,
    borderColor: c.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  boughtText: { color: c.primary, fontSize: 15, fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 12 },
  emptyText: { fontSize: 15, color: c.muted, textAlign: 'center', marginTop: 6, lineHeight: 22 },
});
