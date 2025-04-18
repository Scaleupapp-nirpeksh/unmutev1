// File: mobile/src/context/AppContext.js
// Purpose: Manage application state (vents, journals, etc.)

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@env';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';

// Create the context
const AppContext = createContext();

// Custom hook to use the app context
export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  
  // Vents
  const [vents, setVents] = useState([]);
  const [ventsPagination, setVentsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [ventsLoading, setVentsLoading] = useState(false);
  
  // Journal
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalPagination, setJournalPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalPrompts, setJournalPrompts] = useState([]);
  const [journalStreak, setJournalStreak] = useState(null);
  
  // Matches
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  
  // Circles
  const [circles, setCircles] = useState([]);
  const [circlesLoading, setCirclesLoading] = useState(false);

  // Configure axios with auth token
  const apiClient = axios.create({
    baseURL: API_URL
  });
  
  // Update authorization header when token changes
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // === VENTS FUNCTIONS ===
  
  // Fetch vents with pagination and filters
  const fetchVents = async (page = 1, limit = 10, tag = null, search = null) => {
    if (!isAuthenticated) return;
    
    setVentsLoading(true);
    try {
      let url = `${API_URL}/vent?page=${page}&limit=${limit}`;
      if (tag) url += `&tag=${tag}`;
      if (search) url += `&search=${search}`;
      
      const response = await apiClient.get(url);
      
      setVents(response.data.vents);
      setVentsPagination(response.data.pagination);
      
      return response.data.vents;
    } catch (error) {
      console.error('Error fetching vents:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load vents',
        position: 'bottom'
      });
    } finally {
      setVentsLoading(false);
    }
  };
  
  // Get a single vent by ID
  const getVent = async (ventId) => {
    try {
      const response = await apiClient.get(`${API_URL}/vent/${ventId}`);
      return response.data.vent;
    } catch (error) {
      console.error('Error fetching vent:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load vent',
        position: 'bottom'
      });
      return null;
    }
  };
  
  // Create a new vent
  const createVent = async (ventData) => {
    try {
      const response = await apiClient.post(`${API_URL}/vent`, ventData);
      
      // Add to local state if successful
      setVents(prevVents => [response.data.vent, ...prevVents]);
      
      Toast.show({
        type: 'success',
        text1: 'Your thoughts have been shared',
        position: 'bottom'
      });
      
      return { success: true, vent: response.data.vent };
    } catch (error) {
      console.error('Error creating vent:', error);
      
      let message = 'Could not share your thoughts';
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
  
  // Add reaction to a vent
  const reactToVent = async (ventId, reactionType) => {
    try {
      await apiClient.post(`${API_URL}/vent/${ventId}/react`, { reactionType });
      
      // Update local state to reflect the reaction
      await fetchVents(ventsPagination.page, ventsPagination.limit);
      
      return { success: true };
    } catch (error) {
      console.error('Error reacting to vent:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not add reaction',
        position: 'bottom'
      });
      
      return { success: false };
    }
  };
  
  // Add comment to a vent
  const commentOnVent = async (ventId, content) => {
    try {
      const response = await apiClient.post(`${API_URL}/vent/${ventId}/comment`, { content });
      
      Toast.show({
        type: 'success',
        text1: 'Comment added',
        position: 'bottom'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error commenting on vent:', error);
      
      let message = 'Could not add comment';
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
  
  // Delete a vent
  const deleteVent = async (ventId) => {
    try {
      await apiClient.delete(`${API_URL}/vent/${ventId}`);
      
      // Remove from local state
      setVents(prevVents => prevVents.filter(vent => vent._id !== ventId));
      
      Toast.show({
        type: 'success',
        text1: 'Vent deleted',
        position: 'bottom'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting vent:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not delete vent',
        position: 'bottom'
      });
      
      return { success: false };
    }
  };
  
  // Report a vent
  const reportVent = async (ventId, reason) => {
    try {
      await apiClient.post(`${API_URL}/vent/${ventId}/report`, { reason });
      
      Toast.show({
        type: 'success',
        text1: 'Vent reported',
        text2: 'Thank you for helping keep the community safe',
        position: 'bottom'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error reporting vent:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not report vent',
        position: 'bottom'
      });
      
      return { success: false };
    }
  };
  
  // === JOURNAL FUNCTIONS ===
  
  // Fetch journal entries with filters
  const fetchJournalEntries = async (page = 1, limit = 10, filters = {}) => {
    if (!isAuthenticated) return;
    
    setJournalLoading(true);
    try {
      let url = `${API_URL}/journal?page=${page}&limit=${limit}`;
      
      // Add optional filters
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.emotions) url += `&emotions=${filters.emotions}`;
      if (filters.tags) url += `&tags=${filters.tags}`;
      if (filters.searchQuery) url += `&searchQuery=${filters.searchQuery}`;
      
      const response = await apiClient.get(url);
      
      setJournalEntries(response.data.journalEntries);
      setJournalPagination(response.data.pagination);
      
      return response.data.journalEntries;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load journal entries',
        position: 'bottom'
      });
    } finally {
      setJournalLoading(false);
    }
  };
  
  // Get a single journal entry by ID
  const getJournalEntry = async (entryId) => {
    try {
      const response = await apiClient.get(`${API_URL}/journal/${entryId}`);
      return response.data.journalEntry;
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load journal entry',
        position: 'bottom'
      });
      return null;
    }
  };
  
  // Create a new journal entry
  const createJournalEntry = async (entryData) => {
    try {
      const response = await apiClient.post(`${API_URL}/journal`, entryData);
      
      // Add to local state if successful
      setJournalEntries(prevEntries => [response.data.journalEntry, ...prevEntries]);
      
      // Also refresh streak info since it may have changed
      fetchJournalStreak();
      
      Toast.show({
        type: 'success',
        text1: 'Journal entry saved',
        position: 'bottom'
      });
      
      return { success: true, entry: response.data.journalEntry };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      
      let message = 'Could not save journal entry';
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
  
  // Update a journal entry
  const updateJournalEntry = async (entryId, entryData) => {
    try {
      const response = await apiClient.put(`${API_URL}/journal/${entryId}`, entryData);
      
      // Update in local state
      setJournalEntries(prevEntries => 
        prevEntries.map(entry => 
          entry._id === entryId ? response.data.journalEntry : entry
        )
      );
      
      Toast.show({
        type: 'success',
        text1: 'Journal entry updated',
        position: 'bottom'
      });
      
      return { success: true, entry: response.data.journalEntry };
    } catch (error) {
      console.error('Error updating journal entry:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not update journal entry',
        position: 'bottom'
      });
      
      return { success: false };
    }
  };
  
  // Delete a journal entry
  const deleteJournalEntry = async (entryId) => {
    try {
      await apiClient.delete(`${API_URL}/journal/${entryId}`);
      
      // Remove from local state
      setJournalEntries(prevEntries => 
        prevEntries.filter(entry => entry._id !== entryId)
      );
      
      Toast.show({
        type: 'success',
        text1: 'Journal entry deleted',
        position: 'bottom'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not delete journal entry',
        position: 'bottom'
      });
      
      return { success: false };
    }
  };
  
  // Fetch random journal prompts
  const fetchJournalPrompts = async (category = null, difficultyLevel = null, targetEmotions = null, limit = 10) => {
    try {
      let url = `${API_URL}/journal/prompts/random?limit=${limit}`;
      
      if (category) url += `&category=${category}`;
      if (difficultyLevel) url += `&difficultyLevel=${difficultyLevel}`;
      if (targetEmotions) url += `&targetEmotions=${targetEmotions}`;
      
      const response = await apiClient.get(url);
      
      setJournalPrompts(response.data.prompts);
      return response.data.prompts;
    } catch (error) {
      console.error('Error fetching journal prompts:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load writing prompts',
        position: 'bottom'
      });
      return [];
    }
  };
  
  // Fetch journal streak and stats
  const fetchJournalStreak = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/journal/streak/stats`);
      setJournalStreak(response.data.streak);
      return response.data.streak;
    } catch (error) {
      console.error('Error fetching journal streak:', error);
      return null;
    }
  };
  
  // Mark achievements as seen
  const markAchievementsSeen = async () => {
    try {
      await apiClient.post(`${API_URL}/journal/streak/achievements/seen`);
      
      // Update local state - mark all as seen
      if (journalStreak) {
        setJournalStreak(prev => ({
          ...prev,
          achievements: prev.achievements.map(a => ({ ...a, seen: true }))
        }));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error marking achievements as seen:', error);
      return { success: false };
    }
  };
  
  // === MATCHES FUNCTIONS ===
  
  // Fetch user matches
  const fetchMatches = async () => {
    if (!isAuthenticated) return;
    
    setMatchesLoading(true);
    try {
      const response = await apiClient.get(`${API_URL}/match`);
      
      setMatches(response.data.matches);
      return response.data.matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load matches',
        position: 'bottom'
      });
      return [];
    } finally {
      setMatchesLoading(false);
    }
  };
  
  // Get details about a specific match
  const getMatchDetails = async (matchId) => {
    try {
      const response = await apiClient.get(`${API_URL}/match/${matchId}`);
      return response.data.match;
    } catch (error) {
      console.error('Error fetching match details:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load match details',
        position: 'bottom'
      });
      return null;
    }
  };
  
  // Trigger recalculation of matches
  const recalculateMatches = async () => {
    try {
      await apiClient.post(`${API_URL}/match/recalculate`);
      
      Toast.show({
        type: 'success',
        text1: 'Updating your matches',
        text2: 'This may take a moment',
        position: 'bottom'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error recalculating matches:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not update matches',
        position: 'bottom'
      });
      
      return { success: false };
    }
  };
  
  // === CIRCLES FUNCTIONS ===
  
  // Fetch circles
  const fetchCircles = async () => {
    if (!isAuthenticated) return;
    
    setCirclesLoading(true);
    try {
      // Assuming there's an endpoint to list all circles
      const response = await apiClient.get(`${API_URL}/circle`);
      
      setCircles(response.data.circles);
      return response.data.circles;
    } catch (error) {
      console.error('Error fetching circles:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not load circles',
        position: 'bottom'
      });
      return [];
    } finally {
      setCirclesLoading(false);
    }
  };
  
  // Join a circle
  const joinCircle = async (slug) => {
    try {
      const response = await apiClient.post(`${API_URL}/circle/${slug}/join`);
      
      Toast.show({
        type: 'success',
        text1: `Joined ${response.data.title}`,
        position: 'bottom'
      });
      
      return { success: true, circle: response.data };
    } catch (error) {
      console.error('Error joining circle:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not join circle',
        position: 'bottom'
      });
      
      return { success: false };
    }
  };
  
  // Get circle feed
  const getCircleFeed = async (slug) => {
    try {
      const response = await apiClient.get(`${API_URL}/circle/${slug}/feed`);
      return response.data;
    } catch (error) {
      console.error('Error fetching circle feed:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Could not load circle content',
        position: 'bottom'
      });
      
      return [];
    }
  };

  // Define the context value
  const value = {
    // Vents
    vents,
    ventsPagination,
    ventsLoading,
    fetchVents,
    getVent,
    createVent,
    reactToVent,
    commentOnVent,
    deleteVent,
    reportVent,
    
    // Journal
    journalEntries,
    journalPagination,
    journalLoading,
    journalPrompts,
    journalStreak,
    fetchJournalEntries,
    getJournalEntry,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    fetchJournalPrompts,
    fetchJournalStreak,
    markAchievementsSeen,
    
    // Matches
    matches,
    matchesLoading,
    fetchMatches,
    getMatchDetails,
    recalculateMatches,
    
    // Circles
    circles,
    circlesLoading,
    fetchCircles,
    joinCircle,
    getCircleFeed
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;