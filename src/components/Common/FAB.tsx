import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { useTheme } from "@/theme";
import { PlusIcon } from "../Icon/SvgIcons";

interface FABProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
  children?: React.ReactNode;
  /** Screen-reader label. Defaults to a generic "Add" since the icon is decorative. */
  accessibilityLabel?: string;
}

const FAB: React.FC<FABProps> = ({
  onPress,
  style,
  size = 56,
  children,
  accessibilityLabel = "Add",
}) => {
  const { colors } = useTheme();
  const dim = moderateScale(size);
  const ringPad = moderateScale(6);
  const outerDim = dim + ringPad * 2;

  return (
    <View
      style={[
        styles.halo,
        { backgroundColor: colors.primaryLight },
        {
          width: outerDim,
          height: outerDim,
          borderRadius: outerDim / 2,
          padding: ringPad,
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.fab,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
      >
        {children ?? (
          <PlusIcon size={moderateScale(24)} color={colors.textOnPrimary} />
        )}
      </Pressable>
    </View>
  );
};

export default FAB;

const styles = StyleSheet.create({
  halo: {
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
