// Online recipes:
//  1. TheMealDB (themealdb.com) – a free recipe database with photos and
//     YouTube videos. The free key "1" is for personal/development use;
//     publishing the app in an app store requires becoming a supporter.
//  2. Import from a link – reads the structured recipe data
//     (schema.org/Recipe) that most recipe sites publish for search
//     engines, e.g. Serious Eats, Budget Bytes, Allrecipes. For personal
//     use; the original source is always linked.

const MEALDB = 'https://www.themealdb.com/api/json/v1/1';

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function titleCase(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Splits a block of instructions into individual steps.
export function splitSteps(text) {
  if (!text) return [];
  return text
    .replace(/\r/g, '')
    .split(/\n+|(?=\bSTEP\s*\d+)/i)
    .map((s) => s.replace(/^\s*(step\s*\d+[:.)-]?|\d+[.)])\s*/i, '').trim())
    .filter((s) => s.length > 3)
    .map((text) => ({ text }));
}

function youtubeId(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function fromMealDb(m) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: titleCase(name), qty: null, unit: null, measure: (m[`strMeasure${i}`] || '').trim() });
    }
  }
  return {
    id: `mealdb-${m.idMeal}`,
    source: 'mealdb',
    sourceName: 'TheMealDB',
    sourceUrl: m.strSource || `https://www.themealdb.com/meal/${m.idMeal}`,
    name: m.strMeal,
    cuisine: m.strArea && m.strArea !== 'Unknown' ? m.strArea : m.strCategory,
    category: m.strCategory,
    emoji: '🌐',
    image: m.strMealThumb,
    videoId: youtubeId(m.strYoutube),
    minutes: null,
    servings: 4,
    ingredients,
    steps: splitSteps(m.strInstructions),
  };
}

export async function searchMealDb(query) {
  const data = await getJson(`${MEALDB}/search.php?s=${encodeURIComponent(query)}`);
  return (data.meals || []).map(fromMealDb);
}

export async function mealDbCategories() {
  const data = await getJson(`${MEALDB}/categories.php`);
  return (data.categories || []).map((c) => c.strCategory);
}

// Category listings only include name and photo; full details load on tap.
export async function mealDbByCategory(category) {
  const data = await getJson(`${MEALDB}/filter.php?c=${encodeURIComponent(category)}`);
  return (data.meals || []).map((m) => ({
    id: `mealdb-${m.idMeal}`,
    mealDbId: m.idMeal,
    partial: true,
    source: 'mealdb',
    name: m.strMeal,
    image: m.strMealThumb,
    cuisine: category,
  }));
}

// TheMealDB groups recipes by country ("area"). Maps the app's cuisine
// names onto theirs; cuisines with no match return nothing.
const AREA_FOR_CUISINE = {
  Indian: 'Indian', Mexican: 'Mexican', Thai: 'Thai', Italian: 'Italian', Japanese: 'Japanese',
  Greek: 'Greek', Chinese: 'Chinese', American: 'American', Vietnamese: 'Vietnamese', French: 'French',
  British: 'British', Irish: 'Irish', Spanish: 'Spanish', Moroccan: 'Moroccan', Jamaican: 'Jamaican',
  Turkish: 'Turkish', Korean: 'Korean', Filipino: 'Filipino', Canadian: 'Canadian', Malaysian: 'Malaysian',
  'Middle Eastern': 'Egyptian', Cajun: 'American', Vegetarian: null,
};

export async function mealDbByCuisine(cuisine) {
  if (cuisine === 'Vegetarian') return mealDbByCategory('Vegetarian');
  if (!/^[A-Za-z]/.test(cuisine)) return []; // protein/keto/snack filters need nutrition info
  const area = AREA_FOR_CUISINE[cuisine] ?? cuisine;
  if (!area) return [];
  const data = await getJson(`${MEALDB}/filter.php?a=${encodeURIComponent(area)}`);
  return (data.meals || []).map((m) => ({
    id: `mealdb-${m.idMeal}`,
    mealDbId: m.idMeal,
    partial: true,
    source: 'mealdb',
    name: m.strMeal,
    image: m.strMealThumb,
    cuisine,
  }));
}

export async function mealDbLookup(mealDbId) {
  const data = await getJson(`${MEALDB}/lookup.php?i=${encodeURIComponent(mealDbId)}`);
  const m = data.meals && data.meals[0];
  if (!m) throw new Error('Recipe not found');
  return fromMealDb(m);
}

export async function mealDbRandom(count = 6) {
  const results = await Promise.all(
    Array.from({ length: count }, () => getJson(`${MEALDB}/random.php`).catch(() => null))
  );
  const seen = new Set();
  return results
    .map((d) => d && d.meals && d.meals[0])
    .filter((m) => m && !seen.has(m.idMeal) && seen.add(m.idMeal))
    .map(fromMealDb);
}

// ---------- Import from a link ----------

