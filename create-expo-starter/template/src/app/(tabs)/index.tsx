import { ScrollView, View } from "react-native";
// #if gallery
import { Link } from "expo-router";
// #endif

import { Card, Chip, RNText, StatusBadge } from "@/components";
import { useAppSelector } from "@/redux/hooks";
import { Config } from "@/services";
import { SPACING, makeStyles, useTheme } from "@/theme";

const Home = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const profile = useAppSelector((s) => s.userProfile.profile);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <RNText size={13} color={colors.textSecondary}>
          Welcome back
        </RNText>
        <RNText font="bold" size={26} color={colors.text}>
          {profile.fullName || "there"}
        </RNText>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <RNText font="semibold" size={15} color={colors.text}>
            Environment
          </RNText>
          <StatusBadge
            label={Config.appEnv}
            tone={Config.isProduction ? "success" : "warning"}
            dot
          />
        </View>
        <RNText size={12} color={colors.textMuted}>
          API base URL: {Config.coreAPI}
        </RNText>
        <RNText size={12} color={colors.textMuted}>
          Edit `.env` to point this at your own backend.
        </RNText>
      </Card>

      <Card style={styles.card}>
        <RNText font="semibold" size={15} color={colors.text}>
          What&apos;s wired up
        </RNText>
        <View style={styles.chips}>
          <Chip label="expo-router" variant="soft" />
          <Chip label="Redux Toolkit" variant="soft" />
          <Chip label="RTK Query" variant="soft" />
          <Chip label="i18next" variant="soft" />
          <Chip label="Dark mode" variant="soft" />
          <Chip label="SecureStore" variant="soft" />
        </View>
        {/* #if gallery */}
        <Link href="/(tabs)/components" style={styles.link}>
          <RNText font="semibold" size={14} color={colors.primary}>
            Browse the component library →
          </RNText>
        </Link>
        {/* #endif */}
      </Card>
    </ScrollView>
  );
};

export default Home;

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.hPadding,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.huge * 2,
    gap: SPACING.lg,
  },
  header: { gap: SPACING.xxs },
  card: { gap: SPACING.sm },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  link: { marginTop: SPACING.sm },
}));
