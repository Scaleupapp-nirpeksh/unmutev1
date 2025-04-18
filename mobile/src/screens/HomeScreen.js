// File: mobile/src/screens/HomeScreen.js
// Purpose: Main hub with activity feed, quick actions and navigation

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  Image,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { 
  useFonts, 
  Poppins_600SemiBold, 
  Poppins_500Medium, 
  Poppins_400Regular, 
  Poppins_300Light 
} from "@expo-google-fonts/poppins";
import { Inter_500Medium, Inter_400Regular } from "@expo-google-fonts/inter";
import LottieView from "lottie-react-native";
import VentCard from "../components/VentCard";
import QuickActionButton from "../components/QuickActionButton";
import JournalEntryCard from "../components/JournalEntryCard";
import PromptCard from "../components/PromptCard";
import BottomTabBar from "../components/BottomTabBar";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === "ios";

// Consistent colors with existing screens
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
  journal: "#FFC55C",  // Amber for journal
  vent: "#FF5E7D"      // Pink for vents
};

// Welcoming messages for users
const WELCOME_MESSAGES = [
  "How are you feeling today?",
  "What's on your mind?",
  "Express yourself freely",
  "You're in a safe space now",
  "Your voice matters here"
];

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [vents, setVents] = useState([]);
  const [journals, setJournals] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [welcomeMsg] = useState(WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const colorShift = useRef(new Animated.Value(0)).current;
  
  // Font loading
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_500Medium,
    Poppins_400Regular,
    Poppins_300Light,
    Inter_500Medium,
    Inter_400Regular
  });
  
  // Get user info and feed data
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
    
    // Start color shift animation for welcome message
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorShift, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false
        }),
        Animated.timing(colorShift, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false
        })
      ])
    ).start();
    
    // Fetch data
    loadData();
  }, []);
  
  // Load all data
  const loadData = async () => {
    try {
      setRefreshing(true);
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        return navigation.replace("Phone");
      }
      
      // Fetch user data
      const userResponse = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userId = userResponse.data.userId;
      
      // Fetch user profile
      const profileResponse = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(profileResponse.data.user);
      
      // Fetch recent vents
      const ventsResponse = await axios.get(`${API_URL}/vent?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVents(ventsResponse.data.vents);
      
      // Fetch journal entries
      const journalsResponse = await axios.get(`${API_URL}/journal?limit=3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJournals(journalsResponse.data.journalEntries);
      
      // Fetch prompts
      const promptsResponse = await axios.get(`${API_URL}/journal/prompts/random?limit=2`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrompts(promptsResponse.data.prompts);
      
      // Fetch matches
      const matchesResponse = await axios.get(`${API_URL}/match`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(matchesResponse.data.matches);
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    loadData();
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  // Interpolate colors for the welcome message
  const welcomeColor = colorShift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.primary, COLORS.vent, COLORS.primary]
  });
  
  if (!fontsLoaded || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LottieView 
          source={require("../../assets/relax-bg.json")}
          autoPlay
          loop
          speed={0.5}
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
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
      
      {/* Animated background elements */}
      <View style={styles.bgContainer}>
        <LottieView
          source={require("../../assets/relax-bg.json")}
          autoPlay
          loop
          speed={0.3}
          style={[StyleSheet.absoluteFill, { opacity: 0.2 }]}
        />
      </View>
      
      {/* Main content */}
      <Animated.View style={[
        styles.mainContainer,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }] 
        }
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.username}>{user.username}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-circle" size={44} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        {/* Welcome message */}
        <Animated.View style={[styles.welcomeCard, { borderColor: welcomeColor }]}>
          <Animated.Text style={[styles.welcomeText, { color: welcomeColor }]}>
            {welcomeMsg}
          </Animated.Text>
        </Animated.View>
        
        {/* Main Scroll Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <QuickActionButton 
                icon="megaphone" 
                text="New Vent" 
                color={COLORS.vent}
                onPress={() => navigation.navigate("CreateVent")}
              />
              <QuickActionButton 
                icon="book" 
                text="Journal" 
                color={COLORS.journal}
                onPress={() => navigation.navigate("CreateJournal")}
              />
              <QuickActionButton 
                icon="people" 
                text="Circles" 
                color={COLORS.interest}
                onPress={() => navigation.navigate("Circles")}
              />
              <QuickActionButton 
                icon="heart" 
                text="Matches" 
                color={COLORS.accent}
                onPress={() => navigation.navigate("Matches")}
              />
            </View>
          </View>
          
          {/* Journal Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Journal</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Journal")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {journals.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.journalContainer}
              >
                {journals.map(journal => (
                  <JournalEntryCard 
                    key={journal._id} 
                    entry={journal} 
                    onPress={() => navigation.navigate("JournalDetail", { entryId: journal._id })}
                  />
                ))}
                
                {/* Writing prompt suggestion */}
                {prompts.length > 0 && (
                  <PromptCard 
                    prompt={prompts[0]} 
                    onPress={() => navigation.navigate("CreateJournal", { promptId: prompts[0]._id })}
                  />
                )}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <FontAwesome5 name="book" size={32} color={COLORS.journal} />
                <Text style={styles.emptyStateText}>Start your journal journey</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate("CreateJournal")}
                >
                  <Text style={styles.emptyStateButtonText}>Write First Entry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Recent Vents */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Community Vents</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Vents")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {vents.length > 0 ? (
              vents.map(vent => (
                <VentCard 
                  key={vent._id} 
                  vent={vent} 
                  onPress={() => navigation.navigate("VentDetail", { ventId: vent._id })}
                />
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <FontAwesome5 name="megaphone" size={32} color={COLORS.vent} />
                <Text style={styles.emptyStateText}>No vents to show yet</Text>
                <TouchableOpacity 
                  style={[styles.emptyStateButton, { backgroundColor: COLORS.vent }]}
                  onPress={() => navigation.navigate("CreateVent")}
                >
                  <Text style={styles.emptyStateButtonText}>Share Your Thoughts</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Suggested Matches */}
          {matches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Suggested Matches</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Matches")}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.matchesContainer}
              >
                {matches.slice(0, 5).map(match => (
                  <TouchableOpacity 
                    key={match._id}
                    style={styles.matchCard}
                    onPress={() => navigation.navigate("MatchDetail", { matchId: match.matchId._id })}
                  >
                    <View style={styles.matchAvatar}>
                      <Ionicons name="person" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.matchName} numberOfLines={1}>
                      {match.matchId.username}
                    </Text>
                    <View style={styles.matchScore}>
                      <Text style={styles.matchScoreText}>
                        {Math.round(match.score * 100)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Prompts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Writing Prompts</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Prompts")}>
                <Text style={styles.seeAll}>More</Text>
              </TouchableOpacity>
            </View>
            
            {prompts.length > 0 && (
              <View style={styles.promptsGrid}>
                {prompts.map(prompt => (
                  <TouchableOpacity 
                    key={prompt._id}
                    style={styles.promptGridItem}
                    onPress={() => navigation.navigate("CreateJournal", { promptId: prompt._id })}
                  >
                    <View style={[
                      styles.promptIcon, 
                      { backgroundColor: getCategoryColor(prompt.category) }
                    ]}>
                      <Ionicons name={getCategoryIcon(prompt.category)} size={20} color="#FFF" />
                    </View>
                    <Text style={styles.promptTitle} numberOfLines={2}>{prompt.title}</Text>
                    <Text style={styles.promptCategory}>{prompt.category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Footer space */}
          <View style={styles.footerSpace} />
        </ScrollView>
      </Animated.View>
      
      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

// Helper functions for prompts
function getCategoryColor(category) {
  const categories = {
    "Self-Reflection": "#7ED9A6",
    "Stress & Anxiety": "#FF7E67",
    "Work & Productivity": "#5a8ccc",
    "Relationships": "#F2A1A1",
    "Growth & Resilience": "#FFC55C",
    "Advanced Reflection": "#B288FD",
    "Healing & Recovery": "#FF9F76",
    "Identity & Purpose": "#7eacde",
  };
  return categories[category] || COLORS.primary;
}

function getCategoryIcon(category) {
  const icons = {
    "Self-Reflection": "telescope",
    "Stress & Anxiety": "fitness",
    "Work & Productivity": "briefcase",
    "Relationships": "people",
    "Growth & Resilience": "leaf",
    "Advanced Reflection": "prism",
    "Healing & Recovery": "bandage",
    "Identity & Purpose": "compass",
  };
  return icons[category] || "book";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  mainContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight + 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: 'Poppins_300Light',
    fontSize: 14,
    color: '#fff',
    opacity: 0.85,
  },
  username: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: '#fff',
  },
  profileButton: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
    marginBottom: 20,
  },
  welcomeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#fff',
  },
  seeAll: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  journalContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  emptyStateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: COLORS.text.dark,
    marginTop: 10,
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: COLORS.journal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#fff',
  },
  matchesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.text.dark,
    marginBottom: 6,
    textAlign: 'center',
  },
  matchScore: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchScoreText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#fff',
  },
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  promptGridItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    margin: 4,
    width: (width - 48) / 2,
  },
  promptIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.text.dark,
    marginBottom: 4,
    height: 40,
  },
  promptCategory: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.medium,
  },
  footerSpace: {
    height: 80,
  },
});