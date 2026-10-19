# Meal Planner

Plan a week of dinners from a recipe library, then turn them into a grocery list for King Soopers.

## What it does so far

- **Recipes**: 12 recipes from different cuisines, with search and cuisine filters.
- **Week**: fill 5 or 7 days with recipes, or tap "Surprise me" to fill empty days with something new.
- **Groceries**: pick all or some of your planned meals and get one combined shopping list. Untick anything you already have.

Coming next: sending the shopping list straight to your King Soopers cart.

## Running it on your phone

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
