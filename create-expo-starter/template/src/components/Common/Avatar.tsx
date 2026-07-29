import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/theme";
import RNText from "../Text/RNText";

interface AvatarProps {
  uri?: string;
  source?: ImageSourcePropType;
  size?: number;
  name?: string;
  style?: StyleProp<ViewStyle>;
  ring?: boolean;
}

const initials = (n?: string) =>
  (n || "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Avatar: React.FC<AvatarProps> = ({
  uri,
  source,
  size = 44,
  name,
  style,
  ring,
}) => {
  const { colors } = useTheme();
  const radius = size / 2;
  const wrap = [
    {
      width: size,
      height: size,
      borderRadius: radius,
      backgroundColor: colors.primaryLight,
    },
    ring && { borderWidth: 2, borderColor: colors.surface },
    styles.center,
    style,
  ];

  if (uri || source) {
    return (
      <View style={wrap}>
        <Image
          source={source ?? { uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          accessibilityIgnoresInvertColors
          accessible={Boolean(name)}
          accessibilityLabel={name ? `${name}'s avatar` : undefined}
        />
      </View>
    );
  }

  return (
    <View style={wrap}>
      <RNText
        font="semibold"
        size={Math.round(size * 0.36)}
        color={colors.primary}
      >
        {initials(name) || "U"}
      </RNText>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
