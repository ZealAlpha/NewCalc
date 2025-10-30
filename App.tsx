import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './global.css';
import Premium from './src/screens/premium';
import CodePush from "@code-push-next/react-native-code-push";
<<<<<<< HEAD
import { useAppRating } from './src/hooks/useAppRating';
import { RatingModal } from './src/components/RatingModal';
import { SettingsProvider } from './src/context/SettingsContext';
=======
>>>>>>> parent of 4973ed4 (Latest October)

// Screens
import Index from './src/screens/index';
import _layout from './src/screens/_layout';

// 🔐 Use test IDs for development
// const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz';
// const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    CodePush.sync({
      installMode: CodePush.InstallMode.IMMEDIATE,
      updateDialog: true,
    });
  }, []);
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 bg-white">



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
    </>
  );
}
