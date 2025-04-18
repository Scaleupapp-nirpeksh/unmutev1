// File: mobile/src/utils/sharedTransitions.js
// Purpose: Create shared element transitions between screens

import React from 'react';
import { Animated } from 'react-native';

// Element mapping between screens
const sharedElementMap = new Map();

// Generate a unique ID for shared elements
export function getSharedElementId(screenName, elementName) {
  return `${screenName}-${elementName}`;
}

// Register a shared element
export function registerSharedElement(id, ref, measurements = null) {
  sharedElementMap.set(id, { ref, measurements });
}

// Unregister a shared element
export function unregisterSharedElement(id) {
  sharedElementMap.delete(id);
}

// Get a shared element
export function getSharedElement(id) {
  return sharedElementMap.get(id);
}

// Measure a component's layout
export function measureElement(component) {
  return new Promise(resolve => {
    if (!component) {
      resolve(null);
      return;
    }
    
    component.measure((x, y, width, height, pageX, pageY) => {
      resolve({
        x: pageX,
        y: pageY,
        width,
        height,
      });
    });
  });
}

// Shared Element component
export const SharedElement = React.forwardRef(({ id, style, onMeasure, children, ...props }, ref) => {
  const innerRef = React.useRef(null);
  const combinedRef = ref || innerRef;
  
  React.useEffect(() => {
    // Register this element when mounted
    registerSharedElement(id, combinedRef);
    
    // Measure the element if needed
    if (onMeasure) {
      measureElement(combinedRef.current).then(measurements => {
        if (measurements) {
          registerSharedElement(id, combinedRef, measurements);
          onMeasure(measurements);
        }
      });
    }
    
    // Unregister when unmounted
    return () => unregisterSharedElement(id);
  }, [id, combinedRef, onMeasure]);
  
  return (
    <Animated.View ref={combinedRef} style={style} {...props}>
      {children}
    </Animated.View>
  );
});

// SharedTransition component - wraps the screen and handles transitions
export const SharedTransitionContainer = ({ children, active, onTransitionStart, onTransitionEnd }) => {
  const [transitioning, setTransitioning] = React.useState(false);
  
  // Handle transition start
  const handleTransitionStart = () => {
    setTransitioning(true);
    if (onTransitionStart) onTransitionStart();
  };
  
  // Handle transition end
  const handleTransitionEnd = () => {
    setTransitioning(false);
    if (onTransitionEnd) onTransitionEnd();
  };
  
  return (
    <Animated.View style={{ flex: 1 }}>
      {children}
    </Animated.View>
  );
};

// Transitions between two screens with shared elements
export const createTransition = (fromScreen, toScreen, sharedElements = []) => {
  // Track animation values
  const animation = new Animated.Value(0);
  
  // Start the transition
  const start = () => {
    // Get all shared elements
    const elements = sharedElements.map(id => ({
      id,
      from: getSharedElement(`${fromScreen}-${id}`),
      to: getSharedElement(`${toScreen}-${id}`),
    }));
    
    // Filter out elements that don't exist in both screens
    const validElements = elements.filter(el => el.from && el.to);
    
    // No valid shared elements, just do a regular transition
    if (validElements.length === 0) {
      return;
    }
    
    // Setup animations for each shared element
    validElements.forEach(el => {
      const { from, to } = el;
      
      // Get measurements
      measureElement(from.ref.current).then(fromMeasurements => {
        measureElement(to.ref.current).then(toMeasurements => {
          if (!fromMeasurements || !toMeasurements) return;
          
          // Create animations for position, size, etc.
          const translateX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [fromMeasurements.x, toMeasurements.x],
          });
          
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [fromMeasurements.y, toMeasurements.y],
          });
          
          const scaleX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [
              fromMeasurements.width / toMeasurements.width,
              1,
            ],
          });
          
          const scaleY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [
              fromMeasurements.height / toMeasurements.height,
              1,
            ],
          });
          
          // Apply animations to the "to" element
          to.ref.current.setNativeProps({
            style: {
              transform: [
                { translateX },
                { translateY },
                { scaleX },
                { scaleY },
              ],
            },
          });
          
          // Start the animation
          Animated.spring(animation, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        });
      });
    });
  };
  
  return { start };
};

// Hook to use shared element transitions
export function useSharedTransition(screenName) {
  const registerElement = React.useCallback((elementName, ref, onMeasure) => {
    const id = getSharedElementId(screenName, elementName);
    registerSharedElement(id, ref);
    
    if (onMeasure) {
      measureElement(ref.current).then(measurements => {
        if (measurements) {
          registerSharedElement(id, ref, measurements);
          onMeasure(measurements);
        }
      });
    }
    
    return () => unregisterSharedElement(id);
  }, [screenName]);
  
  return { registerElement };
}