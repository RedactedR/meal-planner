import { getRecipe } from './data/recipes';
import { catalogItem } from './data/ingredients';
import { haveQty, stockStatus } from './pricing';

// Things you can only buy whole: you can't buy half a can or half an onion.
const WHOLE_UNITS = new Set(['', 'can', 'jar', 'bottle', 'packet', 'bag', 'tub', 'bunch', 'loaf', 'head', 'piece', 'slices']);

export function scaleFactor(recipe, portions) {
  return portions / recipe.servings;
}

function roundToQuarter(n) {
  return Math.max(0.25, Math.round(n * 4) / 4);
}

// Amount to use when cooking, scaled to the chosen number of people.
export function cookingQty(ing, recipe, portions) {
  const q = ing.qty * scaleFactor(recipe, portions);
  if (ing.unit === 'cloves' || ing.unit === 'slices' || ing.unit === '') {
    return ing.unit === '' ? roundToQuarter(q) : Math.max(1, Math.round(q));
  }
  return roundToQuarter(q);
}

// Amount to buy at the store.
function shoppingQty(qty, unit) {
  if (WHOLE_UNITS.has(unit) || unit === 'cloves' || unit === 'oz') return Math.max(1, Math.ceil(qty - 0.01));
  return roundToQuarter(qty);
}

// How much ends up in your kitchen when you buy it: whole packages.
// e.g. needing 3 cloves of garlic means you bring home a 10-clove head.
export function boughtQty(item) {
  const pack = catalogItem(item.name)?.pack || 1;
  return Math.max(item.qty, Math.ceil(item.qty / pack - 0.01) * pack);
}

// Combines the ingredients of several recipes into one shopping list,
// adding up repeats and subtracting what's already in your Kitchen.
export function buildGroceryList(recipeIds, portions, inventory = {}) {
  const byKey = new Map();

  for (const id of recipeIds) {
    const recipe = getRecipe(id);
    if (!recipe) continue;
    const factor = scaleFactor(recipe, portions);
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${ing.unit}`;
      const existing = byKey.get(key);
      const qty = ing.qty * factor;
      if (existing) {
        existing.need += qty;
        if (!existing.recipes.includes(recipe.name)) existing.recipes.push(recipe.name);
      } else {
        byKey.set(key, { key, name: ing.name, unit: ing.unit, need: qty, recipes: [recipe.name] });
      }
    }
  }

  return Array.from(byKey.values())
    .map((item) => {
      const info = catalogItem(item.name);
      const have = haveQty(inventory, item.name, item.unit);
      const toBuy = Math.max(0, item.need - have);
      const qty = toBuy > 0.001 ? shoppingQty(toBuy, item.unit) : 0;
      return {
        ...item,
        have,
        qty,
        status: stockStatus(have, item.need),
        category: info?.category ?? 'other',
        price: qty * (info?.price ?? 0),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
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
