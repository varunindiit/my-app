import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { setIsLoggedIn } from "../../redux/slice/auth";
import { storage } from "../../services/storage";
import { IS_LOGGED_IN } from "../../utils/constants";

const Login = () => {
  const dispatch = useDispatch();

  const onLogin = () => {
    // Persist + flip auth state. The protected guard in the root layout
    // mounts the (tabs) flow automatically.
    storage.set(IS_LOGGED_IN, true);
    dispatch(setIsLoggedIn(true));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>

      <Pressable style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
    </View>
  );
};

export default Login;

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
    backgroundColor: "#E87C3E",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
