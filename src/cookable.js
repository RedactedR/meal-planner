import { effectiveRecipe } from './data/recipes';
import { keyOf } from './data/ingredients';
import { recipeCosts } from './pricing';
import { allowedRecipes } from './recipeFilters';

// Everyone has these; not having them logged shouldn't stop a recipe
// from counting as "ready to cook".
const ASSUMED = new Set(['kosher salt', 'salt', 'black pepper', 'water']);

// Which recipes your Kitchen can already make, and which are cheapest
// to finish with a short shopping trip.
export function cookFromKitchen(inventory, settings) {
  if (Object.values(inventory).every((i) => i.qty <= 0)) return { ready: [], cheapest: [] };

  const all = allowedRecipes(settings).map((recipe) => {
    const cost = recipeCosts(effectiveRecipe(recipe, settings), settings.portions, inventory, settings);
    const missing = cost.items.filter((i) => i.status !== 'full' && !ASSUMED.has(keyOf(i.name)));
    // Cost of just the missing items (salt and pepper don't count).
    const toBuy = missing.reduce((s, i) => s + (i.buyCost || 0), 0);
    return { recipe, cost, missing, toBuy };
  });

  const ready = all
    .filter((r) => r.missing.length === 0)
    .sort((a, b) => b.cost.items.length - a.cost.items.length || a.recipe.name.localeCompare(b.recipe.name));

  // Uses something you have, needs a little more. Cheapest first; on a
  // tie, the one that uses more of your Kitchen.
  const cheapest = all
    .filter((r) => r.missing.length > 0 && r.cost.priced && r.cost.savings > 0.005)
    .sort((a, b) => a.toBuy - b.toBuy || b.cost.savings - a.cost.savings)
    .slice(0, 8);

  return { ready, cheapest };
}

// "Need cilantro, limes + 2 more"
export function missingText(missing) {
  const names = missing.map((i) => i.name.toLowerCase());
  if (names.length <= 3) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} + ${names.length - 2} more`;
}
