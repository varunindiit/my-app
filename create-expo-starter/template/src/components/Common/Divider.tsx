import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/theme";

interface DividerProps {
  color?: string;
  thickness?: number;
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
}

const Divider: React.FC<DividerProps> = ({
  color,
  thickness = 1,
  style,
  vertical,
}) => {
  const { colors } = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        vertical ? styles.vertical : styles.horizontal,
        vertical ? { width: thickness } : { height: thickness },
        { backgroundColor: color ?? colors.divider },
        style,
      ]}
    />
  );
};

export default Divider;

const styles = StyleSheet.create({
  vertical: { height: "100%" },
  horizontal: { width: "100%" },
});
