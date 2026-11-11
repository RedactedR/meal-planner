import { buildGroceryList } from './grocery';
import { recipeCategory } from './recipeColor';
import { snackExtras } from './snackPlan';
import { isStaple } from './data/ingredients';

// What the week costs at the store: every package on the grocery list,
// planned meals plus the snack list, minus what's already in your Kitchen.
export function weekSpend(recipeIds, settings, inventory, snackList) {
  const snacks = snackExtras(snackList || {});
  const items = buildGroceryList(recipeIds, settings.portions, inventory, settings, {
    recipes: snacks.recipes,
    items: snacks.items,
  });
  return items.filter((i) => i.qty > 0).reduce((s, i) => s + (i.price || 0), 0);
}

// Higher is better: protein keeps you full, and different kinds of meals
// keep the week from getting boring.
function score(recipes) {
  const protein = recipes.reduce((s, r) => s + (r.nutrition?.protein || 0), 0);
  const kinds = new Set(recipes.map((r) => recipeCategory(r).key)).size;
  const cuisines = new Set(recipes.map((r) => r.cuisine)).size;
  return protein + kinds * 8 + cuisines * 6;
}

// Picks one dinner per day that fits the weekly budget.
// 1. Start from the cheapest week (each pick is the meal that adds the
//    least to the bill, so meals that share ingredients get grouped).
// 2. While money is left, swap in better meals (more protein, more
//    variety) as long as the whole week still fits.
// Returns { ids, total, over } — over is true when even the cheapest
// week costs more than the budget.
export function planWithinBudget({ candidates, dayCount, budget, settings, inventory, snackList }) {
  const pool = candidates.filter((r) => !r.breakfast);
  const cost = (ids) => weekSpend(ids, settings, inventory, snackList);

  const ids = [];
  while (ids.length < Math.min(dayCount, pool.length)) {
    let best = null;
    for (const r of pool) {
      if (ids.includes(r.id)) continue;
      const c = cost([...ids, r.id]);
      if (!best || c < best.c) best = { id: r.id, c };
    }
    ids.push(best.id);
  }
  let total = cost(ids);
  if (total > budget) return { ids, total, over: true };

  const byId = new Map(pool.map((r) => [r.id, r]));
  for (let pass = 0; pass < 3; pass++) {
    let improved = false;
    for (let slot = 0; slot < ids.length; slot++) {
      const current = score(ids.map((id) => byId.get(id)));
      let best = null;
      for (const r of pool) {
        if (ids.includes(r.id)) continue;
        const next = ids.map((id, i) => (i === slot ? r.id : id));
        const s = score(next.map((id) => byId.get(id)));
        if (s <= current || (best && s <= best.s)) continue;
        const c = cost(next);
        if (c <= budget) best = { next, s, c };
      }
      if (best) {
        ids.splice(0, ids.length, ...best.next);
        total = best.c;
        improved = true;
      }
    }
    if (!improved) break;
  }
  return { ids, total, over: false };
}

// Pantry basics (oil, salt, spices…) on a grocery list: they cost a lot
// the first time but last for months, so the budget card calls them out.
export function staplesSpend(recipeIds, settings, inventory, snackList) {
  const snacks = snackExtras(snackList || {});
  const items = buildGroceryList(recipeIds, settings.portions, inventory, settings, {
    recipes: snacks.recipes,
    items: snacks.items,
  });
  return items.filter((i) => i.qty > 0 && isStaple(i.name)).reduce((s, i) => s + (i.price || 0), 0);
}

// One meal swap that brings an over-budget week back under (or as close
// as possible): the swap that saves the most. Returns null if none saves.
export function bestSwap({ plannedIds, candidates, settings, inventory, snackList }) {
  const now = weekSpend(plannedIds, settings, inventory, snackList);
  let best = null;
  plannedIds.forEach((id, slot) => {
    for (const r of candidates) {
      if (r.breakfast || plannedIds.includes(r.id)) continue;
      const next = plannedIds.map((x, i) => (i === slot ? r.id : x));
      const c = weekSpend(next, settings, inventory, snackList);
      if (now - c > 0.5 && (!best || c < best.total)) best = { from: id, to: r.id, total: c, saves: now - c };
    }
  });
  return best;
}
