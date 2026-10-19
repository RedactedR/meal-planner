import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { catalogItem, keyOf } from './data/ingredients';

// Everything the app remembers between launches: the week plan,
// settings, the user's own recipe ratings and what's in their kitchen.

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
  inventory: {}, // { 'garlic': { name: 'Garlic', qty: 10, unit: 'cloves', category: 'produce' } }
  kitchenSetup: false, // true once the first-time kitchen inventory is done
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
            inventory: { ...parsed.inventory },
            kitchenSetup: !!parsed.kitchenSetup,
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

  const { plan, settings, ratings, inventory, kitchenSetup } = state;
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

    // Set an exact amount for one kitchen item (0 removes it).
    setInventoryQty(name, unit, qty) {
      setState((s) => ({ ...s, inventory: setQty(s.inventory, name, unit, qty) }));
    },
    // Add bought items: [{ name, unit, qty }]
    addToInventory(items) {
      setState((s) => {
        let inv = s.inventory;
        for (const i of items) {
          const cur = inv[keyOf(i.name)];
          const base = cur && cur.unit === i.unit ? cur.qty : 0;
          inv = setQty(inv, i.name, i.unit, base + i.qty);
        }
        return { ...s, inventory: inv };
      });
    },
    // Take cooked ingredients out of the kitchen: [{ name, unit, qty }]
    consumeInventory(items) {
      setState((s) => {
        let inv = s.inventory;
        for (const i of items) {
          const cur = inv[keyOf(i.name)];
          if (cur && cur.unit === i.unit) inv = setQty(inv, i.name, i.unit, cur.qty - i.qty);
        }
        return { ...s, inventory: inv };
      });
    },
    finishKitchenSetup(items) {
      setState((s) => {
        let inv = s.inventory;
        for (const i of items) inv = setQty(inv, i.name, i.unit, i.qty);
        return { ...s, inventory: inv, kitchenSetup: true };
      });
    },
  };

  const value = { loaded, plan, days, settings, ratings, inventory, kitchenSetup, ...actions };
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  return useContext(AppStateContext);
}

function setQty(inventory, name, unit, qty) {
  const key = keyOf(name);
  const next = { ...inventory };
  const rounded = Math.round(qty * 100) / 100;
  if (rounded <= 0) {
    delete next[key];
  } else {
    const info = catalogItem(name);
    next[key] = {
      name: info?.name ?? name.trim(),
      unit: info?.unit ?? unit,
      qty: rounded,
      category: info?.category ?? 'other',
    };
  }
  return next;
}
