// File: mobile/App.js
// Purpose: App entry point—handles initial route selection and navigation stack

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";

// Context Providers
import { AuthProvider } from "./src/context/AuthContext";
import { AppProvider } from "./src/context/AppContext";

// Auth Screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import PhoneScreen from "./src/screens/PhoneScreen";
import OtpScreen from "./src/screens/OtpScreen";
import CompleteProfileScreen from "./src/screens/CompleteProfileScreen";

// Main Screens
import HomeScreen from "./src/screens/HomeScreen";
//import VentsScreen from "./src/screens/VentsScreen";
//import JournalScreen from "./src/screens/JournalScreen";
//import MatchesScreen from "./src/screens/MatchesScreen";
//import CirclesScreen from "./src/screens/CirclesScreen";
//import ProfileScreen from "./src/screens/ProfileScreen";

// Detail Screens
import CreateVentScreen from "./src/screens/CreateVentScreen";
//import VentDetailScreen from "./src/screens/VentDetailScreen";
//import CreateJournalScreen from "./src/screens/CreateJournalScreen";
//import JournalDetailScreen from "./src/screens/JournalDetailScreen";
//import PromptsScreen from "./src/screens/PromptsScreen";
//import MatchDetailScreen from "./src/screens/MatchDetailScreen";
//import CircleDetailScreen from "./src/screens/CircleDetailScreen";

// Custom Tab Bar
import BottomTabBar from "./src/components/BottomTabBar";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigation
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <BottomTabBar {...props} currentScreen={props.state.routes[props.state.index].name} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {/*
      <Tab.Screen name="Vents" component={VentsScreen} />
  */}
      <Tab.Screen name="CreateVent" component={CreateVentScreen} options={{ tabBarButton: () => null }} />
      {/*
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
*/}
    </Tab.Navigator>
  );
}

export default function App() {
  // Initial route defaults to Welcome; will switch to Main if we already have a JWT
  const [initialRoute, setInitialRoute] = useState("Welcome");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("jwt");
        if (token) {
          setInitialRoute("Main");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <AuthProvider>
      <AppProvider>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            {/* Auth Flow */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OtpScreen} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
            
            {/* Main App Flow */}
            <Stack.Screen name="Main" component={MainTabs} />
            
            {/* Additional Screens (outside the tab navigation) */}
          {/* <Stack.Screen name="VentDetail" component={VentDetailScreen} />
            <Stack.Screen name="CreateJournal" component={CreateJournalScreen} />
            <Stack.Screen name="JournalDetail" component={JournalDetailScreen} />
            <Stack.Screen name="Prompts" component={PromptsScreen} />
            <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
            <Stack.Screen name="Circles" component={CirclesScreen} />
            <Stack.Screen name="CircleDetail" component={CircleDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
  */}
          </Stack.Navigator>
        </NavigationContainer>
        
        {/* Global Toast Message Handler */}
        <Toast />
      </AppProvider>
    </AuthProvider>
  );
}