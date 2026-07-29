import React from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { useNavigation } from "expo-router";
import { SPACING, makeStyles, useTheme } from "@/theme";
import RNText from "../Text/RNText";
import BackIcon from "@/assets/svg/back.svg";

const AUTH_BG: ImageSourcePropType = require("@/assets/image/BackGroundAuth.png");

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  rightLabel?: string;
  rightColor?: string;
  onRightPress?: () => void;
  showBack?: boolean;
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  withBackground?: boolean;
  backgroundSource?: ImageSourcePropType;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  rightLabel,
  rightColor,
  onRightPress,
  showBack,
  scrollable = true,
  contentStyle,
  withBackground = true,
  backgroundSource,
}) => {
  const nav = useNavigation();
  const styles = useStyles();
  const { colors } = useTheme();

  const inner = (
    <View style={[styles.body, contentStyle]}>
      {title ? (
        <View style={styles.titleBlock}>
          <RNText font="bold" size={24} color={colors.text}>
            {title}
          </RNText>
          {subtitle ? (
            <RNText
              size={13}
              color={colors.textSecondary}
              style={styles.subtitle}
            >
              {subtitle}
            </RNText>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  const content = (
    <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
        {(showBack || rightLabel) && (
          <View style={styles.topBar}>
            {showBack ? (
              <TouchableOpacity
                onPress={() => nav.canGoBack() && nav.goBack()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={styles.backBtn}
              >
                <BackIcon
                  width={moderateScale(22)}
                  height={moderateScale(22)}
                  color={colors.text}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtn} />
            )}
            <View style={styles.topBarSpacer} />
            {rightLabel ? (
              <TouchableOpacity onPress={onRightPress} hitSlop={10}>
                <RNText font="medium" size={14} color={rightColor ?? colors.primary}>
                  {rightLabel}
                </RNText>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {scrollable ? (
          <KeyboardAwareScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bottomOffset={moderateScale(35)}
          >
            {inner}
          </KeyboardAwareScrollView>
        ) : (
          inner
        )}
      </SafeAreaView>
  );

  if (withBackground) {
    return (
      <ImageBackground
        source={backgroundSource ?? AUTH_BG}
        style={styles.flex}
        resizeMode="cover"
      >
        {content}
      </ImageBackground>
    );
  }
  return (
    <View style={[styles.flex, styles.plainBg]}>
      {content}
    </View>
  );
};

export default AuthLayout;

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  topBarSpacer: { flex: 1 },
  plainBg: { backgroundColor: c.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.hPadding,
    paddingTop: moderateScale(4),
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: "flex-start",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: SPACING.hPadding,
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(24),
    flexGrow: 1,
  },
  titleBlock: {
    marginBottom: moderateScale(20),
  },
  subtitle: {
    marginTop: moderateScale(6),
    lineHeight: moderateScale(20),
  },
}));
