import React, { useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { moderateScale } from "react-native-size-matters";
import { CameraIcon, GalleryIcon } from "../Icon/SvgIcons";
import { SPACING, makeStyles, useTheme } from "@/theme";
import { showToast } from "@/utils/functions";
import { useLanguage } from "@/localization";
import BottomSheet from "../BottomSheet/BottomSheet";
import RNText from "../Text/RNText";

/**
 * Normalised picked-image shape. Mirrors the fields the app consumed from
 * `react-native-image-crop-picker` so existing callers keep working after the
 * move to `expo-image-picker`.
 */
export interface PickedImage {
  path: string;
  width: number;
  height: number;
  mime: string;
  size?: number;
}

export interface ImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPicked: (image: PickedImage) => void;
  title?: string;
  subtitle?: string;
  cropping?: boolean;
  circular?: boolean;
  width?: number;
  height?: number;
  compressImageQuality?: number;
}

const ImagePickerSheet: React.FC<ImagePickerSheetProps> = ({
  visible,
  onClose,
  onPicked,
  title,
  subtitle,
  cropping = true,
  circular = false,
  width = 1200,
  height = 1200,
  compressImageQuality = 0.85,
}) => {
  const { t } = useLanguage();
  const [busy, setBusy] = useState<"camera" | "gallery" | null>(null);
  const styles = useStyles();
  const { colors } = useTheme();

  const titleText = title ?? t("imagePicker.updatePhoto");
  const subtitleText = subtitle ?? t("imagePicker.subtitle");

  const baseOptions: ImagePicker.ImagePickerOptions = useMemo(
    () => ({
      mediaTypes: ["images"],
      allowsEditing: cropping,
      aspect: circular ? [1, 1] : [width, height],
      quality: compressImageQuality,
      base64: false,
    }),
    [cropping, circular, width, height, compressImageQuality],
  );

  const handleResult = useCallback(
    (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      onPicked({
        path: asset.uri,
        width: asset.width,
        height: asset.height,
        mime: asset.mimeType ?? "image/jpeg",
        size: asset.fileSize,
      });
      onClose();
    },
    [onPicked, onClose],
  );

  const openCamera = useCallback(async () => {
    if (busy) return;
    setBusy("camera");
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        showToast(t("imagePicker.permissionDenied"), "warning");
        return;
      }
      handleResult(await ImagePicker.launchCameraAsync(baseOptions));
    } catch {
      showToast(t("common.somethingWrong"), "danger");
    } finally {
      setBusy(null);
    }
  }, [busy, baseOptions, handleResult, t]);

  const openGallery = useCallback(async () => {
    if (busy) return;
    setBusy("gallery");
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast(t("imagePicker.permissionDenied"), "warning");
        return;
      }
      handleResult(await ImagePicker.launchImageLibraryAsync(baseOptions));
    } catch {
      showToast(t("common.somethingWrong"), "danger");
    } finally {
      setBusy(null);
    }
  }, [busy, baseOptions, handleResult, t]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <RNText font="semibold" size={18} color={colors.text}>
        {titleText}
      </RNText>
      <RNText size={12} color={colors.textMuted} style={styles.subtitle}>
        {subtitleText}
      </RNText>

      <View style={styles.card}>
        <Row
          icon={
            <CameraIcon size={moderateScale(20)} color={colors.primary} />
          }
          label={t("imagePicker.openCamera")}
          caption={t("imagePicker.openCameraCaption")}
          onPress={openCamera}
          disabled={!!busy}
        />
        <View style={styles.divider} />
        <Row
          icon={
            <GalleryIcon size={moderateScale(20)} color={colors.primary} />
          }
          label={t("imagePicker.chooseFromGallery")}
          caption={t("imagePicker.galleryCaption")}
          onPress={openGallery}
          disabled={!!busy}
        />
      </View>

      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        style={styles.cancel}
      >
        <RNText font="semibold" size={15} color={colors.text}>
          {t("common.cancel")}
        </RNText>
      </Pressable>
    </BottomSheet>
  );
};

const Row = ({
  icon,
  label,
  caption,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  caption: string;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={caption}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={[styles.row, disabled && styles.rowDisabled]}
    >
      <View style={styles.iconBubble}>{icon}</View>
      <View style={styles.rowBody}>
        <RNText font="semibold" size={14} color={colors.text}>
          {label}
        </RNText>
        <RNText size={11} color={colors.textMuted} style={styles.caption}>
          {caption}
        </RNText>
      </View>
    </Pressable>
  );
};

export default ImagePickerSheet;

const useStyles = makeStyles((c) => ({
  subtitle: { marginTop: moderateScale(4), marginBottom: SPACING.lg },
  card: {
    backgroundColor: c.backgroundAlt,
    borderRadius: SPACING.radiusLg,
    padding: moderateScale(6),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(14),
    gap: moderateScale(14),
    borderRadius: SPACING.radiusMd,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: c.divider,
    marginHorizontal: moderateScale(10),
  },
  rowBody: {
    flex: 1,
  },
  caption: {
    marginTop: moderateScale(2),
  },
  iconBubble: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: c.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: {
    marginTop: SPACING.md,
    height: moderateScale(52),
    borderRadius: SPACING.radiusPill,
    backgroundColor: c.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
}));
