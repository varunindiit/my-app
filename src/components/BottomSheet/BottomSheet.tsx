import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Modal } from "react-native-reanimated-modal";
import { moderateScale } from "react-native-size-matters";
import { SPACING, makeStyles, useTheme } from "@/theme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  dismissOnBackdropPress?: boolean;
  showHandle?: boolean;
  animationInTiming?: number;
  backdropOpacity?: number;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  contentStyle,
  dismissOnBackdropPress = true,
  showHandle = true,
  animationInTiming = 280,
  backdropOpacity = 0.5,
}) => {
  const styles = useStyles();
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      style={styles.modal}
      animation={{ type: "slide", duration: animationInTiming }}
      backdrop={{
        enabled: true,
        color: "#000000",
        // A 50% scrim over an already-dark background reads as muddy rather
        // than dimmed, so lean harder on it in dark mode.
        opacity: isDark ? Math.min(backdropOpacity + 0.2, 0.85) : backdropOpacity,
      }}
      swipe={{ directions: ["down"], threshold: 150 }}
      onBackdropPress={dismissOnBackdropPress ? onClose : false}
      onHide={onClose}
    >
      <View style={[styles.sheet, contentStyle]}>
        {showHandle && <View style={styles.handle} />}
        {children}
      </View>
    </Modal>
  );
};

export default BottomSheet;

const useStyles = makeStyles((c) => ({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    backgroundColor: c.overlay,
  },
  sheet: {
    backgroundColor: c.surface,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    borderTopLeftRadius: SPACING.radiusXxl,
    borderTopRightRadius: SPACING.radiusXxl,
  },
  handle: {
    alignSelf: "center",
    width: moderateScale(40),
    height: moderateScale(4),
    backgroundColor: c.border,
    borderRadius: moderateScale(2),
    marginBottom: SPACING.lg,
  },
}));
