// File: mobile/src/components/QuickActionButton.js
// Purpose: Beautiful quick action buttons for the home screen

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_500Medium } from '@expo-google-fonts/inter';

const QuickActionButton = ({ icon, text, color, onPress }) => {
  // Font loading
  const [fontsLoaded] = useFonts({
    Inter_500Medium
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 70,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});

export default QuickActionButton;