const UNIT_WORDS =
  'cups?|c\\.|tablespoons?|tbsps?|tbs|tsps?|teaspoons?|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|ml|milliliters?|liters?|l|pinch(?:es)?|dash(?:es)?|cloves?|cans?|jars?|bunch(?:es)?|sticks?|slices?|pieces?|heads?|sprigs?|handfuls?|packages?|pkgs?|large|medium|small';

// "2 1/2 cups all-purpose flour, sifted" -> { name: 'All-purpose flour', measure: '2 1/2 cups' }
export function parseIngredientLine(line) {
  const clean = String(line).replace(/\s+/g, ' ').replace(/\(.*?\)/g, '').trim();
  const re = new RegExp(`^((?:[\\d¼½¾⅓⅔⅛.,/\\-–]+\\s*)+)?\\s*((?:${UNIT_WORDS})\\b\\.?)?\\s*(?:of\\s+)?(.*)$`, 'i');
  const m = clean.match(re);
  let measure = '';
  let name = clean;
  if (m) {
    measure = [m[1], m[2]].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    name = m[3] || clean;
  }
  name = name.split(',')[0].trim();
  if (!name) name = clean;
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    qty: null,
    unit: null,
    measure,
    original: String(line).trim(),
  };
}

function textOf(x) {
  if (!x) return '';
  if (typeof x === 'string') return x;
  return x.text || x.name || '';
}

function stripHtml(s) {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

function flattenInstructions(ins) {
  if (!ins) return [];
  if (typeof ins === 'string') return splitSteps(stripHtml(ins.replace(/<\/(p|li)>/gi, '\n')));
  const out = [];
  for (const item of [].concat(ins)) {
    if (!item) continue;
    if (item['@type'] === 'HowToSection' || item.itemListElement) {
      const section = item.name ? stripHtml(item.name) : null;
      flattenInstructions(item.itemListElement).forEach((s) => out.push(section ? { ...s, part: section } : s));
    } else {
      const t = stripHtml(textOf(item));
      if (t) out.push({ text: t });
    }
  }
  return out;
}

function isoMinutes(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  const mins = (Number(m[1] || 0) * 24 + Number(m[2] || 0)) * 60 + Number(m[3] || 0);
  return mins || null;
}

function firstImage(img) {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (Array.isArray(img)) return firstImage(img[0]);
  return img.url || img.contentUrl || null;
}

function findRecipeNode(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const hit = findRecipeNode(n);
      if (hit) return hit;
    }
    return null;
  }
  const type = [].concat(node['@type'] || []);
  if (type.includes('Recipe')) return node;
  return findRecipeNode(node['@graph']) || findRecipeNode(node.mainEntity);
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export async function importFromLink(url) {
  const clean = url.trim();
  if (!/^https?:\/\//i.test(clean)) throw new Error('Paste a full link starting with https://');
  let html;
  try {
    const res = await fetch(clean, { headers: { Accept: 'text/html' } });
    if (!res.ok) throw new Error(`The site returned an error (${res.status}).`);
    html = await res.text();
  } catch (e) {
    throw new Error(
      e.message?.includes('returned')
        ? e.message
        : "Couldn't reach that page. Import works in the phone app; browser previews block it."
    );
  }

  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let node = null;
  for (const b of blocks) {
    try {
      node = findRecipeNode(JSON.parse(b[1].trim()));
    } catch {
      // Some sites have broken JSON in one block; try the next.
    }
    if (node) break;
  }
  if (!node) {
    throw new Error(
      "That page doesn't share its recipe in a format the app can read. It may be behind a login or paywall."
    );
  }

  const host = (clean.match(/^https?:\/\/([^/?#]+)/i)?.[1] || 'web').replace(/^www\./, '');
  const video = node.video && [].concat(node.video)[0];
  const servings = parseInt(String([].concat(node.recipeYield || [])[0] || '').match(/\d+/)?.[0] || '4', 10);
  const recipe = {
    id: `import-${hashString(clean)}`,
    source: 'import',
    sourceName: host,
    sourceUrl: clean,
    name: stripHtml(node.name || 'Imported recipe'),
    cuisine: stripHtml([].concat(node.recipeCuisine || [])[0] || [].concat(node.recipeCategory || [])[0] || 'Imported'),
    emoji: '🔗',
    image: firstImage(node.image),
    videoId: youtubeId(video?.embedUrl || video?.contentUrl || video?.url),
    minutes: isoMinutes(node.totalTime) || isoMinutes(node.cookTime),
    servings: servings || 4,
    ingredients: [].concat(node.recipeIngredient || []).map((l) => parseIngredientLine(stripHtml(l))),
    steps: flattenInstructions(node.recipeInstructions),
  };
  if (recipe.steps.length === 0) {
    throw new Error("That recipe didn't include instructions, so it can't be added.");
  }
  return recipe;
}

export function youtubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`;
}

export function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
