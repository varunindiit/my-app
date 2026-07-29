import React from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { SPACING, makeStyles, useTheme } from "@/theme";
import RNText from "../Text/RNText";
import { CloseIcon, CloudUploadIcon } from "../Icon/SvgIcons";
import { useLanguage } from "@/localization";

interface UploadBoxProps {
  title: string;
  hint?: string;
  imageUri?: string | null;
  onPress?: () => void;
  onRemove?: () => void;
  height?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Dashed upload card for document / image capture flows. Shows an upload
 * prompt when empty and an image preview with a remove action once filled.
 */
const UploadBox: React.FC<UploadBoxProps> = ({
  title,
  hint,
  imageUri,
  onPress,
  onRemove,
  height = moderateScale(130),
  containerStyle,
}) => {
  const { t } = useLanguage();
  const styles = useStyles();
  const { colors } = useTheme();
  const hintText = hint ?? t("common.uploadFormatsHint");

  if (imageUri) {
    return (
      <View style={[styles.box, styles.filled, { height }, containerStyle]}>
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          accessibilityIgnoresInvertColors
        />
        <TouchableOpacity
          style={styles.remove}
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${title}`}
        >
          <CloseIcon size={moderateScale(14)} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={hintText}
      style={[styles.box, { height }, containerStyle]}
    >
      <CloudUploadIcon size={moderateScale(28)} color={colors.primary} />
      <RNText font="bold" size={14} color={colors.text} style={styles.title}>
        {title}
      </RNText>
      {hintText ? (
        <RNText size={12} color={colors.textSecondary} style={styles.hint}>
          {hintText}
        </RNText>
      ) : null}
    </TouchableOpacity>
  );
};

export default UploadBox;

const useStyles = makeStyles((c) => ({
  box: {
    borderRadius: SPACING.radiusLg,
    borderWidth: 1.5,
    borderColor: c.primary,
    borderStyle: "dashed",
    backgroundColor: c.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(16),
  },
  filled: {
    overflow: "hidden",
    backgroundColor: c.surfaceMuted,
  },
  title: { marginTop: moderateScale(10) },
  hint: { marginTop: moderateScale(4) },
  remove: {
    position: "absolute",
    top: moderateScale(8),
    right: moderateScale(8),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
  },
}));
