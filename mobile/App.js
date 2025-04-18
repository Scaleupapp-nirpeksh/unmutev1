import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PhoneScreen from "./src/screens/PhoneScreen";
import OtpScreen from "./src/screens/OtpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import WelcomeScreen  from  "./src/screens/WelcomeScreen";
import Toast from "react-native-toast-message";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="OTP" component={OtpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
