// File: mobile/src/screens/HomeScreen.js
// Purpose: Main social hub with feed-first approach and wellness value-adds
// Enhanced UX/UI Version

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@env"; // Ensure this is configured
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"; // Added MaterialCommunityIcons
import {
  useFonts,
  Poppins_600SemiBold,
  Poppins_500Medium,
  Poppins_400Regular,
  Poppins_300Light
} from "@expo-google-fonts/poppins";
import { Inter_500Medium, Inter_400Regular } from "@expo-google-fonts/inter";
import LottieView from "lottie-react-native";
// import * as Haptics from 'expo-haptics'; // Import for haptic feedback

// Assuming these components exist and are styled appropriately internally
import VentCard from "../components/VentCard";
import QuickActionButton from "../components/QuickActionButton";
import JournalEntryCard from "../components/JournalEntryCard";
import PromptCard from "../components/PromptCard";
import BottomTabBar from "../components/BottomTabBar";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === "ios";

// Refined Color Palette
const COLORS = {
  primary: "#4B77BE", // Main interactive color
  gradient: {
    start: "#5D8FD9",
    middle: "#4A7FD7",
    end: "#3A6BC6"
  },
  background: "#F4F7F9", // Softer background
  card: "#FFFFFF", // Clean white cards
  text: {
    dark: "#2C3E50", // For titles and important text
    medium: "#566573", // For body text, descriptions
    light: "#8E9EAC", // For metadata, placeholders
  },
  shadow: "rgba(44, 62, 80, 0.15)", // Softer shadow based on dark text color
  error: "#E74C3C",
  accent: "#FF5733", // Kept for matches/highlights
  success: "#2ECC71",
  like: "#27AE60",
  dislike: "#E74C3C",
  interest: "#3498DB", // Circles
  journal: "#F39C12", // Journal
  vent: "#E84393", // Vibrant Pink/Magenta for Vent actions/FAB
  promptCategories: { // Define prompt category colors here
    "Self-Reflection": "#27AE60",
    "Stress & Anxiety": "#E74C3C",
    "Work & Productivity": "#3498DB",
    "Relationships": "#E84393",
    "Growth & Resilience": "#F39C12",
    "Advanced Reflection": "#9B59B6",
    "Healing & Recovery": "#FF7675",
    "Identity & Purpose": "#00CEC9",
    "Default": "#AAB7B8"
  },
};

// Engaging welcome messages
const WELCOME_MESSAGES = [
  "What's on your mind today?",
  "Your space to share freely.",
  "Let it out, you're safe here.",
  "How are you feeling right now?",
  "Connect, share, and heal.",
];

// --- Mock Data Section (Replace with API calls) ---
// To run without a backend, uncomment this section and comment out API calls in loadData
/*
const MOCK_USER = { _id: 'user123', username: 'You' };
const MOCK_VENTS = [
  { _id: 'vent1', content: 'Feeling overwhelmed with work today...', createdAt: new Date().toISOString(), reactions: [{userId: 'user123', reactionType: 'same'}], comments: [{_id: 'c1'}, {_id: 'c2'}] },
  { _id: 'vent2', content: 'Had a really nice moment of peace this morning.', createdAt: new Date().toISOString(), reactions: [], comments: [] },
  // Add more mock vents
];
const MOCK_JOURNALS = [
  { _id: 'j1', title: 'Morning Thoughts', contentSnippet: 'Woke up feeling...', mood: 'Neutral', createdAt: new Date().toISOString() },
  // Add more mock journals
];
const MOCK_PROMPTS = [
  { _id: 'p1', title: 'What are you grateful for today?', category: 'Self-Reflection' },
  { _id: 'p2', title: 'Describe a recent challenge and how you navigated it.', category: 'Growth & Resilience' },
  // Add more mock prompts
];
const MOCK_MATCHES = [
    { _id: 'm1', matchId: { _id: 'user456', username: ' kindredSpirit'}, score: 0.85 },
    // Add more mock matches
];
*/
// --- End Mock Data Section ---


