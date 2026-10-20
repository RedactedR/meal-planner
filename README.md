# Meal Planner

Plan a week of dinners from a recipe library, then turn them into a grocery list for King Soopers.

## What it does so far

- **Recipes**: 250 built-in recipes across 30 cuisines with in-depth, step-by-step instructions, 333 pro tips (toggle them off in Settings), "Watch how" technique videos, difficulty levels, and homemade versions of store-bought sauces and seasonings. Search, filter by cuisine, sort by top rated or best deal, and rate recipes yourself.
- **Find online**: browse and search thousands of recipes from TheMealDB (with full recipe videos), or import any recipe by pasting a link from sites like Serious Eats, Budget Bytes or Allrecipes. Saved recipes join your library and work with the planner, Kitchen and grocery list.
- **Costs**: recipes are priced by the whole packages you'd buy (a jar of paprika, not 1 tsp of it), minus what's already in your Kitchen, with a chart by ingredient and store section. Leftovers stay in your Kitchen with an approximate amount ("≈ ¾ jar").
- **Kitchen**: your food inventory. A first-time checklist fills it in; groceries you mark as bought get added, and meals you cook get taken out. Recipes show ✓ for ingredients you have.
- **Deals**: meals that cost less because you already have some of the ingredients, with the discount shown.
- **Week**: fill 5 or 7 days, or tap "Surprise me". Suggestions for meals that reuse ingredients from your week. The recipe page shows your week so you can see which days are free.
- **Groceries**: one combined shopping list for the meals you pick, minus what's in your Kitchen, with an estimated total.
- **King Soopers**: match your list to real products at your store with live prices, then add it all to your King Soopers cart for pickup or delivery. One-time setup: [server/README.md](server/README.md).
- **Settings**: dark or light theme, portions from "Just me" up to 6 people, a balanced-meals-only switch, and allergies and foods to never suggest.

Recipe costs are estimates; live King Soopers prices appear when you send your list to your cart.

## Running it on your phone

The app uses **Expo SDK 57**, matching the current Expo Go app. You need Node.js on your computer and Expo Go on your phone, on the same Wi-Fi.

```
git clone https://github.com/RedactedR/meal-planner
cd meal-planner
npm install
npx expo start
```

Scan the QR code with your phone camera (iPhone) or the Expo Go app (Android).

To get the latest changes later, run `git pull` in the `meal-planner` folder, then `npx expo start` again.

Snack (snack.expo.dev) can't run this app right now because Snack only supports up to SDK 54.
