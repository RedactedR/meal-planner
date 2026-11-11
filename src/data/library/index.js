// All library recipes, grouped by file. Add new files here.
import chicken from './chicken';
import beef from './beef';
import pork from './pork';
import seafood from './seafood';
import pasta from './pasta';
import vegetarian from './vegetarian';
import soups from './soups';
import bowls from './bowls';
import handhelds from './handhelds';
import keto1 from './keto1';
import keto2 from './keto2';
import snacks from './snacks';
import budget1 from './budget1';
import budget2 from './budget2';

// Budget meals that are really breakfasts: kept out of the planned dinners.
const BREAKFAST = new Set(['budget-banana-oat-pancakes', 'budget-pb-banana-oatmeal', 'budget-cheesy-grits-eggs', 'budget-egg-potato-burritos']);
import DETAILED from './detailed';
import { parseSteps } from './build';

const ALL = [...chicken, ...beef, ...pork, ...seafood, ...pasta, ...vegetarian, ...soups, ...bowls, ...handhelds, ...keto1, ...keto2, ...snacks,
  // Budget meals carry a flag so the Budget tab and chip can find them.
  ...[...budget1, ...budget2].map((r) => ({ ...r, budget: true, ...(BREAKFAST.has(r.id) ? { breakfast: true } : null) }))];

// Detailed, follow-along instructions replace the shorter originals.
export default ALL.map((r) => (DETAILED[r.id] ? { ...r, steps: parseSteps(DETAILED[r.id]) } : r));
