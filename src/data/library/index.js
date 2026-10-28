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
import DETAILED from './detailed';
import { parseSteps } from './build';

const ALL = [...chicken, ...beef, ...pork, ...seafood, ...pasta, ...vegetarian, ...soups, ...bowls, ...handhelds, ...keto1, ...keto2, ...snacks];

// Detailed, follow-along instructions replace the shorter originals.
export default ALL.map((r) => (DETAILED[r.id] ? { ...r, steps: parseSteps(DETAILED[r.id]) } : r));
