import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { SPACING, useTheme } from "@/theme";
import RNText from "../Text/RNText";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  variant?: "filled" | "outline" | "soft";
}

const Chip: React.FC<ChipProps> = ({
  label,
  active,
  onPress,
  icon,
  size = "md",
  variant = "outline",
}) => {
  const { colors } = useTheme();

  const bg = active
    ? colors.primary
    : variant === "soft"
      ? colors.primaryFaint
      : variant === "filled"
        ? colors.primaryLight
        : colors.surface;
  const border = active
    ? colors.primary
    : variant === "outline"
      ? colors.inputBorder
      : "transparent";
  const color = active ? colors.textOnPrimary : colors.text;

  const Comp = onPress ? Pressable : View;
  return (
    <Comp
      onPress={onPress}
      {...(onPress
        ? {
            accessibilityRole: "button" as const,
            accessibilityState: { selected: Boolean(active) },
          }
        : {})}
      style={[
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      {icon}
      <RNText font={active ? "semibold" : "medium"} size={13} color={color}>
        {label}
      </RNText>
    </Comp>
  );
};

export default Chip;

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    borderRadius: SPACING.radiusPill,
    borderWidth: 1,
  },
  md: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
  },
  sm: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
  },
});
