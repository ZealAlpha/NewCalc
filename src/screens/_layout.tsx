import React, { useEffect, useState } from 'react';
import { Keyboard, StatusBar } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

import CustomNavBar from '../navigation/CustomNavBar';
import Crypto from './crypto';
import Forex from './forex';
import Settings from './settings';
import Premium from './premium';

type RootTabParamList = {
  Crypto: undefined;
  Forex: undefined;
  Settings: undefined;
  Premium: undefined;
};

// Accept route prop to receive screen info from parent stack
type Props = {
  route: RouteProp<{ Layout: { screen?: keyof RootTabParamList } }, 'Layout'>;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function _layout({ route }: Props) {
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Tab.Navigator
        initialRouteName={initialTab}
        screenOptions={{ headerShown: false }}
        tabBar={(props: BottomTabBarProps) => (
          <CustomNavBar {...props} keyboardVisible={keyboardVisible} />
        )}
      >
        <Tab.Screen name="Crypto" component={Crypto} />
        <Tab.Screen name="Forex" component={Forex} />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Premium" component={Premium} />
      </Tab.Navigator>
    </>
  );
}
