import { catalogItem, keyOf } from './data/ingredients';

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

// Full cost picture for one recipe at the chosen portion size:
// what each ingredient costs, what you already have, and what's left to pay.
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
    const unitPrice = info?.price ?? 0;
    const cost = need * unitPrice;
    const have = haveQty(inventory, ing.name, ing.unit);
    const covered = Math.min(have, need);
    return {
      name: ing.name,
      unit: ing.unit,
      need,
      have,
      cost,
      savings: covered * unitPrice,
      category: info?.category ?? 'other',
      status: stockStatus(have, need),
    };
  });

  const total = items.reduce((s, i) => s + i.cost, 0);
  const savings = items.reduce((s, i) => s + i.savings, 0);
  const byCategory = {};
  for (const i of items) byCategory[i.category] = (byCategory[i.category] || 0) + i.cost;

  return {
    items,
    total,
    savings,
    youPay: Math.max(0, total - savings),
    perServing: total / portions,
    byCategory,
    inStockCount: items.filter((i) => i.status === 'full').length,
    priced: items.length > 0 && items.every((i) => !i.unpriced),
  };
}

export function money(n) {
  return `$${n.toFixed(2)}`;
}
