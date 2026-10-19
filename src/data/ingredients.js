// Every ingredient the recipes use, with:
//   unit     – the unit recipes and your Kitchen inventory measure it in
//   price    – estimated King Soopers price per unit (USD). These are
//              estimates, not live prices; live prices come with the
//              King Soopers connection later.
//   category – store section, used for grouping and the cost chart
//   pack     – how much comes in a typical package you'd buy
//
// [name, unit, price, category, pack]
const CATALOG_ROWS = [
  // Protein
  ['Chicken thighs', 'lb', 3.49, 'protein', 1.5],
  ['Chicken breasts', 'lb', 3.99, 'protein', 1.5],
  ['Ground beef', 'lb', 5.99, 'protein', 1],
  ['Ground turkey', 'lb', 5.49, 'protein', 1],
  ['Flank steak', 'lb', 10.99, 'protein', 1.5],
  ['Shrimp', 'lb', 9.99, 'protein', 1],
  ['Salmon fillets', '', 4.5, 'protein', 2],
  ['Andouille sausage', 'oz', 0.45, 'protein', 12],
  ['Eggs', '', 0.3, 'dairy', 12],

  // Dairy
  ['Plain yogurt', 'cup', 1.0, 'dairy', 4],
  ['Heavy cream', 'cup', 2.25, 'dairy', 2],
  ['Fresh mozzarella', 'oz', 0.62, 'dairy', 8],
  ['Feta cheese', 'oz', 0.75, 'dairy', 6],
  ['Tzatziki', 'tub', 4.49, 'dairy', 1],
  ['Pepper jack cheese', 'slices', 0.4, 'dairy', 10],
  ['Butter', 'tbsp', 0.3, 'dairy', 16],
  ['Parmesan', 'oz', 1.25, 'dairy', 5],
  ['Shredded cheddar', 'oz', 0.4, 'dairy', 8],

  // Produce
  ['Yellow onion', '', 0.99, 'produce', 1],
  ['Red onion', '', 1.29, 'produce', 1],
  ['Garlic', 'cloves', 0.1, 'produce', 10],
  ['Cilantro', 'bunch', 0.99, 'produce', 1],
  ['Limes', '', 0.5, 'produce', 1],
  ['Lemons', '', 0.79, 'produce', 1],
  ['Bean sprouts', 'cup', 1.0, 'produce', 3],
  ['Green onions', 'bunch', 1.0, 'produce', 1],
  ['Tomatoes', '', 0.9, 'produce', 1],
  ['Fresh basil', 'bunch', 2.49, 'produce', 1],
  ['Cucumber', '', 0.89, 'produce', 1],
  ['Avocado', '', 1.25, 'produce', 1],
  ['Baby potatoes', 'lb', 2.5, 'produce', 1.5],
  ['Bell peppers', '', 1.29, 'produce', 1],
  ['Celery', 'bunch', 1.99, 'produce', 1],
  ['Fresh ginger', 'piece', 0.75, 'produce', 1],
  ['Jalapeño', '', 0.25, 'produce', 1],
  ['Baby spinach', 'oz', 0.8, 'produce', 5],
  ['Zucchini', '', 1.29, 'produce', 1],
  ['Romaine lettuce', 'head', 2.29, 'produce', 1],
  ['Kimchi', 'jar', 6.99, 'produce', 1],

  // Bakery
  ['Corn tortillas', '', 0.12, 'bakery', 30],
  ['Naan or flatbread', '', 1.75, 'bakery', 2],
  ['Crusty bread', 'loaf', 3.99, 'bakery', 1],
  ['Burger buns', '', 0.62, 'bakery', 8],

  // Frozen
  ['Edamame', 'bag', 2.79, 'frozen', 1],
  ['Frozen corn', 'cup', 0.75, 'frozen', 4],

  // Pantry
  ['Crushed tomatoes', 'can', 1.79, 'pantry', 1],
  ['Diced tomatoes', 'can', 1.49, 'pantry', 1],
  ['Basmati rice', 'cup', 0.8, 'pantry', 10],
  ['Jasmine rice', 'cup', 0.8, 'pantry', 10],
  ['Long grain rice', 'cup', 0.5, 'pantry', 10],
  ['Brown rice', 'cup', 0.6, 'pantry', 10],
  ['Rice noodles', 'oz', 0.35, 'pantry', 14],
  ['Spaghetti', 'lb', 1.69, 'pantry', 1],
  ['Red lentils', 'cup', 1.2, 'pantry', 4],
  ['Black beans', 'can', 1.09, 'pantry', 1],
  ['Kidney beans', 'can', 1.09, 'pantry', 1],
  ['Coconut milk', 'can', 2.49, 'pantry', 1],
  ['Chicken broth', 'oz', 0.1, 'pantry', 32],
  ['Peanuts', 'cup', 2.0, 'pantry', 3],
  ['Breadcrumbs', 'cup', 1.25, 'pantry', 3],
  ['Olive oil', 'tbsp', 0.2, 'pantry', 34],
  ['Salsa verde', 'jar', 3.49, 'pantry', 1],
  ['Pad thai sauce', 'jar', 4.49, 'pantry', 1],
  ['Teriyaki sauce', 'bottle', 3.49, 'pantry', 1],
  ['Bulgogi marinade', 'bottle', 4.99, 'pantry', 1],

  // Spices
  ['Garam masala', 'tbsp', 0.6, 'spices', 6],
  ['Taco seasoning', 'packet', 1.29, 'spices', 1],
  ['Sesame seeds', 'tbsp', 0.25, 'spices', 12],
  ['Chili powder', 'tbsp', 0.35, 'spices', 8],
  ['Curry powder', 'tbsp', 0.45, 'spices', 6],
  ['Cajun seasoning', 'tbsp', 0.4, 'spices', 8],
  ['Ground cumin', 'tsp', 0.15, 'spices', 24],
  ['Paprika', 'tsp', 0.15, 'spices', 24],
  ['Dried oregano', 'tsp', 0.12, 'spices', 24],
  ['Star anise', '', 0.3, 'spices', 10],
  ['Cinnamon stick', '', 0.4, 'spices', 6],

  // Added for in-depth recipes and from-scratch sauces
  ['Kosher salt', 'tsp', 0.02, 'spices', 160],
  ['Black pepper', 'tsp', 0.12, 'spices', 20],
  ['Garlic powder', 'tsp', 0.12, 'spices', 30],
  ['Baking soda', 'tsp', 0.02, 'pantry', 100],
  ['Cornstarch', 'tsp', 0.03, 'pantry', 100],
  ['Vegetable oil', 'tbsp', 0.06, 'pantry', 96],
  ['Sesame oil', 'tbsp', 0.35, 'pantry', 14],
  ['Soy sauce', 'tbsp', 0.12, 'pantry', 32],
  ['Fish sauce', 'tbsp', 0.18, 'pantry', 46],
  ['Oyster sauce', 'tbsp', 0.2, 'pantry', 18],
  ['Tamarind concentrate', 'tbsp', 0.45, 'pantry', 16],
  ['Mirin', 'tbsp', 0.3, 'pantry', 20],
  ['Rice vinegar', 'tbsp', 0.15, 'pantry', 24],
  ['Light brown sugar', 'tbsp', 0.06, 'pantry', 64],
  ['Dijon mustard', 'tbsp', 0.2, 'pantry', 16],
  ['Mayonnaise', 'tbsp', 0.12, 'pantry', 60],
  ['Ketchup', 'tbsp', 0.07, 'pantry', 38],
  ['Dill pickles', 'jar', 3.49, 'pantry', 1],
  ['Dry white wine', 'cup', 2.5, 'pantry', 3],
  ['Arborio rice', 'cup', 1.75, 'pantry', 4],
  ['Chickpeas', 'can', 1.09, 'pantry', 1],
  ['Bacon', 'oz', 0.5, 'protein', 16],
  ['New York strip steak', 'lb', 13.99, 'protein', 1],
  ['American cheese', 'slices', 0.25, 'dairy', 16],
  ['Shallot', '', 0.69, 'produce', 1],
  ['Fresh parsley', 'bunch', 0.99, 'produce', 1],
  ['Fresh dill', 'bunch', 1.99, 'produce', 1],
  ['Fresh thyme', 'bunch', 1.99, 'produce', 1],
  ['Pear', '', 1.29, 'produce', 1],
  ['Cremini mushrooms', 'oz', 0.37, 'produce', 8],
  ['Broccoli', 'lb', 1.99, 'produce', 1],
  ['Frozen peas and carrots', 'cup', 0.6, 'frozen', 4],
];

