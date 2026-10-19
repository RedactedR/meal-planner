import { getRecipe } from './data/recipes';
import { isStaple, keyOf } from './data/ingredients';

// Suggests recipes that reuse ingredients from meals already on your week,
// so the cilantro bunch or the bag of spinach gets used up.
export function pairingSuggestions(plannedIds, candidates) {
  const planned = plannedIds.map(getRecipe).filter(Boolean);
  if (planned.length === 0) return [];

  const weekIngredients = new Map(); // key -> display name
  for (const r of planned) {
    for (const ing of r.ingredients) {
      if (!isStaple(ing.name)) weekIngredients.set(keyOf(ing.name), ing.name);
    }
  }

  const plannedSet = new Set(plannedIds);
  return candidates
    .filter((r) => !plannedSet.has(r.id))
    .map((r) => {
      const shared = r.ingredients
        .filter((ing) => weekIngredients.has(keyOf(ing.name)))
        .map((ing) => ing.name);
      return { recipe: r, shared: Array.from(new Set(shared)) };
    })
    .filter((p) => p.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length || a.recipe.name.localeCompare(b.recipe.name));
}

export function sharedLabel(shared, max = 3) {
  const list = shared.slice(0, max).map((s) => s.toLowerCase());
  const more = shared.length - list.length;
  return `Uses your ${list.join(', ')}${more > 0 ? ` +${more} more` : ''}`;
}
