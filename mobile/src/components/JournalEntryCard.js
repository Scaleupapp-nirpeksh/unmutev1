// File: mobile/src/components/JournalEntryCard.js
// Purpose: Horizontal card component for displaying journal entries in a scrollable list

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
  sentiments: {
    Positive: "#7ED9A6",
    Neutral: "#7eacde",
    Negative: "#FF7E67"
  }
};

const JournalEntryCard = ({ entry, onPress }) => {
  // Font loading
  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_400Regular,
    Inter_400Regular
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Get emotion icons
  const getEmotionIcon = (emotion) => {
    const emotionIcons = {
      'Happy': 'happy',
      'Sad': 'sad',
      'Angry': 'flame',
      'Anxious': 'pulse',
      'Grateful': 'flower',
      'Peaceful': 'leaf',
      'Excited': 'star',
      'Overwhelmed': 'thunderstorm',
      'Hopeful': 'sunny',
      'Determined': 'trophy',
      'Lonely': 'person',
      'Proud': 'ribbon'
    };
    
    return emotionIcons[emotion] || 'heart';
  };

  // Get sentiment icon
  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'Positive': return 'happy';
      case 'Negative': return 'sad';
      default: return 'help-circle';
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
        
        {/* Display sentiment if available */}
        {entry.analysis && (
          <View style={[
            styles.sentimentBadge, 
            { backgroundColor: COLORS.sentiments[entry.analysis.sentiment] || COLORS.journal }
          ]}>
            <Ionicons 
              name={getSentimentIcon(entry.analysis.sentiment)} 
              size={12} 
              color="#FFF" 
            />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>{entry.title}</Text>
      
      <Text 
        style={styles.content} 
        numberOfLines={2}
      >
        {entry.content}
      </Text>
      
      {/* Display emotions if available */}
      {entry.emotions && entry.emotions.length > 0 && (
        <View style={styles.emotionsContainer}>
          {entry.emotions.slice(0, 3).map((emotion, index) => (
            <View key={index} style={styles.emotion}>
              <Ionicons 
                name={getEmotionIcon(emotion)} 
                size={12} 
                color={COLORS.text.medium} 
                style={styles.emotionIcon}
              />
              <Text style={styles.emotionText}>{emotion}</Text>
            </View>
          ))}
          
          {entry.emotions.length > 3 && (
            <Text style={styles.moreEmotions}>+{entry.emotions.length - 3}</Text>
          )}
        </View>
      )}
      
      {/* Display prompt if it was used */}
      {entry.promptId && (
        <View style={styles.promptBadge}>
          <Ionicons name="help-circle" size={12} color={COLORS.journal} />
          <Text style={styles.promptText}>From prompt</Text>
        </View>
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.light,
  },
  sentimentBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.journal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.text.dark,
    marginBottom: 6,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text.medium,
    marginBottom: 10,
    flex: 1,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  emotion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 197, 92, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  emotionIcon: {
    marginRight: 2,
  },
  emotionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: COLORS.text.medium,
  },
  moreEmotions: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: COLORS.text.light,
    alignSelf: 'center',
    marginLeft: 2,
  },
  promptBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: COLORS.journal,
    marginLeft: 2,
  },
});

export default JournalEntryCard;