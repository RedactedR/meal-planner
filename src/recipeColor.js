import { CAT } from './theme';
import { isKeto, isSnack, isVegetarian } from './data/recipes';

const SEAFOOD = /\b(shrimp|salmon|tuna|cod|tilapia|halibut|scallops?|crab|clams?|mussels?|lobster|fish fillets?|white fish|mahi|trout|sardines?|prawns?)\b/i;

// The one color a recipe shows everywhere, picked in this order:
// snack (purple), keto (blue), seafood (cyan), vegetarian (green),
// high protein (orange), everything else (red).
export function recipeCategory(recipe) {
  if (!recipe) return { key: 'classic', color: CAT.classic, label: 'Classic' };
  if (isSnack(recipe)) return { key: 'snack', color: CAT.snack, label: 'Snack' };
  if (isKeto(recipe)) return { key: 'keto', color: CAT.keto, label: 'Keto' };
  if ((recipe.ingredients || []).some((i) => SEAFOOD.test(i.name))) return { key: 'seafood', color: CAT.seafood, label: 'Seafood' };
  if (isVegetarian(recipe)) return { key: 'veg', color: CAT.veg, label: 'Veggie' };
  if ((recipe.nutrition?.protein || 0) >= 35) return { key: 'protein', color: CAT.protein, label: 'Protein' };
  return { key: 'classic', color: CAT.classic, label: recipe.cuisine || 'Classic' };
}
