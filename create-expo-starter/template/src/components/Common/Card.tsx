import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { makeStyles, SPACING, useTheme } from "@/theme";

interface CardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  bg?: string;
  radius?: number;
  shadow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding,
  bg,
  radius = SPACING.radiusLg,
  shadow = false,
}) => {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        shadow && styles.shadow,
        {
          backgroundColor: bg ?? colors.surface,
          borderRadius: radius,
          padding: padding ?? SPACING.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default Card;

const useStyles = makeStyles((c) => ({
  card: { width: "100%", borderWidth: 1, borderColor: c.border },
  shadow: {
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
}));
