import { isKeto } from './data/recipes';
import { STORE_SNACKS, isKetoSnack } from './data/snacks';

// "What can I eat to hit my protein?" Finds one or two things — a meal,
// a homemade snack or something from the store — that cover the protein
// you still need without going over the calories you have left.

function food(kind, ref, n) {
  return { kind, ref, id: ref.id, name: ref.name, emoji: ref.emoji, calories: n.calories, protein: n.protein };
}

export function gapPlans({ proteinLeft, caloriesLeft, recipes, keto = false, limit = 6 }) {
  if (proteinLeft <= 0) return { plans: [], fallback: [] };
  const meals = [];
  const snacks = [];
  for (const r of recipes) {
    if (!r.nutrition || (keto && !isKeto(r))) continue;
    if (r.course === 'snack') {
      if (r.nutrition.protein >= 5) snacks.push(food('recipe', r, r.nutrition));
    } else if (r.nutrition.protein >= 20) {
      meals.push(food('recipe', r, r.nutrition));
    }
  }
  for (const s of STORE_SNACKS) {
    if (keto && !isKetoSnack(s)) continue;
    if (s.nutrition.protein >= 5) snacks.push(food('store', s, s.nutrition));
  }

  // Within 3 g counts as hitting it.
  const need = proteinLeft - 3;
  const budget = caloriesLeft > 0 ? caloriesLeft : 0;
  const fits = [];
  const consider = (items) => {
    let calories = 0;
    let protein = 0;
    for (const f of items) {
      calories += f.calories;
      protein += f.protein;
    }
    if (calories <= budget) fits.push({ items, calories, protein });
  };

  for (const f of [...meals, ...snacks]) consider([f]);
  for (const m of meals) for (const s of snacks) consider([m, s]);
  for (let i = 0; i < snacks.length; i++) for (let j = i + 1; j < snacks.length; j++) consider([snacks[i], snacks[j]]);
  // Two of the same store snack (e.g. two protein shakes).
  for (const s of snacks) if (s.kind === 'store') consider([s, s]);
  // For big gaps: a meal plus two of the leanest snacks.
  const lean = [...snacks].sort((a, b) => b.protein / b.calories - a.protein / a.calories).slice(0, 12);
  for (const m of meals)
    for (let i = 0; i < lean.length; i++) for (let j = i + 1; j < lean.length; j++) consider([m, lean[i], lean[j]]);

  const pick = (list) => {
    const out = [];
    const usedLead = new Set();
    const usedAny = new Map();
    for (const c of list) {
      const lead = c.items[0].id;
      if (usedLead.has(lead)) continue;
      if (c.items.some((f) => (usedAny.get(f.id) || 0) >= 2)) continue;
      out.push(c);
      usedLead.add(lead);
      c.items.forEach((f) => usedAny.set(f.id, (usedAny.get(f.id) || 0) + 1));
      if (out.length >= limit) break;
    }
    return out;
  };

  // Hits the goal: fewest things first, then fewest calories.
  const plans = pick(
    fits.filter((c) => c.protein >= need).sort((a, b) => a.items.length - b.items.length || a.calories - b.calories)
  );

  // Nothing hits it: the combos that get closest within your calories, or
  // if you're out of calories, the leanest protein there is.
  let fallback = [];
  if (!plans.length) {
    fallback = fits.length
      ? pick([...fits].sort((a, b) => b.protein - a.protein || a.calories - b.calories)).slice(0, 4)
      : [...snacks, ...meals]
          .sort((a, b) => b.protein / b.calories - a.protein / a.calories)
          .slice(0, 4)
          .map((f) => ({ items: [f], calories: f.calories, protein: f.protein }));
  }

  return { plans, fallback };
}
