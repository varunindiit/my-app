import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { SIZES, SPACING, useTheme, type ThemeColors } from "@/theme";
import RNText from "../Text/RNText";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface RNButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  height?: number;
  textSize?: number;
  /** Defaults to `title`. Required when the button renders only an icon. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Derived from the live palette rather than frozen at module scope, so button
// colours follow the theme.
const variantStyles = (
  c: ThemeColors,
): Record<Variant, { bg: string; border: string; color: string }> => ({
  primary: { bg: c.primary, border: c.primary, color: c.textOnPrimary },
  secondary: { bg: c.primaryLight, border: c.primaryLight, color: c.primary },
  outline: { bg: "transparent", border: c.primary, color: c.primary },
  ghost: { bg: "transparent", border: "transparent", color: c.primary },
  danger: { bg: c.dangerLight, border: c.dangerLight, color: c.danger },
});

const RNButton: React.FC<RNButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  containerStyle,
  textStyle,
  leftIcon,
  rightIcon,
  children,
  height = SIZES.buttonHeight,
  textSize = 16,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const onPressIn = useCallback(() => {
    scale.set(withSpring(0.97, { damping: 18, stiffness: 220 }));
  }, [scale]);
  const onPressOut = useCallback(() => {
    scale.set(withSpring(1, { damping: 18, stiffness: 220 }));
  }, [scale]);

  const v = useMemo(() => variantStyles(colors)[variant], [colors, variant]);
  const isDisabled = Boolean(disabled || loading);

  const inner =
    children ??
    (title ? (
      <View style={styles.contentRow}>
        {leftIcon}
        <RNText font="semibold" size={textSize} color={v.color} style={textStyle}>
          {title}
        </RNText>
        {rightIcon}
      </View>
    ) : null);

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      // `busy` makes screen readers announce the loading state instead of
      // silently ignoring taps.
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      style={[
        styles.shell,
        {
          height,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: variant === "outline" ? 1.2 : 0,
          opacity: disabled ? 0.55 : 1,
        },
        styles.center,
        containerStyle,
        animatedStyle,
      ]}
    >
      {loading ? <ActivityIndicator color={v.color} /> : inner}
    </AnimatedPressable>
  );
};

export default RNButton;

const styles = StyleSheet.create({
  shell: {
    borderRadius: SPACING.radiusPill,
    overflow: "hidden",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
  },
});
