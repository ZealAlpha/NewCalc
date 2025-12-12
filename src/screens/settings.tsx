import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, Linking, Share, Platform, ScrollView, Switch, Animated } from 'react-native';
import { ThemeContext } from '../components/ThemeContext.tsx';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useSettings } from '../context/SettingsContext.tsx';

const Settings = () => {
  const { theme, themePreference, setThemePreference } = useContext(ThemeContext);
  const { showRiskRewardSection, setShowRiskRewardSection, isAdvancedMode, setIsAdvancedMode } = useSettings();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const isDark = theme === 'dark';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);


  const openModal = (content: string) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing Position Size Calculator App!',
        url: 'https://fxcryptocalculator.com/',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleRateUs = () => {
    const storeLink =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/us/app/crypto-position-size-calc/id6471634980'
        : 'https://play.google.com/store/apps/details?id=com.flilbare.afibie&pcampaignid=web_share';
    Linking.openURL(storeLink).catch(err => console.error('Error opening store:', err));
  };

  const handleContactUs = () => {
    const email = 'afibie247@gmail.com';
    const subject = 'Support Request - FxCryptoCalculator';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(mailtoUrl).catch(err => console.error('Error opening email:', err));
  };

  // Cycle through theme preferences: system -> light -> dark -> system
  const cycleTheme = () => {
    console.log('Current theme preference:', themePreference);
    let newPreference: 'light' | 'dark' | 'system';

    if (themePreference === 'system') {
      newPreference = 'light';
    } else if (themePreference === 'light') {
      newPreference = 'dark';
    } else {
      newPreference = 'system';
    }

    console.log('Setting new theme preference:', newPreference);
    setThemePreference(newPreference);
  };

  // Get display text and icon for current theme preference
  const getThemeDisplay = () => {
    switch (themePreference) {
      case 'light':
        return { icon: 'sun' as const, iconStyle: 'regular' as const, text: 'Light' };
      case 'dark':
        return { icon: 'moon' as const, iconStyle: 'solid' as const, text: 'Dark' };
      case 'system':
        return { icon: 'circle-half-stroke' as const, iconStyle: 'solid' as const, text: 'System' };
    }
  };

  const themeDisplay = getThemeDisplay();

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-black-300' : 'bg-white'}`}>
      <View className="px-4 py-8 pb-20">
        {/* Theme Selector */}
        <Pressable
          onPress={() => {
            console.log('Theme selector pressed');
            cycleTheme();
          }}
          className={`mb-8 flex-row items-center border border-primary-100 rounded-lg px-4 py-3 w-full ${isDark ? 'bg-black-200' : 'bg-gray-50'}`}
          android_ripple={{ color: isDark ? '#333' : '#ddd' }}
          style={({ pressed }) => [
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <FontAwesome6
            name={themeDisplay.icon}
            iconStyle={themeDisplay.iconStyle}
            size={24}
            color={isDark ? 'white' : 'black'}
          />
          <Text className={`ml-2 text-lg ${isDark ? 'text-white' : 'text-black-300'}`}>
            Theme:
          </Text>
          <Text className={`ml-2 font-rubik-bold ${isDark ? 'text-white' : 'text-black-300'}`}>
            {themeDisplay.text}
          </Text>
          <Text className="ml-auto text-gray-400 text-sm">Tap to change</Text>
        </Pressable>

        {/* 1. App Preferences */}
        <View className="mb-8">
          <Text className={`text-xl font-rubik-semibold mb-4 ${isDark ? 'text-white' : 'text-black-300'}`}>
            App Preferences
          </Text>

          <View className={`border border-primary-100 rounded-lg overflow-hidden ${isDark ? 'bg-black-200' : 'bg-gray-50'}`}>
            {/* Show Take Profit & RRR Section */}
            <View className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className={`font-rubik-medium text-base mb-1 ${isDark ? 'text-white' : 'text-black-300'}`}>
                    Show Take Profit &amp; RRR Section
                  </Text>
                  <Text className={`font-rubik text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Display take profit and RRR section
                  </Text>
                </View>

                <Switch
                  value={showRiskRewardSection}
                  onValueChange={setShowRiskRewardSection}
                  trackColor={{ false: '#d1d5db', true: '#f97316' }}
                  thumbColor={showRiskRewardSection ? '#fff' : '#f9fafb'}
                  ios_backgroundColor="#d1d5db"
                  style={{
                    transform: [{ scale: Platform.OS === 'ios' ? 0.9 : 1 }],
                  }}
                />
              </View>
            </View>

            {/* Advanced Mode */}
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className={`font-rubik-medium text-base mb-1 ${isDark ? 'text-white' : 'text-black-300'}`}>
                    Advanced Mode
                  </Text>
                  <Text className={`font-rubik text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Show advanced calculator inputs
                  </Text>
                </View>

                <Switch
                  value={isAdvancedMode}
                  onValueChange={setIsAdvancedMode}
                  trackColor={{ false: '#d1d5db', true: '#f97316' }}
                  thumbColor={isAdvancedMode ? '#fff' : '#f9fafb'}
                  ios_backgroundColor="#d1d5db"
                  style={{ transform: [{ scale: Platform.OS === 'ios' ? 0.9 : 1 }] }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 2. App Information */}
        <View className="mb-8">
          <Text className={`text-xl font-rubik-semibold mb-4 ${isDark ? 'text-white' : 'text-black-300'}`}>
            App Information
          </Text>

          <View className={`border mb-4 border-primary-100 rounded-lg overflow-hidden ${isDark ? 'bg-black-200' : 'bg-gray-50'}`}>
            <Pressable
              className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              disabled
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>
                How to Use
              </Text>
              <Text className={`font-rubik text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Coming Soon</Text>
            </Pressable>

            <Pressable
              className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
              onPress={() => openModal('About Us')}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>About Us</Text>
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>

            <Pressable
              className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
              onPress={() => openModal('Privacy Policy')}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>Privacy Policy</Text>
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>

            <Pressable
              className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
              onPress={() => openModal('Terms of Use')}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>Terms of Use</Text>
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>

            <Pressable
              className="px-4 py-4 flex-row items-center justify-between"
              onPress={() => openModal('Disclaimer')}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>Disclaimer</Text>
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>
          </View>

          {/* Premium Signals CTA */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              className={`mt-4 border border-primary-200 rounded-lg px-4 py-4 flex-row items-center justify-between ${isDark ? 'bg-black-200' : 'bg-gray-50'}`}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              disabled
            >
            <View className="flex-1">
              <Text className={`font-rubik-bold text-base mb-1 ${isDark ? 'text-white' : 'text-black-300'}`}>
                Unlock Our Premium Signals
              </Text>
              <Text className={`font-rubik text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Coming Soon</Text>
            </View>
            <FontAwesome6 name="crown" iconStyle="solid" size={20} color="#f97316" />
            </Pressable>
          </Animated.View>
        </View>

        {/* 3. Support */}
        <View className="mb-8">
          <Text className={`text-xl font-rubik-semibold mb-4 ${isDark ? 'text-white' : 'text-black-300'}`}>
            Support
          </Text>

          <View className={`border border-primary-100 rounded-lg overflow-hidden ${isDark ? 'bg-black-200' : 'bg-gray-50'}`}>
            <Pressable
              className="px-4 py-4 border-b border-gray-200 flex-row items-center justify-between"
              onPress={handleContactUs}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>Contact Us / Report a Bug</Text>
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>

            <Pressable
              className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
              onPress={handleRateUs}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>Rate Us</Text>
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>

            <Pressable
              className="px-4 py-4 flex-row items-center justify-between"
              onPress={handleShare}
              android_ripple={{ color: isDark ? '#333' : '#ddd' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className={`font-rubik-medium ${isDark ? 'text-white' : 'text-black-300'}`}>Share App</Text>
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>
          </View>
        </View>

        {/* App Version */}
        <Text className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          App Version: 1.3.5
        </Text>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 items-center justify-center bg-black/70 px-4">
          <View className={`rounded-xl p-6 w-full max-w-lg ${isDark ? 'bg-black-300' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{modalContent}</Text>
            <View className={`mb-4 max-h-[70vh] ${isDark ? 'text-white' : 'text-gray-700'}`}>
              {modalContent === 'About Us' && (
                <ScrollView className={`space-y-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold font-rubik-bold">Who We Are{'\n'}</Text>
                    FxCryptoCalculator is a mobile app available on both the App Store and Google Play that helps traders make smarter decisions by accurately calculating position sizes for Forex, Crypto, Indices, and Commodities. Whether you're a beginner or a pro, our tool is designed to simplify your risk management and boost your trading confidence.
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold font-rubik-bold">Our Mission{'\n'}</Text>
                    To empower retail traders with simple yet powerful tools that make trading safer, more efficient, and easier to understand.
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold font-rubik-bold">What We Offer{'\n'}</Text>
                    {'\u2022'} Instant position size calculations{'\n'}
                    {'\u2022'} Support for multiple asset classes{'\n'}
                    {'\u2022'} Risk and pip value breakdowns{'\n'}
                    {'\u2022'} A clean, user-friendly interface{'\n'}{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold font-rubik-bold">Who It's For{'\n'}</Text>
                    We serve Forex and Crypto traders globally who want to stay in control of their trades and risk.
                  </Text>

                  <Text className="dark:text-white mb-6">
                    <Text className="font-bold font-rubik-bold">Why You Can Trust Us{'\n'}</Text>
                    We focus on accuracy, simplicity, and user privacy. We constantly update our app to serve the evolving needs of the trading community.{'\n'}{'\n'}
                  </Text>
                </ScrollView>
              )}

              {modalContent === 'Privacy Policy' && (
                <ScrollView className="px-4 space-y-4 text-gray-700 dark:text-white">
                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    Afibie built the FxCryptoCalculator app as an ad-supported app. This SERVICE is provided by Afibie at no cost and is intended for use as-is.
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    This page is used to inform visitors about our policies regarding the collection, use, and disclosure of personal information if anyone decides to use our Service.
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    By using the app, you agree to the collection and use of information in relation to this policy. The personal information we collect is used only to provide and improve the Service. We do not sell your data or share it beyond what's described here.
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Information Collection and Use{'\n'}</Text>
                    For a better experience, we may request certain personally identifiable information (such as your email address when subscribing to the premium version). This information is retained only as long as necessary and handled securely.{'\n'}{'\n'}
                    The app uses third-party services that may collect information to identify you. These include:{'\n'}{'\n'}
                    {'\u2022'} AdMob{'\n'}
                    {'\u2022'} Google Analytics for Firebase{'\n'}
                    {'\u2022'} Firebase Crashlytics{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Log Data{'\n'}</Text>
                    If there's an error in the app, we collect data (via third-party tools) called Log Data. This may include your device's IP address, device name, OS version, the time and date of usage, and other diagnostic stats.{'\n'}{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Cookies{'\n'}</Text>
                    While the app doesn't use cookies directly, third-party services may use cookies to collect data and enhance functionality. You can accept or refuse cookies in your device settings.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Service Providers{'\n'}</Text>
                    We may use third-party companies for:{'\n'}{'\n'}
                    {'\u2022'} App hosting and crash analysis{'\n'}
                    {'\u2022'} Showing ads{'\n'}
                    {'\u2022'} Supporting premium subscriptions{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    These providers may access your personal information only to perform tasks on our behalf and must not misuse it.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Security{'\n'}</Text>
                    We value your trust and use commercially acceptable means to protect your data. However, no method of internet transmission or storage is 100% secure.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Links to Other Sites{'\n'}</Text>
                    The app may contain links to external websites. We are not responsible for the content or policies of those sites and encourage you to review their privacy practices.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Children's Privacy{'\n'}</Text>
                    Our services are not intended for children under 13. We do not knowingly collect information from anyone in that age group. If you believe your child has shared data with us, contact us and we'll delete it.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Changes to This Privacy Policy{'\n'}</Text>
                    We may update this policy from time to time. Any changes will be posted on this page and take effect immediately.{'\n'}
                  </Text>
                </ScrollView>
              )}

              {modalContent === 'Terms of Use' && (
                <ScrollView className="px-4 space-y-4 text-gray-700 dark:text-white">
                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    By using FxCryptoCalculator, you agree to these terms:
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Acceptance of Terms{'\n'}</Text>
                    Using our app means you accept and agree to follow these terms.{'\n'}{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Use of Service{'\n'}</Text>
                    You may use the app only for lawful purposes. You must not misuse or attempt to hack the app.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Intellectual Property{'\n'}</Text>
                    FxCryptoCalculator and its content are owned by us. You may not copy, modify, or resell any part of the app.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Not Financial Advice{'\n'}</Text>
                    The app is for informational and educational purposes only. It does not constitute financial, trading, or investment advice.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Children's Privacy{'\n'}</Text>
                    Our services are not intended for children under 13. We do not knowingly collect information from anyone in that age group. If you believe your child has shared data with us, contact us and we'll delete it.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Limitations of Liability{'\n'}</Text>
                    We do our best to ensure accuracy but are not liable for any losses or damages resulting from use of the app.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Termination{'\n'}</Text>
                    We reserve the right to restrict access or terminate service for users who violate our terms.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Governing Law{'\n'}</Text>
                    These terms are governed by the laws of Nigeria.{'\n'}
                  </Text>
                </ScrollView>
              )}
              {modalContent === 'Disclaimer' && (
                <ScrollView className="px-4 space-y-4 text-gray-700 dark:text-white">
                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Not Financial Advice{'\n'}</Text>
                    FxCryptoCalculator provides general trading tools and information. Nothing in the app constitutes professional financial advice.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Use At Your Own Risk{'\n'}</Text>
                    Trading involves risk. Use this app as a guide, not a guarantee. We are not responsible for your profits or losses.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">Accuracy of Information{'\n'}</Text>
                    While we strive for accuracy, all calculations and data are provided "as is" without warranty.{'\n'}
                  </Text>

                  <Text className={`mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Text className="font-bold">No Liability{'\n'}</Text>
                    FxCryptoCalculator, its creators, and affiliates are not liable for any direct or indirect damages resulting from the use of this app.{'\n'}
                  </Text>
                </ScrollView>
              )}
            </View>
            <Pressable onPress={() => setModalVisible(false)} className="self-end mt-2">
              <Text className="text-blue-600 font-semibold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Settings;