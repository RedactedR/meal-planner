import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

// A small message that slides up for a moment, e.g. "Added Tacos to Tuesday".

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const colors = useTheme();
  const [message, setMessage] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const show = useCallback(
    (text) => {
      clearTimeout(timer.current);
      setMessage(text);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
          setMessage(null)
        );
      }, 2200);
    },
    [anim]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message && (
        <View pointerEvents="none" style={styles.wrap}>
          <Animated.View
            style={[
              styles.toast,
              { backgroundColor: colors.toast },
              {
                opacity: anim,
                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              },
            ]}
          >
            <Text style={[styles.text, { color: colors.onToast }]}>{message}</Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 110, alignItems: 'center', zIndex: 1000, elevation: 1000 },
  toast: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
