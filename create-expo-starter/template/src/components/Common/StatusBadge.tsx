import React from "react";
import { StyleSheet, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { SPACING, useTheme, type ThemeColors } from "@/theme";
import RNText from "../Text/RNText";

export type StatusTone = "success" | "warning" | "danger" | "info" | "primary";

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
}

// Built from the active palette rather than declared at module scope, so the
// badge follows the theme instead of freezing the light colours at import time.
const tonePalette = (c: ThemeColors): Record<StatusTone, { bg: string; fg: string }> => ({
  success: { bg: c.successLight, fg: c.success },
  warning: { bg: c.warningLight, fg: c.warning },
  danger: { bg: c.dangerLight, fg: c.danger },
  info: { bg: c.infoLight, fg: c.info },
  primary: { bg: c.primaryFaint, fg: c.primary },
});

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = "success",
  dot,
}) => {
  const { colors } = useTheme();
  const p = tonePalette(colors)[tone];

  return (
    <View style={[styles.badge, { backgroundColor: p.bg }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: p.fg }]} /> : null}
      <RNText font="medium" size={11} color={p.fg}>
        {label}
      </RNText>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: SPACING.radiusPill,
    alignSelf: "flex-start",
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
  },
});
