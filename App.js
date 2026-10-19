import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RecipesScreen from './src/screens/RecipesScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import GroceryScreen from './src/screens/GroceryScreen';
import RecipeDetail from './src/components/RecipeDetail';
import { usePlan } from './src/usePlan';
import { colors } from './src/theme';

const TABS = [
  { key: 'recipes', label: 'Recipes', icon: '📖' },
  { key: 'planner', label: 'Week', icon: '📅' },
  { key: 'grocery', label: 'Groceries', icon: '🛒' },
];

export default function App() {
  const [tab, setTab] = useState('recipes');
  const [openRecipe, setOpenRecipe] = useState(null);
  const planState = usePlan();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1 }}>
          {!planState.loaded ? (
            <ActivityIndicator style={{ marginTop: 80 }} color={colors.primary} />
          ) : tab === 'recipes' ? (
            <RecipesScreen onOpenRecipe={setOpenRecipe} />
          ) : tab === 'planner' ? (
            <PlannerScreen planState={planState} onOpenRecipe={setOpenRecipe} />
          ) : (
            <GroceryScreen planState={planState} />
          )}
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.tabBar} edges={['bottom']}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab}>
              <Text style={[styles.tabIcon, !active && { opacity: 0.45 }]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </SafeAreaView>

      <RecipeDetail
        recipe={openRecipe}
        onClose={() => setOpenRecipe(null)}
        days={planState.days}
        meals={planState.plan.meals}
        onAddToDay={planState.setMeal}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: '600' },
  tabLabelActive: { color: colors.primary },
});
