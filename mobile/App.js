// File: mobile/App.js
// Purpose: App entry point—handles initial route selection and navigation stack

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import PhoneScreen from "./src/screens/PhoneScreen";
import OtpScreen from "./src/screens/OtpScreen";
import CompleteProfileScreen from "./src/screens/CompleteProfileScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  // Initial route defaults to Welcome; will switch to Home if we already have a JWT
  const [initialRoute, setInitialRoute] = useState("Welcome");

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("jwt");
      if (token) {
        setInitialRoute("Home");
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Phone"   component={PhoneScreen} />
        <Stack.Screen name="OTP"     component={OtpScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="Home"    component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
