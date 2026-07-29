import { StyleSheet, View } from "react-native";
import { Link, Stack } from "expo-router";

import { RNText } from "@/components";
import { SPACING, useTheme } from "@/theme";

/**
 * Rendered for any URL that doesn't match a route — a mistyped deep link, a
 * stale push-notification target, an old universal link. Always give people a
 * way home; expo-router's default `Unmatched` screen is a dead end in a
 * production build.
 */
export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <RNText font="semibold" size={22} color={colors.text}>
          This screen doesn&apos;t exist
        </RNText>
        <RNText size={14} color={colors.textSecondary} textAlign="center">
          The link you followed may be broken or the page may have been removed.
        </RNText>

        <Link href="/" style={styles.link}>
          <RNText font="semibold" size={15} color={colors.primary}>
            Go to home screen
          </RNText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  link: { marginTop: SPACING.lg, paddingVertical: SPACING.md },
});
