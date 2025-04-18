// File: mobile/src/screens/OtpScreen.js
// Purpose: OTP verification with bubbles below the textbox

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Easing,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import AppButton from "../components/AppButton";
import { API_URL } from "@env";

import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useFonts, Poppins_600SemiBold, Poppins_300Light } from "@expo-google-fonts/poppins";
import { Inter_500Medium, Inter_400Regular } from "@expo-google-fonts/inter";
import AppLoading from "expo-app-loading";

const { width } = Dimensions.get("window");
const HEADER_Y = Platform.OS === "ios" ? 100 + 40 : 80 + 40;
const isIOS = Platform.OS === "ios";

// Cheerful colors with contrasting accents
const COLORS = {
  primary: "#5a8ccc",
  gradient: {
    start: "#6b95cb", 
    middle: "#7eacde",
    end: "#a7c5eb"
  },
  text: {
    light: "#e0f4ff",
    medium: "#606f7b",
  },
  card: "rgba(255, 255, 255, 0.95)",
  error: "#e98994",
  accent: "#FF7E67", // Warm coral accent
  shield: "#FFC55C", // Sunny golden shield
  success: "#7ED9A6"  // Soft mint green
};

// Positive verification messages
const VERIFY_MESSAGES = [
  "Almost there",
  "One step closer",
  "Ready when you are",
  "Just a moment away"
];

