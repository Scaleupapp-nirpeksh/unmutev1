// File: mobile/src/screens/CreateVentScreen.js
// Purpose: Screen for creating new vents with emotion tagging and privacy options

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Switch,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular } from "@expo-google-fonts/poppins";
import { Inter_500Medium, Inter_400Regular } from "@expo-google-fonts/inter";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL } from "@env";
import { useApp } from "../context/AppContext";

// Vibrant colors consistent with enhanced HomeScreen
const COLORS = {
  primary: "#4B77BE",
  gradient: {
    start: "#5D8FD9", 
    middle: "#4A7FD7",
    end: "#3A6BC6"
  },
  text: {
    dark: "#2C3E50",
    medium: "#566573",
    light: "#ABB2B9"
  },
  card: "rgba(255, 255, 255, 0.98)",
  error: "#E74C3C",
  accent: "#FF5733",
  success: "#2ECC71",
  vent: "#E91E63",
  journal: "#F39C12",
  tagBg: "rgba(233, 30, 99, 0.1)",
  tagBorder: "rgba(233, 30, 99, 0.3)",
  inputBg: "rgba(255, 255, 255, 0.95)",
};

// Common tags for vents
const SUGGESTED_TAGS = [
  "anxiety", "stress", "work", "family", "relationships", 
  "health", "depression", "motivation", "sleep", "selfcare",
  "therapy", "mindfulness", "gratitude", "progress", "rant"
];

const CreateVentScreen = ({ navigation }) => {
  // State for form inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  
  // Context
  const { createVent } = useApp();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tagInputAnimation = useRef(new Animated.Value(0)).current;
  
  // Refs
  const contentInputRef = useRef(null);
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_500Medium,
    Poppins_400Regular,
    Inter_500Medium,
    Inter_400Regular
  });
  
  // Start animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
    
    // Focus title input after animation
    setTimeout(() => {
      if (contentInputRef.current) {
        contentInputRef.current.focus();
      }
    }, 500);
  }, []);
  
  // Keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setInputFocused(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setInputFocused(false);
    });
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Handle tag input animation
  useEffect(() => {
    Animated.timing(tagInputAnimation, {
      toValue: tagInput.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [tagInput]);
  
  // Handle content changes and update character count
  const handleContentChange = (text) => {
    setContent(text);
    setCharCount(text.length);
  };
  
  // Add a tag
  const addTag = (tag) => {
    const formattedTag = tag.trim().toLowerCase().replace(/\s+/g, '');
    if (formattedTag && !tags.includes(formattedTag) && tags.length < 5) {
      setTags([...tags, formattedTag]);
      setTagInput("");
      
      // Animation feedback
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Submit the vent
  const handleSubmit = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Title required',
        text2: 'Please add a title to your vent',
        position: 'bottom'
      });
      return;
    }
    
    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Content required',
        text2: 'Please share what\'s on your mind',
        position: 'bottom'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await createVent({
        title: title.trim(),
        content: content.trim(),
        tags,
        allowComments
      });
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Shared successfully',
          text2: 'Your thoughts are now in the community',
          position: 'bottom'
        });
        
        navigation.navigate("Vents");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Couldn\'t share your vent',
          text2: response.message || 'Please try again',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error("Error creating vent:", error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please check your connection and try again',
        position: 'bottom'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if form is valid
  const isFormValid = title.trim().length > 0 && content.trim().length > 0;
  
  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.vent} />
    </View>;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient 
        colors={[COLORS.gradient.start, COLORS.gradient.middle, COLORS.gradient.end]} 
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Thoughts</Text>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 40}
      >
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="Add a title..."
                placeholderTextColor={COLORS.text.light}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                returnKeyType="next"
                onSubmitEditing={() => contentInputRef.current.focus()}
              />
            </View>
            
            {/* Content Input */}
            <View style={styles.contentInputContainer}>
              <TextInput
                ref={contentInputRef}
                style={styles.contentInput}
                placeholder="What's on your mind?"
                placeholderTextColor={COLORS.text.light}
                value={content}
                onChangeText={handleContentChange}
                multiline
                textAlignVertical="top"
                maxLength={2000}
              />
              <Text style={styles.charCount}>{charCount}/2000</Text>
            </View>
            
            {/* Tags Section */}
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Add tags</Text>
              <Text style={styles.sectionSubtitle}>Help others find your vent (max 5)</Text>
              
              {/* Tag Input */}
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Type a tag and press +"
                  placeholderTextColor={COLORS.text.light}
                  value={tagInput}
                  onChangeText={setTagInput}
                  maxLength={20}
                  returnKeyType="done"
                  onSubmitEditing={() => tagInput.trim() && addTag(tagInput)}
                />
                <Animated.View style={{
                  opacity: tagInputAnimation,
                  transform: [{ scale: tagInputAnimation }]
                }}>
                  <TouchableOpacity
                    style={styles.addTagButton}
                    onPress={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                  >
                    <Ionicons name="add-circle" size={28} color={COLORS.vent} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
              
              {/* Selected Tags */}
              {tags.length > 0 && (
                <View style={styles.selectedTagsContainer}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>#{tag}</Text>
                      <TouchableOpacity
                        style={styles.removeTagButton}
                        onPress={() => removeTag(tag)}
                      >
                        <Ionicons name="close-circle" size={16} color={COLORS.vent} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Suggested Tags */}
              <View style={styles.suggestedTagsContainer}>
                <Text style={styles.suggestedTagsTitle}>Suggested tags:</Text>
                <View style={styles.suggestedTagsRow}>
                  {SUGGESTED_TAGS.slice(0, 15).map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.suggestedTag,
                        tags.includes(tag) && styles.selectedSuggestedTag
                      ]}
                      onPress={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                      disabled={tags.length >= 5 && !tags.includes(tag)}
                    >
                      <Text
                        style={[
                          styles.suggestedTagText,
                          tags.includes(tag) && styles.selectedSuggestedTagText
                        ]}
                      >
                        #{tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Settings */}
            <View style={styles.settingsSection}>
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Allow comments</Text>
                  <Text style={styles.settingDescription}>Let others comment on this vent</Text>
                </View>
                <Switch
                  value={allowComments}
                  onValueChange={setAllowComments}
                  trackColor={{ false: COLORS.text.light, true: COLORS.vent }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: COLORS.vent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#FFF',
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleInput: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.text.dark,
    padding: 16,
  },
  contentInputContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: COLORS.text.dark,
    padding: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.medium,
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 8,
  },
  tagsSection: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.text.dark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.medium,
    marginBottom: 16,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 247, 250, 0.6)',
    borderRadius: 25,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.text.dark,
  },
  addTagButton: {
    padding: 8,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tagBg,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.tagBorder,
  },
  tagChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.vent,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  suggestedTagsContainer: {
    marginTop: 8,
  },
  suggestedTagsTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.text.medium,
    marginBottom: 8,
  },
  suggestedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestedTag: {
    backgroundColor: 'rgba(245, 247, 250, 0.8)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  selectedSuggestedTag: {
    backgroundColor: COLORS.tagBg,
    borderColor: COLORS.tagBorder,
  },
  suggestedTagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.medium,
  },
  selectedSuggestedTagText: {
    color: COLORS.vent,
    fontFamily: 'Inter_500Medium',
  },
  settingsSection: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: COLORS.text.dark,
  },
  settingDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.medium,
  },
});

export default CreateVentScreen;