export const CATEGORIES = [
  { key: 'protein', label: 'Protein', emoji: '🥩' },
  { key: 'produce', label: 'Produce', emoji: '🥬' },
  { key: 'dairy', label: 'Dairy & eggs', emoji: '🧀' },
  { key: 'bakery', label: 'Bakery', emoji: '🍞' },
  { key: 'frozen', label: 'Frozen', emoji: '🧊' },
  { key: 'pantry', label: 'Pantry', emoji: '🥫' },
  { key: 'spices', label: 'Spices', emoji: '🧂' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

export const CATALOG = Object.fromEntries(
  CATALOG_ROWS.map(([name, unit, price, category, pack]) => [
    name.toLowerCase(),
    { name, unit, price, category, pack },
  ])
);

export function keyOf(name) {
  return name.trim().toLowerCase();
}

export function catalogItem(name) {
  return CATALOG[keyOf(name)];
}

// Things almost every kitchen has on hand; left out of pairing
// suggestions because sharing them doesn't save anything.
const STAPLES = ['olive oil', 'vegetable oil', 'garlic', 'butter', 'water', 'salt', 'pepper', 'oil', 'sugar'];
export function isStaple(name) {
  const key = keyOf(name);
  const item = catalogItem(name);
  if (item) return item.category === 'spices' || STAPLES.includes(key);
  return STAPLES.some((s) => key === s || key.endsWith(` ${s}`)) || /\bsalt\b|black pepper|ground pepper/.test(key);
}
