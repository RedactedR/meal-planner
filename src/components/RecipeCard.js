import { Image, Pressable, Text, View } from 'react-native';
import { radius, useStyles } from '../theme';
import { useAppState } from '../AppState';
import { DIFFICULTY, effectiveRecipe, isBalanced } from '../data/recipes';
import { money, recipeCosts } from '../pricing';
import Stars from './Stars';
import { Pill } from './Badges';

// One recipe in a list: name, rating, price (with your kitchen discount),
// how many ingredients you already have, and badges.
export default function RecipeCard({ recipe, onPress, right, note, inventoryOverride, savingsLabel }) {
  const styles = useStyles(makeStyles);
  const { ratings, settings, inventory } = useAppState();
  const rating = ratings[recipe.id] || 0;
  const portions = recipe.course === 'snack' ? recipe.servings : settings.portions;
  const cost = recipeCosts(effectiveRecipe(recipe, settings), portions, inventoryOverride || inventory, settings);
  const discounted = cost.savings >= 0.01;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.thumb} />
      ) : (
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{recipe.emoji}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.meta}>
          {[
            recipe.cuisine,
            recipe.minutes ? `${recipe.minutes} min` : null,
            recipe.nutrition ? `${recipe.nutrition.protein}g protein` : null,
            `${cost.inStockCount}/${cost.items.length} in stock`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <View style={styles.priceRow}>
          {!cost.priced ? (
            <Text style={styles.source}>
              {recipe.source === 'mealdb' ? '🌐 TheMealDB' : `🔗 ${recipe.sourceName || 'Imported'}`}
              {recipe.videoId ? ' · ▶ video' : ''}
            </Text>
          ) : discounted ? (
            <>
              <Text style={styles.oldPrice}>{money(cost.total)}</Text>
              <Text style={styles.price}>{money(cost.youPay)}</Text>
              <Text style={styles.save}>
                save {money(cost.savings)}
                {savingsLabel ? ` ${savingsLabel}` : ''}
              </Text>
            </>
          ) : (
            <Text style={styles.price}>{money(cost.total)}</Text>
          )}
        </View>
        <View style={styles.badges}>
          {rating > 0 ? <Stars value={rating} size={12} /> : <Text style={styles.unrated}>Not rated</Text>}
          {recipe.difficulty && DIFFICULTY[recipe.difficulty] && (
            <Pill label={DIFFICULTY[recipe.difficulty].label} tone={DIFFICULTY[recipe.difficulty].tone} />
          )}
          {recipe.onePan && <Pill label="🍳 One pan" tone="accent" />}
          {isBalanced(recipe) && <Pill label="Balanced" />}
        </View>
        {note ? <Text style={styles.note}>{note}</Text> : null}
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
    alignSelf: 'flex-start',
  },
  emoji: { fontSize: 28 },
  thumb: { width: 52, height: 52, borderRadius: radius.sm, alignSelf: 'flex-start' },
  source: { fontSize: 13, color: c.muted, fontWeight: '600' },
  name: { fontSize: 16, fontWeight: '600', color: c.text },
  meta: { fontSize: 13, color: c.muted, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  price: { fontSize: 15, fontWeight: '700', color: c.text },
  oldPrice: { fontSize: 13, color: c.muted, textDecorationLine: 'line-through' },
  save: { fontSize: 12, fontWeight: '700', color: c.primary },
  badges: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  unrated: { fontSize: 12, color: c.muted },
  note: { fontSize: 12, color: c.primary, marginTop: 6, fontWeight: '600' },
});
