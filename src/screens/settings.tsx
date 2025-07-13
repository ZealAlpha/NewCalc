import React, { useContext, useState } from 'react';
import { View, Text, Modal, Pressable, Linking, Share, Platform, ScrollView } from 'react-native';
import { ThemeContext } from '../components/ThemeContext.tsx';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

const Settings = () => {
    const { theme } = useContext(ThemeContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const isDark = theme === 'dark';



    const openModal = (content: string) => {
        setModalContent(content);
        setModalVisible(true);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out this amazing Position Size Calculator App!',
                url: 'https://afibie.com',
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

    return (
        <View className={`flex-1 justify-between px-4 py-8 ${isDark ? 'bg-black-300' : 'bg-white'}`}>
            <View className="items-center mt-10">
                <View className="mb-9 flex-row items-center">
                    <FontAwesome6 name={isDark ? 'moon' : 'sun'} iconStyle={isDark ? 'solid' : 'regular'} size={24} color={isDark ? 'white' : 'black'} />
                    <Text className={`ml-2 text-lg ${isDark ? 'text-white' : 'text-black-300'}`}>Dark Mode: </Text>
                    <Text className="ml-4 font-rubik-bold dark:text-white text-black-300">System</Text>
                </View>

                <View className="w-full space-y-4 mt-14">
                    <Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white px-6 py-3 rounded-lg" onPress={() => openModal('About Us')}>
                        <Text className=" font-bold dark:text-white text-black-300 font-rubik-medium">About Us</Text>
                    </Pressable>

                    <Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white px-6 py-3 rounded-lg" onPress={() => openModal('Privacy Policy')}>
                        <Text className="dark:text-white text-black-300 font-rubik-medium font-bold">Privacy Policy</Text>
                    </Pressable>

                    <Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white px-6 py-3 rounded-lg" onPress={() => openModal('Terms of Use')}>
                        <Text className="dark:text-white text-black-300 font-rubik-medium font-bold">Terms of Use</Text>
                    </Pressable>

                    <Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white py-3 px-6 rounded-lg" onPress={() => openModal('Disclaimer')}>
                        <Text className="dark:text-white text-black-300 font-rubik-medium font-bold">Disclaimer</Text>
                    </Pressable>

                    <Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white py-3 px-6 rounded-lg" onPress={handleRateUs}>
                        <Text className="dark:text-white text-black-300 font-rubik-medium font-bold">Rate Us</Text>
                    </Pressable>

                    <Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white py-3 px-6 rounded-lg" onPress={handleShare}>
                        <Text className="dark:text-white text-black-300 font-rubik-medium font-bold">Share App</Text>
                    </Pressable>

                    {/*<Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white py-3 px-6 rounded-lg"*/}
                    {/*    onPress={() => handleExternalLink('https://youtube.com/judeumeano')}*/}
                    {/*>*/}
                    {/*    <Text className="dark:text-white text-black-300 font-rubik-medium font-bold">Learn How to Use</Text>*/}
                    {/*</Pressable>*/}

                    {/*<Pressable className="dark:bg-black-300 border mb-4 border-primary-100 bg-white px-6 py-3 rounded-lg" onPress={() => openModal('Support')}>*/}
                    {/*    <Text className="dark:text-white text-black-300 font-rubik-medium font-bold">Support</Text>*/}
                    {/*</Pressable>*/}

                    <Text className={`text-center mt-5 ${isDark ? 'text-white' : 'text-black-300'}`}>
                        App Version: 1.4.1
                        {/*App Version: {Application.nativeApplicationVersion || '1.0.0'}*/}
                    </Text>
                </View>
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 items-center justify-center bg-black/70 px-4">
                    <View className="bg-white dark:bg-black-300 rounded-xl p-6 w-full">
                        <Text className="text-black dark:text-white text-lg font-bold mb-2">{modalContent}</Text>
                        <View className="text-gray-700 dark:text-white mb-4 max-h-[70vh]">
                            {/* Sample content – you can update based on modalContent */}
                            {modalContent === 'About Us' && (
                                <View className="space-y-4 text-gray-700 dark:text-white">


                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold font-rubik-bold">Who We Are{'\n'}</Text>
                                        FxCryptoCalculator is a mobile app available on both the App Store and Google Play that helps traders make smarter decisions by accurately calculating position sizes for Forex, Crypto, Indices, and Commodities. Whether you're a beginner or a pro, our tool is designed to simplify your risk management and boost your trading confidence.
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold font-rubik-bold">Our Mission{'\n'}</Text>
                                        To empower retail traders with simple yet powerful tools that make trading safer, more efficient, and easier to understand.
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold font-rubik-bold">What We Offer{'\n'}</Text>
                                        {'\u2022'} Instant position size calculations{'\n'}
                                        {'\u2022'} Support for multiple asset classes{'\n'}
                                        {'\u2022'} Risk and pip value breakdowns{'\n'}
                                        {'\u2022'} A clean, user-friendly interface{'\n'}{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold font-rubik-bold">Who It’s For{'\n'}</Text>
                                        We serve Forex and Crypto traders globally who want to stay in control of their trades and risk.
                                    </Text>

                                    <Text className="dark:text-white mb-6">
                                        <Text className="font-bold font-rubik-bold">Why You Can Trust Us{'\n'}</Text>
                                        We focus on accuracy, simplicity, and user privacy. We constantly update our app to serve the evolving needs of the trading community.{'\n'}{'\n'}
                                    </Text>
                                </View>
                            )}

                            {modalContent === 'Privacy Policy' && (
                                <ScrollView className="px-4 space-y-4 text-gray-700 dark:text-white">
                                    <Text className="dark:text-white mb-4">
                                        Afibie built the FxCryptoCalculator app as an ad-supported app. This SERVICE is provided by Afibie at no cost and is intended for use as-is.
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        This page is used to inform visitors about our policies regarding the collection, use, and disclosure of personal information if anyone decides to use our Service.
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        By using the app, you agree to the collection and use of information in relation to this policy. The personal information we collect is used only to provide and improve the Service. We do not sell your data or share it beyond what’s described here.
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Information Collection and Use{'\n'}</Text>
                                        For a better experience, we may request certain personally identifiable information (such as your email address when subscribing to the premium version). This information is retained only as long as necessary and handled securely.{'\n'}{'\n'}
                                        The app uses third-party services that may collect information to identify you. These include:{'\n'}{'\n'}
                                        {'\u2022'} AdMob{'\n'}
                                        {'\u2022'} Google Analytics for Firebase{'\n'}
                                        {'\u2022'} Firebase Crashlytics{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Log Data{'\n'}</Text>
                                        If there’s an error in the app, we collect data (via third-party tools) called Log Data. This may include your device’s IP address, device name, OS version, the time and date of usage, and other diagnostic stats.{'\n'}{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Cookies{'\n'}</Text>
                                        While the app doesn’t use cookies directly, third-party services may use cookies to collect data and enhance functionality. You can accept or refuse cookies in your device settings.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Service Providers{'\n'}</Text>
                                        We may use third-party companies for:{'\n'}{'\n'}
                                        {'\u2022'} App hosting and crash analysis{'\n'}
                                        {'\u2022'} Showing ads{'\n'}
                                        {'\u2022'} Supporting premium subscriptions{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        These providers may access your personal information only to perform tasks on our behalf and must not misuse it.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Security{'\n'}</Text>
                                        We value your trust and use commercially acceptable means to protect your data. However, no method of internet transmission or storage is 100% secure.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Links to Other Sites{'\n'}</Text>
                                        The app may contain links to external websites. We are not responsible for the content or policies of those sites and encourage you to review their privacy practices.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Children’s Privacy{'\n'}</Text>
                                        Our services are not intended for children under 13. We do not knowingly collect information from anyone in that age group. If you believe your child has shared data with us, contact us and we’ll delete it.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Changes to This Privacy Policy{'\n'}</Text>
                                        We may update this policy from time to time. Any changes will be posted on this page and take effect immediately.{'\n'}
                                    </Text>
                                </ScrollView>
                            )}

                            {modalContent === 'Support' && 'Contact us at support@afibie.com for help or questions.'}
                            {modalContent === 'Terms of Use' && (
                                <ScrollView className="px-4 space-y-4 text-gray-700 dark:text-white">
                                    <Text className="dark:text-white mb-4">
                                        By using FxCryptoCalculator, you agree to these terms:
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Acceptance of Terms{'\n'}</Text>
                                        Using our app means you accept and agree to follow these terms.{'\n'}{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Use of Service{'\n'}</Text>
                                        You may use the app only for lawful purposes. You must not misuse or attempt to hack the app.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Intellectual Property{'\n'}</Text>
                                        FxCryptoCalculator and its content are owned by us. You may not copy, modify, or resell any part of the app.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Not Financial Advice{'\n'}</Text>
                                        The app is for informational and educational purposes only. It does not constitute financial, trading, or investment advice.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Children’s Privacy{'\n'}</Text>
                                        Our services are not intended for children under 13. We do not knowingly collect information from anyone in that age group. If you believe your child has shared data with us, contact us and we’ll delete it.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Limitations of Liability{'\n'}</Text>
                                        We do our best to ensure accuracy but are not liable for any losses or damages resulting from use of the app.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Termination{'\n'}</Text>
                                        We reserve the right to restrict access or terminate service for users who violate our terms.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Governing Law{'\n'}</Text>
                                        These terms are governed by the laws of Nigeria.{'\n'}
                                    </Text>
                                </ScrollView>
                            )}
                            {modalContent === 'Disclaimer' && (
                                <ScrollView className="px-4 space-y-4 text-gray-700 dark:text-white">

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Not Financial Advice{'\n'}</Text>
                                        FxCryptoCalculator provides general trading tools and information. Nothing in the app constitutes professional financial advice.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Use At Your Own Risk{'\n'}</Text>
                                        Trading involves risk. Use this app as a guide, not a guarantee. We are not responsible for your profits or losses.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
                                        <Text className="font-bold">Accuracy of Information{'\n'}</Text>
                                        While we strive for accuracy, all calculations and data are provided "as is" without warranty.{'\n'}
                                    </Text>

                                    <Text className="dark:text-white mb-4">
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
        </View>
    );
};

export default Settings;
