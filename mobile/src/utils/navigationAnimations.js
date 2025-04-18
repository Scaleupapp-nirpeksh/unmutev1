// File: mobile/src/utils/navigationAnimations.js
// Purpose: Custom transition animations for navigation

import { Animated } from 'react-native';

// Horizontal slide transition (default card style)
export const cardStyleInterpolator = ({ current, layouts, next }) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  });

  const slideFromRight = { transform: [{ translateX }] };
  
  // For the screen that's being dismissed
  const overlayOpacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  // When going back, create a nice opacity fade for the screen underneath
  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.8],
      })
    : 1;
  
  return {
    cardStyle: slideFromRight,
    overlayStyle: { opacity: overlayOpacity },
    containerStyle: { opacity: nextOpacity },
  };
};

// Modal style - slides up from bottom with fade
export const modalStyleInterpolator = ({ current, layouts }) => {
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.height, 0],
    extrapolate: 'clamp',
  });
  
  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });
  
  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
    extrapolate: 'clamp',
  });
  
  return {
    cardStyle: {
      transform: [{ translateY }, { scale }],
      opacity,
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
        extrapolate: 'clamp',
      }),
    },
  };
};

// Special transition for profile screen - fade and scale
export const profileStyleInterpolator = ({ current, next, layouts }) => {
  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  
  return {
    cardStyle: {
      transform: [{ scale }],
      opacity,
    },
  };
};

// Fade transition for subtle screens
export const fadeStyleInterpolator = ({ current }) => {
  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  return {
    cardStyle: {
      opacity,
    },
  };
};

// Shared transitions options - for shared element transitions
export const sharedElementTransition = {
  animation: 'spring',
  config: {
    mass: 1,
    damping: 30,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Screen transition options creator - use this to create consistent transition options
export function createTransitionOptions(type = 'default', customOptions = {}) {
  const baseOptions = {
    gestureEnabled: true,
    headerShown: false,
  };
  
  let transitionOptions = {};
  
  switch (type) {
    case 'modal':
      transitionOptions = {
        presentation: 'modal',
        cardStyleInterpolator: modalStyleInterpolator,
        gestureDirection: 'vertical',
      };
      break;
    case 'profile':
      transitionOptions = {
        cardStyleInterpolator: profileStyleInterpolator,
        gestureEnabled: false, // Usually profile is accessed from multiple places
      };
      break;
    case 'fade':
      transitionOptions = {
        cardStyleInterpolator: fadeStyleInterpolator,
        gestureDirection: 'horizontal',
      };
      break;
    default:
      transitionOptions = {
        cardStyleInterpolator: cardStyleInterpolator,
        gestureDirection: 'horizontal',
      };
  }
  
  return {
    ...baseOptions,
    ...transitionOptions,
    ...customOptions,
  };
}