export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null); // Use MOCK_USER for testing
  const [vents, setVents] = useState([]); // Use MOCK_VENTS for testing
  const [journals, setJournals] = useState([]); // Use MOCK_JOURNALS for testing
  const [prompts, setPrompts] = useState([]); // Use MOCK_PROMPTS for testing
  const [matches, setMatches] = useState([]); // Use MOCK_MATCHES for testing
  const [refreshing, setRefreshing] = useState(false);
  const [welcomeMsg] = useState(WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]);
  const [trendingTags] = useState(['anxiety', 'growth', 'mindfulness', 'selfcare', 'healing', 'positivity']); // Added one
  const [page, setPage] = useState(1);
  const [hasMoreVents, setHasMoreVents] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current; // Start slightly smaller

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
        duration: 600, // Slightly faster fade-in
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, { // Use spring for a bouncier feel
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true
      })
    ]).start();

    loadData(); // Load initial data
  }, []); // Empty dependency array means this runs once on mount

  // Load initial data (using async/await for clarity)
  const loadData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setRefreshing(true); // Show refresh indicator immediately
    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        console.log("No token found, redirecting to Phone screen.");
        navigation.replace("Phone");
        return;
      }

      // --- Start API Calls (Comment out/replace with mocks if needed) ---
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch user data first to get userId
      const userResponse = await axios.get(`${API_URL}/me`, config);
      const userId = userResponse.data.userId; // Assuming API returns userId directly

      // Fetch profile (can be simplified if /me returns everything)
      const profileResponse = await axios.get(`${API_URL}/user/${userId}`, config);
      setUser(profileResponse.data.user);

      // Reset pagination and fetch first page of vents
      setPage(1);
      setHasMoreVents(true);
      const ventsResponse = await axios.get(`${API_URL}/vent?limit=10&page=1`, config);
      setVents(ventsResponse.data.vents || []);
      setHasMoreVents((ventsResponse.data.vents || []).length >= 10);

      // Fetch other data in parallel
      const [journalsResponse, promptsResponse, matchesResponse] = await Promise.all([
        axios.get(`${API_URL}/journal?limit=3`, config),
        axios.get(`${API_URL}/journal/prompts/random?limit=2`, config),
        axios.get(`${API_URL}/match`, config)
      ]);

      setJournals(journalsResponse.data.journalEntries || []);
      setPrompts(promptsResponse.data.prompts || []);
      setMatches(matchesResponse.data.matches || []);
      // --- End API Calls ---

      // --- Mock Data Loading (Uncomment if not using API) ---
      /*
      console.log("Using Mock Data");
      setUser(MOCK_USER);
      setVents(MOCK_VENTS);
      setJournals(MOCK_JOURNALS);
      setPrompts(MOCK_PROMPTS);
      setMatches(MOCK_MATCHES);
      setPage(1);
      setHasMoreVents(false); // Assume mock data is all there is
      */
      // --- End Mock Data Loading ---

    } catch (error) {
      console.error("Error loading data:", error.response?.data || error.message);
      // Handle specific errors, e.g., redirect on 401 Unauthorized
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync("jwt");
        navigation.replace("Phone");
      }
      // Optionally show an error message to the user
    } finally {
      setRefreshing(false);
    }
  }, [navigation]); // Add navigation as dependency

  // Load more vents
  const loadMoreVents = useCallback(async () => {
    if (!hasMoreVents || refreshing) return;

    // console.log("Loading more vents, page:", page + 1); // Debug log
    setRefreshing(true); // Indicate loading more
    try {
      const nextPage = page + 1;
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) return; // Should not happen if already loaded data

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/vent?limit=10&page=${nextPage}`, config);

      if (response.data.vents && response.data.vents.length > 0) {
        setVents(prevVents => [...prevVents, ...response.data.vents]);
        setPage(nextPage);
        setHasMoreVents(response.data.vents.length >= 10);
      } else {
        setHasMoreVents(false);
      }
    } catch (error) {
      console.error("Error loading more vents:", error.response?.data || error.message);
      setHasMoreVents(false); // Stop trying if there's an error
    } finally {
      setRefreshing(false);
    }
  }, [page, hasMoreVents, refreshing]); // Dependencies for useCallback

  // Handle refresh
  const handleRefresh = () => {
    loadData(true); // Pass true to indicate it's a refresh action
  };

  // Handle reaction (Optimistic Update Example)
  const handleReaction = async (ventId, reactionType) => {
    if (!user) return;
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Add haptic feedback

    const originalVents = [...vents]; // Store original state for rollback
    const userId = user._id;

    // Optimistic UI Update
    setVents(currentVents =>
      currentVents.map(vent => {
        if (vent._id === ventId) {
          let updatedReactions = [...vent.reactions];
          const existingReactionIndex = updatedReactions.findIndex(r => r.userId === userId);

          if (existingReactionIndex >= 0) {
            // User already reacted
            if (updatedReactions[existingReactionIndex].reactionType === reactionType) {
              // User clicked the same reaction again - remove it
              updatedReactions.splice(existingReactionIndex, 1);
            } else {
              // User changed reaction
              updatedReactions[existingReactionIndex] = {
                  ...updatedReactions[existingReactionIndex],
                  reactionType,
                  reactedAt: new Date().toISOString() // Use ISO string for consistency
              };
            }
          } else {
            // User adding a new reaction
            updatedReactions.push({ userId: userId, reactionType, reactedAt: new Date().toISOString() });
          }
          return { ...vent, reactions: updatedReactions };
        }
        return vent;
      })
    );

    // API Call
    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) throw new Error("No auth token found");

      await axios.post(`${API_URL}/vent/${ventId}/react`,
        { reactionType },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // If successful, the optimistic update is correct.

    } catch (error) {
      console.error("Error reacting to vent:", error.response?.data || error.message);
      // Rollback UI on error
      setVents(originalVents);
      // Optionally show an error message
    }
  };

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Helper functions for prompts
  const getCategoryColor = (category) => {
    return COLORS.promptCategories[category] || COLORS.promptCategories["Default"];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Self-Reflection": "telescope-outline", // Using outline variants
      "Stress & Anxiety": "heart-pulse-outline",
      "Work & Productivity": "briefcase-outline",
      "Relationships": "people-outline",
      "Growth & Resilience": "leaf-outline",
      "Advanced Reflection": "prism-outline",
      "Healing & Recovery": "bandage-outline",
      "Identity & Purpose": "compass-outline",
    };
    return icons[category] || "book-outline"; // Default icon
  };


  // Loading state
  if (!fontsLoaded || (!user && refreshing)) { // Show loading if fonts or initial user data isn't loaded
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {/* Optional: Replace Lottie with simpler ActivityIndicator for faster initial load */}
        <LottieView
          source={require("../../assets/relax-bg.json")} // Make sure path is correct
          autoPlay
          loop
          speed={0.7}
          style={{ width: 150, height: 150 }}
        />
         <Text style={{ marginTop: 10, fontFamily: 'Poppins_400Regular', color: COLORS.text.medium }}>Loading your space...</Text>
      </View>
    );
  }

  // Render a trending tag pill
  const renderTrendingTag = (tag) => (
    <TouchableOpacity
      key={tag}
      style={styles.trendingTag}
      onPress={() => navigation.navigate("Vents", { tag })} // Assuming a 'Vents' screen exists for filtering
    >
      <Text style={styles.trendingTagText}>#{tag}</Text>
    </TouchableOpacity>
  );

  // Render a vent item - ASSUMES VentCard component handles internal styling
  const renderVentItem = ({ item }) => (
    <View style={styles.ventCardContainer}>
      <VentCard
        vent={item}
        onPress={() => navigation.navigate("VentDetail", { ventId: item._id })}
        // Pass down user ID to VentCard if it needs to display anonymity differently
        // currentUserId={user._id}
      />
      {/* Quick Reactions Row */}
      <View style={styles.quickReactionsContainer}>
         {['supportive', 'same', 'heart'].map((reaction) => {
              const isActive = item.reactions.some(r => r.userId === user._id && r.reactionType === reaction);
              let iconName;
              let activeColor;
              switch(reaction) {
                  case 'supportive': iconName = isActive ? 'thumbs-up' : 'thumbs-up-outline'; activeColor = COLORS.success; break;
                  case 'same': iconName = isActive ? 'checkmark-circle' : 'checkmark-circle-outline'; activeColor = COLORS.primary; break;
                  case 'heart': iconName = isActive ? 'heart' : 'heart-outline'; activeColor = COLORS.vent; break;
                  default: iconName = 'help-circle-outline'; activeColor = COLORS.text.medium;
              }
              return (
                  <TouchableOpacity
                      key={reaction}
                      style={styles.quickReactionButton}
                      onPress={() => handleReaction(item._id, reaction)}
                  >
                      <Ionicons
                          name={iconName}
                          size={22} // Slightly larger icons
                          color={isActive ? activeColor : COLORS.text.light}
                      />
                  </TouchableOpacity>
              );
          })}
        {/* Comment Button */}
        <TouchableOpacity
          style={styles.quickReactionButton}
          onPress={() => navigation.navigate("VentDetail", { ventId: item._id, focusComment: true })} // Optional: focus comment input on navigate
        >
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.text.light} />
          <Text style={styles.commentCount}>
            {item.comments ? item.comments.length : 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Header Component for FlatList
  const ListHeader = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
       {/* Welcome message - More subtle */}
      <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            {welcomeMsg}
          </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        {/* Assumes QuickActionButton handles its internal icon/text layout and styling */}
        <QuickActionButton icon="megaphone-outline" text="New Vent" color={COLORS.vent} onPress={() => navigation.navigate("CreateVent")} />
        <QuickActionButton icon="create-outline" text="Journal" color={COLORS.journal} onPress={() => navigation.navigate("CreateJournal")} />
        <QuickActionButton icon="people-outline" text="Circles" color={COLORS.interest} onPress={() => navigation.navigate("Circles")} />
        <QuickActionButton icon="heart-outline" text="Matches" color={COLORS.accent} onPress={() => navigation.navigate("Matches")} />
      </View>

      {/* Trending Tags */}
      <View style={styles.trendingContainer}>
        <Text style={styles.sectionTitle}>Trending Topics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingTagsContainer}>
          {trendingTags.map(renderTrendingTag)}
        </ScrollView>
      </View>

      {/* Community Feed Title */}
      <View style={[styles.sectionHeader, { marginTop: 10, marginBottom: 15 }]}>
        <Text style={styles.sectionTitle}>Community Feed</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Vents")}>
          <Text style={styles.seeAllText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Render Footer Component for FlatList (Value Adds)
  const ListFooter = () => (
    <>
      {/* Show loading indicator when fetching more vents */}
       {refreshing && page > 1 && (
           <View style={{ paddingVertical: 20, alignItems: 'center' }}>
               <LottieView
                    source={require("../../assets/relax-bg.json")} // Use a dedicated loading animation if possible
                    autoPlay
                    loop
                    speed={1}
                    style={{ width: 50, height: 50 }}
                />
           </View>
       )}
       {!hasMoreVents && vents.length > 10 && ( // Only show if there were multiple pages
            <Text style={styles.endOfFeedText}>You've reached the end</Text>
       )}

       {/* Value Add Features shown after the main feed */}
      <View style={styles.valueAddContainer}>
        {/* Journal Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
             <View style={styles.sectionHeaderTitle}>
                 <Ionicons name="book-outline" size={20} color={COLORS.journal} style={{marginRight: 8}}/>
                 <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Your Journal</Text>
             </View>
            <TouchableOpacity onPress={() => navigation.navigate("Journal")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {journals.length > 0 || prompts.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContainer}>
              {journals.map(journal => (
                <JournalEntryCard
                  key={journal._id}
                  entry={journal}
                  onPress={() => navigation.navigate("JournalDetail", { entryId: journal._id })}
                />
              ))}
              {/* Show first prompt as suggestion if journals exist */}
              {prompts.length > 0 && journals.length > 0 && (
                 <PromptCard
                    prompt={prompts[0]}
                    onPress={() => navigation.navigate("CreateJournal", { promptId: prompts[0]._id })}
                    isSuggestion={true} // Add a prop to style it differently if needed
                  />
              )}
            </ScrollView>
          ) : (
             // Enhanced Empty State for Journal
            <View style={styles.emptyStateContainer}>
              <FontAwesome5 name="pencil-alt" size={38} color={COLORS.journal} />
              <Text style={styles.emptyStateTitle}>Ready to Reflect?</Text>
              <Text style={styles.emptyStateText}>Journaling helps clear the mind.</Text>
              <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: COLORS.journal }]} onPress={() => navigation.navigate("CreateJournal")}>
                <Text style={styles.emptyStateButtonText}>Start Your First Entry</Text>
              </TouchableOpacity>
               {/* Suggest a prompt even if no journals exist */}
              {prompts.length > 0 && (
                 <TouchableOpacity style={styles.emptyStatePromptButton} onPress={() => navigation.navigate("CreateJournal", { promptId: prompts[0]._id })}>
                      <Text style={styles.emptyStatePromptText}>Try this prompt: "{prompts[0].title}"</Text>
                  </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Suggested Matches */}
        {matches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <View style={styles.sectionHeaderTitle}>
                 <Ionicons name="people-circle-outline" size={22} color={COLORS.accent} style={{marginRight: 8}}/>
                 <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Suggested Connections</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("Matches")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContainer}>
              {matches.slice(0, 5).map(match => ( // Show max 5 inline
                <TouchableOpacity
                  key={match._id}
                  style={styles.matchCard}
                  onPress={() => navigation.navigate("MatchDetail", { matchId: match.matchId._id })} // Ensure this screen exists
                >
                  <View style={styles.matchAvatar}>
                     {/* Use a placeholder or fetch avatar if available */}
                    <Ionicons name="person-outline" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.matchName} numberOfLines={1}>
                    {match.matchId.username} {/* Displaying username - ensure it's anonymized if needed */}
                  </Text>
                  <View style={[styles.matchScore, {backgroundColor: scoreColor(match.score)}]}>
                    <Text style={styles.matchScoreText}>
                      {Math.round(match.score * 100)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Writing Prompts Section (if not shown earlier or want more) */}
        {prompts.length > 0 && (
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderTitle}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={COLORS.interest} style={{marginRight: 8}}/>
                    <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Need Inspiration?</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Prompts")}> {/* Ensure Prompts screen exists */}
                    <Text style={styles.seeAllText}>More Prompts</Text>
                </TouchableOpacity>
             </View>
            <View style={styles.promptsGrid}>
              {/* Show 2 prompts in the grid */}
              {prompts.slice(0, 2).map(prompt => (
                <TouchableOpacity
                  key={prompt._id}
                  style={styles.promptGridItem}
                  onPress={() => navigation.navigate("CreateJournal", { promptId: prompt._id })}
                >
                  <View style={[styles.promptIcon, { backgroundColor: getCategoryColor(prompt.category) }]}>
                    <Ionicons name={getCategoryIcon(prompt.category)} size={20} color="#FFF" />
                  </View>
                  <Text style={styles.promptTitle} numberOfLines={2}>{prompt.title}</Text>
                  <Text style={styles.promptCategory}>{prompt.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Footer space for bottom tab bar */}
      <View style={styles.footerSpace} />
    </>
  );


  // --- Main Return ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Use dark-content for light backgrounds, light-content for dark backgrounds */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.gradient.start} />

      {/* Animated background elements (Subtle) */}
      <View style={styles.bgContainer}>
        <LottieView
          source={require("../../assets/relax-bg.json")} // Ensure path is correct
          autoPlay
          loop
          speed={0.2} // Slower speed
          style={[StyleSheet.absoluteFill, { opacity: 0.08 }]} // Lower opacity
        />
      </View>

      {/* Header with Gradient */}
      <LinearGradient
         colors={[COLORS.gradient.start, COLORS.gradient.middle]} // Simpler gradient
         style={styles.header}
         start={{ x: 0, y: 0 }}
         end={{ x: 1, y: 0 }}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
             <View style={styles.headerLeft}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                {/* Display username carefully - consider privacy implications */}
                <Text style={styles.username}>{user?.username || 'Welcome'}</Text>
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Search")}>
                    <Ionicons name="search-outline" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Profile")}>
                    {/* Replace with profile picture if available */}
                    <Ionicons name="person-circle-outline" size={32} color="#FFF" />
                </TouchableOpacity>
            </View>
        </Animated.View>
      </LinearGradient>

      {/* Main Content Feed */}
      <FlatList
        data={vents}
        keyExtractor={item => item._id}
        renderItem={renderVentItem}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreVents}
        onEndReachedThreshold={0.7} // Trigger load more when 70% scrolled
        refreshControl={
          <RefreshControl
            refreshing={refreshing && page === 1} // Only show spinner on pull-to-refresh, not load more
            onRefresh={handleRefresh}
            tintColor={COLORS.primary} // Color of the spinner
            colors={[COLORS.primary, COLORS.vent]} // Android colors
          />
        }
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContentContainer}
        // Add item layout for performance optimization if vent cards have fixed height
        // getItemLayout={(data, index) => ( {length: VENT_CARD_HEIGHT, offset: VENT_CARD_HEIGHT * index, index} )}
      />

      {/* Add Vent FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateVent")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

// Helper function for Match Score Color (Example)
function scoreColor(score) {
    if (score > 0.8) return COLORS.success;
    if (score > 0.6) return COLORS.journal; // Amber for medium
    return COLORS.interest; // Blue for lower
}


// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Use the light background
  },
  bgContainer: { // For the subtle Lottie background
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, // Ensure it's behind everything
  },
  header: { // Applied to the LinearGradient
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10, // Adjust top padding
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20, // Subtle rounding
    borderBottomRightRadius: 20,
    elevation: 4, // Android shadow
    shadowColor: COLORS.shadow, // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: { // Content inside the gradient header
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1, // Allow text to take available space
    marginRight: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Poppins_300Light',
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  username: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: '#FFF',
  },
  iconButton: { // Style for header icons
    padding: 8, // Increase touch area
    marginLeft: 8,
  },
  listContentContainer: {
      paddingBottom: 20, // Add padding at the very bottom of the scroll
  },
  welcomeContainer: { // Container for the welcome text
    paddingHorizontal: 20,
    marginTop: 20, // Space from header
    marginBottom: 25, // Space before quick actions
  },
  welcomeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.text.dark, // Use dark text on light background
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out actions evenly
    paddingHorizontal: 15,
    marginBottom: 30, // More space after actions
  },
  // QuickActionButton component should handle its internal style

  trendingContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  trendingTagsContainer: {
    paddingVertical: 8, // Add vertical padding for tags
    paddingRight: 20, // Allow last tag to have space
  },
  trendingTag: {
    backgroundColor: COLORS.primary + '20', // Light primary background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '30', // Subtle border
  },
  trendingTagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLORS.primary, // Primary color text
  },
  section: {
    marginBottom: 30, // Increased space between sections
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15, // Increased space below header
  },
   sectionHeaderTitle: { // Group icon and title
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.text.dark, // Use dark text color for sections
  },
  seeAllText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.primary, // Use primary color for links
    opacity: 0.9,
  },
  ventCardContainer: { // Styles for the wrapper around VentCard
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16, // Softer corners
    backgroundColor: COLORS.card,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 }, // Slightly larger shadow
    shadowOpacity: 0.1, // Subtle opacity
    shadowRadius: 8,
    elevation: 3, // Lower elevation for softer feel
  },
  // VentCard component needs its own internal padding and styles

  quickReactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Evenly space reactions
    alignItems: 'center',
    paddingVertical: 8, // Slightly less vertical padding
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.background, // Use background color for subtle separator
  },
  quickReactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8, // Consistent padding for touch area
  },
  commentCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.text.light,
    marginLeft: 5,
  },
  endOfFeedText: {
      textAlign: 'center',
      fontFamily: 'Poppins_400Regular',
      color: COLORS.text.light,
      paddingVertical: 20,
      marginBottom: 10,
  },
  valueAddContainer: { // Container for Journal, Matches, Prompts sections
    backgroundColor: COLORS.background, // Matches main background
    // Optional: Add a subtle top border if needed:
    // borderTopWidth: 1,
    // borderTopColor: '#EAEAEA',
    paddingTop: 20, // Space from feed end indicator
    marginTop: 10,
  },
  horizontalScrollContainer: { // Used for Journals, Matches
    paddingHorizontal: 16,
    paddingVertical: 10, // Add vertical padding
    paddingRight: 30, // Ensure space after the last card
  },
  // JournalEntryCard needs its own styling

  emptyStateContainer: { // For Journal empty state
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 25,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyStateTitle: {
      fontFamily: 'Poppins_500Medium',
      fontSize: 18,
      color: COLORS.text.dark,
      marginTop: 15,
      marginBottom: 5,
  },
  emptyStateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.text.medium,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#fff',
  },
   emptyStatePromptButton: {
      marginTop: 15,
      paddingVertical: 8,
  },
  emptyStatePromptText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: COLORS.primary,
      textAlign: 'center',
  },

  matchCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    width: 110, // Slightly wider
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '15', // Very light primary bg
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLORS.text.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  matchScore: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#fff',
  },
  promptsGrid: { // For the 2-prompt grid
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Space items evenly
    paddingHorizontal: 16,
  },
  promptGridItem: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15, // More padding
    marginBottom: 12, // Space between items if they wrap
    width: (width - 48) / 2, // Calculate width for 2 columns with padding
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    minHeight: 130, // Ensure items have a minimum height
  },
  promptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20, // Fully rounded
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.text.dark,
    lineHeight: 20, // Improve line spacing
    marginBottom: 6,
    flexGrow: 1, // Allow title to take up space
  },
  promptCategory: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: COLORS.text.light,
    textTransform: 'uppercase', // Style category
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 85, // Adjust based on your BottomTabBar height
    width: 60, // Slightly larger FAB
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.vent, // Use the defined Vent color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.vent, // Use color in shadow for glow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8, // Higher elevation for FAB
    zIndex: 100, // Ensure it's above list content
  },
  footerSpace: { // Space at the bottom so FAB doesn't overlap last item
    height: 100, // Should be roughly FAB position + buffer
  }
});