import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  duration?: number;
}

export function AnimatedNumber({ value, suffix = '', style, duration = 600 }: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(value)).current;
  const displayValue = useRef(value);
  const [, forceUpdate] = React.useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: v }) => {
      displayValue.current = Math.round(v);
      forceUpdate((n) => n + 1);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration]);

  return (
    <Animated.Text
      style={style}
      accessibilityRole="text"
      accessibilityLabel={`${displayValue.current}${suffix}`}
    >
      {displayValue.current}{suffix}
    </Animated.Text>
  );
}
