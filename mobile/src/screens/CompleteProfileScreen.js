// File: mobile/src/screens/CompleteProfileScreen.js
// Purpose: Beautiful onboarding experience with intuitive interests, likes and dislikes input

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import AppButton from "../components/AppButton";
import { API_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold, Poppins_500Medium, Poppins_300Light } from "@expo-google-fonts/poppins";
import { Inter_500Medium, Inter_400Regular } from "@expo-google-fonts/inter";
import AppLoading from "expo-app-loading";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === "ios";

// Beautiful colors matching other screens
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
  accent: "#FF7E67",
  success: "#7ED9A6",
  like: "#7ED9A6",     // Green for likes
  dislike: "#FF7E67",  // Coral for dislikes
  interest: "#7eacde", // Blue for interests
  inputBg: "rgba(245, 247, 250, 0.8)",
  inputBorder: "#E0E5EC",
  inputBorderFocus: "#5a8ccc",
  chipBg: "rgba(245, 247, 250, 0.9)",
  switchThumb: "#FFF",
  switchTrackOn: "#7ED9A6",
  switchTrackOff: "#CCC",
};

// Welcome messages for new users
const WELCOME_MESSAGES = [
  "Tell us about yourself",
  "Create your safe space",
  "Express yourself freely",
  "Join our supportive community",
  "Begin your journey"
];

// Common interest suggestions for mental health app
const SUGGESTED_INTERESTS = [
  "mindfulness", "meditation", "anxiety", "depression", "self-care", 
  "journaling", "therapy", "wellness", "support", "gratitude", 
  "stress-relief", "healing", "growth", "community", "art-therapy"
];

