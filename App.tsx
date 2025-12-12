import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './global.css';
import Premium from './src/screens/premium';
import CodePush from "@code-push-next/react-native-code-push";
<<<<<<< HEAD
import { useAppRating } from './src/hooks/useAppRating';
// import { RatingModal } from './src/components/RatingModal';
import { SettingsProvider } from './src/context/SettingsContext';
<<<<<<< Updated upstream
=======
>>>>>>> parent of 4973ed4 (Latest October)
=======
// import { SystemBars } from "react-native-edge-to-edge";
import { ThemeProvider } from './src/components/ThemeContext';
// import { ThemeContext } from './src/components/ThemeContext';
>>>>>>> Stashed changes

// Screens
import Index from './src/screens/index';
import _layout from './src/screens/_layout';

// 🔐 Use test IDs for development
// const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz';
// const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';

const Stack = createStackNavigator();

export default function App() {
<<<<<<< Updated upstream
=======
  useAppRating();
  // const { theme } = useContext(ThemeContext);
  // const isDark = theme === 'dark';
  // const {
    // showRatingModal,
    // initializeRatingSystem,
    // checkAndShowCustomPrompt, // Renamed from showRatingPrompt
    // incrementUsageCount // NEW: Function to increase the counter
    // handleRateNow,
    // handleLater,
    // handleNever
  // } = useAppRating();
>>>>>>> Stashed changes
  useEffect(() => {
    CodePush.sync({
      installMode: CodePush.InstallMode.IMMEDIATE,
      updateDialog: true,
    });
  }, []);
<<<<<<< Updated upstream
=======

  // useEffect(() => {
    // 1. Initialize the rating system when app starts
    // initializeRatingSystem();

    // 2. Increment usage count immediately on app load/start
    // incrementUsageCount();

  // }, []);

  // useEffect(() => {
  //   // We check for the prompt after the count has been updated and the state re-rendered
  //   // Add a short delay to avoid interrupting initial load
  //   const timer = setTimeout(() => {
  //     checkAndShowCustomPrompt();
  //   }, 500);
  //
  //   return () => clearTimeout(timer);
  // }, [checkAndShowCustomPrompt]); // Dependency: checkAndShowCustomPrompt
>>>>>>> Stashed changes
  // const [showBanner, setShowBanner] = useState(false);

  // useEffect(() => {
  //   // Initialize AdMob
  //   mobileAds().initialize().then(() => {
  //     console.log('AdMob initialized');
  //
  //     // Create interstitial ad instance
  //     const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
  //       requestNonPersonalizedAdsOnly: true,
  //     });
  //
  //     // Set up ad event listener
  //     const unsubscribe = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  //       console.log('Interstitial ad closed');
  //       setShowBanner(true); // Show banner after interstitial is closed
  //     });
  //
  //     // Optional: listen for load errors
  //     interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
  //       console.warn('Interstitial ad error:', error);
  //       setShowBanner(true); // fallback to banner
  //     });
  //
  //     // Load and show interstitial
  //     interstitial.load();
  //
  //     const checkAndShow = setInterval(() => {
  //       if (interstitial.loaded) {
  //         interstitial.show();
  //         clearInterval(checkAndShow);
  //       }
  //     }, 500);
  //
  //     // Cleanup
  //     return () => {
  //       unsubscribe();
  //       clearInterval(checkAndShow);
  //     };
  //   });
  // }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#00000" />
        <View className="flex-1 bg-primary-100">

<<<<<<< Updated upstream


        {/* ✅ Navigation screens */}
        <SettingsProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Index" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Index" component={Index} />
                <Stack.Screen name="Layout" component={_layout} />
                <Stack.Screen name="Premium" component={Premium} />
            </Stack.Navigator>
          </NavigationContainer>
        </SettingsProvider>
        {/*/!* ✅ Show banner only after interstitial is closed *!/*/}
        {/*{showBanner && (*/}
        {/*  <BannerAd*/}
        {/*    unitId={bannerAdUnitId}*/}
        {/*    size={BannerAdSize.FULL_BANNER}*/}
        {/*    requestOptions={{ requestNonPersonalizedAdsOnly: true }}*/}
        {/*  />*/}
        {/*)}*/}
      </View>
=======
          {/* ✅ Navigation screens */}
          <ThemeProvider>
            <SettingsProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName="Index" screenOptions={{ headerShown: false, animation: "none"}}>
                  <Stack.Screen name="Index" component={Index} />
                  <Stack.Screen name="Layout" component={_layout} />
                  <Stack.Screen name="Premium" component={Premium} />
                </Stack.Navigator>
              </NavigationContainer>
            </SettingsProvider>
          </ThemeProvider>
          {/*/!* ✅ Show banner only after interstitial is closed *!/*/}
          {/*{showBanner && (*/}
          {/*  <BannerAd*/}
          {/*    unitId={bannerAdUnitId}*/}
          {/*    size={BannerAdSize.FULL_BANNER}*/}
          {/*    requestOptions={{ requestNonPersonalizedAdsOnly: true }}*/}
          {/*  />*/}
          {/*)}*/}
          {/*<RatingModal*/}
          {/*  visible={showRatingModal}*/}
          {/*  onRateNow={handleRateNow}*/}
          {/*  onLater={handleLater}*/}
          {/*  onNever={handleNever}*/}
          {/*  appName="FX Crypto Calculator" // Replace with your actual app name*/}
          {/*/>*/}
        </View>
>>>>>>> Stashed changes
    </>
  );
}