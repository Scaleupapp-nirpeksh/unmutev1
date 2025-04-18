// File: mobile/src/components/PromptCard.js
// Purpose: Card component for showing writing prompts

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useFonts, 
  Poppins_500Medium,
  Poppins_400Regular 
} from '@expo-google-fonts/poppins';
import { Inter_400Regular } from '@expo-google-fonts/inter';

// Colors consistent with the app
const COLORS = {
  journal: "#FFC55C",
  text: {
    dark: "#3d4852",
    medium: "#606f7b",
    light: "#8795a1"
  },
  card: "rgba(255, 255, 255, 0.97)",
};

// Get colors and icons for categories
const getCategoryColor = (category) => {
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
  return categories[category] || COLORS.journal;
};

const getCategoryIcon = (category) => {
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
  return icons[category] || "help-circle";
};

const PromptCard = ({ prompt, onPress }) => {
  // Font loading
  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_400Regular,
    Inter_400Regular
  });

  if (!fontsLoaded || !prompt) {
    return null;
  }

  const categoryColor = getCategoryColor(prompt.category);
  const categoryIcon = getCategoryIcon(prompt.category);

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons name={categoryIcon} size={14} color="#FFF" />
        </View>
        
        <View style={styles.difficultyContainer}>
          {Array.from({ length: prompt.difficultyLevel }).map((_, index) => (
            <View key={index} style={styles.difficultyDot} />
          ))}
          {Array.from({ length: 5 - (prompt.difficultyLevel || 0) }).map((_, index) => (
            <View key={index} style={[styles.difficultyDot, styles.difficultyDotInactive]} />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.promptTitle} numberOfLines={2}>
          {prompt.title}
        </Text>
        
        <Text style={styles.promptCategory}>
          {prompt.category}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Ionicons name="create-outline" size={16} color={COLORS.journal} />
        <Text style={styles.writeText}>Write Now</Text>
      </View>
      
      {/* Arrow indicator */}
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={16} color={COLORS.text.light} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    width: 200,
    height: 160,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.journal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.journal,
    marginLeft: 3,
  },
  difficultyDotInactive: {
    backgroundColor: 'rgba(255, 197, 92, 0.3)',
  },
  content: {
    flex: 1,
  },
  promptTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: COLORS.text.dark,
    marginBottom: 5,
    lineHeight: 20,
  },
  promptCategory: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  writeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.journal,
    marginLeft: 6,
  },
  arrow: {
    position: 'absolute',
    right: 12,
    bottom: 14,
  },
});

export default PromptCard;