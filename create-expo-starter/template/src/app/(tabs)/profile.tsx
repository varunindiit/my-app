import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { setIsLoggedIn } from "../../redux/slice/auth";
import { storage } from "../../services/storage";
import { THEME } from "../../theme";
import { IS_LOGGED_IN } from "../../utils/constants";

const Profile = () => {
  const dispatch = useDispatch();

  const onLogout = () => {
    // Clear + flip auth state. The protected guard returns to the (auth) flow.
    storage.set(IS_LOGGED_IN, false);
    dispatch(setIsLoggedIn(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      <Pressable style={styles.button} onPress={onLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
  },
  button: {
    backgroundColor: THEME.danger,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: THEME.textOnPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
