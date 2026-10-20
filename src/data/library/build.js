// Compact way to write library recipes.
//
// R(id, name, cuisine, emoji, minutes, servings, difficulty, onePan,
//   nutrition [calories, protein g, carbs g, fat g, fiber g, veg cups] per serving,
//   ingredients 'Name qty unit; Name qty unit; ...'  (unit optional),
//   steps [ 'text' | ['text', 'pro tip', 'video search'] ],
//   extra { allergens: [...], scratch: {...} } )
//
// Ingredient names and units must match src/data/ingredients.js; the
// test script checks this. Allergens are detected from ingredient names
// (see detectAllergens) plus anything listed in extra.allergens.

import { catalogItem } from '../ingredients';

// Recipes can use whichever spoon or weight reads naturally ("1 tsp
// chili powder") even when the store item is tracked in another unit
// (tbsp). Amounts are converted for pricing and the Kitchen, and the
// original wording is kept for display.
const VOLUME = { tsp: 1, tbsp: 3, cup: 48 };
const WEIGHT = { oz: 1, lb: 16 };

function normalize(ing) {
  const info = catalogItem(ing.name);
  if (!info || info.unit === ing.unit) return ing;
  const table = VOLUME[ing.unit] && VOLUME[info.unit] ? VOLUME : WEIGHT[ing.unit] && WEIGHT[info.unit] ? WEIGHT : null;
  if (!table) return ing;
  return {
    name: ing.name,
    qty: (ing.qty * table[ing.unit]) / table[info.unit],
    unit: info.unit,
    displayQty: ing.qty,
    displayUnit: ing.unit,
  };
}

function parseIngredients(text) {
  return text
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^(.*?)\s+([\d.]+)(?:\s+([a-z]+))?$/i);
      if (!m) throw new Error(`Bad ingredient: "${s}"`);
      return normalize({ name: m[1].trim(), qty: Number(m[2]), unit: m[3] || '' });
    });
}

function parseSteps(steps) {
  return steps.map((s) => {
    if (typeof s === 'string') return { text: s };
    const [text, tip, watch] = s;
    return { text, ...(tip ? { tip } : {}), ...(watch ? { watch } : {}) };
  });
}

export function R(id, name, cuisine, emoji, minutes, servings, difficulty, onePan, n, ingredients, steps, extra = {}) {
  const [calories, protein, carbs, fat, fiber, veg] = n;
  return {
    id,
    name,
    cuisine,
    emoji,
    minutes,
    servings,
    difficulty,
    onePan,
    allergens: extra.allergens || [],
    nutrition: { calories, protein, carbs, fat, fiber, veg },
    ingredients: parseIngredients(ingredients),
    steps: parseSteps(steps),
    ...(extra.scratch ? { scratch: extra.scratch } : {}),
  };
}
