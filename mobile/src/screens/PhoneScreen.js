// File: mobile/src/screens/PhoneScreen.js
// Purpose: Cheerful mental health focused phone verification with fixed animations

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Text,
  Keyboard,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import AppButton from "../components/AppButton";
import { API_URL } from "@env";

import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold, Poppins_300Light } from "@expo-google-fonts/poppins";
import { Inter_500Medium, Inter_400Regular } from "@expo-google-fonts/inter";
import AppLoading from "expo-app-loading";

import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");
const HEADER_Y = Platform.OS === "ios" ? 60 : 40;
const isIOS = Platform.OS === "ios";

const fontMap = { 
  Poppins_600SemiBold, 
  Poppins_300Light,
  Inter_500Medium,
  Inter_400Regular
};

// Cheerful colors with contrasting accents
const COLORS = {
  primary: "#5a8ccc",
  gradient: {
    start: "#6b95cb", 
    middle: "#7eacde",
    end: "#a7c5eb"
  },
  text: {
    dark: "#3d4852",
    medium: "#606f7b",
    light: "#8795a1"
  },
  card: "rgba(255, 255, 255, 0.97)",
  error: "#e98994",
  accent: "#FF7E67", // Warm coral accent
  heart: "#FF5E7D",   // Vibrant heartbeat color
  success: "#7ED9A6"  // Soft mint green
};

