// File: mobile/src/screens/WelcomeScreen.js
// Purpose: Displays a branded Lottie animation on launch, then fades into the Phone login screen.

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";

export default function WelcomeScreen({ navigation }) {
  // Animated opacity value starting at 0 (invisible)
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade the animation container in over 600ms
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // After fade‑in completes, wait 800ms then navigate to PhoneScreen
      setTimeout(() => navigation.replace("Phone"), 800);
    });
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animationWrapper, { opacity }]}>
        <LottieView
          source={require("../../assets/animation.json")}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6A4DFF",             // Brand purple background
    justifyContent: "center",
    alignItems: "center",
  },
  animationWrapper: {
    width: 200,
    height: 200,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
});
