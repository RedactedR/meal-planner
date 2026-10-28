import { Pressable, Text, View } from 'react-native';
import { useAppState } from '../AppState';
import { STORE_SNACKS, isKetoSnack, snackNetCarbs } from '../data/snacks';
import { catalogItem, keyOf } from '../data/ingredients';
import { dateKey } from '../nutrition';
import { packDescription, servingPrice } from '../snackPlan';
import { money } from '../pricing';
import { useToast } from './Toast';
import { StockIcon } from './Badges';
import { radius, useStyles, useTheme } from '../theme';

// Shared actions for store-bought snacks.
export function useSnackActions() {
  const { logFood, consumeInventory, inventory, snackList, setSnackCount } = useAppState();
  const toast = useToast();

  // How many servings you have in your Kitchen.
  function servingsOnHand(s) {
    const item = inventory[keyOf(s.item)];
    const unit = catalogItem(s.item)?.unit ?? '';
    if (!item || item.unit !== unit || item.qty <= 0) return 0;
    return Math.floor(item.qty / s.per + 1e-9);
  }

  // Log one serving for today and take it out of your Kitchen if it's there.
  function eat(s, date = dateKey()) {
    logFood(date, {
      name: s.name,
      emoji: s.emoji,
      calories: s.nutrition.calories,
      protein: s.nutrition.protein,
      snackId: s.id,
    });
    if (servingsOnHand(s) > 0) {
      consumeInventory([{ name: s.item, unit: catalogItem(s.item)?.unit ?? '', qty: s.per }]);
    }
    toast(`Logged ${s.name} ✓`);
  }

  function addToList(s) {
    const n = snackList[s.id] || 0;
    setSnackCount(s.id, n + 1);
    toast(n ? `${s.name}: ${n + 1} packs on your list` : `Added ${s.name} to your grocery list ✓`);
  }

  return { eat, addToList, servingsOnHand, snackList, setSnackCount };
}

// One store-bought snack with its numbers and buttons.
export function StoreSnackCard({ snack, onLog, compact }) {
  const styles = useStyles(makeStyles);
  const c = useTheme();
  const { eat, addToList, servingsOnHand, snackList, setSnackCount } = useSnackActions();
  const n = snack.nutrition;
  const have = servingsOnHand(snack);
  const listed = snackList[snack.id] || 0;

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{snack.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{snack.name}</Text>
        <Text style={styles.meta}>
          {snack.serving} · {n.calories} cal · <Text style={{ color: c.accent, fontWeight: '700' }}>{n.protein}g protein</Text>
          {isKetoSnack(snack) ? ` · ${snackNetCarbs(snack)}g net carbs` : ''}
        </Text>
        {!compact && (
          <Text style={styles.meta}>
            {money(servingPrice(snack))} a serving · {packDescription(snack, 1)}
          </Text>
        )}
        <View style={styles.badges}>
          {have > 0 && (
            <View style={styles.badge}>
              <StockIcon status="full" size={14} />
              <Text style={styles.badgeText}>{have} in your Kitchen</Text>
            </View>
          )}
          {isKetoSnack(snack) && <Text style={styles.keto}>🥑 Keto</Text>}
        </View>
      </View>
      <View style={styles.buttons}>
        <Pressable onPress={() => (onLog ? onLog(snack) : eat(snack))} style={styles.logBtn} hitSlop={4}>
          <Text style={styles.logText}>+ Log</Text>
        </Pressable>
        {listed ? (
          <View style={styles.listRow}>
            <Pressable onPress={() => setSnackCount(snack.id, listed - 1)} hitSlop={6}>
              <Text style={styles.listStep}>−</Text>
            </Pressable>
            <Text style={styles.listText}>🛒 {listed}</Text>
            <Pressable onPress={() => setSnackCount(snack.id, listed + 1)} hitSlop={6}>
              <Text style={styles.listStep}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => addToList(snack)} style={styles.listBtn} hitSlop={4}>
            <Text style={styles.listBtnText}>🛒 Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// The store-snacks section on the Recipes tab, most protein first.
export function StoreSnackShelf({ ketoOnly, query = '' }) {
  const styles = useStyles(makeStyles);
  const q = query.trim().toLowerCase();
  const list = STORE_SNACKS.filter((s) => (!ketoOnly || isKetoSnack(s)) && (!q || s.name.toLowerCase().includes(q))).sort(
    (a, b) => b.nutrition.protein - a.nutrition.protein
  );
  if (!list.length) return null;
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={styles.heading}>🛒 Snacks to buy at King Soopers</Text>
      <Text style={styles.sub}>
        Tap 🛒 to put a pack on your grocery list, or + Log when you eat one. Homemade snacks are below.
      </Text>
      {list.map((s) => (
        <StoreSnackCard key={s.id} snack={s} />
      ))}
      <Text style={[styles.heading, { marginTop: 14 }]}>🥣 Make your own</Text>
    </View>
  );
}

const makeStyles = (c) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    padding: 12,
    marginBottom: 10,
  },
  emoji: { fontSize: 30, width: 40, textAlign: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: c.text },
  meta: { fontSize: 12, color: c.muted, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 12, color: c.primary, fontWeight: '600' },
  keto: { fontSize: 12, color: c.primary, fontWeight: '600' },
  buttons: { gap: 6, alignItems: 'stretch' },
  logBtn: { backgroundColor: c.accentSoft, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 10, alignItems: 'center' },
  logText: { color: c.accent, fontWeight: '700', fontSize: 13 },
  listBtn: { backgroundColor: c.primarySoft, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 10, alignItems: 'center' },
  listBtnText: { color: c.primary, fontWeight: '700', fontSize: 13 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6,
    backgroundColor: c.primarySoft, borderRadius: radius.sm, paddingVertical: 5, paddingHorizontal: 8,
  },
  listStep: { color: c.primary, fontWeight: '800', fontSize: 16 },
  listText: { color: c.primary, fontWeight: '700', fontSize: 13 },
  heading: { fontSize: 17, fontWeight: '800', color: c.text, marginTop: 6 },
  sub: { fontSize: 13, color: c.muted, marginTop: 2, marginBottom: 10, lineHeight: 18 },
});
