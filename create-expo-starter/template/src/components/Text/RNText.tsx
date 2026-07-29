import React from "react";
import { Text, TextProps, TextStyle, StyleProp } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { FONTS, FontWeight } from "@/theme";
import { useThemeColors } from "@/theme/useTheme";

type FontKey = FontWeight;

interface RNTextProps extends TextProps {
  size?: number;
  font?: FontKey;
  color?: string;
  textAlign?: TextStyle["textAlign"];
  lineHeight?: number;
  letterSpacing?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Typography primitive.
 *
 * Font scaling is enabled (the platform default) so the app honours the user's
 * accessibility text-size setting, but capped via `maxFontSizeMultiplier` so
 * extreme settings cannot destroy fixed-height layouts. Pass
 * `allowFontScaling={false}` on the rare element where scaling truly cannot
 * work (e.g. text baked into a fixed-size badge).
 */
const RNText: React.FC<RNTextProps> = ({
  size = 14,
  font = "regular",
  color,
  textAlign,
  lineHeight,
  letterSpacing,
  style,
  children,
  maxFontSizeMultiplier = 1.3,
  ...rest
}) => {
  const colors = useThemeColors();
  const fontSize = moderateScale(size, 0.3);
  const fontFamily = FONTS[font] || FONTS.regular;

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
      style={[
        {
          fontFamily,
          fontSize,
          color: color ?? colors.text,
          textAlign,
          lineHeight,
          letterSpacing,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default RNText;
export type { RNTextProps };
