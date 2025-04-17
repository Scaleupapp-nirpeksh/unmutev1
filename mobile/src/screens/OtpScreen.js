import React, { useState } from "react";
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import AppButton from "../components/AppButton";
import { API_URL } from "@env";

export default function OtpScreen({ route, navigation }) {
  const { phone } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify`, { phone, code });
      await SecureStore.setItemAsync("jwt", data.token);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch {
      Toast.show({ type: "error", text1: "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter 6‑digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        <AppButton title="Verify" loading={loading} disabled={code.length !== 6} onPress={verify} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9F9FF" },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E3E6F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
});
