import { catalogItem, keyOf } from './data/ingredients';

// Everything about store packages: you can't buy 1 tsp of paprika, you
// buy a jar. Recipes are priced by the packages you'd actually buy, and
// whatever is left over stays in your Kitchen.

// What one package is called, for "≈ ¾ jar" style amounts.
const WORDS_BY_NAME = {
  'garlic': 'head',
  'eggs': 'carton',
  'butter': 'box',
  'heavy cream': 'carton',
  'plain yogurt': 'tub',
  'chicken broth': 'carton',
  'kosher salt': 'box',
  'baking soda': 'box',
  'cornstarch': 'box',
  'olive oil': 'bottle',
  'vegetable oil': 'bottle',
  'sesame oil': 'bottle',
  'soy sauce': 'bottle',
  'fish sauce': 'bottle',
  'oyster sauce': 'bottle',
  'rice vinegar': 'bottle',
  'mirin': 'bottle',
  'dry white wine': 'bottle',
  'tamarind concentrate': 'jar',
  'dijon mustard': 'jar',
  'mayonnaise': 'jar',
  'ketchup': 'bottle',
  'light brown sugar': 'bag',
  'breadcrumbs': 'can',
  'peanuts': 'jar',
  'parmesan': 'wedge',
  'fresh mozzarella': 'ball',
  'baby spinach': 'bag',
  'bean sprouts': 'bag',
  'corn tortillas': 'pack',
  'burger buns': 'pack',
  'naan or flatbread': 'pack',
  'frozen corn': 'bag',
  'frozen peas and carrots': 'bag',
};

const WORDS_BY_CATEGORY = {
  spices: 'jar',
  protein: 'pack',
  dairy: 'pack',
  pantry: 'bag',
  produce: 'bag',
  bakery: 'pack',
  frozen: 'bag',
  snacks: 'pack',
  other: 'package',
};

export function packOf(name) {
  return catalogItem(name)?.pack || 1;
}

// Price of one whole package.
export function packPrice(name) {
  const info = catalogItem(name);
  return info ? info.price * (info.pack || 1) : 0;
}

export function packageWord(name) {
  const info = catalogItem(name);
  const key = keyOf(name);
  if (WORDS_BY_NAME[key]) return WORDS_BY_NAME[key];
  if (['can', 'jar', 'bottle', 'bag', 'tub', 'packet', 'bunch', 'head', 'loaf', 'pint', 'block'].includes(info?.unit)) return info.unit;
  if (key === 'pesto') return 'jar';
  if (/vinegar|sauce|oil|dressing|syrup|wine/.test(key) && info?.unit !== 'can') return 'bottle';
  return WORDS_BY_CATEGORY[info?.category] || 'package';
}

// How many packages cover an amount.
export function packsFor(name, qty) {
  if (!(qty > 0.0001)) return 0;
  return Math.max(1, Math.ceil(qty / packOf(name) - 1e-6));
}

function plural(word, n) {
  if (n === 1) return word;
  if (word === 'loaf') return 'loaves';
  if (word === 'lb' || word === 'oz') return word;
  if (/(ch|sh|x|s)$/.test(word)) return `${word}es`;
  return `${word}s`;
}

const QUARTERS = { 0: '', 1: '¼', 2: '½', 3: '¾' };

// "≈ ¾ jar", "≈ 1½ boxes", "a little left". Returns null for things
// counted one at a time (onions, cans), where the count says it all.
export function approxAmount(name, qty) {
  const pack = packOf(name);
  if (pack <= 1 || !(qty > 0)) return null;
  const word = packageWord(name);
  const ratio = qty / pack;
  if (ratio < 0.125) return `a little left`;
  if (ratio > 0.999 && ratio < 1.001) return `1 full ${word}`;
  if (ratio >= 0.875 && ratio < 1) return `almost a full ${word}`;
  const quarters = Math.round(ratio * 4);
  const whole = Math.floor(quarters / 4);
  const rest = QUARTERS[quarters % 4];
  if (whole === 0) return `≈ ${rest} ${word}`;
  const n = `${whole}${rest}`;
  return `≈ ${n} ${plural(word, whole + (rest ? 1 : 0))}`;
}

// "1 jar", "2 cans", "4". For the shopping list.
export function packLabel(name, unit, packs) {
  const pack = packOf(name);
  if (pack <= 1) {
    if (!unit) return String(packs);
    return `${packs} ${plural(unit, packs)}`;
  }
  return `${packs} ${plural(packageWord(name), packs)}`;
}
