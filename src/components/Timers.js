import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, Vibration, View } from 'react-native';
import { radius, useStyles } from '../theme';

// Kitchen timers started from recipe steps. They run while the app is
// open and buzz + pop up when done.

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const [timers, setTimers] = useState([]); // { id, label, endsAt, seconds }
  const [, setTick] = useState(0);
  const fired = useRef(new Set());

  useEffect(() => {
    if (!timers.length) return undefined;
    const t = setInterval(() => {
      setTick((n) => n + 1);
      const now = Date.now();
      for (const timer of timers) {
        if (timer.endsAt <= now && !fired.current.has(timer.id)) {
          fired.current.add(timer.id);
          Vibration.vibrate([0, 600, 300, 600, 300, 600]);
          Alert.alert('⏱ Time!', timer.label, [
            { text: 'OK', onPress: () => remove(timer.id) },
            { text: '+1 min', onPress: () => extend(timer.id, 60) },
          ]);
        }
      }
    }, 500);
    return () => clearInterval(t);
  }, [timers]);

  function start(label, seconds) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setTimers((list) => [...list, { id, label, seconds, endsAt: Date.now() + seconds * 1000 }]);
  }
  function remove(id) {
    setTimers((list) => list.filter((t) => t.id !== id));
  }
  function extend(id, seconds) {
    fired.current.delete(id);
    setTimers((list) => list.map((t) => (t.id === id ? { ...t, endsAt: Math.max(t.endsAt, Date.now()) + seconds * 1000 } : t)));
  }

  return <TimerContext.Provider value={{ timers, start, remove, extend }}>{children}</TimerContext.Provider>;
}

export function useTimers() {
  return useContext(TimerContext);
}

function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

// Buttons for the times found in a step, e.g. "⏱ 8 min".
export function TimerButtons({ timers, stepNumber, recipeName }) {
  const styles = useStyles(makeStyles);
  const ctx = useTimers();
  if (!ctx || !timers.length) return null;
  return (
    <View style={styles.buttons}>
      {timers.map((t) => (
        <Pressable
          key={t.seconds}
          onPress={() => ctx.start(`${recipeName} — step ${stepNumber} (${t.label})`, t.seconds)}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
          hitSlop={4}
        >
          <Text style={styles.btnText}>⏱ {t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Running timers, shown at the bottom of the screen.
export function TimerBar() {
  const styles = useStyles(makeStyles);
  const ctx = useTimers();
  if (!ctx || !ctx.timers.length) return null;
  const now = Date.now();
  return (
    <View style={styles.bar}>
      {ctx.timers.map((t) => {
        const left = t.endsAt - now;
        return (
          <View key={t.id} style={[styles.chip, left <= 0 && styles.chipDone]}>
            <Text style={styles.chipTime}>{left > 0 ? fmt(left) : 'Done!'}</Text>
            <Text style={styles.chipLabel} numberOfLines={1}>
              {t.label.replace(/^.* — /, '')}
            </Text>
            <Pressable onPress={() => ctx.extend(t.id, 60)} hitSlop={8}>
              <Text style={styles.chipAct}>+1</Text>
            </Pressable>
            <Pressable onPress={() => ctx.remove(t.id)} hitSlop={8}>
              <Text style={styles.chipAct}>✕</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c) => ({
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { backgroundColor: c.primarySoft, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  btnText: { color: c.primary, fontWeight: '700', fontSize: 13 },
  bar: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.primarySoft, borderRadius: radius.sm,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  chipDone: { backgroundColor: c.accentSoft },
  chipTime: { fontSize: 18, fontWeight: '800', color: c.text, fontVariant: ['tabular-nums'], minWidth: 64 },
  chipLabel: { flex: 1, fontSize: 13, color: c.muted },
  chipAct: { fontSize: 15, fontWeight: '800', color: c.primary, paddingHorizontal: 4 },
});
