import { catalogItem, keyOf } from './data/ingredients';

// How much of an ingredient you have in your Kitchen, in the recipe's unit.
export function haveQty(inventory, name, unit) {
  const item = inventory[keyOf(name)];
  if (!item || item.qty <= 0) return 0;
  return item.unit === unit ? item.qty : 0;
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
  };
}

export function money(n) {
  return `$${n.toFixed(2)}`;
}
