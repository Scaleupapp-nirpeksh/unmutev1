// File: mobile/src/components/VentCard.js
// Purpose: Card component for displaying vent posts

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
  primary: "#5a8ccc",
  text: {
    dark: "#3d4852",
    medium: "#606f7b",
    light: "#8795a1"
  },
  reactions: {
    supportive: "#7ED9A6",
    same: "#5a8ccc",
    hugs: "#FFC55C",
    heart: "#FF5E7D",
    notAlone: "#B288FD"
  },
  card: "rgba(255, 255, 255, 0.97)",
};

// Get the reaction icon based on type
const getReactionIcon = (type) => {
  switch (type) {
    case 'supportive': return 'thumbs-up';
    case 'same': return 'checkmark-circle';
    case 'hugs': return 'hand-left';
    case 'heart': return 'heart';
    case 'notAlone': return 'people';
    default: return 'heart';
  }
};

const VentCard = ({ vent, onPress }) => {
  // Font loading
  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_400Regular,
    Inter_400Regular
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Calculate total reactions
  const totalReactions = vent.reactions ? vent.reactions.length : 0;
  
  // Calculate total comments
  const totalComments = vent.comments ? vent.comments.length : 0;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#FFF" />
          </View>
          <Text style={styles.anonymous}>Anonymous</Text>
        </View>
        <Text style={styles.time}>{formatDate(vent.createdAt)}</Text>
      </View>

      <Text style={styles.title}>{vent.title}</Text>
      
      <Text 
        style={styles.content} 
        numberOfLines={3}
      >
        {vent.content}
      </Text>
      
      {vent.tags && vent.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {vent.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.reactions}>
          {/* Group reactions by type */}
          {Object.entries(vent.reactionCounts || {}).map(([type, count]) => (
            <View key={type} style={styles.reaction}>
              <Ionicons 
                name={getReactionIcon(type)} 
                size={16} 
                color={COLORS.reactions[type] || COLORS.primary} 
              />
              <Text style={styles.reactionCount}>{count}</Text>
            </View>
          ))}
          
          {/* If no reactions yet */}
          {(!vent.reactionCounts || Object.keys(vent.reactionCounts).length === 0) && (
            <View style={styles.reaction}>
              <Ionicons name="heart-outline" size={16} color={COLORS.text.light} />
            </View>
          )}
        </View>
        
        <View style={styles.commentsContainer}>
          <Ionicons name="chatbubble-outline" size={14} color={COLORS.text.light} />
          <Text style={styles.commentsCount}>
            {totalComments > 0 ? totalComments : 'Comment'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  anonymous: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.text.medium,
  },
  time: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.light,
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.text.dark,
    marginBottom: 8,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text.medium,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(90, 140, 204, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  reactionCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.medium,
    marginLeft: 3,
  },
  commentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text.light,
    marginLeft: 4,
  },
});

export default VentCard;