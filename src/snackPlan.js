import { getRecipe } from './data/recipes';
import { getStoreSnack } from './data/snacks';
import { catalogItem } from './data/ingredients';
import { packOf, packPrice } from './packages';

// Turns the saved snack list into grocery-list extras and display rows.
// Store snacks are counted in packages, snack recipes in batches.
export function snackExtras(snackList = {}) {
  const recipes = [];
  const items = [];
  const rows = [];
  for (const [id, count] of Object.entries(snackList)) {
    const store = getStoreSnack(id);
    if (store) {
      items.push({ id, name: store.item, qty: count * packOf(store.item), label: `${store.name} (snack)` });
      rows.push({ id, name: store.name, emoji: store.emoji, count, kind: 'store', sub: packDescription(store, count) });
      continue;
    }
    const recipe = getRecipe(id);
    if (recipe) {
      recipes.push({ id, count });
      rows.push({
        id,
        name: recipe.name,
        emoji: recipe.emoji,
        count,
        kind: 'recipe',
        sub: `${count} ${count === 1 ? 'batch' : 'batches'} · ${count * recipe.servings} snacks`,
      });
    }
  }
  return { recipes, items, rows };
}

// "1 pack · 4 servings · $8.00"
export function packDescription(store, packs = 1) {
  const servings = Math.floor((packs * packOf(store.item)) / store.per + 1e-9);
  return `${packs} ${packs === 1 ? 'pack' : 'packs'} · ${servings} servings · $${(packs * packPrice(store.item)).toFixed(2)}`;
}

// Price of one serving of a store snack.
export function servingPrice(store) {
  const info = catalogItem(store.item);
  return info ? info.price * store.per : 0;
}
