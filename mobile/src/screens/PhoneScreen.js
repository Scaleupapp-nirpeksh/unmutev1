import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import AppLoading from "expo-app-loading";
import AppButton from "../components/AppButton";
import { API_URL } from "@env";

// 👉 Google‑fonts hook
import { useFonts as usePoppins, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { useFonts as useInter, Inter_500Medium } from "@expo-google-fonts/inter";

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // load both font families
  const [poppinsLoaded] = usePoppins({ Poppins_600SemiBold });
  const [interLoaded] = useInter({ Inter_500Medium });
  if (!poppinsLoaded || !interLoaded) return <AppLoading />;

  const sendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/request-otp`, { phone });
      navigation.navigate("OTP", { phone });
    } catch {
      Toast.show({ type: "error", text1: "Failed to send OTP" });
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
          placeholder="Enter 10‑digit mobile number"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />
        <AppButton
          title="Send OTP"
          loading={loading}
          disabled={phone.length !== 10}
          onPress={sendOtp}
        />
      </View>
      {/* Toast container */}
      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9FF",
  },
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
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    marginBottom: 12,
  },
});