export default function CompleteProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  
  // Using arrays directly for tags
  const [interests, setInterests] = useState([]);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  
  // Input values for new tags
  const [interestInput, setInterestInput] = useState("");
  const [likeInput, setLikeInput] = useState("");
  const [dislikeInput, setDislikeInput] = useState("");
  
  const [allowComments, setAllowComments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [welcomeMsg] = useState(WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]);
  
  // State to track which section is expanded
  const [expandedSection, setExpandedSection] = useState("interests");
  
  // Input focus states
  const [focusedInput, setFocusedInput] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const breatheAnim = useRef(new Animated.Value(0)).current;
  
  // Font loading
  const fontMap = { 
    Poppins_600SemiBold,
    Poppins_500Medium,
    Poppins_300Light,
    Inter_500Medium,
    Inter_400Regular
  };
  
  const [fontsLoaded] = useFonts(fontMap);
  
  // Start animations
  useEffect(() => {
    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    ).start();
    
    // Fade in elements
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Slide up elements
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Heartbeat-like welcome animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // load token + userId from storage, then GET /user/:userId
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) return navigation.replace("Phone");
      // decode userId from JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;
      try {
        const { data } = await axios.get(`${API_URL}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
        setUsername(data.user.username || "");
        setBio(data.user.bio || "");
        
        // Set arrays directly
        setInterests(data.user.interests || []);
        setLikes(data.user.likes || []);
        setDislikes(data.user.dislikes || []);
        
        setAllowComments(data.user.allowComments);
      } catch (err) {
        console.error(err);
        navigation.replace("Phone");
      }
    })();
  }, []);

  // Add tag to appropriate array
  const addTag = (type, value) => {
    if (!value.trim()) return;
    
    const formattedValue = value.trim().toLowerCase();
    
    switch(type) {
      case 'interest':
        if (!interests.includes(formattedValue)) {
          setInterests([...interests, formattedValue]);
          setInterestInput("");
        }
        break;
      case 'like':
        if (!likes.includes(formattedValue)) {
          setLikes([...likes, formattedValue]);
          setLikeInput("");
        }
        break;
      case 'dislike':
        if (!dislikes.includes(formattedValue)) {
          setDislikes([...dislikes, formattedValue]);
          setDislikeInput("");
        }
        break;
    }
  };
  
  // Remove tag from array
  const removeTag = (type, value) => {
    switch(type) {
      case 'interest':
        setInterests(interests.filter(item => item !== value));
        break;
      case 'like':
        setLikes(likes.filter(item => item !== value));
        break;
      case 'dislike':
        setDislikes(dislikes.filter(item => item !== value));
        break;
    }
  };
  
  // Add suggested interest
  const addSuggestedInterest = (interest) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
      
      // Show toast for feedback
      Toast.show({
        type: "success",
        text1: "Added " + interest,
        position: 'bottom',
        visibilityTime: 1000
      });
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // submit profile update
  const handleSave = async () => {
    setLoading(true);
    const token = await SecureStore.getItemAsync("jwt");
    try {
      // 1) change username if it's different
      if (username !== user.username) {
        await axios.post(
          `${API_URL}/user/change-username`,
          { newUsername: username },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 2) update bio/interests/likes/dislikes/allowComments
      await axios.put(
        `${API_URL}/user/update-details`,
        {
          bio,
          interests,
          likes,
          dislikes,
          allowComments,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success animation
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1, 
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      Toast.show({ 
        type: "success", 
        text1: "Profile completed!", 
        text2: "Welcome to Unmute",
        position: 'bottom',
        visibilityTime: 2000
      });
      
      // Short delay for the user to see the success message
      setTimeout(() => {
        // Navigate to home
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }, 1000);
      
    } catch (error) {
      console.error(error);
      Toast.show({ 
        type: "error", 
        text1: "Couldn't save profile", 
        text2: error.response?.data?.message || "Please try again",
        position: 'bottom',
        visibilityTime: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || !user) {
    return <AppLoading />;
  }
  
  // Background gradient size for breathing effect
  const breatheInterpolate = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["100%", "120%"]
  });

  // Render individual tag chip
  const renderTag = (value, type) => {
    let color, icon;
    
    switch(type) {
      case 'interest':
        color = COLORS.interest;
        icon = "star-outline";
        break;
      case 'like':
        color = COLORS.like;
        icon = "thumbs-up-outline";
        break;
      case 'dislike':
        color = COLORS.dislike;
        icon = "thumbs-down-outline";
        break;
    }
    
    return (
      <View key={`${type}-${value}`} style={[styles.chip, { borderColor: color }]}>
        <Ionicons name={icon} size={14} color={color} style={styles.chipIcon} />
        <Text style={styles.chipText}>{value}</Text>
        <TouchableOpacity 
          onPress={() => removeTag(type, value)}
          style={styles.chipRemove}
        >
          <Ionicons name="close-circle" size={16} color={color} />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render suggested interest chip
  const renderSuggestion = (interest) => (
    <TouchableOpacity 
      key={`suggestion-${interest}`}
      style={styles.suggestionChip}
      onPress={() => addSuggestedInterest(interest)}
    >
      <Text style={styles.suggestionText}>{interest}</Text>
      <Ionicons name="add-circle-outline" size={14} color={COLORS.text.medium} />
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <Animated.View style={[styles.breathingBg, { 
          width: breatheInterpolate, 
          height: breatheInterpolate 
        }]}>
          <LinearGradient 
            colors={[COLORS.gradient.start, COLORS.gradient.middle, COLORS.gradient.end]} 
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        <View style={styles.lottieContainer}>
          <LottieView
            source={require("../../assets/relax-bg.json")}
            autoPlay
            loop
            speed={0.3}
            style={StyleSheet.absoluteFill}
          />
        </View>
        
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={isIOS ? "padding" : undefined}
          keyboardVerticalOffset={isIOS ? 30 : 0}
        >
          <Animated.View 
            style={[
              styles.header,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons name="person-circle" size={60} color="#FFF" />
            </Animated.View>
            
            <Text style={styles.welcomeText}>Welcome to Unmute</Text>
            
            <View style={styles.welcomeMsgContainer}>
              <Text style={styles.welcomeMsg}>{welcomeMsg}</Text>
            </View>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.cardContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'username' && styles.inputWrapperFocused
                  ]}>
                    <Ionicons name="at-outline" size={18} color={COLORS.text.medium} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Choose a unique username"
                      placeholderTextColor={COLORS.text.light}
                      onFocus={() => setFocusedInput('username')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bio</Text>
                  <View style={[
                    styles.inputWrapper,
                    styles.textareaWrapper,
                    focusedInput === 'bio' && styles.inputWrapperFocused
                  ]}>
                    <Ionicons name="create-outline" size={18} color={COLORS.text.medium} style={[styles.inputIcon, { marginTop: 10 }]} />
                    <TextInput
                      style={[styles.input, styles.textarea]}
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Tell us a bit about yourself..."
                      placeholderTextColor={COLORS.text.light}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      onFocus={() => setFocusedInput('bio')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>
                
                {/* Interests Section */}
                <TouchableOpacity 
                  style={[
                    styles.sectionHeader, 
                    { borderColor: COLORS.interest }
                  ]}
                  onPress={() => toggleSection('interests')}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="star-outline" size={20} color={COLORS.interest} />
                    <Text style={styles.sectionTitle}>Interests</Text>
                  </View>
                  <Ionicons 
                    name={expandedSection === 'interests' ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.text.medium} 
                  />
                </TouchableOpacity>
                
                {expandedSection === 'interests' && (
                  <View style={styles.sectionContent}>
                    <View style={[
                      styles.inputWrapper,
                      focusedInput === 'interests' && styles.inputWrapperFocused
                    ]}>
                      <Ionicons name="add-circle-outline" size={18} color={COLORS.text.medium} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={interestInput}
                        onChangeText={setInterestInput}
                        placeholder="Add an interest..."
                        placeholderTextColor={COLORS.text.light}
                        onFocus={() => setFocusedInput('interests')}
                        onBlur={() => setFocusedInput(null)}
                        onSubmitEditing={() => addTag('interest', interestInput)}
                        returnKeyType="done"
                      />
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => addTag('interest', interestInput)}
                        disabled={!interestInput.trim()}
                      >
                        <Text style={[
                          styles.addButtonText, 
                          !interestInput.trim() && { opacity: 0.5 }
                        ]}>Add</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Chips for existing interests */}
                    <View style={styles.chipsContainer}>
                      {interests.map(interest => renderTag(interest, 'interest'))}
                    </View>
                    
                    {interests.length === 0 && (
                      <Text style={styles.emptyTagsText}>No interests added yet</Text>
                    )}
                    
                    {/* Suggested interests */}
                    <View style={styles.suggestionsContainer}>
                      <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                      <View style={styles.suggestionChips}>
                        {SUGGESTED_INTERESTS.slice(0, 8).map(interest => renderSuggestion(interest))}
                      </View>
                    </View>
                  </View>
                )}
                
                {/* Likes Section */}
                <TouchableOpacity 
                  style={[
                    styles.sectionHeader, 
                    { borderColor: COLORS.like }
                  ]}
                  onPress={() => toggleSection('likes')}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="thumbs-up-outline" size={20} color={COLORS.like} />
                    <Text style={styles.sectionTitle}>Things I Like</Text>
                  </View>
                  <Ionicons 
                    name={expandedSection === 'likes' ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.text.medium} 
                  />
                </TouchableOpacity>
                
                {expandedSection === 'likes' && (
                  <View style={styles.sectionContent}>
                    <View style={[
                      styles.inputWrapper,
                      focusedInput === 'likes' && styles.inputWrapperFocused
                    ]}>
                      <Ionicons name="add-circle-outline" size={18} color={COLORS.text.medium} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={likeInput}
                        onChangeText={setLikeInput}
                        placeholder="Add something you like..."
                        placeholderTextColor={COLORS.text.light}
                        onFocus={() => setFocusedInput('likes')}
                        onBlur={() => setFocusedInput(null)}
                        onSubmitEditing={() => addTag('like', likeInput)}
                        returnKeyType="done"
                      />
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => addTag('like', likeInput)}
                        disabled={!likeInput.trim()}
                      >
                        <Text style={[
                          styles.addButtonText, 
                          !likeInput.trim() && { opacity: 0.5 }
                        ]}>Add</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Chips for existing likes */}
                    <View style={styles.chipsContainer}>
                      {likes.map(like => renderTag(like, 'like'))}
                    </View>
                    
                    {likes.length === 0 && (
                      <Text style={styles.emptyTagsText}>No likes added yet</Text>
                    )}
                    
                    <Text style={styles.tagsHint}>
                      Add activities, foods, hobbies, etc. that bring you joy
                    </Text>
                  </View>
                )}
                
                {/* Dislikes Section */}
                <TouchableOpacity 
                  style={[
                    styles.sectionHeader, 
                    { borderColor: COLORS.dislike }
                  ]}
                  onPress={() => toggleSection('dislikes')}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="thumbs-down-outline" size={20} color={COLORS.dislike} />
                    <Text style={styles.sectionTitle}>Things I Dislike</Text>
                  </View>
                  <Ionicons 
                    name={expandedSection === 'dislikes' ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.text.medium} 
                  />
                </TouchableOpacity>
                
                {expandedSection === 'dislikes' && (
                  <View style={styles.sectionContent}>
                    <View style={[
                      styles.inputWrapper,
                      focusedInput === 'dislikes' && styles.inputWrapperFocused
                    ]}>
                      <Ionicons name="add-circle-outline" size={18} color={COLORS.text.medium} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={dislikeInput}
                        onChangeText={setDislikeInput}
                        placeholder="Add something you dislike..."
                        placeholderTextColor={COLORS.text.light}
                        onFocus={() => setFocusedInput('dislikes')}
                        onBlur={() => setFocusedInput(null)}
                        onSubmitEditing={() => addTag('dislike', dislikeInput)}
                        returnKeyType="done"
                      />
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => addTag('dislike', dislikeInput)}
                        disabled={!dislikeInput.trim()}
                      >
                        <Text style={[
                          styles.addButtonText, 
                          !dislikeInput.trim() && { opacity: 0.5 }
                        ]}>Add</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Chips for existing dislikes */}
                    <View style={styles.chipsContainer}>
                      {dislikes.map(dislike => renderTag(dislike, 'dislike'))}
                    </View>
                    
                    {dislikes.length === 0 && (
                      <Text style={styles.emptyTagsText}>No dislikes added yet</Text>
                    )}
                    
                    <Text style={styles.tagsHint}>
                      Add triggering topics or things that you want to avoid
                    </Text>
                  </View>
                )}
                
                <View style={styles.switchRow}>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Allow comments</Text>
                    <Text style={styles.switchDescription}>Let others comment on your shares</Text>
                  </View>
                  <Switch
                    value={allowComments}
                    onValueChange={setAllowComments}
                    thumbColor={COLORS.switchThumb}
                    trackColor={{ 
                      false: COLORS.switchTrackOff, 
                      true: COLORS.switchTrackOn 
                    }}
                    ios_backgroundColor={COLORS.switchTrackOff}
                  />
                </View>
                
                <View style={styles.buttonContainer}>
                  <AppButton
                    title="Complete Profile"
                    loading={loading}
                    disabled={loading || !username.trim()}
                    onPress={handleSave}
                  />
                </View>
                
                <Text style={styles.privacyNote}>
                  <Ionicons name="shield-checkmark-outline" size={12} color={COLORS.primary} /> Your information is secure with us
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
        
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { 
    flex: 1 
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  breathingBg: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    borderRadius: 1000,
    overflow: 'hidden'
  },
  lottieContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    opacity: 0.2,
  },
  header: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 60 : 40,
    paddingVertical: 20,
  },
  welcomeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 26,
    color: "#fff",
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  welcomeMsgContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  welcomeMsg: {
    fontFamily: "Poppins_300Light",
    fontSize: 14,
    color: "#fff",
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    marginTop: 5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: COLORS.text.dark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: COLORS.inputBorderFocus,
    backgroundColor: "#FFFFFF",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  textareaWrapper: {
    alignItems: "flex-start",
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingVertical: 8,
    paddingRight: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: COLORS.text.dark,
  },
  textarea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    marginLeft: 8,
    color: COLORS.text.dark,
  },
  sectionContent: {
    marginBottom: 16,
  },
  tagsHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: COLORS.text.medium,
    marginTop: 8,
    fontStyle: 'italic',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chipBg,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    margin: 4,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: COLORS.text.dark,
  },
  chipRemove: {
    marginLeft: 4,
  },
  emptyTagsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: COLORS.text.light,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: COLORS.primary,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: COLORS.text.medium,
    marginBottom: 8,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 247, 250, 0.5)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    margin: 3,
    borderWidth: 1,
    borderColor: '#E0E5EC',
  },
  suggestionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: COLORS.text.medium,
    marginRight: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: COLORS.text.dark,
  },
  switchDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: COLORS.text.medium,
  },
  buttonContainer: {
    marginTop: 8,
  },
  privacyNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: COLORS.text.medium,
    textAlign: "center",
    marginTop: 16,
  },
});