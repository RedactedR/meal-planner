import { allRecipes, detectAllergens, effectiveRecipe, isBalanced } from './data/recipes';

// True when a recipe contains an allergen or a food the user said
// never to suggest.
export function isExcluded(baseRecipe, settings) {
  const recipe = effectiveRecipe(baseRecipe, settings);
  if (detectAllergens(recipe).some((a) => settings.allergens.includes(a))) return true;

  const words = settings.avoid.map((w) => w.trim().toLowerCase()).filter(Boolean);
  if (words.length === 0) return false;
  const haystack = [recipe.name, ...recipe.ingredients.map((i) => i.name)]
    .join(' | ')
    .toLowerCase();
  return words.some((w) => haystack.includes(w));
}

// Recipes the app is allowed to show or suggest, given the settings.
export function allowedRecipes(settings) {
  return allRecipes().filter(
    (r) => !isExcluded(r, settings) && (!settings.balancedOnly || isBalanced(r))
  );
}

export const SORTS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'quick', label: 'Quickest' },
  { key: 'name', label: 'A–Z' },
];

export function sortRecipes(list, ratings, sort = 'rating') {
  const copy = [...list];
  if (sort === 'quick') return copy.sort((a, b) => (a.minutes ?? 999) - (b.minutes ?? 999) || a.name.localeCompare(b.name));
  if (sort === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
  // Top rated: highest stars first, unrated recipes after, then A–Z.
  return copy.sort(
    (a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0) || a.name.localeCompare(b.name)
  );
}
