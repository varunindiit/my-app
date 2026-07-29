import React from "react";
import { TouchableOpacity, View, StyleProp, ViewStyle } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { SIZES, SPACING, makeStyles, useTheme } from "@/theme";
import RNText from "../Text/RNText";
import { ChevronDownIcon } from "../Icon/SvgIcons";

export interface CountryItem {
  name: string;
  code: string;
  flag: string;
}

interface CountryDropdownProps {
  value: CountryItem;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  compact?: boolean;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  value,
  onPress,
  containerStyle,
  compact,
}) => {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Country: ${value.name} (${value.code})`}
      style={[styles.container, containerStyle]}
    >
      <RNText size={18} style={styles.flag}>
        {value.flag}
      </RNText>
      <RNText size={14} font="medium" color={colors.text}>
        {value.code}
      </RNText>
      <ChevronDownIcon size={moderateScale(14)} color={colors.textMuted} />
      {!compact && (
        <View style={styles.spacer}>
          <RNText size={14} color={colors.text}>
            {value.name}
          </RNText>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CountryDropdown;

const useStyles = makeStyles((c) => ({
  container: {
    height: SIZES.inputHeight,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: c.inputBorder,
    backgroundColor: c.surface,
    paddingHorizontal: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
  },
  flag: { fontSize: moderateScale(18) },
  spacer: { flex: 1, marginLeft: moderateScale(6) },
}));
