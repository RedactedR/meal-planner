// Step-by-step instructions written to be followed without guessing:
// pan size, heat level, how to cut things, how long, and what "done"
// looks like. Keyed by recipe id; each value is a steps array in the
// same format as R() ('text' or ['text', 'pro tip', 'video search']).
// Amounts aren't written into the text (they change with portions) —
// the app shows each step's amounts underneath it.

import beef from './beef';
import beef2 from './beef2';
import chicken from './chicken';
import chicken2 from './chicken2';
import pork from './pork';
import seafood from './seafood';
import seafood2 from './seafood2';

const parts = [beef, beef2, chicken, chicken2, pork, seafood, seafood2];

export default Object.assign({}, ...parts);
