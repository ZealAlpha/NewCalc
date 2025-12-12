import React, { useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { SystemBars } from 'react-native-edge-to-edge';

import CustomNavBar from '../navigation/CustomNavBar';
import Crypto from './crypto';
import Forex from './forex';
import Deriv from './deriv';
import Settings from './settings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../components/ThemeContext';
// import Premium from './premium';

type RootTabParamList = {
  Crypto: undefined;
  Forex: undefined;
  Deriv: undefined;
  Settings: undefined;
  // Premium: undefined;
};

// Accept route prop to receive screen info from parent stack
type Props = {
  route: RouteProp<{ Layout: { screen?: keyof RootTabParamList } }, 'Layout'>;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function Layout({ route }: Props) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const initialTab = route?.params?.screen ?? 'Crypto'; // default to 'Crypto' if none passed

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <>
      <SafeAreaView className={`w-full h-full ${isDark ? 'bg-black-300' : 'bg-white'}`}>
        <SystemBars style="dark" />
        <Tab.Navigator
          initialRouteName={initialTab}
          screenOptions={{ headerShown: false }}
          tabBar={(props: BottomTabBarProps) => (
            <CustomNavBar {...props} keyboardVisible={keyboardVisible} />
          )}
        >
          <Tab.Screen name="Crypto" component={Crypto} />
          <Tab.Screen name="Forex" component={Forex} />
          <Tab.Screen name="Deriv" component={Deriv} />
          <Tab.Screen name="Settings" component={Settings} />
          {/*<Tab.Screen name="Premium" component={Premium} />*/}
        </Tab.Navigator>
      </SafeAreaView>
    </>
  );
}