// Inspiring messages for a mental health app
const WELCOME_MESSAGES = [
  "Your voice matters",
  "Express yourself freely",
  "Find your peace",
  "Connect & heal together",
  "Begin your journey"
];

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const [welcomeMsg] = useState(WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]);
  const [heartState, setHeartState] = useState({
    color: COLORS.heart,
    glowOpacity: 0.4
  });
  
  // Animation refs
  const inputRef = useRef(null);
  const scale = useRef(new Animated.Value(0.8)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const heartbeatScale = useRef(new Animated.Value(1)).current;
  const heartRotate = useRef(new Animated.Value(0)).current;
  
  // Load fonts
  const [fontsLoaded] = useFonts(fontMap);

  // Setup initial animations
  useEffect(() => {
    // Fade in the screen content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Start heartbeat animation
    startHeartbeatAnimation();
    
    // Start logo animation
    startLogoAnimation();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.loop(
          Animated.sequence([
            Animated.timing(scale, { toValue: 0.95, duration: 3000, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 3000, useNativeDriver: true }),
          ])
        ).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.loop(
          Animated.sequence([
            Animated.timing(scale, { toValue: 1, duration: 3000, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.9, duration: 3000, useNativeDriver: true }),
          ])
        ).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Start the heartbeat animation cycle
  const startHeartbeatAnimation = () => {
    // Realistic heartbeat pattern - animation loop
    const heartbeatAnimation = () => {
      Animated.sequence([
        // First beat - expand
        Animated.timing(heartbeatScale, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        // First beat - contract
        Animated.timing(heartbeatScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        // Brief pause
        Animated.delay(200),
        // Second beat - expand
        Animated.timing(heartbeatScale, {
          toValue: 1.25,
          duration: 200,
          useNativeDriver: true,
        }),
        // Second beat - contract
        Animated.timing(heartbeatScale, {
          toValue: 0.95,
          duration: 280,
          useNativeDriver: true,
        }),
        // Rest period
        Animated.delay(1200),
      ]).start(() => {
        heartbeatAnimation(); // Restart the animation
      });
    };
    
    // Start the heartbeat loop
    heartbeatAnimation();
    
    // Control heart color and glow with state
    const heartColorInterval = setInterval(() => {
      // Change heart colors during beating
      setHeartState(prevState => {
        // Cycle between normal and intense colors
        const isIntense = prevState.glowOpacity > 0.5;
        return {
          color: isIntense ? COLORS.heart : '#FF2D55',
          glowOpacity: isIntense ? 0.4 : 0.8
        };
      });
    }, 1000);
    
    // Slight rotation to make the heart feel more alive
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartRotate, {
          toValue: 0.05, // 5 degrees clockwise
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(heartRotate, {
          toValue: -0.05, // 5 degrees counter-clockwise
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Clean up intervals when component unmounts
    return () => clearInterval(heartColorInterval);
  };

  // Format phone number as the user types
  const handlePhoneChange = (text) => {
    const formattedText = text.replace(/[^0-9]/g, '');
    
    if (formattedText.length <= 10) {
      setPhone(formattedText);
      
      if (errorMsg) setErrorMsg("");
      
      // Success animation when 10 digits are entered
      if (formattedText.length === 10 && phone.length === 9) {
        // Create a happy effect when completed
        Animated.sequence([
          Animated.timing(heartbeatScale, {
            toValue: 1.4,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(heartbeatScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Set heart to happy state
        setHeartState({
          color: '#FF2D55',
          glowOpacity: 0.9
        });
        
        // Reset heart state after a moment
        setTimeout(() => {
          setHeartState({
            color: COLORS.heart,
            glowOpacity: 0.4
          });
        }, 800);
      }
    }
  };

  const startLogoAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -5, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const sendOtp = async () => {
    if (phone.length !== 10) {
      setErrorMsg("Enter valid number");
      shakeError();
      return;
    }
    
    Keyboard.dismiss();
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/auth/request-otp`, { phone });
      navigation.navigate("OTP", { phone });
    } catch (error) {
      let message = "Failed to send code";
      
      if (error.response) {
        if (error.response.status === 429) {
          message = "Try again later";
        } else if (error.response.data && error.response.data.message) {
          message = error.response.data.message;
        }
      }
      
      setErrorMsg(message);
      shakeError();
      Toast.show({ 
        type: "error", 
        text1: message,
        position: 'bottom',
        visibilityTime: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return <AppLoading />;
  
  // Heart rotation interpolation
  const rotateInterpolation = heartRotate.interpolate({
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
            behavior={isIOS ? "padding" : "height"}
            keyboardVerticalOffset={isIOS ? -HEADER_Y : 0}
          >
            <Animated.View style={styles.header}>
              <Animated.View style={{
                transform: [{ scale }]
              }}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
              </Animated.View>
              <Animated.Text style={styles.tagline}>
                Unmute
              </Animated.Text>
              
              <Animated.View style={styles.taglineContainer}>
                <Text style={styles.taglineSubtext}>
                  {welcomeMsg}
                </Text>
              </Animated.View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.card,
                {
                  transform: [{
                    translateX: shakeAnimation
                  }]
                }
              ]}
            >
              <View style={styles.mindIconContainer}>
                {/* Brain icon */}
                <FontAwesome5 name="brain" size={20} color={COLORS.primary} />
                
                {/* Animated heart */}
                <Animated.View style={[
                  styles.heartIconWrapper,
                  {
                    transform: [
                      { scale: heartbeatScale },
                      { rotate: rotateInterpolation }
                    ]
                  }
                ]}>
                  {/* Heart glow effect */}
                  <View style={[
                    styles.heartGlow,
                    { opacity: heartState.glowOpacity }
                  ]} />
                  
                  {/* Actual heart icon */}
                  <View style={styles.heartIcon}>
                    <FontAwesome5 
                      name="heart" 
                      size={22}
                      color={heartState.color}
                      solid
                    />
                  </View>
                </Animated.View>
              </View>
              
              <View style={[
                styles.inputWrapper,
                focusedInput && styles.inputWrapperFocused,
                errorMsg ? styles.inputWrapperError : null
              ]}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor="#8795a1"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  onFocus={() => setFocusedInput(true)}
                  onBlur={() => setFocusedInput(false)}
                  returnKeyType="done"
                  blurOnSubmit
                />
                {phone.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => {
                      setPhone("");
                      inputRef.current.focus();
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color="#8795a1" />
                  </TouchableOpacity>
                )}
              </View>
              
              {errorMsg ? (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle" size={14} color={COLORS.error} /> {errorMsg}
                </Text>
              ) : (
                <Text style={styles.hintText}>
                  <Ionicons name="shield-checkmark-outline" size={12} color={COLORS.primary} /> Secure & private
                </Text>
              )}
              
              <AppButton
                title={loading ? "Sending..." : "Continue"}
                loading={loading}
                disabled={phone.length !== 10 || loading}
                onPress={sendOtp}
              />
              
              {!isKeyboardVisible && (
                <Text style={styles.footerText}>
                  A safe space to share what's inside
                </Text>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>

        <Toast ref={(ref) => Toast.setRef(ref)} />
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
    marginTop: HEADER_Y + 20,
    paddingVertical: 20,
  },
  logo: { 
    width: 80, 
    height: 80, 
    marginBottom: 8,
    borderRadius: 20,
  },
  tagline: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 30,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  taglineContainer: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  taglineSubtext: {
    fontFamily: "Poppins_300Light",
    fontSize: 14,
    color: "#fff",
    textAlign: 'center',
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
  mindIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heartIconWrapper: {
    marginLeft: 15,
    position: 'relative',
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD2DC',
    top: -2,
    left: -2,
  },
  heartIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 247, 250, 0.8)",
    borderWidth: 1,
    borderColor: "#E0E5EC",
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 1,
    height: 56,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFFFF",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: "rgba(254, 242, 242, 0.8)",
  },
  countryCode: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E5EC',
  },
  countryCodeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: COLORS.text.dark,
  },
  input: { 
    flex: 1, 
    height: 56, 
    fontSize: 16,
    paddingHorizontal: 12,
    color: COLORS.text.dark,
    fontFamily: "Inter_500Medium",
  },
  clearButton: {
    padding: 8,
    marginRight: 6,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 16,
    marginLeft: 4,
    lineHeight: 16,
  },
  hintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: COLORS.text.medium,
    marginBottom: 16,
    marginLeft: 4,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: COLORS.text.medium,
    textAlign: "center",
    marginTop: 20,
    fontStyle: 'italic',
  },
});