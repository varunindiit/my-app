import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { moderateScale } from "react-native-size-matters";
import { CameraIcon, GalleryIcon } from "../Icon/SvgIcons";
import { SPACING, THEME } from "../../theme";
import { showToast } from "../../utils/functions";
import { useLanguage } from "../../localization";
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
      <RNText font="semibold" size={18} color={THEME.text}>
        {titleText}
      </RNText>
      <RNText size={12} color={THEME.textMuted} style={styles.subtitle}>
        {subtitleText}
      </RNText>

      <View style={styles.card}>
        <Row
          icon={
            <CameraIcon size={moderateScale(20)} color={THEME.primary} />
          }
          label={t("imagePicker.openCamera")}
          caption={t("imagePicker.openCameraCaption")}
          onPress={openCamera}
          disabled={!!busy}
        />
        <View style={styles.divider} />
        <Row
          icon={
            <GalleryIcon size={moderateScale(20)} color={THEME.primary} />
          }
          label={t("imagePicker.chooseFromGallery")}
          caption={t("imagePicker.galleryCaption")}
          onPress={openGallery}
          disabled={!!busy}
        />
      </View>

      <Pressable onPress={onClose} style={styles.cancel}>
        <RNText font="semibold" size={15} color={THEME.text}>
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
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={[styles.row, disabled && styles.rowDisabled]}
  >
    <View style={styles.iconBubble}>{icon}</View>
    <View style={styles.rowBody}>
      <RNText font="semibold" size={14} color={THEME.text}>
        {label}
      </RNText>
      <RNText size={11} color={THEME.textMuted} style={styles.caption}>
        {caption}
      </RNText>
    </View>
  </Pressable>
);

export default ImagePickerSheet;

const styles = StyleSheet.create({
  subtitle: { marginTop: moderateScale(4), marginBottom: SPACING.lg },
  card: {
    backgroundColor: THEME.backgroundAlt,
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
    backgroundColor: THEME.divider,
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
    backgroundColor: THEME.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: {
    marginTop: SPACING.md,
    height: moderateScale(52),
    borderRadius: SPACING.radiusPill,
    backgroundColor: THEME.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});
