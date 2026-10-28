// Calorie & protein tracking helpers.

// A recipe counts as high protein at 35 g or more per serving.
export const HIGH_PROTEIN_G = 35;

export function isHighProtein(recipe) {
  return (recipe.nutrition?.protein ?? 0) >= HIGH_PROTEIN_G;
}

// "2026-10-28" in your own time zone.
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + n));
}

export function dayLabel(key) {
  const today = dateKey();
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

// 'Mon'..'Sun' for a date, to find that day's meal on your week plan.
export function weekdayOf(key) {
  const [y, m, d] = key.split('-').map(Number);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(y, m - 1, d).getDay()];
}

export function totals(entries = []) {
  return entries.reduce(
    (t, e) => ({
      calories: t.calories + (e.calories || 0) * (e.servings || 1),
      protein: t.protein + (e.protein || 0) * (e.servings || 1),
    }),
    { calories: 0, protein: 0 }
  );
}

export const AIMS = [
  { key: 'lose', label: 'Lose fat', note: 'About 500 under maintenance, with high protein to keep muscle.' },
  { key: 'maintain', label: 'Maintain', note: 'Eat about what you burn while you train.' },
  { key: 'build', label: 'Build muscle', note: 'A small surplus (about 300) plus high protein.' },
];

// Common starting points for someone who works out a few times a week:
// maintenance ≈ 15 calories per lb of body weight, protein 0.8–1 g per lb.
// Rough estimates — adjust after a couple of weeks based on the scale.
export function suggestGoals(weight, aim) {
  const maintenance = weight * 15;
  const calories = aim === 'lose' ? maintenance - 500 : aim === 'build' ? maintenance + 300 : maintenance;
  const protein = weight * (aim === 'maintain' ? 0.8 : 1);
  return {
    calories: Math.round(calories / 50) * 50,
    protein: Math.round(protein / 5) * 5,
  };
}

// One-tap foods for things that aren't a recipe.
export const QUICK_FOODS = [
  { name: 'Protein shake', emoji: '🥤', calories: 130, protein: 25 },
  { name: 'Greek yogurt (1 cup)', emoji: '🥣', calories: 150, protein: 20 },
  { name: '2 eggs', emoji: '🥚', calories: 140, protein: 12 },
  { name: 'Protein bar', emoji: '🍫', calories: 210, protein: 20 },
  { name: 'Chicken breast (6 oz)', emoji: '🍗', calories: 280, protein: 52 },
  { name: 'Cottage cheese (1 cup)', emoji: '🥛', calories: 180, protein: 24 },
  { name: 'Tuna can', emoji: '🐟', calories: 120, protein: 26 },
  { name: 'Glass of milk', emoji: '🥛', calories: 120, protein: 8 },
  { name: 'Banana', emoji: '🍌', calories: 105, protein: 1 },
  { name: 'Peanut butter (2 tbsp)', emoji: '🥜', calories: 190, protein: 7 },
];

// Recipes that fit what's left of today's calories, most protein first.
export function proteinPicks(recipes, caloriesLeft, limit = 5) {
  return recipes
    .filter((r) => r.nutrition && r.nutrition.protein >= 25 && caloriesLeft > 0 && r.nutrition.calories <= caloriesLeft)
    .sort(
      (a, b) =>
        b.nutrition.protein / b.nutrition.calories - a.nutrition.protein / a.nutrition.calories ||
        b.nutrition.protein - a.nutrition.protein
    )
    .slice(0, limit);
}
