// File: mobile/src/components/BottomTabBar.js
// Purpose: Custom animated bottom navigation with beautiful indicators

import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_500Medium } from '@expo-google-fonts/poppins';

const { width } = Dimensions.get('window');

// Colors consistent with the rest of the app
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
  vent: "#FF5E7D",
  journal: "#FFC55C",
  matches: "#FF7E67"
};

const BottomTabBar = ({ currentScreen, navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;
  
  // Font loading
  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
  });

  // Animation on mount
  useEffect(() => {
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

    // Start pulsing animation for add button
    startAddButtonAnimation();
  }, []);

  // Pulse animation for the add button
  const startAddButtonAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(addButtonScale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(addButtonScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  // Tab definitions with screens, icons and colors
  const tabs = [
    { id: 'Home', icon: 'home', label: 'Home', color: COLORS.primary },
    { id: 'Vents', icon: 'megaphone', label: 'Vents', color: COLORS.vent },
    { id: 'CreateVent', icon: 'add-circle', label: '', color: COLORS.vent, special: true },
    { id: 'Journal', icon: 'book', label: 'Journal', color: COLORS.journal },
    { id: 'Matches', icon: 'people', label: 'Matches', color: COLORS.matches }
  ];

  // Handle tab press
  const handleTabPress = (screen) => {
    if (screen === 'CreateVent') {
      // Trigger a little animation when pressing the add button
      Animated.sequence([
        Animated.timing(addButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(addButtonScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(addButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
    
    if (screen !== currentScreen) {
      navigation.navigate(screen);
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              tab.special && styles.specialTabButton,
              currentScreen === tab.id && styles.activeTabButton
            ]}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
          >
            {tab.special ? (
              <Animated.View style={[
                styles.addButtonContainer,
                { transform: [{ scale: addButtonScale }] }
              ]}>
                <View style={styles.addButton}>
                  <Ionicons name={tab.icon} size={34} color="#FFF" />
                </View>
              </Animated.View>
            ) : (
              <>
                <Ionicons 
                  name={currentScreen === tab.id ? tab.icon : `${tab.icon}-outline`}
                  size={24} 
                  color={currentScreen === tab.id ? tab.color : COLORS.text.medium} 
                />
                
                {tab.label && (
                  <Text 
                    style={[
                      styles.tabLabel,
                      currentScreen === tab.id ? { 
                        color: tab.color,
                        fontWeight: '500'
                      } : null
                    ]}
                  >
                    {tab.label}
                  </Text>
                )}
                
                {currentScreen === tab.id && (
                  <View style={[styles.activeIndicator, { backgroundColor: tab.color }]} />
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Add a subtle shadow overlay */}
      <View style={styles.tabBarShadow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    paddingHorizontal: 5,
    zIndex: 2,
  },
  tabBarShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.04)',
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    position: 'relative',
  },
  specialTabButton: {
    justifyContent: 'flex-start',
  },
  activeTabButton: {
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.text.medium,
    marginTop: 3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  addButtonContainer: {
    position: 'absolute',
    top: -24,
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.vent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.vent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'white',
  }
});

export default BottomTabBar;