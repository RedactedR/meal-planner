import { Pressable, Text, View } from 'react-native';
import { radius, useStyles } from '../theme';
import { useAppState } from '../AppState';
import { isBalanced } from '../data/recipes';
import Stars from './Stars';

export default function RecipeCard({ recipe, onPress, right }) {
  const styles = useStyles(makeStyles);
  const { ratings } = useAppState();
  const rating = ratings[recipe.id] || 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{recipe.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.meta}>
          {recipe.cuisine} · {recipe.minutes} min
        </Text>
        <View style={styles.badges}>
          {rating > 0 ? <Stars value={rating} size={12} /> : <Text style={styles.unrated}>Not rated</Text>}
          {isBalanced(recipe) && (
            <View style={styles.balanced}>
              <Text style={styles.balancedText}>Balanced</Text>
            </View>
          )}
        </View>
      </View>
      {right}
    </Pressable>
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
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 16, fontWeight: '600', color: c.text },
  meta: { fontSize: 13, color: c.muted, marginTop: 2 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  unrated: { fontSize: 12, color: c.muted },
  balanced: { backgroundColor: c.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  balancedText: { fontSize: 11, fontWeight: '700', color: c.primary },
});
