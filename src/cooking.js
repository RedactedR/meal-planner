// Helpers for following a recipe step by step: which ingredients each
// step uses (with amounts) and which times in a step can become timers.

import { stepText } from './data/recipes';
import { catalogItem } from './data/ingredients';

// Words that describe an ingredient but aren't what a step calls it:
// "Fresh parsley" is "the parsley", "Shredded cheddar" is "the cheddar".
const DESCRIPTORS = new Set(
  ('fresh ground dried shredded kosher yellow red green white black large small baby boneless skinless bone-in ' +
    'extra-virgin canned frozen unsweetened plain light dark sushi-grade lump deli roasted crushed diced sliced ' +
    'whole sea low-sodium all-purpose cherry jumbo wide long grain sweet smoked hard-boiled firm instant cooked ' +
    'grated chopped unsalted salted dry hot mild sharp crumbled pure fire-roasted new york')
    .split(' ')
);

// Main-ingredient words that steps use on their own ("sear the chicken").
const PROTEIN_WORDS = new Set(['chicken', 'beef', 'pork', 'turkey', 'lamb', 'salmon', 'shrimp', 'steak', 'cod', 'tuna', 'sausage']);

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Match singular or plural: "tomatoes" ↔ "tomato", "cherries" ↔ "cherry".
function wordPattern(word) {
  const w = word.toLowerCase();
  if (w.endsWith('ies')) return escape(w.slice(0, -3)) + '(?:y|ies)';
  if (w.endsWith('oes')) return escape(w.slice(0, -2)) + '(?:es)?';
  if (w.endsWith('s') && !w.endsWith('ss')) return escape(w.slice(0, -1)) + '(?:e?s)?';
  return escape(w) + '(?:e?s)?';
}

function aliasesFor(name) {
  const out = new Set();
  for (const part of name.toLowerCase().split(/\s+or\s+|\s*\(|\)/)) {
    const clean = part.trim();
    if (!clean) continue;
    out.add(clean);
    const words = clean.split(/\s+/);
    const stripped = words.filter((w) => !DESCRIPTORS.has(w));
    if (stripped.length && stripped.length < words.length) out.add(stripped.join(' '));
    if (words.length > 1) out.add(words[words.length - 1]);
    if (words.length > 1 && PROTEIN_WORDS.has(words[0]) && catalogItem(name)?.category === 'protein') out.add(words[0]);
  }
  return [...out].filter((a) => a.length >= 3);
}

const matcherCache = new WeakMap();

// Builds, once per recipe, the list of names to look for in its steps.
function matcherFor(recipe) {
  if (matcherCache.has(recipe)) return matcherCache.get(recipe);
  const owners = new Map(); // alias -> set of ingredient indexes
  const forms = new Map(); // singular key -> alias as written
  recipe.ingredients.forEach((ing, idx) => {
    for (const a of aliasesFor(ing.name)) {
      // "pepper" and "peppers" are the same word for matching purposes.
      const key = a.replace(/ies\b/g, 'y').replace(/oes\b/g, 'o').replace(/([^s])s\b/g, '$1');
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key).add(idx);
      if (!forms.has(key)) forms.set(key, a);
    }
  });
  // Keep only names that point to exactly one ingredient; longest first so
  // "red pepper flakes" wins over "pepper".
  const list = [...owners.entries()]
    .filter(([, set]) => set.size === 1)
    .map(([key, set]) => {
      const alias = forms.get(key);
      const re = new RegExp(`\\b${alias.split(' ').map(wordPattern).join('\\s+')}\\b`, 'gi');
      return { idx: [...set][0], re, len: alias.length };
    })
    .sort((a, b) => b.len - a.len);
  matcherCache.set(recipe, list);
  return list;
}

// Indexes of the ingredients a step mentions, in recipe order.
export function stepIngredientIdx(recipe, step) {
  let text = stepText(step);
  const found = new Set();
  for (const m of matcherFor(recipe)) {
    m.re.lastIndex = 0;
    if (m.re.test(text)) {
      found.add(m.idx);
      m.re.lastIndex = 0;
      text = text.replace(m.re, (s) => ' '.repeat(s.length));
    }
  }
  return [...found].sort((a, b) => a - b);
}

// For every step: which ingredients it uses, and whether each one is
// split across several steps (so the amount shown is the total).
export function stepsWithIngredients(recipe) {
  const perStep = recipe.steps.map((s) => stepIngredientIdx(recipe, s));
  const count = new Map();
  perStep.flat().forEach((i) => count.set(i, (count.get(i) || 0) + 1));
  return perStep.map((idxs) => idxs.map((i) => ({ idx: i, ing: recipe.ingredients[i], shared: count.get(i) > 1 })));
}

// Times in a step that make sense as timers: "8 minutes", "4–5 minutes",
// "1 hour 15 minutes". Uses the low end of a range — check then, add more if needed.
export function stepTimers(step) {
  const text = stepText(step);
  const re = /(\d+)\s*(?:(?:–|-|to)\s*(\d+)\s*)?(hours?|hrs?|minutes?|mins?)\b(?:\s*(?:and\s*)?(\d+)\s*(minutes?|mins?)\b)?/gi;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 7), m.index).toLowerCase();
    if (/up to\s*$|every\s*$/.test(before)) continue;
    const isHour = /^h/i.test(m[3]);
    const low = Number(m[1]);
    const high = m[2] ? Number(m[2]) : null;
    let seconds = (isHour ? low * 3600 : low * 60) + (m[4] ? Number(m[4]) * 60 : 0);
    if (seconds < 60 || seconds > 6 * 3600) continue;
    const unit = isHour ? 'hr' : 'min';
    const label = high ? `${low}–${high} ${unit}` : m[4] ? `${low} hr ${m[4]} min` : `${low} ${unit}`;
    if (seen.has(seconds)) continue;
    seen.add(seconds);
    out.push({ seconds, label });
  }
  return out;
}
