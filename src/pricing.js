import { catalogItem, keyOf } from './data/ingredients';
import { packOf, packPrice, packsFor } from './packages';
import { effectiveRecipe, getRecipe } from './data/recipes';

// How much of an ingredient you have in your Kitchen, in the recipe's unit.
export function haveQty(inventory, name, unit) {
  const item = inventory[keyOf(name)];
  if (!item || item.qty <= 0) return 0;
  return item.unit === unit ? item.qty : 0;
}

// For online/imported recipes without exact amounts: do you have
// something by that name? "Garlic" in your kitchen matches "Minced garlic".
export function findInventoryItem(inventory, name) {
  const key = keyOf(name);
  if (inventory[key]?.qty > 0) return inventory[key];
  for (const item of Object.values(inventory)) {
    if (item.qty <= 0) continue;
    const k = keyOf(item.name);
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${esc}s?\\b`).test(key)) return item;
  }
  return null;
}

// 'full' = you have enough, 'partial' = some, 'none' = need to buy.
export function stockStatus(have, need) {
  if (have <= 0) return 'none';
  return have + 1e-9 >= need ? 'full' : 'partial';
}

// Full cost picture for one recipe at the chosen portion size. Prices
// are for whole packages (a jar of paprika, not 1 tsp of it); anything
// already in your Kitchen is taken off, and leftovers stay there.
export function recipeCosts(recipe, portions, inventory = {}) {
  const factor = portions / recipe.servings;
  const items = recipe.ingredients.map((ing) => {
    if (ing.qty == null) {
      // Online recipe: no exact amount, so no price; just check stock.
      const found = findInventoryItem(inventory, ing.name);
      return {
        name: ing.name,
        unit: ing.unit,
        measure: ing.measure,
        need: null,
        have: found ? found.qty : 0,
        cost: 0,
        savings: 0,
        category: catalogItem(ing.name)?.category ?? 'other',
        status: found ? 'full' : 'none',
        unpriced: true,
      };
    }
    const info = catalogItem(ing.name);
    const need = ing.qty * factor;
    const have = haveQty(inventory, ing.name, ing.unit);
    const pack = packOf(ing.name);
    const price = packPrice(ing.name);
    // Full price: the whole packages you'd buy with an empty kitchen.
    const fullPacks = packsFor(ing.name, need);
    // What you'd actually buy, after using what's in your Kitchen.
    const buyPacks = packsFor(ing.name, Math.max(0, need - have));
    const cost = fullPacks * price;
    const buyCost = buyPacks * price;
    return {
      name: ing.name,
      unit: ing.unit,
      need,
      have,
      pack,
      fullPacks,
      buyPacks,
      cost,
      buyCost,
      savings: cost - buyCost,
      usedValue: need * (info?.price ?? 0),
      leftover: Math.max(0, have + buyPacks * pack - need),
      category: info?.category ?? 'other',
      status: stockStatus(have, need),
    };
  });

  const total = items.reduce((s, i) => s + i.cost, 0);
  const savings = items.reduce((s, i) => s + i.savings, 0);
  const usedValue = items.reduce((s, i) => s + (i.usedValue || 0), 0);
  const byCategory = {};
  for (const i of items) byCategory[i.category] = (byCategory[i.category] || 0) + i.cost;

  return {
    items,
    // Price of every package you'd need with an empty kitchen.
    total,
    // Packages you already have (fully or partly) that you won't buy again.
    savings,
    youPay: Math.max(0, total - savings),
    // Approximate value of what this meal actually uses up.
    usedValue,
    perServing: usedValue / portions,
    byCategory,
    inStockCount: items.filter((i) => i.status === 'full').length,
    priced: items.length > 0 && items.every((i) => !i.unpriced),
  };
}

// What your Kitchen will hold after you shop for and cook the meals
// already on your week: whole packages bought, recipe amounts used, the
// rest left over. Used to price "pairs with your week" suggestions.
export function weekLeftovers(inventory, plannedIds, portions, settings) {
  const inv = { ...inventory };
  for (const id of plannedIds) {
    const recipe = effectiveRecipe(getRecipe(id), settings);
    if (!recipe) continue;
    const factor = portions / recipe.servings;
    for (const ing of recipe.ingredients) {
      if (ing.qty == null) continue;
      const key = keyOf(ing.name);
      const cur = inv[key] && inv[key].unit === ing.unit ? inv[key].qty : 0;
      const need = ing.qty * factor;
      const bought = packsFor(ing.name, Math.max(0, need - cur)) * packOf(ing.name);
      const left = Math.max(0, cur + bought - need);
      const info = catalogItem(ing.name);
      inv[key] = { name: info?.name ?? ing.name, unit: ing.unit, qty: left, category: info?.category ?? 'other' };
    }
  }
  return inv;
}

export function money(n) {
  return `$${n.toFixed(2)}`;
}
