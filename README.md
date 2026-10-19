# Meal Planner

Plan a week of dinners from a recipe library, then turn them into a grocery list for King Soopers.

## What it does so far

- **Recipes**: 12 recipes from different cuisines, with search and cuisine filters.
- **Week**: fill 5 or 7 days with recipes, or tap "Surprise me" to fill empty days with something new.
- **Groceries**: pick all or some of your planned meals and get one combined shopping list. Untick anything you already have.

Coming next: sending the shopping list straight to your King Soopers cart.

## Running it on your phone

**Quickest way (no computer):** open [this Snack link](https://snack.expo.dev/?name=Meal%20Planner&dependencies=%40react-native-async-storage%2Fasync-storage%2Creact-native-safe-area-context%2Cexpo-status-bar&files=%7B%22App.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2FApp.js%22%7D%2C%22src%2Ftheme.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Ftheme.js%22%7D%2C%22src%2FusePlan.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2FusePlan.js%22%7D%2C%22src%2Fgrocery.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fgrocery.js%22%7D%2C%22src%2Fdata%2Frecipes.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fdata%2Frecipes.js%22%7D%2C%22src%2Fcomponents%2FRecipeCard.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FRecipeCard.js%22%7D%2C%22src%2Fcomponents%2FRecipeDetail.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fcomponents%2FRecipeDetail.js%22%7D%2C%22src%2Fscreens%2FRecipesScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FRecipesScreen.js%22%7D%2C%22src%2Fscreens%2FPlannerScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FPlannerScreen.js%22%7D%2C%22src%2Fscreens%2FGroceryScreen.js%22%3A%7B%22type%22%3A%22CODE%22%2C%22url%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2FRedactedR%2Fmeal-planner%2Fmain%2Fsrc%2Fscreens%2FGroceryScreen.js%22%7D%7D) on your phone, then tap "Open in Expo Go" / "My Device". It always loads the latest code from this repo.

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
