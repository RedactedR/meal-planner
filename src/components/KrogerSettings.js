import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from 'react-native';
import { useAppState } from '../AppState';
import { checkServer, findStores, signIn } from '../kroger';
import { useToast } from './Toast';
import { radius, useStyles, useTheme } from '../theme';

const SETUP_GUIDE = 'https://github.com/RedactedR/meal-planner/blob/main/server/README.md';

// Settings card for connecting King Soopers: server address, sign-in,
// store, and pickup or delivery.
export default function KrogerSettings() {
  const styles = useStyles(makeStyles);
  const colors = useTheme();
  const toast = useToast();
  const { kroger, updateKroger } = useAppState();
  const [server, setServer] = useState(kroger.serverUrl);
  const [busy, setBusy] = useState(null); // 'check' | 'signin' | 'stores'
  const [error, setError] = useState(null);
  const [zip, setZip] = useState('');
  const [stores, setStores] = useState([]);

  const signedIn = !!kroger.tokens?.accessToken;
  const ready = signedIn && !!kroger.store;

  async function run(kind, fn) {
    setBusy(kind);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  const saveServer = () =>
    run('check', async () => {
      const url = server.trim().replace(/\/+$/, '');
      await checkServer(url);
      updateKroger({ serverUrl: url });
      setServer(url);
      toast('Connection server works ✓');
    });

  const doSignIn = () =>
    run('signin', async () => {
      const tokens = await signIn(kroger.serverUrl);
      if (tokens) {
        updateKroger({ tokens });
        toast('Signed in to King Soopers ✓');
      }
    });

  const lookUpStores = () =>
    run('stores', async () => {
      const list = await findStores(kroger.serverUrl, zip.trim());
      setStores(list);
      if (list.length === 0) setError('No stores found near that ZIP code.');
    });

  function pickStore(s) {
    updateKroger({ store: s });
    setStores([]);
    toast(`Shopping at ${s.name}`);
  }

  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <Text style={styles.cardTitle}>🛒 King Soopers</Text>
        <View style={[styles.status, ready ? styles.statusOn : null]}>
          <Text style={[styles.statusText, ready && { color: colors.primary }]}>
            {ready ? 'Connected' : signedIn ? 'Pick a store' : 'Not connected'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardText}>
        Send your grocery list straight to your King Soopers cart, with live prices from your store. One-time setup takes
        about 15 minutes.
      </Text>
      <Pressable onPress={() => Linking.openURL(SETUP_GUIDE)}>
        <Text style={styles.link}>Open the setup guide ↗</Text>
      </Pressable>

      <Text style={styles.step}>1. Connection server</Text>
      <View style={styles.row}>
        <TextInput
          value={server}
          onChangeText={setServer}
          placeholder="https://meal-planner-kroger.you.workers.dev"
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1 }]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          keyboardAppearance={colors.mode}
        />
        <Pressable onPress={saveServer} disabled={!server.trim() || !!busy} style={[styles.btn, (!server.trim() || !!busy) && styles.dim]}>
          {busy === 'check' ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.btnText}>Save</Text>}
        </Pressable>
      </View>
      {kroger.serverUrl ? <Text style={styles.ok}>✓ Saved</Text> : null}

      <Text style={styles.step}>2. Your King Soopers account</Text>
      {signedIn ? (
        <View style={styles.rowBetween}>
          <Text style={styles.ok}>✓ Signed in</Text>
          <Pressable onPress={() => updateKroger({ tokens: null })} hitSlop={8}>
            <Text style={styles.link}>Sign out</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={doSignIn}
          disabled={!kroger.serverUrl || !!busy}
          style={[styles.wideBtn, (!kroger.serverUrl || !!busy) && styles.dim]}
        >
          {busy === 'signin' ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.btnText}>Sign in to King Soopers</Text>
          )}
        </Pressable>
      )}

      <Text style={styles.step}>3. Your store</Text>
      {kroger.store && (
        <View style={styles.storeChosen}>
          <Text style={styles.storeName}>{kroger.store.name}</Text>
          <Text style={styles.storeAddr}>{kroger.store.address}</Text>
        </View>
      )}
      <View style={styles.row}>
        <TextInput
          value={zip}
          onChangeText={setZip}
          placeholder="ZIP code"
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1 }]}
          keyboardType="number-pad"
          maxLength={5}
          keyboardAppearance={colors.mode}
          onSubmitEditing={lookUpStores}
        />
        <Pressable
          onPress={lookUpStores}
          disabled={!kroger.serverUrl || zip.trim().length !== 5 || !!busy}
          style={[styles.btn, (!kroger.serverUrl || zip.trim().length !== 5 || !!busy) && styles.dim]}
        >
          {busy === 'stores' ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.btnText}>{kroger.store ? 'Change' : 'Find'}</Text>
          )}
        </Pressable>
      </View>
      {stores.map((s) => (
        <Pressable key={s.locationId} onPress={() => pickStore(s)} style={styles.storeRow}>
          <Text style={styles.storeName}>{s.name}</Text>
          <Text style={styles.storeAddr}>{s.address}</Text>
        </Pressable>
      ))}

      <Text style={styles.step}>4. Pickup or delivery</Text>
      <View style={styles.segment}>
        {[
          ['PICKUP', 'Pickup'],
          ['DELIVERY', 'Delivery'],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => updateKroger({ modality: key })}
            style={[styles.segmentBtn, kroger.modality === key && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, kroger.modality === key && styles.segmentTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const makeStyles = (c) => ({
  card: {
    marginHorizontal: 20,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    gap: 10,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: c.text },
  cardText: { fontSize: 14, color: c.muted, lineHeight: 20 },
  status: { backgroundColor: c.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  statusOn: { backgroundColor: c.primarySoft },
  statusText: { fontSize: 12, fontWeight: '700', color: c.muted },
  link: { color: c.primary, fontWeight: '600', fontSize: 14 },
  step: { fontSize: 14, fontWeight: '700', color: c.text, marginTop: 6 },
  row: { flexDirection: 'row', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
  btn: { backgroundColor: c.primary, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', minWidth: 76 },
  wideBtn: { backgroundColor: c.primary, borderRadius: radius.sm, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: c.onPrimary, fontWeight: '700' },
  dim: { opacity: 0.45 },
  ok: { color: c.primary, fontWeight: '600', fontSize: 13 },
  storeChosen: { backgroundColor: c.primarySoft, borderRadius: radius.sm, padding: 10 },
  storeRow: { borderWidth: 1, borderColor: c.border, borderRadius: radius.sm, padding: 10 },
  storeName: { fontSize: 15, fontWeight: '600', color: c.text },
  storeAddr: { fontSize: 13, color: c.muted, marginTop: 2 },
  segment: { flexDirection: 'row', backgroundColor: c.border, borderRadius: 999, padding: 3 },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  segmentActive: { backgroundColor: c.background },
  segmentText: { color: c.muted, fontWeight: '600' },
  segmentTextActive: { color: c.text },
  error: { color: c.danger, fontSize: 13, lineHeight: 18 },
});
