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
<<<<<<< Updated upstream
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
=======
import React, { useEffect, useState, useRef, useContext } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
>>>>>>> Stashed changes
import images from "../constants/images.ts";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Clipboard from '@react-native-clipboard/clipboard';
<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../context/SettingsContext.tsx';
<<<<<<< Updated upstream
=======
>>>>>>> parent of 4973ed4 (Latest October)

const Crypto = () => {

    const [activeTab, setActiveTab] = useState('Long');
=======
import { ThemeContext } from '../components/ThemeContext';

const Crypto = () => {

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const formatNumber = (value: string) => {
    if (!value) return "";

    // Remove commas
    const cleaned = value.replace(/,/g, "");

    // Allow only digits and dot
    if (!/^\d*\.?\d*$/.test(cleaned)) return value;

    // Split integer and decimal part
    const [intPart, decPart] = cleaned.split(".");

    // Add commas to integer part
    const formattedInt = Number(intPart || 0).toLocaleString();

    // If user typed a dot but no decimals yet, preserve it
    if (decPart === undefined) return formattedInt;

    return `${formattedInt}.${decPart}`;
  };


  const [activeTab, setActiveTab] = useState('Long');
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
    const [lastEdited, setLastEdited] = useState<'leverage' | 'tradeAmount' | null>(null);
=======


  const [, setLastEdited] = useState<'leverage' | 'tradeAmount' | null>(null);
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
  const handleInputChange = async (key: string, value: string) => {
    // Remove comma formatting
    const cleanedValue = value.replace(/,/g, '');

    // Update form
    const updated = { ...formData, [key]: cleanedValue };
    setFormData(updated);

    // Trigger calculation exactly like your manual handler
    calculatePosition(updated);

    // Persist clean version (optional but matches your existing behavior)
    await AsyncStorage.setItem('forexFormData', JSON.stringify(updated));
  };

  const handleTradeAmountChange = (value: string) => {
    setLastEdited('tradeAmount');

    // Remove commas for processing
    let cleaned = value.replace(/,/g, '');

    // Convert to absolute number
    if (cleaned !== '' && !isNaN(parseFloat(cleaned))) {
      cleaned = Math.abs(Number(cleaned)).toString();
    }

    // Update state with clean numeric value
    const updated = { ...formData, tradeAmount: cleaned };
    setFormData(updated);

    // Recalculate passing the special flag
    calculatePosition(updated, 'tradeAmount');

    // Save clean version
    AsyncStorage.setItem('forexFormData', JSON.stringify(updated));
  };

>>>>>>> Stashed changes

<<<<<<< HEAD
  // Check if all required fields are filled for take profit calculation
  const areBasicFieldsFilled = () => {
    const capital = parseFloat(formData.capital) || 0;
    const risk = parseFloat(formData.risk.replace('%', '')) || 0;
    const entry = parseFloat(formData.entryPrice) || 0;
    const stopLoss = parseFloat(formData.stopLoss) || 0;

    return capital > 0 && risk > 0 && entry > 0 && stopLoss > 0;
  };
=======
        const dsl = activeTab === 'Long'
            ? (entry - stopLoss) / entry
            : (stopLoss - entry) / entry;

        const riskAmount = (risk / 100) * capital;
        const positionSize = riskAmount / dsl;
>>>>>>> parent of 4973ed4 (Latest October)

<<<<<<< Updated upstream
        let leverage = 0;
        let manualTradeAmount = 0;

        if (fieldChanged === 'tradeAmount') {
            leverage = tradeAmount !== 0 ? positionSize / tradeAmount : 0;
            manualTradeAmount = tradeAmount;
        } else if (fieldChanged === 'leverage') {
            manualTradeAmount = leverageInput !== 0 ? positionSize / leverageInput : 0;
            leverage = leverageInput;
=======
    // ✅ Always compute risk amount first (depends only on capital & risk)
    const riskAmount = capital && risk ? (risk / 100) * capital : 0;

    // ✅ Always reflect this in the result state, even if other fields are empty
    setResult(prev => ({
      ...prev,
      riskValue: riskAmount.toFixed(0),
    }));

    // Stop further calculations if required fields are missing
    if (!entry || !stopLoss || !capital || !risk) {
      return;
    }

    // Proceed with full calculations below
    const dsl =
      activeTab === 'Long'
        ? (entry - stopLoss) / entry
        : (stopLoss - entry) / entry;

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

    // Entry must be between SL and TP (in either direction)
    const isValidEntry = (stopLoss < entry && entry < takeProfitAmount) ||
      (takeProfitAmount < entry && entry < stopLoss);

    if (isValidEntry) {
      const rrrValue = Math.abs((takeProfitAmount - entry) / (entry - stopLoss));
      const expectedProfitValue = rrrValue * riskAmount;
      rrr = rrrValue.toFixed(2);
      expectedProfit = expectedProfitValue.toFixed(0);
    } else {
      rrr = 'Error';
      expectedProfit = 'Error';
    }

    // ✅ Update the result
    setResult({
      dsl: dsl.toFixed(5),
      positionSize: positionSize.toFixed(0),
      leverage: leverage.toFixed(1) + 'x',
      manualTradeAmount: manualTradeAmount.toFixed(1),
      manualLeverage: leverage.toFixed(1) + 'x',
      rrr,
      ep: expectedProfit,
      riskValue: riskAmount.toFixed(0),
    });

    // ✅ Reflect calculated counterpart in form - ENSURE POSITIVE VALUES
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
>>>>>>> Stashed changes
        }

<<<<<<< Updated upstream
=======
      lastPress.current = 0; // Reset to prevent triple-tap issues
    } else {
      // 👇 Potential single tap → wait to see if double-tap comes
      singlePressTimer.current = setTimeout(() => {
        setFormData(prev => ({
          takeProfit: '',
          capital: prev.capital,
          risk: prev.risk,
          entryPrice: '',
          stopLoss: '',
          tradeAmount: '',
          leverage: ''
        }));
>>>>>>> Stashed changes
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

<<<<<<< HEAD
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
          <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Capital</Text>
          <TextInput
            className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
            placeholder="Your Capital"
            placeholderTextColor="#374151"
            value={formatNumber(formData.capital)}
            onChangeText={(val) => handleInputChange('capital', val)}
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          />
        </View>

        <View className="flex-1">
          {/* Labels Row */}
          <View className="flex-row justify-between mb-1">
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Risk %</Text>
            <Text className={`text-sm font-rubik mb-1 mr-9 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              {result.riskValue !== '0' ? `$${result.riskValue}` : ''}
            </Text>
          </View>

          {/* Input Field */}
          <TextInput
            className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
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
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          />
        </View>
      </View>

      {/* Row 2 */}
      <View className="flex-row gap-4 mt-4">
        <View className="flex-1">
          <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Entry Price</Text>
          <TextInput
            className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
            placeholder="Entry Price"
            placeholderTextColor="#374151"
            value={formatNumber(formData.entryPrice)}
            onChangeText={(val) => handleInputChange('entryPrice', val)}
            // onChangeText={(value) => {
            //   const updated = { ...formData, entryPrice: value };
            //   setFormData(updated);
            //   calculatePosition(updated);
            // }}
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          />
        </View>

        <View className="flex-1 mb-3">
          <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Stop Loss</Text>
          <TextInput
            className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
            placeholder="Stop Loss"
            placeholderTextColor="#374151"
            value={formatNumber(formData.stopLoss)}
            // onChangeText={(value) => {
            //   const updated = { ...formData, stopLoss: value };
            //   setFormData(updated);
            //   calculatePosition(updated);
            // }}
            onChangeText={(val) => handleInputChange('stopLoss', val)}
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
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
          <Text className={`text-3xl mr-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>{Math.abs(Number(result.positionSize))}</Text>
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
          <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Trade Amount</Text>
          <TextInput
            className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
            placeholder="Trade Amount"
            placeholderTextColor="#374151"
            value={formatNumber(formData.tradeAmount)}
            onChangeText={handleTradeAmountChange}
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          />
        </View>

        <View className="flex-row items-center mt-5">
          <FontAwesome6 name="arrow-right-arrow-left" size={18} color="#0B6623" />
        </View>

        <View className="flex-1">
          <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Leverage</Text>
          <TextInput
            className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
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
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
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
              value={formatNumber(formData.takeProfit)}
              onChangeText={(val) => handleInputChange('takeProfit', val)}

              // onChangeText={(value) => {
              //   const updated = { ...formData, takeProfit: value };
              //   setFormData(updated);
              //   calculatePosition(updated);
              // }}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
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
=======
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
>>>>>>> parent of 4973ed4 (Latest October)
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

<<<<<<< HEAD
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
=======
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

<<<<<<< Updated upstream
            <View className="mt-4 items-center justify-center flex-row">
                <View className="items-center justify-center mr-2">
                    <Text className="text-3xl dark:text-white mr-2">{Math.abs(Number(result.positionSize))}</Text>
                    <Text className="text-center text-secondary-100 dark:text-white text-sm">Position Size</Text>
                </View>
                <TouchableOpacity onPress={handleCopyToClipboard} style={styles.copyButton}>
                    <FontAwesome6 name="copy" size={20} color="#0B6623" />
                </TouchableOpacity>
            </View>
>>>>>>> parent of 4973ed4 (Latest October)
=======
  return (
    <SafeAreaProvider>
      <SafeAreaView
        className={`flex-1 ${isDark ? 'bg-black-300' : 'bg-white'}`}
        edges={['right', 'left']} // Only apply safe area to sides, not top/bottom
      >
      <ScrollView contentContainerClassName="p-4">
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
    return (
        <SafeAreaView className="bg-white dark:bg-black-300 h-full">
            <ScrollView contentContainerClassName="p-4">
=======
        {/* Active Tab Content */}
        <View>{renderInputs()}</View>
      </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
>>>>>>> Stashed changes

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