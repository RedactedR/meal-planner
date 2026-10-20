import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../AppState';
import { itemAmount } from '../grocery';
import { money } from '../pricing';
import {
  KING_SOOPERS_CART_URL,
  addToCart,
  freshToken,
  priceOf,
  searchProducts,
  searchTerm,
  suggestedQuantity,
} from '../kroger';
import { radius, useStyles, useTheme } from '../theme';

// Matches each shopping-list item to a real King Soopers product at your
// store (with live prices), lets you adjust, then adds them to your cart.
export default function CartMatcher({ visible, items, onClose, onMarkBought }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {visible && <Matcher items={items} onClose={onClose} onMarkBought={onMarkBought} />}
    </Modal>
  );
}

function Matcher({ items, onClose, onMarkBought }) {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const { kroger, updateKroger, rememberProducts } = useAppState();
  const [rows, setRows] = useState(() =>
    items.map((item) => ({ item, status: 'loading', options: [], chosen: 0, qty: suggestedQuantity(item), include: true, open: false }))
  );
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null); // { count }
  const cancelled = useRef(false);

  const ready = kroger.serverUrl && kroger.tokens?.accessToken && kroger.store;

  function update(i, changes) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...changes } : r)));
  }

  useEffect(() => {
    cancelled.current = false;
    if (!ready) return undefined;
    // Look products up a few at a time to stay well inside Kroger's limits.
    let next = 0;
    const worker = async () => {
      while (!cancelled.current && next < items.length) {
        const i = next++;
        const item = items[i];
        try {
          let options = await searchProducts(kroger.serverUrl, kroger.store.locationId, searchTerm(item.name), 6);
          const pref = kroger.productPrefs[item.name.toLowerCase()];
          let chosen = 0;
          if (pref) {
            const at = options.findIndex((o) => o.upc === pref.upc);
            if (at >= 0) chosen = at;
            else options = [{ ...pref, stale: true }, ...options];
          }
          if (!cancelled.current) {
            update(i, { status: options.length ? 'done' : 'none', options, chosen, include: options.length > 0 });
          }
        } catch (e) {
          if (!cancelled.current) update(i, { status: 'error', error: e.message, include: false });
        }
      }
    };
    Promise.all([worker(), worker(), worker()]);
    return () => {
      cancelled.current = true;
    };
  }, []);

  const picked = rows.filter((r) => r.include && r.status === 'done' && r.options[r.chosen]);
  const total = picked.reduce((s, r) => s + (priceOf(r.options[r.chosen]) || 0) * r.qty, 0);
  const loading = rows.some((r) => r.status === 'loading');

  async function add() {
    setAdding(true);
    setError(null);
    try {
      const token = await freshToken(kroger.serverUrl, kroger.tokens, (tokens) => updateKroger({ tokens }));
      await addToCart(
        kroger.serverUrl,
        token,
        picked.map((r) => ({ upc: r.options[r.chosen].upc, quantity: r.qty })),
        kroger.modality
      );
      rememberProducts(
        Object.fromEntries(picked.map((r) => [r.item.name.toLowerCase(), { ...r.options[r.chosen], stale: undefined }]))
      );
      setDone({ count: picked.length });
    } catch (e) {
      if (e.status === 401) updateKroger({ tokens: null });
      setError(e.status === 401 ? 'Your King Soopers sign-in expired. Sign in again in Settings.' : e.message);
    } finally {
      setAdding(false);
    }
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header styles={styles} title="King Soopers cart" onClose={onClose} />
        <View style={styles.center}>
          <Text style={{ fontSize: 44 }}>🛒</Text>
          <Text style={styles.bigTitle}>Connect King Soopers first</Text>
          <Text style={styles.centerText}>
            In Settings, add your connection server, sign in to your King Soopers account and pick your store.
          </Text>
          <Pressable onPress={onClose} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>OK</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header styles={styles} title="King Soopers cart" onClose={onClose} />
        <View style={styles.center}>
          <Text style={{ fontSize: 52 }}>✅</Text>
          <Text style={styles.bigTitle}>Added {done.count} items to your cart</Text>
          <Text style={styles.centerText}>
            Finish checking out on King Soopers to pick a {kroger.modality === 'DELIVERY' ? 'delivery' : 'pickup'} time.
          </Text>
          <Pressable onPress={() => Linking.openURL(KING_SOOPERS_CART_URL)} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Open my King Soopers cart ↗</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onMarkBought(picked.map((r) => ({ ...r.item, packs: r.qty })));
              onClose();
            }}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryText}>Also add these to my Kitchen</Text>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.muted}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header styles={styles} title="Match products" onClose={onClose} />
      <Text style={styles.sub}>
        {kroger.store.name} · {kroger.modality === 'DELIVERY' ? 'Delivery' : 'Pickup'} · live prices
      </Text>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140, gap: 12 }}>
        {rows.map((r, i) => {
          const product = r.options[r.chosen];
          return (
            <View key={r.item.key} style={[styles.row, !r.include && { opacity: 0.5 }]}>
              <View style={styles.rowHead}>
                <Pressable onPress={() => update(i, { include: !r.include })} hitSlop={8} style={[styles.check, r.include && styles.checkOn]}>
                  {r.include && <Text style={styles.checkMark}>✓</Text>}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{r.item.name}</Text>
                  <Text style={styles.muted}>Recipe needs {itemAmount(r.item)}</Text>
                </View>
              </View>

              {r.status === 'loading' && <ActivityIndicator style={{ marginVertical: 10 }} color={colors.primary} />}
              {r.status === 'none' && <Text style={styles.muted}>No match at your store. Untick it or buy it elsewhere.</Text>}
              {r.status === 'error' && <Text style={styles.error}>{r.error}</Text>}

              {product && (
                <>
                  <ProductRow product={product} styles={styles} />
                  <View style={styles.controls}>
                    <View style={styles.stepper}>
                      <Pressable onPress={() => update(i, { qty: Math.max(1, r.qty - 1) })} style={styles.stepBtn} hitSlop={6}>
                        <Text style={styles.stepText}>−</Text>
                      </Pressable>
                      <Text style={styles.qty}>{r.qty}</Text>
                      <Pressable onPress={() => update(i, { qty: Math.min(20, r.qty + 1) })} style={styles.stepBtn} hitSlop={6}>
                        <Text style={styles.stepText}>+</Text>
                      </Pressable>
                    </View>
                    {r.options.length > 1 && (
                      <Pressable onPress={() => update(i, { open: !r.open })} hitSlop={8}>
                        <Text style={styles.link}>{r.open ? 'Close' : `Other options (${r.options.length - 1})`}</Text>
                      </Pressable>
                    )}
                  </View>
                  {r.open &&
                    r.options.map((o, j) =>
                      j === r.chosen ? null : (
                        <Pressable key={`${o.upc}-${j}`} onPress={() => update(i, { chosen: j, open: false })} style={styles.option}>
                          <ProductRow product={o} styles={styles} />
                        </Pressable>
                      )
                    )}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.total}>
          {picked.length} items · {money(total)}
          {loading ? ' · still matching…' : ''}
        </Text>
        <Pressable
          onPress={add}
          disabled={!!(adding || loading || picked.length === 0)}
          style={[styles.primaryBtn, { alignSelf: 'stretch' }, (adding || loading || picked.length === 0) && { opacity: 0.45 }]}
        >
          {adding ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryText}>Add {picked.length} items to cart</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Header({ styles, title, onClose }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onClose} hitSlop={12}>
        <Text style={styles.link}>Close</Text>
      </Pressable>
    </View>
  );
}

function ProductRow({ product, styles }) {
  const sale = product.promo && product.promo > 0 && product.promo < product.price;
  return (
    <View style={styles.product}>
      {product.image ? <Image source={{ uri: product.image }} style={styles.thumb} /> : <View style={styles.thumb} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.muted}>
          {[product.size, product.aisle].filter(Boolean).join(' · ')}
          {product.stale ? ' · last time' : ''}
          {product.inStock === false ? ' · low stock' : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {sale && <Text style={styles.oldPrice}>{money(product.price)}</Text>}
        <Text style={[styles.price, sale && styles.salePrice]}>
          {priceOf(product) != null ? money(priceOf(product)) : '—'}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14 },
  title: { fontSize: 22, fontWeight: '800', color: c.text },
  sub: { fontSize: 13, color: c.muted, paddingHorizontal: 20, marginTop: 4 },
  link: { color: c.primary, fontWeight: '700', fontSize: 15 },
  muted: { color: c.muted, fontSize: 13 },
  error: { color: c.danger, fontSize: 13, lineHeight: 18 },
  row: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: radius.md, padding: 12, gap: 10 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemName: { fontSize: 16, fontWeight: '700', color: c.text },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: c.muted, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: c.primary, borderColor: c.primary },
  checkMark: { color: c.onPrimary, fontSize: 13, fontWeight: '800' },
  product: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: '#fff' },
  productName: { fontSize: 14, color: c.text, fontWeight: '500' },
  price: { fontSize: 15, fontWeight: '800', color: c.text },
  salePrice: { color: c.danger },
  oldPrice: { fontSize: 12, color: c.muted, textDecorationLine: 'line-through' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 18, color: c.text, fontWeight: '700', lineHeight: 20 },
  qty: { fontSize: 15, fontWeight: '700', color: c.text, minWidth: 20, textAlign: 'center' },
  option: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 8,
    backgroundColor: c.background,
    borderTopWidth: 1,
    borderTopColor: c.border,
    alignItems: 'center',
  },
  total: { fontSize: 15, fontWeight: '700', color: c.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  bigTitle: { fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center' },
  centerText: { fontSize: 15, color: c.muted, textAlign: 'center', lineHeight: 22 },
  primaryBtn: { backgroundColor: c.primary, borderRadius: radius.md, paddingVertical: 15, paddingHorizontal: 24, alignItems: 'center' },
  primaryText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
  secondaryBtn: { borderWidth: 1.5, borderColor: c.primary, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 20 },
  secondaryText: { color: c.primary, fontWeight: '700', fontSize: 15 },
});
