import { ScrollView, View } from "react-native";

import {
  Avatar,
  Card,
  Divider,
  RNButton,
  RNText,
  SegmentedControl,
} from "@/components";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signedOut } from "@/redux/slice/auth";
import { resetUserProfile } from "@/redux/slice/userProfile";
import { setMonitoringUser } from "@/services/monitoring";
import { SPACING, makeStyles, useTheme, type ThemePreference } from "@/theme";

const THEME_TABS: { key: ThemePreference; label: string }[] = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

const Profile = () => {
  const dispatch = useAppDispatch();
  const styles = useStyles();
  const { colors, preference, setPreference } = useTheme();
  const profile = useAppSelector((s) => s.userProfile.profile);

  const onLogout = () => {
    // The auth listener clears the keystore; the protected guard in the root
    // layout returns to the (auth) flow on its own.
    dispatch(signedOut());
    dispatch(resetUserProfile());
    setMonitoringUser(null);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.identity}>
        <Avatar name={profile.fullName || profile.email} size={72} ring />
        <RNText font="semibold" size={20} color={colors.text}>
          {profile.fullName || "Signed in"}
        </RNText>
        {profile.email ? (
          <RNText size={13} color={colors.textSecondary}>
            {profile.email}
          </RNText>
        ) : null}
      </View>

      <Card style={styles.card}>
        <RNText font="semibold" size={15} color={colors.text}>
          Appearance
        </RNText>
        <RNText size={12} color={colors.textMuted} style={styles.cardHint}>
          &quot;System&quot; follows your device setting.
        </RNText>
        <SegmentedControl
          tabs={THEME_TABS}
          value={preference}
          onChange={(key) => setPreference(key as ThemePreference)}
          style={styles.segmented}
        />
      </Card>

      <Divider style={styles.divider} />

      <RNButton title="Sign out" variant="danger" onPress={onLogout} />
    </ScrollView>
  );
};

export default Profile;

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.hPadding,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.huge * 2,
    gap: SPACING.lg,
  },
  identity: {
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  card: { gap: SPACING.xs },
  cardHint: { marginBottom: SPACING.sm },
  segmented: { marginTop: SPACING.xs },
  divider: { marginVertical: SPACING.sm },
}));
