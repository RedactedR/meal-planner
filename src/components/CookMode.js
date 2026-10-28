import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { stepText } from '../data/recipes';
import { stepTimers, stepsWithIngredients } from '../cooking';
import { TimerBar, TimerButtons } from './Timers';
import VideoPlayer, { openVideo } from './VideoPlayer';
import { youtubeSearchUrl } from '../online';
import { radius, useStyles, useTheme } from '../theme';

// Keeps the screen on while cooking, if the module is available.
let KeepAwake = null;
try {
  // eslint-disable-next-line global-require
  KeepAwake = require('expo-keep-awake');
} catch {
  KeepAwake = null;
}

// Full-screen, one step at a time: a prep checklist first, then each
// step in big type with what it uses, timers and the pro tip.
export default function CookMode({ visible, recipe, amountOf, showTips, onClose, onFinish }) {
  const styles = useStyles(makeStyles);
  const c = useTheme();
  const [page, setPage] = useState(0);
  const [checked, setChecked] = useState(new Set());
  const [video, setVideo] = useState(null);
  const steps = recipe.steps;
  const uses = useMemo(() => stepsWithIngredients(recipe), [recipe]);
  const total = steps.length + 1;

  useEffect(() => {
    if (!visible) return undefined;
    setPage(0);
    try {
      KeepAwake?.activateKeepAwakeAsync?.('cook-mode');
    } catch {
      // ignore
    }
    return () => {
      try {
        KeepAwake?.deactivateKeepAwake?.('cook-mode');
      } catch {
        // ignore
      }
    };
  }, [visible]);

  function toggle(i) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const step = page > 0 ? (typeof steps[page - 1] === 'string' ? { text: steps[page - 1] } : steps[page - 1]) : null;
  const stepUses = page > 0 ? uses[page - 1] : [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.link}>✕ Close</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {recipe.emoji} {recipe.name}
          </Text>
          <Text style={styles.count}>
            {page === 0 ? 'Prep' : `${page}/${steps.length}`}
          </Text>
        </View>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${(page / (total - 1)) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {page === 0 ? (
            <>
              <Text style={styles.bigTitle}>Before you start</Text>
              <Text style={styles.hint}>
                Get everything out and measured. Tap each one as you set it on the counter — cooking is much calmer when
                nothing has to be found mid-step.
              </Text>
              {recipe.ingredients.map((ing, i) => {
                const on = checked.has(i);
                return (
                  <Pressable key={`${ing.name}-${i}`} onPress={() => toggle(i)} style={[styles.checkRow, on && styles.checkRowOn]}>
                    <View style={[styles.box, on && styles.boxOn]}>{on && <Text style={styles.tick}>✓</Text>}</View>
                    <Text style={[styles.checkAmt, on && styles.dim]}>{amountOf(ing)}</Text>
                    <Text style={[styles.checkName, on && styles.dim]}>{ing.name}</Text>
                  </Pressable>
                );
              })}
              <Text style={[styles.hint, { marginTop: 14 }]}>
                {checked.size}/{recipe.ingredients.length} ready. Read step 1 all the way through before you turn on the
                heat.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.stepLabel}>Step {page}</Text>
              {step.part && <Text style={styles.part}>{step.part}</Text>}
              <Text style={styles.stepText}>{stepText(step)}</Text>

              {stepUses.length > 0 && (
                <View style={styles.usesBox}>
                  <Text style={styles.usesTitle}>In this step</Text>
                  {stepUses.map(({ ing, shared }) => (
                    <Text key={ing.name} style={styles.usesRow}>
                      <Text style={styles.usesAmt}>{amountOf(ing)}</Text> {ing.name}
                      {shared ? <Text style={styles.usesNote}> (total — the step says how much)</Text> : null}
                    </Text>
                  ))}
                </View>
              )}

              <TimerButtons timers={stepTimers(step)} stepNumber={page} recipeName={recipe.name} />

              {showTips && step.tip && (
                <View style={styles.tip}>
                  <Text style={styles.tipLabel}>💡 PRO TIP</Text>
                  <Text style={styles.tipText}>{step.tip}</Text>
                </View>
              )}
              {step.watch && (
                <Pressable onPress={() => openVideo(youtubeSearchUrl(step.watch), (u) => setVideo({ url: u, title: step.watch }))} style={styles.watch}>
                  <Text style={styles.watchText}>▶ Watch how</Text>
                </Pressable>
              )}
            </>
          )}
        </ScrollView>

        <TimerBar />
        <View style={styles.footer}>
          <Pressable
            onPress={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={[styles.navBtn, page === 0 && { opacity: 0.3 }]}
          >
            <Text style={styles.navText}>‹ Back</Text>
          </Pressable>
          {page < total - 1 ? (
            <Pressable onPress={() => setPage((p) => p + 1)} style={[styles.navBtn, styles.nextBtn]}>
              <Text style={[styles.navText, { color: c.onPrimary }]}>{page === 0 ? 'Start cooking ›' : 'Next step ›'}</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                onClose();
                onFinish();
              }}
              style={[styles.navBtn, styles.nextBtn]}
            >
              <Text style={[styles.navText, { color: c.onPrimary }]}>Done 🎉</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
      <VideoPlayer url={video?.url} title={video?.title} onClose={() => setVideo(null)} />
    </Modal>
  );
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: c.text, textAlign: 'center' },
  count: { fontSize: 14, fontWeight: '700', color: c.muted, minWidth: 44, textAlign: 'right' },
  link: { color: c.primary, fontWeight: '700', fontSize: 15 },
  progress: { height: 4, backgroundColor: c.border, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: c.primary },
  body: { padding: 22, paddingBottom: 40, gap: 16 },
  bigTitle: { fontSize: 26, fontWeight: '800', color: c.text },
  hint: { fontSize: 15, color: c.muted, lineHeight: 22 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12,
    backgroundColor: c.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: c.border,
  },
  checkRowOn: { backgroundColor: c.primarySoft, borderColor: c.primarySoft },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: c.muted, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: c.primary, borderColor: c.primary },
  tick: { color: c.onPrimary, fontWeight: '800' },
  checkAmt: { fontSize: 16, fontWeight: '800', color: c.text, minWidth: 74 },
  checkName: { fontSize: 16, color: c.text, flex: 1 },
  dim: { opacity: 0.5 },
  stepLabel: { fontSize: 14, fontWeight: '800', color: c.primary, letterSpacing: 1, textTransform: 'uppercase' },
  part: { fontSize: 15, fontWeight: '700', color: c.accent },
  stepText: { fontSize: 22, lineHeight: 33, color: c.text },
  usesBox: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: 14, gap: 6 },
  usesTitle: { fontSize: 12, fontWeight: '800', color: c.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  usesRow: { fontSize: 16, color: c.text, lineHeight: 23 },
  usesAmt: { fontWeight: '800' },
  usesNote: { fontSize: 13, color: c.muted },
  tip: { backgroundColor: c.warnSoft, borderRadius: radius.sm, padding: 12, borderLeftWidth: 3, borderLeftColor: c.warn },
  tipLabel: { fontSize: 11, fontWeight: '800', color: c.warn, letterSpacing: 0.6 },
  tipText: { fontSize: 16, color: c.text, lineHeight: 23, marginTop: 4 },
  watch: { alignSelf: 'flex-start', backgroundColor: c.dangerSoft, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  watchText: { color: c.danger, fontWeight: '700' },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: c.border },
  navBtn: { flex: 1, paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', backgroundColor: c.border },
  nextBtn: { flex: 2, backgroundColor: c.primary },
  navText: { fontSize: 17, fontWeight: '800', color: c.text },
});
