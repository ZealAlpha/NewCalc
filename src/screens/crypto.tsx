import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ToastAndroid,
    TextInput,
    Image,
    Alert,
    StyleSheet,
    Platform
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../constants/images.ts";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Clipboard from '@react-native-clipboard/clipboard';

const Crypto = () => {

    const [activeTab, setActiveTab] = useState('Long');

    const [formData, setFormData] = useState({
        capital: '',
        risk: '',
        entryPrice: '',
        stopLoss: '',
        tradeAmount: '',
        leverage: '',
    });

    const [result, setResult] = useState({
        dsl: '0',
        positionSize: '0',
        leverage: '0',
        manualTradeAmount: '0',
        manualLeverage: '0',
    });

    const [lastEdited, setLastEdited] = useState<'leverage' | 'tradeAmount' | null>(null);

  const handleCopyToClipboard = async () => {
    if (result.positionSize !== null && result.positionSize !== undefined && result.positionSize !== '0') {
      Clipboard.setString(Math.abs(Number(result.positionSize || 0)).toString());
      if (Platform.OS === 'android') {
        ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied', 'Position size copied to clipboard!');
      }
    } else {
      // console.warn('No position size to copy.');
      if (Platform.OS === 'android') {
        ToastAndroid.show('No position size to copy.', ToastAndroid.SHORT);
      } else {
        Alert.alert('No position size to copy.');
      }
    }
  };

    function calculatePosition(updatedFormData: typeof formData, fieldChanged?: 'leverage' | 'tradeAmount') {
        const entry = parseFloat(updatedFormData.entryPrice) || 0;
        const stopLoss = parseFloat(updatedFormData.stopLoss) || 0;
        const capital = parseFloat(updatedFormData.capital) || 0;
        const risk = parseFloat(updatedFormData.risk.replace('%', '')) || 0;
        const tradeAmount = parseFloat(updatedFormData.tradeAmount) || 0;
        const leverageInput = parseFloat(updatedFormData.leverage) || 0;

        if (!entry || !stopLoss || !capital || !risk) {
            setResult({
                dsl: '0',
                positionSize: '0',
                leverage: '0',
                manualTradeAmount: '0',
                manualLeverage: '0',
            });
            return;
        }

        const dsl = activeTab === 'Long'
            ? (entry - stopLoss) / entry
            : (stopLoss - entry) / entry;

        const riskAmount = (risk / 100) * capital;
        const positionSize = riskAmount / dsl;

        let leverage = 0;
        let manualTradeAmount = 0;

        if (fieldChanged === 'tradeAmount') {
            leverage = tradeAmount !== 0 ? positionSize / tradeAmount : 0;
            manualTradeAmount = tradeAmount;
        } else if (fieldChanged === 'leverage') {
            manualTradeAmount = leverageInput !== 0 ? positionSize / leverageInput : 0;
            leverage = leverageInput;
        }

        setResult({
            dsl: dsl.toFixed(5),
            positionSize: positionSize.toFixed(0),
            leverage: leverage.toFixed(1) + 'x',
            manualTradeAmount: manualTradeAmount.toFixed(1),
            manualLeverage: leverage.toFixed(1) + 'x',
        });

        // Reflect calculated counterpart in form
        if (fieldChanged === 'tradeAmount') {
            setFormData(prev => ({ ...prev, leverage: leverage.toFixed(1) }));
        } else if (fieldChanged === 'leverage') {
            setFormData(prev => ({ ...prev, tradeAmount: manualTradeAmount.toFixed(1) }));
        }
    }

    useEffect(() => {
        calculatePosition(formData);
    }, [activeTab]);

    const renderInputs = () => (
        <>
            {/* Row 1 */}
            <View className="flex-row gap-4">
                <View className="flex-1">
                    <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Capital</Text>
                    <TextInput
                        className="p-4 border border-primary-100 rounded-md dark:text-white text-black"
                        placeholder="Your Capital"
                        placeholderTextColor="#374151"
                        value={formData.capital}
                        onChangeText={(value) =>{
                            const updated = { ...formData, capital: value };
                            setFormData(updated);
                            calculatePosition(updated);
                        }}
                        keyboardType="numeric"
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Risk %</Text>
                    <TextInput
                        className="p-4 border border-primary-100 rounded-md text-black dark:text-white"
                        placeholder="Risk in %"
                        placeholderTextColor="#374151"
                        value={formData.risk}
                        onChangeText={(value) =>{
                            const updated = { ...formData, risk: value };
                            setFormData(updated);
                            calculatePosition(updated);
                        }}
                        onBlur={() => {
                            if (!formData.risk.includes('%')) {
                                setFormData({ ...formData, risk: formData.risk + '%' });
                            }
                        }}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-4 mt-4">
                <View className="flex-1">
                    <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Entry Price</Text>
                    <TextInput
                        className="p-4 border border-primary-100 rounded-md text-black dark:text-white"
                        placeholder="Entry Price"
                        placeholderTextColor="#374151"
                        value={formData.entryPrice}
                        onChangeText={(value) => {
                            const updated = { ...formData, entryPrice: value };
                            setFormData(updated);
                            calculatePosition(updated);
                        }}
                        keyboardType="numeric"
                    />
                </View>

                <View className="flex-1 mb-3">
                    <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Stop Loss</Text>
                    <TextInput
                        className="p-4 border border-primary-100 rounded-md text-black dark:text-white"
                        placeholder="Stop Loss"
                        placeholderTextColor="#374151"
                        value={formData.stopLoss}
                        onChangeText={(value) => {
                            const updated = { ...formData, stopLoss: value };
                            setFormData(updated);
                            calculatePosition(updated);
                        }}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View className="mt-4 items-center justify-center flex-row">
                <View className="items-center justify-center mr-2">
                    <Text className="text-3xl dark:text-white mr-2">{Math.abs(Number(result.positionSize))}</Text>
                    <Text className="text-center text-secondary-100 dark:text-white text-sm">Position Size</Text>
                </View>
                <TouchableOpacity onPress={handleCopyToClipboard} style={styles.copyButton}>
                    <FontAwesome6 name="copy" size={20} color="#0B6623" />
                </TouchableOpacity>
            </View>

            <View className="flex-row gap-4 mt-4">
                <View className="flex-1">
                    <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Trade Amount</Text>
                    <TextInput
                        className="p-4 border border-primary-100 rounded-md dark:text-white text-black"
                        placeholder="Trade Amount"
                        placeholderTextColor="#374151"
                        value={formData.tradeAmount}
                        onChangeText={(value) => {
                            setLastEdited('tradeAmount');
                            const updated = { ...formData, tradeAmount: value };
                            setFormData(updated);
                            calculatePosition(updated, 'tradeAmount');
                        }}
                        keyboardType="numeric"
                    />
                </View>

                <View className="flex-row items-center mt-5">
                    <FontAwesome6 name="arrow-right-arrow-left" size={18} color="#0B6623" />
                </View>

                <View className="flex-1">
                    <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Leverage</Text>
                    <TextInput
                        className="p-4 border border-primary-100 rounded-md dark:text-white text-black"
                        placeholder="Leverage"
                        placeholderTextColor="#374151"
                        value={formData.leverage}
                        onChangeText={(value) => {
                            setLastEdited('leverage');
                            const updated = { ...formData, leverage: value };
                            setFormData(updated);
                            calculatePosition(updated, 'leverage');
                        }}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View className="items-center">
                <TouchableOpacity
                    onPress={() => {
                        setFormData({
                            capital: '',
                            risk: '',
                            entryPrice: '',
                            stopLoss: '',
                            tradeAmount: '',
                            leverage: '',
                        });
                        setResult({
                            dsl: '0',
                            positionSize: '0',
                            leverage: '0',
                            manualTradeAmount: '0',
                            manualLeverage: '0',
                        });
                    }}
                    className="bg-red-900 w-1/2 shadow-md shadow-zinc-300 rounded-full py-4 mt-5"
                >
                    <Text className="text-lg text-center font-rubik-medium text-white ml-2">Clear</Text>
                </TouchableOpacity>
            </View>


        </>
    );

    return (
        <SafeAreaView className="bg-white dark:bg-black-300 h-full">
            <ScrollView contentContainerClassName="p-4">

                <View className="mb-9">
                    <Image source={images.logo} className="w-full h-32" resizeMode="contain" />
                    <Text className="text-sm font-rubik text-center text-secondary-100 dark:text-white">Crypto Position Size Calculator</Text>
                </View>


                {/* Tabs */}
                {/*<View className="flex-row justify-center mb-6">*/}
                {/* {['Long', 'Short'].map((tab) => (*/}
                {/* <TouchableOpacity*/}
                {/* key={tab}*/}
                {/* onPress={() => setActiveTab(tab)}*/}
                {/* className={`px-6 py-3 rounded-full mx-2 ${*/}
                {/* activeTab === tab*/}
                {/* ? 'bg-primary-100'*/}
                {/* : 'bg-gray-200'*/}
                {/* }`}*/}
                {/* >*/}
                {/* <Text*/}
                {/* className={`text-sm font-rubik-medium ${*/}
                {/* activeTab === tab ? 'text-white' : 'text-gray-700'*/}
                {/* }`}*/}
                {/* >*/}
                {/* {tab}*/}
                {/* </Text>*/}
                {/* </TouchableOpacity>*/}
                {/* ))}*/}
                {/*</View>*/}

                {/* Active Tab Content */}
                <View>{renderInputs()}</View>
            </ScrollView>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    copyButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f0f0f0', // Optional background for better touch feedback
    },
});

export default Crypto;