# Meal Planner

Plan a week of dinners from a recipe library, then turn them into a grocery list for King Soopers.

## What it does so far

- **Recipes**: 23 built-in recipes with in-depth, step-by-step instructions, 80 pro tips (toggle them off in Settings), "Watch how" technique videos, difficulty levels, and homemade versions of store-bought sauces and seasonings. Search, filter by cuisine, sort by top rated or best deal, and rate recipes yourself.
- **Find online**: browse and search thousands of recipes from TheMealDB (with full recipe videos), or import any recipe by pasting a link from sites like Serious Eats, Budget Bytes or Allrecipes. Saved recipes join your library and work with the planner, Kitchen and grocery list.
- **Costs**: every recipe shows an estimated King Soopers cost, cost per serving, and a chart breaking it down by ingredient and store section.
- **Kitchen**: your food inventory. A first-time checklist fills it in; groceries you mark as bought get added, and meals you cook get taken out. Recipes show ✓ for ingredients you have.
- **Deals**: meals that cost less because you already have some of the ingredients, with the discount shown.
- **Week**: fill 5 or 7 days, or tap "Surprise me". Suggestions for meals that reuse ingredients from your week. The recipe page shows your week so you can see which days are free.
- **Groceries**: one combined shopping list for the meals you pick, minus what's in your Kitchen, with an estimated total.
- **Settings**: dark or light theme, portions from "Just me" up to 6 people, a balanced-meals-only switch, and allergies and foods to never suggest.

Prices are estimates for now; live prices come with the King Soopers connection.

Coming next: sending the shopping list straight to your King Soopers cart.

## Running it on your phone

**Quickest way (no computer):** open [this Snack link](https://snack.expo.dev/?name=Meal%20Planner&dependencies=%40react-native-async-storage%2Fasync-storage%2Creact-native-safe-area-context%2Cexpo-status-bar%2Creact-native-webview&files=%7B%22App.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2FApp.js%22%7D%2C%22src%2FAppState.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2FAppState.js%22%7D%2C%22src%2Fcomponents%2FBadges.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FBadges.js%22%7D%2C%22src%2Fcomponents%2FCostBreakdown.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FCostBreakdown.js%22%7D%2C%22src%2Fcomponents%2FRecipeCard.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FRecipeCard.js%22%7D%2C%22src%2Fcomponents%2FRecipeDetail.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FRecipeDetail.js%22%7D%2C%22src%2Fcomponents%2FStars.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FStars.js%22%7D%2C%22src%2Fcomponents%2FToast.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FToast.js%22%7D%2C%22src%2Fcomponents%2FVideoPlayer.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FVideoPlayer.js%22%7D%2C%22src%2Fdata%2Fingredients.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fdata%2Fingredients.js%22%7D%2C%22src%2Fdata%2Frecipes.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fdata%2Frecipes.js%22%7D%2C%22src%2Fgrocery.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fgrocery.js%22%7D%2C%22src%2Fonline.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fonline.js%22%7D%2C%22src%2Fpairing.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fpairing.js%22%7D%2C%22src%2Fpricing.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fpricing.js%22%7D%2C%22src%2FrecipeFilters.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2FrecipeFilters.js%22%7D%2C%22src%2Fscreens%2FGroceryScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FGroceryScreen.js%22%7D%2C%22src%2Fscreens%2FKitchenScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FKitchenScreen.js%22%7D%2C%22src%2Fscreens%2FOnlineBrowser.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FOnlineBrowser.js%22%7D%2C%22src%2Fscreens%2FPlannerScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FPlannerScreen.js%22%7D%2C%22src%2Fscreens%2FRecipesScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FRecipesScreen.js%22%7D%2C%22src%2Fscreens%2FSettingsScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FSettingsScreen.js%22%7D%2C%22src%2Ftheme.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Ftheme.js%22%7D%7D) on your phone, then tap "Open in Expo Go" / "My Device". If new files are added, regenerate the link with `node scripts/snack-link.js`.

**With a computer:**

You need Node.js on your computer and the Expo Go app on your phone.

```
git clone https://github.com/RedactedR/meal-planner
cd meal-planner
npm install
npx expo install --fix
npx expo start
```

Scan the QR code with your phone camera (iPhone) or the Expo Go app (Android). Phone and computer must be on the same Wi-Fi.

Built with Expo (React Native), so it runs on both iOS and Android.
