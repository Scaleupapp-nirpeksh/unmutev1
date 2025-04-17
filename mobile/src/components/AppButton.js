import React from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function AppButton({ title, loading, disabled, onPress }) {
  return (
    <Pressable
      style={[
        styles.btn,
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#6A4DFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { color: "#fff", fontSize: 16, fontFamily: "Poppins_600SemiBold" },
});
