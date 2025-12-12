import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InAppReview from "react-native-in-app-review";
import { AppState } from "react-native";

const SESSION_COUNT_KEY = "@session_count";
const HAS_RATED_KEY = "@has_rated";

export function useAppRating() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextState: string) => {
    // Detect app going from foreground → background (session ended)
    if (appState.current === "active" && nextState.match(/inactive|background/)) {
      await registerSession();
    }

    appState.current = nextState;
  };

  const registerSession = async () => {
    const hasRated = await AsyncStorage.getItem(HAS_RATED_KEY);
    if (hasRated === "true") return; // stop forever

    let sessionCount = parseInt((await AsyncStorage.getItem(SESSION_COUNT_KEY)) || "0", 10);
    sessionCount += 1;
    await AsyncStorage.setItem(SESSION_COUNT_KEY, sessionCount.toString());

    // Trigger review on session 7 and 12
    if (sessionCount === 7 || sessionCount === 12) {
      await triggerNativeReview();
    }
  };



  const triggerNativeReview = async () => {
    try {
      if (!InAppReview.isAvailable()) return;

      const completed = await InAppReview.RequestInAppReview();

      // OS considers closing the dialog as a completed flow
      if (completed) {
        await AsyncStorage.setItem(HAS_RATED_KEY, "true");
      }
    } catch (e) {
      console.warn("Review error:", e);
    }
  };

  return {};
}
