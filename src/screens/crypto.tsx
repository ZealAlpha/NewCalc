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
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../constants/images.ts";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../context/SettingsContext.tsx';

const Crypto = () => {

  const [activeTab, setActiveTab] = useState('Long');

  const [formData, setFormData] = useState({
    capital: '',
    risk: '',
    entryPrice: '',
    stopLoss: '',
    tradeAmount: '',
    leverage: '',
    takeProfit: ''
  });

  const [result, setResult] = useState({
    dsl: '0',
    positionSize: '0',
    leverage: '0',
    manualTradeAmount: '0',
    manualLeverage: '0',
    rrr: '0',
    ep: '0',
    riskValue: '0',
  });

  const [, setLastEdited] = useState<'leverage' | 'tradeAmount' | null>(null);

  const { showRiskRewardSection } = useSettings();

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

  const handleInputChange = async (key: string, value: string) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    calculatePosition(updated);
    await AsyncStorage.setItem('forexFormData', JSON.stringify(updated));
  };


  // Check if all required fields are filled for take profit calculation
  const areBasicFieldsFilled = () => {
    const capital = parseFloat(formData.capital) || 0;
    const risk = parseFloat(formData.risk.replace('%', '')) || 0;
    const entry = parseFloat(formData.entryPrice) || 0;
    const stopLoss = parseFloat(formData.stopLoss) || 0;

    return capital > 0 && risk > 0 && entry > 0 && stopLoss > 0;
  };

  function calculatePosition(updatedFormData: typeof formData, fieldChanged?: 'leverage' | 'tradeAmount') {
    const entry = parseFloat(updatedFormData.entryPrice) || 0;
    const stopLoss = parseFloat(updatedFormData.stopLoss) || 0;
    const capital = parseFloat(updatedFormData.capital) || 0;
    const risk = parseFloat(updatedFormData.risk.replace('%', '')) || 0;
    const tradeAmount = Math.abs(parseFloat(updatedFormData.tradeAmount) || 0);
    const leverageInput = Math.abs(parseFloat(updatedFormData.leverage) || 0);
    const takeProfitAmount = Math.abs(parseFloat(updatedFormData.takeProfit) || 0);

    if (!entry || !stopLoss || !capital || !risk) {
      setResult({
        dsl: '0',
        positionSize: '0',
        leverage: '0',
        manualTradeAmount: '0',
        manualLeverage: '0',
        rrr: '0',
        ep: '0',
        riskValue: '0',
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

    // Calculate take profit metrics only if basic fields are filled and take profit is entered
    let rrr = '0';
    let expectedProfit = '0';

    if (takeProfitAmount > 0 && areBasicFieldsFilled()) {
      // Validate that entry price is between stop loss and take profit
      const isValidLong = activeTab === 'Long' && stopLoss < entry && entry < takeProfitAmount;
      const isValidShort = activeTab === 'Short' && takeProfitAmount < entry && entry < stopLoss;

      if (isValidLong || isValidShort) {
        const rrrValue = Math.abs((takeProfitAmount - entry) / (entry - stopLoss));
        const expectedProfitValue = rrrValue * riskAmount;

        rrr = rrrValue.toFixed(2);
        expectedProfit = expectedProfitValue.toFixed(0);
      } else {
        // Entry price is not between stop loss and take profit
        rrr = 'Error';
        expectedProfit = 'Error';
      }
    }

    setResult({
      dsl: dsl.toFixed(5),
      positionSize: positionSize.toFixed(0),
      leverage: leverage.toFixed(1) + 'x',
      manualTradeAmount: manualTradeAmount.toFixed(1),
      manualLeverage: leverage.toFixed(1) + 'x',
      rrr: rrr,
      ep: expectedProfit,
      riskValue: riskAmount.toFixed(0),
    });

    // Reflect calculated counterpart in form - ENSURE POSITIVE VALUES
    if (fieldChanged === 'tradeAmount') {
      setFormData(prev => ({ ...prev, leverage: Math.abs(leverage).toFixed(1) }));
    } else if (fieldChanged === 'leverage') {
      setFormData(prev => ({ ...prev, tradeAmount: Math.abs(manualTradeAmount).toFixed(1) }));
    }
  }

  const lastPress = useRef(0);
  const singlePressTimer = useRef(null);

  const handleReset = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastPress.current < DOUBLE_PRESS_DELAY) {
      // 👇 Double-tap detected → clear timeout & clear AsyncStorage too
      if (singlePressTimer.current) {
        clearTimeout(singlePressTimer.current);
        singlePressTimer.current = null;
      }

      (async () => {
        await AsyncStorage.removeItem('forexFormData');
        setFormData({
          takeProfit: '',
          capital: '',
          risk: '',
          entryPrice: '',
          stopLoss: '',
          tradeAmount: '',
          leverage: ''
        });
        setResult({
          riskValue: '0',
          ep: '0',
          rrr: '0',
          dsl: '0',
          positionSize: '0',
          leverage: '0',
          manualTradeAmount: '0',
          manualLeverage: '0'
        });
        if (Platform.OS === 'android') {
          ToastAndroid.show('All saved data has been removed.', ToastAndroid.SHORT);
        } else {
          Alert.alert('Data Cleared', 'All saved data has been removed.');
        }
      })();

      lastPress.current = 0; // Reset to prevent triple-tap issues
    } else {
      // 👇 Potential single tap → wait to see if double-tap comes
      singlePressTimer.current = setTimeout(() => {
        // Only clear form & result (no AsyncStorage)
        setFormData({
          takeProfit: '',
          capital: '',
          risk: '',
          entryPrice: '',
          stopLoss: '',
          tradeAmount: '',
          leverage: ''
        });
        setResult({
          riskValue: '0',
          ep: '0',
          rrr: '0',
          dsl: '0',
          positionSize: '0',
          leverage: '0',
          manualTradeAmount: '0',
          manualLeverage: '0'
        });
        if (Platform.OS === 'android') {
          ToastAndroid.show('Fields cleared (saved data preserved).', ToastAndroid.SHORT);
        } else {
          Alert.alert('Form Reset', 'Fields cleared (saved data preserved).');
        }
      }, DOUBLE_PRESS_DELAY);

      lastPress.current = now;
    }
  };


  useEffect(() => {
    calculatePosition(formData);
  }, [activeTab]);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const saved = await AsyncStorage.getItem('forexFormData');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
          calculatePosition(parsed);
        }
      } catch (err) {
        console.error('Error loading saved data:', err);
      }
    };

    loadSavedData();
  }, []);


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
            onChangeText={(value) => handleInputChange('capital', value)}
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
            onChangeText={(value) => handleInputChange('risk', value)}
            onBlur={() => {
              if (!formData.risk.includes('%')) {
                const updatedRisk = formData.risk + '%';
                handleInputChange('risk', updatedRisk);
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
        <View className="items-center justify-center mr-9">
          <TouchableOpacity
            // onPress={handleCopyToClipboard} // tap to copy
            onLongPress={handleCopyToClipboard} // long press to copy too
            activeOpacity={0.7}
            className="items-center justify-center"
          >
          <Text className="text-3xl dark:text-white mr-2">{Math.abs(Number(result.positionSize))}</Text>
          <Text className="text-center text-secondary-100 dark:text-white text-sm">Position Size</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="mr-9" onPress={handleCopyToClipboard} style={styles.copyButton}>
          <FontAwesome6 name="copy" size={18} color="#0B6623" />
        </TouchableOpacity>
        <TouchableOpacity className="ml-3" onPress={handleReset}>
          <FontAwesome6 name="rotate-right" size={22} color="#0B6623" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4 mt-4 mb-9">
        <View className="flex-1">
          <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Trade Amount</Text>
          <TextInput
            className="p-4 border border-primary-100 rounded-md dark:text-white text-black"
            placeholder="Trade Amount"
            placeholderTextColor="#374151"
            value={formData.tradeAmount}
            onChangeText={(value) => {
              setLastEdited('tradeAmount');

              // Convert to absolute value immediately
              let processedValue = value;
              if (value !== '' && !isNaN(parseFloat(value))) {
                processedValue = Math.abs(parseFloat(value)).toString();
              }

              const updated = { ...formData, tradeAmount: processedValue };
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

              // Convert to absolute value immediately
              let processedValue = value;
              if (value !== '' && !isNaN(parseFloat(value))) {
                processedValue = Math.abs(parseFloat(value)).toString();
              }

              const updated = { ...formData, leverage: processedValue };
              setFormData(updated);
              calculatePosition(updated, 'leverage');
            }}
            keyboardType="numeric"
          />
        </View>
      </View>

      {showRiskRewardSection && (
      <View className="mt-0 w-full bg-black-200 border border-white rounded-2xl overflow-hidden mb-2">
        {/* Table Grid */}
        <View className="border-t border-white flex-row">

          {/* LEFT COLUMN - Take Profit Input */}
          <View className="w-1/2 border-r border-white px-4 py-5 justify-center">
            <TextInput
              className="p-4 border border-accent-100 rounded-xl text-white text-center"
              placeholder="Take Profit Price"
              placeholderTextColor="#808080"
              value={formData.takeProfit}
              onChangeText={(value) => {
                const updated = { ...formData, takeProfit: value };
                setFormData(updated);
                calculatePosition(updated);
              }}
              keyboardType="numeric"
            />
          </View>

          {/* RIGHT COLUMN - EP, Risk, RRR */}
          <View className="w-1/2 px-4 py-5 justify-center items-center">
            {areBasicFieldsFilled() && formData.takeProfit ? (
              <View className="w-full">
                {/* EP */}
                <View className="flex-row justify-between border-b border-white/30 pb-2 mb-2">
                  <Text className="text-white font-rubik-medium">Profit:</Text>
                  <Text
                    className={`font-rubik-bold ${
                      result.ep === 'Error'
                        ? 'text-red-500'
                        : 'text-green-400'
                    }`}
                  >
                    {`≈${result.ep}`}
                  </Text>
                </View>

                {/* Risk */}
                <View className="flex-row justify-between border-b border-white/30 pb-2 mb-2">
                  <Text className="text-white font-rubik-medium">Risk:</Text>
                  <Text className="text-red-400 font-rubik-bold">
                    {result.riskValue}
                  </Text>
                </View>

                {/* RRR */}
                <View className="flex-row justify-between">
                  <Text className="text-white font-rubik-medium">R:R</Text>
                  <Text
                    className={`font-rubik-bold ${
                      result.rrr === 'Error' ? 'text-red-500' : 'text-primary-300'
                    }`}
                  >
                    {result.rrr === 'Error' ? result.rrr : `1 : ${result.rrr}`}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center justify-center">
                <FontAwesome6
                  name="info-circle"
                  size={18}
                  color="#999"
                  style={{ marginBottom: 6 }}
                />
                <Text className="text-sm text-gray-400 italic text-center">
                  Fill all fields to see take profit metrics
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      )}
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