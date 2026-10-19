import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Everything the app remembers between launches: the week plan,
// settings and the user's own recipe ratings.

const STORAGE_KEY = 'meal-planner/state/v2';
const OLD_PLAN_KEY = 'meal-planner/plan/v1';

export const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_NAMES = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};
export const PORTION_OPTIONS = [1, 2, 4, 6];

const DEFAULT_STATE = {
  plan: { dayCount: 5, meals: {} },
  settings: {
    theme: 'system', // 'system' | 'light' | 'dark'
    portions: 4, // people per meal
    balancedOnly: false,
    allergens: [], // keys from ALLERGENS
    avoid: [], // free-text foods to never suggest
  },
  ratings: {}, // { recipeId: 1..5 }
};

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setState({
            plan: { ...DEFAULT_STATE.plan, ...parsed.plan },
            settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
            ratings: { ...parsed.ratings },
          });
        } else {
          const oldPlan = await AsyncStorage.getItem(OLD_PLAN_KEY);
          if (oldPlan) {
            setState((s) => ({ ...s, plan: { ...s.plan, ...JSON.parse(oldPlan) } }));
          }
        }
      } catch {
        // Start fresh if saved data can't be read.
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const { plan, settings, ratings } = state;
  const days = ALL_DAYS.slice(0, plan.dayCount);

  const actions = {
    setMeal(day, recipeId) {
      setState((s) => ({ ...s, plan: { ...s.plan, meals: { ...s.plan.meals, [day]: recipeId } } }));
    },
    setMeals(meals) {
      setState((s) => ({ ...s, plan: { ...s.plan, meals: { ...s.plan.meals, ...meals } } }));
    },
    setDayCount(dayCount) {
      setState((s) => ({ ...s, plan: { ...s.plan, dayCount } }));
    },
    clearWeek() {
      setState((s) => ({ ...s, plan: { ...s.plan, meals: {} } }));
    },
    updateSettings(changes) {
      setState((s) => ({ ...s, settings: { ...s.settings, ...changes } }));
    },
    rate(recipeId, stars) {
      setState((s) => ({ ...s, ratings: { ...s.ratings, [recipeId]: stars } }));
    },
  };

  const value = { loaded, plan, days, settings, ratings, ...actions };
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  return useContext(AppStateContext);
}
