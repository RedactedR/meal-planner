import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Saves the weekly plan on the phone so it is still there next time
// the app opens.

const STORAGE_KEY = 'meal-planner/plan/v1';

export const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_PLAN = {
  dayCount: 5, // 5 = weekdays only, 7 = full week
  meals: {}, // e.g. { Mon: 'beef-tacos', Tue: null }
};

export function usePlan() {
  const [plan, setPlan] = useState(EMPTY_PLAN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setPlan({ ...EMPTY_PLAN, ...JSON.parse(saved) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plan)).catch(() => {});
  }, [plan, loaded]);

  const days = ALL_DAYS.slice(0, plan.dayCount);

  function setMeal(day, recipeId) {
    setPlan((p) => ({ ...p, meals: { ...p.meals, [day]: recipeId } }));
  }

  function setDayCount(dayCount) {
    setPlan((p) => ({ ...p, dayCount }));
  }

  function clearWeek() {
    setPlan((p) => ({ ...p, meals: {} }));
  }

  return { plan, days, loaded, setMeal, setDayCount, clearWeek };
}
