// src/hooks/useAppRating.ts
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Rate from 'react-native-rate';
import { RATING_CONFIG, getRateOptions } from '../utils/ratingConfig';

export const useAppRating = () => {
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Initialize app session tracking
  const initializeRatingSystem = async () => {
    try {
      const installDate = await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.INSTALL_DATE);

      if (!installDate) {
        // First time opening the app
        await AsyncStorage.setItem(
          RATING_CONFIG.STORAGE_KEYS.INSTALL_DATE,
          Date.now().toString()
        );
        await AsyncStorage.setItem(RATING_CONFIG.STORAGE_KEYS.SESSION_COUNT, '1');
      } else {
        // Increment session count
        const sessionCount = await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.SESSION_COUNT);
        const newCount = parseInt(sessionCount || '0') + 1;
        await AsyncStorage.setItem(RATING_CONFIG.STORAGE_KEYS.SESSION_COUNT, newCount.toString());
      }
    } catch (error) {
      console.error('Error initializing rating system:', error);
    }
  };

  // Check if we should show the rating prompt
  const checkShouldShowRating = async () => {
    try {
      // Check if user already rated or chose "never"
      const userResponse = await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.USER_RESPONSE);
      const hasRated = await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.RATED);

      if (userResponse === RATING_CONFIG.RESPONSES.NEVER || hasRated === 'true') {
        return false;
      }

      // Check session count
      const sessionCount = parseInt(
        await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.SESSION_COUNT) || '0'
      );

      if (sessionCount < RATING_CONFIG.MIN_SESSIONS) {
        return false;
      }

      const installDate = parseInt(
        await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.INSTALL_DATE) || '0'
      );
      const lastPrompt = parseInt(
        await AsyncStorage.getItem(RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT) || '0'
      );

      const now = Date.now();

      // If user clicked "Later" before, wait for LATER_DELAY
      if (lastPrompt > 0) {
        return now - lastPrompt >= RATING_CONFIG.LATER_DELAY;
      }

      // Otherwise, wait for INITIAL_DELAY after install
      return now - installDate >= RATING_CONFIG.INITIAL_DELAY;

    } catch (error) {
      console.error('Error checking rating conditions:', error);
      return false;
    }
  };

  // Show rating prompt if conditions are met
  const showRatingPrompt = async () => {
    const shouldShow = await checkShouldShowRating();
    if (shouldShow) {
      setShowRatingModal(true);
    }
  };

  // Handle user clicking "Rate Now"
  const handleRateNow = async () => {
    try {
      setShowRatingModal(false);

      // Mark as rated to prevent future prompts
      await AsyncStorage.setItem(RATING_CONFIG.STORAGE_KEYS.RATED, 'true');
      await AsyncStorage.setItem(
        RATING_CONFIG.STORAGE_KEYS.USER_RESPONSE,
        RATING_CONFIG.RESPONSES.RATED
      );

      // Open app store
      Rate.rate(getRateOptions(), (success, errorMessage) => {
        if (success) {
          console.log('Rating successful');
        } else if (errorMessage) {
          console.error('Rating error:', errorMessage);
        }
      });

    } catch (error) {
      console.error('Error handling rate now:', error);
    }
  };

  // Handle user clicking "Later"
  const handleLater = async () => {
    try {
      setShowRatingModal(false);

      // Record when user clicked "Later"
      await AsyncStorage.setItem(
        RATING_CONFIG.STORAGE_KEYS.LAST_PROMPT,
        Date.now().toString()
      );
      await AsyncStorage.setItem(
        RATING_CONFIG.STORAGE_KEYS.USER_RESPONSE,
        RATING_CONFIG.RESPONSES.LATER
      );

    } catch (error) {
      console.error('Error handling later:', error);
    }
  };

  // Handle user clicking "Never"
  const handleNever = async () => {
    try {
      setShowRatingModal(false);

      // Mark to never show again
      await AsyncStorage.setItem(
        RATING_CONFIG.STORAGE_KEYS.USER_RESPONSE,
        RATING_CONFIG.RESPONSES.NEVER
      );

    } catch (error) {
      console.error('Error handling never:', error);
    }
  };

  return {
    showRatingModal,
    setShowRatingModal,
    initializeRatingSystem,
    showRatingPrompt,
    handleRateNow,
    handleLater,
    handleNever
  };
};