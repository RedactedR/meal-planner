// Step-by-step instructions written to be followed without guessing:
// pan size, heat level, how to cut things, how long, and what "done"
// looks like. Keyed by recipe id; each value is a steps array in the
// same format as R() ('text' or ['text', 'pro tip', 'video search']).
// Amounts aren't written into the text (they change with portions) —
// the app shows each step's amounts underneath it.

import beef from './beef';
import beef2 from './beef2';
import bowls from './bowls';
import bowls2 from './bowls2';
import chicken from './chicken';
import chicken2 from './chicken2';
import handhelds from './handhelds';
import handhelds2 from './handhelds2';
import keto1 from './keto1';
import keto2 from './keto2';
import keto3 from './keto3';
import pasta from './pasta';
import pasta2 from './pasta2';
import pork from './pork';
import seafood from './seafood';
import seafood2 from './seafood2';
import soups from './soups';
import soups2 from './soups2';
import vegetarian from './vegetarian';
import vegetarian2 from './vegetarian2';

const parts = [beef, beef2, bowls, bowls2, chicken, chicken2, handhelds, handhelds2, keto1, keto2, keto3, pasta, pasta2, pork, seafood, seafood2, soups, soups2, vegetarian, vegetarian2];

export default Object.assign({}, ...parts);
