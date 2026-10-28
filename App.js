import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RecipesScreen from './src/screens/RecipesScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import GroceryScreen from './src/screens/GroceryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import TodayScreen from './src/screens/TodayScreen';
import RecipeDetail from './src/components/RecipeDetail';
import { ToastProvider } from './src/components/Toast';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AppStateProvider, useAppState } from './src/AppState';
import { ThemeContext, palettes, useStyles } from './src/theme';

const TABS = [
  { key: 'recipes', label: 'Recipes', icon: '📖' },
  { key: 'planner', label: 'Week', icon: '📅' },
  { key: 'today', label: 'Today', icon: '💪' },
  { key: 'kitchen', label: 'Kitchen', icon: '🏠' },
  { key: 'grocery', label: 'Groceries', icon: '🛒' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppStateProvider>
          <ThemedApp />
        </AppStateProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function ThemedApp() {
  const { settings } = useAppState();
  const system = useColorScheme();
  const mode = settings.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.theme;
  const colors = palettes[mode];

  return (
    <ThemeContext.Provider value={colors}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ToastProvider>
        <Main />
      </ToastProvider>
    </ThemeContext.Provider>
  );
}

function Main() {
  const styles = useStyles(makeStyles);
  const { loaded } = useAppState();
  const [tab, setTab] = useState('recipes');
  const [openRecipe, setOpenRecipe] = useState(null);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {!loaded ? (
          <ActivityIndicator style={{ marginTop: 80 }} />
        ) : tab === 'recipes' ? (
          <RecipesScreen onOpenRecipe={setOpenRecipe} onGoToKitchen={() => setTab('kitchen')} />
        ) : tab === 'planner' ? (
          <PlannerScreen onOpenRecipe={setOpenRecipe} />
        ) : tab === 'today' ? (
          <TodayScreen onOpenRecipe={setOpenRecipe} />
        ) : tab === 'kitchen' ? (
          <KitchenScreen onOpenRecipe={setOpenRecipe} />
        ) : tab === 'grocery' ? (
          <GroceryScreen />
        ) : (
          <SettingsScreen />
        )}
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

      <RecipeDetail recipe={openRecipe} onClose={() => setOpenRecipe(null)} />
    </View>
  );
}

const makeStyles = (c) => ({
  root: { flex: 1, backgroundColor: c.background },
  tabBar: { flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 11, color: c.muted, marginTop: 2, fontWeight: '600' },
  tabLabelActive: { color: c.primary },
});
