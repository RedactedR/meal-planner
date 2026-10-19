import { getRecipe } from './data/recipes';

// Combines the ingredients of several recipes into one shopping list,
// adding up anything that appears in more than one recipe.
export function buildGroceryList(recipeIds) {
  const byKey = new Map();

  for (const id of recipeIds) {
    const recipe = getRecipe(id);
    if (!recipe) continue;
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${ing.unit}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.qty += ing.qty;
        if (!existing.recipes.includes(recipe.name)) existing.recipes.push(recipe.name);
      } else {
        byKey.set(key, { key, name: ing.name, unit: ing.unit, qty: ing.qty, recipes: [recipe.name] });
      }
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}

const FRACTIONS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

export function formatQty(qty, unit) {
  const whole = Math.floor(qty);
  const rest = Math.round((qty - whole) * 100) / 100;
  let num;
  if (rest === 0) num = String(whole);
  else if (FRACTIONS[rest]) num = whole > 0 ? `${whole}${FRACTIONS[rest]}` : FRACTIONS[rest];
  else num = String(Math.round(qty * 100) / 100);
  return unit ? `${num} ${unit}` : num;
}
