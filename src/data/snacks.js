// Snacks you can grab at King Soopers. Each one is a catalog item
// (src/data/ingredients.js) so it can go on your grocery list, into your
// Kitchen, and be logged on the Today tab.
//
//   item     – catalog name (what you buy)
//   per      – how much of that item one serving is, in the catalog unit
//   serving  – what one serving looks like
//   n        – [calories, protein g, carbs g, fat g, fiber g] per serving
//              (typical label values; brands vary)

const S = (id, name, emoji, item, per, serving, n) => {
  const [calories, protein, carbs, fat, fiber] = n;
  return { id: `snack-${id}`, name, emoji, item, per, serving, nutrition: { calories, protein, carbs, fat, fiber } };
};

export const STORE_SNACKS = [
  S('protein-shake', 'Protein shake', '🥤', 'Protein shakes', 1, '1 bottle (11 oz)', [160, 30, 5, 3, 1]),
  S('protein-bar', 'Protein bar', '🍫', 'Protein bars', 1, '1 bar', [200, 21, 22, 8, 13]),
  S('greek-yogurt', 'Greek yogurt cup', '🥣', 'Greek yogurt cups', 1, '1 cup (5.3 oz)', [90, 15, 7, 0, 0]),
  S('cottage-cheese', 'Cottage cheese cup', '🥛', 'Cottage cheese cups', 1, '1 cup (5.3 oz)', [140, 19, 4, 5, 0]),
  S('hard-boiled-eggs', 'Hard-boiled eggs', '🥚', 'Hard-boiled eggs', 2, '2 eggs', [140, 12, 1, 10, 0]),
  S('string-cheese', 'String cheese', '🧀', 'String cheese', 1, '1 stick', [80, 7, 1, 6, 0]),
  S('babybel', 'Babybel cheese', '🧀', 'Babybel cheese', 1, '1 round', [70, 5, 0, 6, 0]),
  S('beef-jerky', 'Beef jerky', '🥩', 'Beef jerky', 1, '1 oz', [80, 11, 6, 1, 0]),
  S('meat-stick', 'Meat stick', '🌭', 'Meat sticks', 1, '1 stick', [90, 10, 0, 6, 0]),
  S('tuna-pouch', 'Tuna pouch', '🐟', 'Tuna pouches', 1, '1 pouch (2.5 oz)', [70, 15, 0, 1, 0]),
  S('protein-milk', 'Protein milk', '🥛', 'Protein milk', 1, '1 cup', [120, 13, 6, 4.5, 0]),
  S('protein-chips', 'Protein chips', '🥔', 'Protein chips', 1, '1 bag (1.1 oz)', [140, 19, 5, 5, 1]),
  S('roasted-edamame', 'Roasted edamame', '🫛', 'Roasted edamame', 0.25, '¼ cup', [130, 14, 9, 4.5, 8]),
  S('pork-rinds', 'Pork rinds', '🥓', 'Pork rinds', 1, '1 oz', [150, 17, 0, 9, 0]),
  S('cheese-crisps', 'Parmesan cheese crisps', '🧀', 'Cheese crisps', 1, '⅓ bag', [100, 9, 1, 7, 0]),
  S('pepperoni', 'Pepperoni slices', '🍕', 'Pepperoni', 1, '1 oz', [140, 6, 0, 13, 0]),
  S('almonds', 'Almonds', '🌰', 'Almonds', 0.25, '¼ cup (1 oz)', [165, 6, 6, 14, 3.5]),
  S('olives', 'Olive snack cup', '🫒', 'Olive snack cups', 1, '1 cup', [50, 0, 1, 5, 0]),
  S('guacamole', 'Guacamole cup', '🥑', 'Guacamole cups', 1, '1 cup (2 oz)', [100, 1, 5, 9, 3]),
  S('seaweed', 'Seaweed snacks', '🌿', 'Seaweed snacks', 1, '1 pack', [30, 1, 1, 2, 0]),
  S('dark-chocolate', 'Dark chocolate (85%)', '🍫', 'Dark chocolate (85%)', 1, '1 oz', [170, 3, 13, 14, 4]),
  S('trail-mix', 'Trail mix', '🥜', 'Trail mix', 0.25, '¼ cup', [170, 5, 15, 11, 2]),
  S('apple', 'Apple', '🍎', 'Apples', 1, '1 medium', [95, 0.5, 25, 0.3, 4.4]),
  S('banana', 'Banana', '🍌', 'Bananas', 1, '1 medium', [105, 1, 27, 0.4, 3]),
  S('rice-cakes', 'Rice cakes', '🍘', 'Rice cakes', 2, '2 cakes', [70, 2, 14, 0.5, 0.5]),
  S('pretzels', 'Pretzels', '🥨', 'Pretzels', 1, '1 oz', [110, 3, 23, 1, 1]),
  S('popcorn', 'Light popcorn', '🍿', 'Light popcorn', 3.5, '3½ cups', [100, 3, 19, 2, 4]),
];

export function getStoreSnack(id) {
  return STORE_SNACKS.find((s) => s.id === id);
}

export function snackNetCarbs(s) {
  return Math.max(0, s.nutrition.carbs - (s.nutrition.fiber || 0));
}

export function isKetoSnack(s) {
  return snackNetCarbs(s) <= 6;
}
