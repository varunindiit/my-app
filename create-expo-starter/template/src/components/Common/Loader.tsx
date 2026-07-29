import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";

interface LoaderProps {
  size?: "small" | "large";
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = "large", color }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.center}>
      <ActivityIndicator size={size} color={color ?? colors.primary} />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