export default function OtpScreen({ route, navigation }) {
  const { phone } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verifyMsg] = useState(VERIFY_MESSAGES[Math.floor(Math.random() * VERIFY_MESSAGES.length)]);
  const [shieldState, setShieldState] = useState({
    color: COLORS.shield,
    glowOpacity: 0.4
  });
  const [bubble1Visible, setBubble1Visible] = useState(false);
  const [bubble2Visible, setBubble2Visible] = useState(false);
  const [bubble3Visible, setBubble3Visible] = useState(false);
  
  const fontMap = { 
    Poppins_600SemiBold,
    Poppins_300Light,
    Inter_500Medium,
    Inter_400Regular
  };
  
  const [fontsLoaded] = useFonts(fontMap);

  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shieldRotate = useRef(new Animated.Value(0)).current;
  const shieldScale = useRef(new Animated.Value(1)).current;
  const bubble1Scale = useRef(new Animated.Value(0)).current;
  const bubble2Scale = useRef(new Animated.Value(0)).current;
  const bubble3Scale = useRef(new Animated.Value(0)).current;
  const codeInputScale = useRef(new Animated.Value(1)).current;
  
  // Setup animations
  useEffect(() => {
    // Slow floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    
    // Entrance animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Start shield animation
    startShieldAnimation();
    
    // Start bubble animations with staggered timing
    startBubbleAnimations();
  }, []);
  
  // Shield animation
  const startShieldAnimation = () => {
    // Shield pulse animation
    const shieldPulse = () => {
      Animated.sequence([
        Animated.timing(shieldScale, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shieldScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        shieldPulse(); // Restart the animation
      });
    };
    
    // Start the pulse animation
    shieldPulse();
    
    // Change shield glow with state updates
    const shieldInterval = setInterval(() => {
      setShieldState(prev => ({
        color: prev.glowOpacity > 0.5 ? COLORS.shield : '#FFDA7B',
        glowOpacity: prev.glowOpacity > 0.5 ? 0.4 : 0.7
      }));
    }, 1500);
    
    // Gentle shield rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldRotate, {
          toValue: 0.05, // 5 degrees clockwise
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shieldRotate, {
          toValue: -0.05, // 5 degrees counter-clockwise
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => clearInterval(shieldInterval);
  };
  
  // Bubble animations with state for visibility
  const startBubbleAnimations = () => {
    // Function to animate a single bubble
    const animateBubble = (setVisible, scaleAnim, delay = 0) => {
      setTimeout(() => {
        const bubbleSequence = () => {
          setVisible(true);
          
          Animated.sequence([
            // Appear
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            // Hold
            Animated.delay(1000),
            // Disappear
            Animated.timing(scaleAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setVisible(false);
            // Wait and restart
            setTimeout(() => {
              bubbleSequence();
            }, 2000 + Math.random() * 2000); // Random delay for natural feel
          });
        };
        
        bubbleSequence();
      }, delay);
    };
    
    // Start animations with staggered delays
    animateBubble(setBubble1Visible, bubble1Scale, 500);
    animateBubble(setBubble2Visible, bubble2Scale, 1700);
    animateBubble(setBubble3Visible, bubble3Scale, 2900);
  };

  // Countdown timer
  useEffect(() => {
    setCanResend(false);
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(id);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  
  // Handle code input with animations
  const handleCodeChange = (text) => {
    // Only allow numbers
    const formattedText = text.replace(/[^0-9]/g, '');
    
    if (formattedText.length <= 6) {
      setCode(formattedText);
      
      // Create small "tap" animation on each digit entry
      Animated.sequence([
        Animated.timing(codeInputScale, {
          toValue: 1.03,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(codeInputScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Celebration animation when code is complete
      if (formattedText.length === 6 && code.length === 5) {
        // Make shield happy
        setShieldState({
          color: '#FFDA7B',
          glowOpacity: 0.9
        });
        
        // Excited shield animation
        Animated.sequence([
          Animated.timing(shieldScale, {
            toValue: 1.25,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(shieldScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Reset shield state after celebration
        setTimeout(() => {
          setShieldState({
            color: COLORS.shield,
            glowOpacity: 0.4
          });
        }, 800);
      }
    }
  };

  const verify = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify`, { phone, code });
      await SecureStore.setItemAsync("jwt", data.token);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch {
      Toast.show({ type: "error", text1: "Invalid code" });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);
    try {
      await axios.post(`${API_URL}/auth/request-otp`, { phone });
      Toast.show({ type: "success", text1: "Code sent" });
    } catch {
      Toast.show({ type: "error", text1: "Failed" });
    }
  };
  
  if (!fontsLoaded) return <AppLoading />;
  
  // Format phone for display
  const formattedPhone = `+91 ${phone.substring(0, 5)} ${phone.substring(5)}`;
  
  // Shield rotation interpolation
  const shieldRotateInterpolate = shieldRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg']
  });

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <LinearGradient 
          colors={[COLORS.gradient.start, COLORS.gradient.middle, COLORS.gradient.end]} 
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.lottieContainer}>
          <LottieView
            source={require("../../assets/relax-bg.json")}
            autoPlay
            loop
            speed={0.3}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <Animated.View style={{ 
          flex: 1, 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={isIOS ? "padding" : "position"}
            keyboardVerticalOffset={isIOS ? 0 : -HEADER_Y}
          >
            <View style={styles.header}>
              {/* Shield with glow effect */}
              <Animated.View style={[
                styles.shieldContainer,
                {
                  transform: [
                    { translateY: floatAnim },
                    { scale: shieldScale },
                    { rotate: shieldRotateInterpolate }
                  ]
                }
              ]}>
                {/* Glow effect */}
                <View style={[
                  styles.shieldGlow,
                  { opacity: shieldState.glowOpacity }
                ]} />
                
                {/* Shield icon */}
                <Ionicons name="shield-checkmark" size={48} color={shieldState.color} />
              </Animated.View>
              
              <View style={styles.phoneContainer}>
                <Text style={styles.headerText}>{formattedPhone}</Text>
              </View>
              
              <View style={styles.encouragementContainer}>
                <Text style={styles.encouragementText}>{verifyMsg}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Animated.View 
                style={[
                  styles.inputWrapper,
                  { transform: [{ scale: codeInputScale }] }
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#8795a1"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={handleCodeChange}
                />
              </Animated.View>
              
              {/* Happy bubbles - moved below the textbox */}
              <View style={styles.bubblesContainer}>
                {bubble1Visible && (
                  <Animated.View style={[
                    styles.bubble, 
                    styles.bubble1,
                    { 
                      opacity: bubble1Scale,
                      transform: [{ scale: bubble1Scale }] 
                    }
                  ]}>
                    <FontAwesome5 name="smile" size={16} color="#FF7E67" solid />
                  </Animated.View>
                )}
                
                {bubble2Visible && (
                  <Animated.View style={[
                    styles.bubble, 
                    styles.bubble2,
                    { 
                      opacity: bubble2Scale,
                      transform: [{ scale: bubble2Scale }] 
                    }
                  ]}>
                    <FontAwesome5 name="laugh" size={16} color="#7ED9A6" solid />
                  </Animated.View>
                )}
                
                {bubble3Visible && (
                  <Animated.View style={[
                    styles.bubble, 
                    styles.bubble3,
                    { 
                      opacity: bubble3Scale,
                      transform: [{ scale: bubble3Scale }] 
                    }
                  ]}>
                    <FontAwesome5 name="heart" size={14} color="#FF5E7D" solid />
                  </Animated.View>
                )}
              </View>
              
              <AppButton 
                title="Verify"
                loading={loading}
                disabled={code.length !== 6} 
                onPress={verify} 
              />
              
              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={resendOtp}>
                    <Text style={styles.resendText}>Resend code</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>Resend in {timer}s</Text>
                )}
              </View>
              
              <Text style={styles.noteText}>
                Your story is about to be heard
              </Text>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
        
        <Toast />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  flex: { 
    flex: 1,
  },
  lottieContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    opacity: 0.2,
  },
  header: {
    alignItems: "center",
    marginTop: HEADER_Y - 40,
    paddingVertical: 20,
  },
  shieldContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  shieldGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.shield,
  },
  phoneContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text.light,
  },
  encouragementContainer: {
    marginTop: 8,
  },
  encouragementText: {
    fontFamily: "Poppins_300Light",
    fontSize: 16,
    color: COLORS.text.light,
    opacity: 0.9,
  },
  card: {
    alignSelf: "center",
    width: width * 0.9,
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginTop: 20,
  },
  inputWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E5EC',
  },
  input: {
    height: 56,
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 4,
    color: COLORS.text.dark,
  },
  // Repositioned bubbles container below the input
  bubblesContainer: {
    position: 'relative',
    width: '100%',
    height: 50,
    marginBottom: 10,
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubble1: {
    left: '20%',
    top: 5,
  },
  bubble2: {
    left: '50%',
    marginLeft: -17, // Half the width to center it
    top: 0,
  },
  bubble3: {
    right: '20%',
    top: 8,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.text.medium,
    fontFamily: "Inter_400Regular",
  },
  resendText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Inter_500Medium",
  },
  noteText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: COLORS.text.medium,
    textAlign: "center",
    marginTop: 24,
    fontStyle: 'italic',
  },
});