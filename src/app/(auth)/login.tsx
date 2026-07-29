import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { RNButton, RNInput, RNText } from "@/components";
import { useAppDispatch } from "@/redux/hooks";
import { signedIn } from "@/redux/slice/auth";
import { setProfile } from "@/redux/slice/userProfile";
import { SPACING, useTheme } from "@/theme";
import { showToast } from "@/utils/functions";

/**
 * Demo sign-in.
 *
 * Replace `fakeSignIn` with a real call — typically an RTK Query mutation
 * (`useLoginMutation`) or `api.post("/auth/login", …)`. Everything downstream
 * already works: dispatching `signedIn` persists the token to the OS keystore
 * via the auth listener, and the protected guard in the root layout swaps the
 * navigator over to the tab flow.
 */
const fakeSignIn = async (email: string) => {
  await new Promise((r) => setTimeout(r, 400));
  return {
    token: `demo-access-token.${Date.now()}`,
    refreshToken: `demo-refresh-token.${Date.now()}`,
    profile: { id: "demo-user", email, fullName: email.split("@")[0] || "there" },
  };
};

const Login = () => {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    setBusy(true);
    try {
      const { token, refreshToken, profile } = await fakeSignIn(email.trim());
      dispatch(setProfile(profile));
      dispatch(signedIn({ token, refreshToken }));
    } catch {
      showToast("Could not sign in. Please try again.", "danger");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <RNText font="bold" size={26} color={colors.text}>
        Welcome back
      </RNText>
      <RNText size={14} color={colors.textSecondary} style={styles.subtitle}>
        Sign in to continue
      </RNText>

      <RNInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <RNInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
      />

      <RNButton
        title="Sign in"
        onPress={onLogin}
        loading={busy}
        containerStyle={styles.button}
      />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.hPadding,
    gap: SPACING.md,
  },
  subtitle: { marginBottom: SPACING.lg },
  button: { marginTop: SPACING.lg },
});
