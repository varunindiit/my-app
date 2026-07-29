import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { useTheme } from "@/theme";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  /** Announced by screen readers in place of the surrounding label. */
  accessibilityLabel?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  value,
  onChange,
  disabled,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const tx = useSharedValue(value ? moderateScale(22) : 0);

  useEffect(() => {
    tx.value = withTiming(value ? moderateScale(22) : 0, {
      duration: 160,
      easing: Easing.out(Easing.cubic),
    });
  }, [tx, value]);

  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!value)}
      hitSlop={6}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.primary : colors.inputBorder,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Animated.View
        style={[styles.thumb, { backgroundColor: colors.tabBg }, thumb]}
      />
    </Pressable>
  );
};

export default Toggle;

const styles = StyleSheet.create({
  track: {
    width: moderateScale(48),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    padding: moderateScale(3),
    justifyContent: "center",
  },
  thumb: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(11),
  },
});
