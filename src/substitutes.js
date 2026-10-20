import { keyOf } from './data/ingredients';
import { detectAllergens } from './data/recipes';

// Ingredients that can stand in for each other in a recipe. If a recipe
// calls for jasmine rice and you have basmati, the app uses yours
// instead of putting jasmine rice on your grocery list.
// Only swaps that cook the same way and in the same amount are listed.

// Any of these works for any other.
const GROUPS = [
  ['Olive oil', 'Vegetable oil'],
  ['Jasmine rice', 'Basmati rice', 'Long grain rice'],
  ['Yellow onion', 'Red onion'],
  ['Spaghetti', 'Linguine', 'Fettuccine'],
  ['Penne', 'Rigatoni'],
  ['Black beans', 'Pinto beans', 'Kidney beans'],
  ['Crushed tomatoes', 'Diced tomatoes'],
  ['Shredded cheddar', 'Monterey Jack'],
  ['Shredded mozzarella', 'Fresh mozzarella'],
  ['Parmesan', 'Pecorino Romano'],
  ['Provolone', 'Swiss cheese'],
  ['Feta cheese', 'Queso fresco'],
  ['Breadcrumbs', 'Panko'],
  ['Rice noodles', 'Wide rice noodles'],
  ['Plain yogurt', 'Sour cream'],
  ['Honey', 'Maple syrup'],
  ['Red wine vinegar', 'Sherry vinegar'],
  ['Chicken thighs', 'Chicken breasts'],
  ['Ground beef', 'Ground turkey'],
  ['Naan or flatbread', 'Pita bread'],
  ['Hoagie rolls', 'Ciabatta rolls'],
];

// One direction only: the recipe ingredient (left) can be replaced by
// these, but not the other way round (e.g. vegetable broth works in a
// chicken recipe, but chicken broth would break a vegetarian one).
const ONE_WAY = {
  'Chicken broth': ['Vegetable broth'],
  'Rotel tomatoes': ['Diced tomatoes'],
  'Paprika': ['Smoked paprika'],
  'Light brown sugar': ['Granulated sugar'],
  'Rice vinegar': ['Apple cider vinegar'],
  'Dijon mustard': ['Yellow mustard'],
  'Seafood stock': ['Bottled clam juice'],
};

const SUBS = new Map();
function add(from, to) {
  const k = keyOf(from);
  const list = SUBS.get(k) || [];
  if (!list.includes(to)) list.push(to);
  SUBS.set(k, list);
}
for (const group of GROUPS) for (const a of group) for (const b of group) if (a !== b) add(a, b);
for (const [from, tos] of Object.entries(ONE_WAY)) for (const to of tos) add(from, to);

// For checking the list in scripts.
export const SUBSTITUTE_NAMES = Array.from(new Set([...GROUPS.flat(), ...Object.keys(ONE_WAY), ...Object.values(ONE_WAY).flat()]));

// Never swap in something the user has said to avoid or is allergic to.
function blocked(name, settings) {
  if (!settings) return false;
  const lower = name.toLowerCase();
  if ((settings.avoid || []).some((w) => w.trim() && lower.includes(w.trim().toLowerCase()))) return true;
  const allergens = settings.allergens || [];
  return allergens.length > 0 && detectAllergens({ ingredients: [{ name }] }).some((a) => allergens.includes(a));
}

export function substitutesFor(name, settings) {
  if (settings && settings.swaps === false) return [];
  return (SUBS.get(keyOf(name)) || []).filter((s) => !blocked(s, settings));
}

// How much of an ingredient you can cook with from your Kitchen, in the
// recipe's unit. Uses the exact item when you have enough of it;
// otherwise a stand-in you have enough of (or, failing that, whichever
// covers the most). Returns { have, using } where `using` is the
// stand-in's name, or null for the real thing.
export function stockFor(inventory, name, unit, need, settings) {
  const qtyOf = (n) => {
    const item = inventory[keyOf(n)];
    return item && item.unit === unit && item.qty > 0 ? item.qty : 0;
  };
  const exact = qtyOf(name);
  let best = { have: exact, using: null };
  if (need != null && exact + 1e-9 >= need) return best;
  for (const sub of substitutesFor(name, settings)) {
    const have = qtyOf(sub);
    if (have <= 0) continue;
    if (need != null && have + 1e-9 >= need) return { have, using: inventory[keyOf(sub)].name || sub };
    if (have > best.have) best = { have, using: inventory[keyOf(sub)].name || sub };
  }
  return best;
}

// For online recipes (no exact amounts): any stand-in in your Kitchen?
export function findSubstitute(inventory, name, settings) {
  for (const sub of substitutesFor(name, settings)) {
    const item = inventory[keyOf(sub)];
    if (item && item.qty > 0) return item;
  }
  return null;
}
