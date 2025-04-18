// File: mobile/src/context/AuthContext.js
// Purpose: Manage authentication state across the app

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    loadStoredToken();
  }, []);

  // Load token from secure storage
  const loadStoredToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('jwt');
      
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        await fetchUserProfile(storedToken);
      }
    } catch (error) {
      console.error('Error loading authentication:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile with token
  const fetchUserProfile = async (authToken) => {
    try {
      // First get the user ID
      const meResponse = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const userId = meResponse.data.userId;
      
      // Then fetch the full profile
      const profileResponse = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setUser(profileResponse.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If we can't get the profile, we should log out
      logout();
    }
  };

  // Request OTP for phone number
  const requestOTP = async (phone) => {
    try {
      await axios.post(`${API_URL}/auth/request-otp`, { phone });
      return { success: true };
    } catch (error) {
      let message = 'Failed to send verification code';
      
      if (error.response) {
        if (error.response.status === 429) {
          message = 'Too many attempts. Please try again later.';
        } else if (error.response.data && error.response.data.message) {
          message = error.response.data.message;
        }
      }
      
      Toast.show({ 
        type: 'error', 
        text1: message,
        position: 'bottom'
      });
      
      return { success: false, message };
    }
  };

  // Verify OTP
  const verifyOTP = async (phone, code) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { phone, code });
      
      // Store the token
      const newToken = response.data.token;
      await SecureStore.setItemAsync('jwt', newToken);
      
      // Update state
      setToken(newToken);
      setIsAuthenticated(true);
      
      // Return additional info from response
      return { 
        success: true, 
        isNewUser: response.data.isNewUser 
      };
    } catch (error) {
      let message = 'Invalid verification code';
      
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      
      Toast.show({ 
        type: 'error', 
        text1: message,
        position: 'bottom'
      });
      
      return { success: false, message };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      // Handle username change if it's different
      if (user && profileData.username && profileData.username !== user.username) {
        await axios.post(
          `${API_URL}/user/change-username`,
          { newUsername: profileData.username },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Update other profile details
      const updateData = {
        bio: profileData.bio,
        interests: profileData.interests,
        likes: profileData.likes,
        dislikes: profileData.dislikes,
        allowComments: profileData.allowComments
      };
      
      const response = await axios.put(
        `${API_URL}/user/update-details`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local user state
      setUser(response.data.user);
      
      Toast.show({ 
        type: 'success', 
        text1: 'Profile updated successfully',
        position: 'bottom'
      });
      
      return { success: true };
    } catch (error) {
      let message = 'Failed to update profile';
      
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      
      Toast.show({ 
        type: 'error', 
        text1: message,
        position: 'bottom'
      });
      
      return { success: false, message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwt');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Define the value to be provided to consumers
  const value = {
    user,
    loading,
    isAuthenticated,
    token,
    requestOTP,
    verifyOTP,
    updateProfile,
    logout,
    refreshUserProfile: () => fetchUserProfile(token)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;