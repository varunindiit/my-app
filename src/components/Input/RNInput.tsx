import React, { useCallback, useState } from "react";
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { FONTS, SPACING, makeStyles, useTheme } from "@/theme";
import RNText from "../Text/RNText";
import { EyeIcon, EyeOffIcon } from "../Icon/SvgIcons";

interface RNInputProps extends TextInputProps {
  label?: string;
  error?: string;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPressRightIcon?: () => void;
  focusedBorderColor?: string;
}

const RNInput: React.FC<RNInputProps> = ({
  label,
  error,
  secure = false,
  containerStyle,
  inputContainerStyle,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  focusedBorderColor,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [secureVisible, setSecureVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const styles = useStyles();
  const { colors } = useTheme();

  const toggleSecure = useCallback(() => setSecureVisible((v) => !v), []);

  const right = secure ? (
    <TouchableOpacity
      onPress={toggleSecure}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={secureVisible ? "Hide password" : "Show password"}
    >
      {secureVisible ? (
        <EyeIcon color={colors.textMuted} />
      ) : (
        <EyeOffIcon color={colors.textMuted} />
      )}
    </TouchableOpacity>
  ) : rightIcon ? (
    <TouchableOpacity
      onPress={onPressRightIcon}
      hitSlop={10}
      disabled={!onPressRightIcon}
    >
      {rightIcon}
    </TouchableOpacity>
  ) : null;

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <RNText size={13} color={colors.textSecondary} font="medium" style={styles.label}>
          {label}
        </RNText>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? colors.danger
              : focused
                ? (focusedBorderColor ?? colors.primary)
                : colors.border,
          },
          inputContainerStyle,
        ]}
      >
        {leftIcon ? <View style={styles.left}>{leftIcon}</View> : null}
        <TextInput
          accessibilityLabel={label}
          maxFontSizeMultiplier={1.3}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={secure && !secureVisible}
          style={[styles.input, style]}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {error ? (
        <RNText size={11} color={colors.danger} style={styles.errorText}>
          {error}
        </RNText>
      ) : null}
    </View>
  );
};

export default React.memo(RNInput);

const useStyles = makeStyles((c) => ({
  wrap: { width: "100%" },
  label: { marginBottom: moderateScale(6) },
  inputContainer: {
    height: moderateScale(50),
    paddingHorizontal: moderateScale(18),
    borderRadius: SPACING.radiusPill,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: c.text,
    fontFamily: FONTS.regular,
    fontSize: moderateScale(14, 0.3),
    paddingVertical: 0,
  },
  left: { marginRight: moderateScale(10) },
  right: { marginLeft: moderateScale(10) },
  errorText: { marginTop: moderateScale(6) },
}));
