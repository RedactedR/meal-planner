// Prints a Snack link that loads every app file straight from GitHub.
// Run: node scripts/snack-link.js
const { execSync } = require('child_process');
const files = ['App.js', ...execSync('git ls-files src').toString().trim().split('\n')];
const base = 'https://raw.githubusercontent.com/RedactedR/meal-planner/main/';
const map = {};
for (const f of files) map[f] = { type: 'CODE', url: base + f };
const deps = '@react-native-async-storage/async-storage,react-native-safe-area-context,expo-status-bar,react-native-webview';
console.log(
  'https://snack.expo.dev/?name=' + encodeURIComponent('Meal Planner') +
  '&dependencies=' + encodeURIComponent(deps) +
  '&files=' + encodeURIComponent(JSON.stringify(map))
);
