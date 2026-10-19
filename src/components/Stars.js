import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';

// Shows 1–5 stars. Pass onRate to let the user tap a star to rate.
export default function Stars({ value = 0, size = 14, onRate }) {
  const colors = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: onRate ? 6 : 1 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Text style={{ fontSize: size, color: n <= value ? colors.accent : colors.border }}>★</Text>
        );
        return onRate ? (
          <Pressable key={n} onPress={() => onRate(n === value ? 0 : n)} hitSlop={6}>
            {star}
          </Pressable>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
    </View>
  );
}
