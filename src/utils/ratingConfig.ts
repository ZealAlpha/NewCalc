// src/utils/ratingConfig.ts
import { AndroidMarket } from 'react-native-rate';

export const RATING_CONFIG = {
  INITIAL_DELAY: 24 *60 * 60 * 1000,  // 24 hour after install
  LATER_DELAY: 48 * 60 * 60 * 1000,    // 48 hours after clicking "Later"
  MIN_SESSIONS: 5,                          // Minimum app sessions before showing
  STORAGE_KEYS: {
    INSTALL_DATE: 'app_install_date',
    LAST_PROMPT: 'rating_last_prompt',
    USER_RESPONSE: 'rating_user_response',
    SESSION_COUNT: 'app_session_count',
    RATED: 'app_already_rated'
  },
  RESPONSES: {
    LATER: 'later',
    RATED: 'rated',
    NEVER: 'never'
  }
};

export const getRateOptions = () => ({
  AppleAppID: "6471634980", // Replace with your actual App Store ID
  GooglePackageName: "com.flilbare.afibie", // Replace with your package name
  OtherAndroidURL: "https://play.google.com/store/apps/details?id=com.flilbare.afibie",
  preferredAndroidMarket: AndroidMarket.Google,
  preferInApp: false,
  openAppStoreIfInAppFails: true,
  fallbackPlatformURL: "https://fxcryptocalculator.com"
});