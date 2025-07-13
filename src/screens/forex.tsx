import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomCurrencyPicker from '../components/CustomCurrencyPicker.tsx';
import CurrencyPickerModal from "../components/CurrencyPickerModal.tsx";
import EnhancedTextInput from "../components/EnhancedTextInput.tsx";


const Forex = () => {
    const [currencyPair, setCurrencyPair] = useState('EURUSD');

    const [accountCurrencyOpen] = useState(false);
    const [accountCurrency, setAccountCurrency] = useState('USD');
    const [isEntryPriceManuallyEdited, setIsEntryPriceManuallyEdited] = useState(false);

    const getCurrencySymbol = (currencyCode: string) => {
        switch (currencyCode) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'JPY': return '¥';
            case 'CHF': return 'CHF ';
            case 'CAD': return 'CA$';
            case 'AUD': return 'AU$';
            case 'NZD': return 'NZ$';
            case 'CNY': case 'CNH': return '¥';
            case 'CZK': return 'Kč';
            case 'DKK': return 'kr ';
            case 'HKD': return 'HK$';
            case 'KRW': return '₩';
            case 'KWD': return 'KD ';
            case 'INR': return '₹';
            case 'MXN': return 'Mex$';
            case 'NOK': return 'kr ';
            case 'PLN': return 'zł ';
            case 'RUB': return '₽';
            case 'SEK': return 'kr ';
            case 'SGD': return 'S$';
            case 'TRY': return '₺';
            case 'ZAR': return 'R ';
            default: return '';
        }
    };

    const [accountBalance, setAccountBalance] = useState('');
    const [riskPercentage, setRiskPercentage] = useState('');
    const [riskAmount, setRiskAmount] = useState('');
    const [stopLossPips, setStopLossPips] = useState('');
    const [stopLossPrice, setStopLossPrice] = useState('');
    const [entryPrice, setEntryPrice] = useState('');
    const [pipValuePerLot, setPipValuePerLot] = useState('0');
    const [units, setUnits] = useState('0');
    const [standardLots, setStandardLots] = useState('0');
    const [miniLots, setMiniLots] = useState('0');
    const [microLots, setMicroLots] = useState('0');
    const [loading, setLoading] = useState(false);
    const [quoteToAccountRate, setQuoteToAccountRate] = useState('1');  // New state to store conversion rate

    const API_KEY = 'HdJ6P9Xswe51x5KLWiCORfvPc1cDlnKJ';

    type CacheEntry = {
        rate: string;
        timestamp: number;
    };

    const cache: Record<string, CacheEntry> = {};
    const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

    const getCachedRate = (pair: string | number) => {
        const cached = cache[pair];
        if (!cached) return null;
        const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY;
        return isExpired ? null : cached.rate;
    };

    const setCachedRate = (pair: string | number, rate: string) => {
        cache[pair] = { rate, timestamp: Date.now() };
    };

    const indicesPairs = ["^DJI", "^SPX", "^AXJO", "^N225", "^FTSE", "^IBEX", "^HSI", "^XNDX", "^GDAXI", "^FCHI"];

    const fetchExchangeRate = useCallback(async (pair: string) => {
        // Only use cached rate or fetch new one if user hasn't manually edited
        if (!isEntryPriceManuallyEdited) {
            const cached = getCachedRate(pair);
            if (cached) {
                setEntryPrice(cached);
                return;
            }

            setLoading(true);
            try {
                // Determine endpoint based on pair type
                const isIndex = indicesPairs.includes(pair);
                const url = isIndex
                    ? `https://financialmodelingprep.com/stable/quote?symbol=${pair}&apikey=${API_KEY}`
                    : `https://financialmodelingprep.com/api/v3/quote/${pair}?apikey=${API_KEY}`;

                const res = await fetch(url);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const rate = data[0].price;
                    if (rate) {
                        const formatted = parseFloat(rate).toFixed(5).replace(/\.?0+$/, '');
                        setEntryPrice(formatted);
                        setCachedRate(pair, formatted);
                    } else {
                        console.warn("No price found in response:", data);
                    }
                } else {
                    console.warn("Unexpected response format:", data);
                }
            } catch (err) {
                console.error('Error fetching rate:', err);
            } finally {
                setLoading(false);
            }
        }
    }, [isEntryPriceManuallyEdited, API_KEY]);


    const handleRefreshRate = useCallback(() => {
        // Force refresh by resetting the manual edit flag
        setIsEntryPriceManuallyEdited(false);
        fetchExchangeRate(currencyPair);
    }, [currencyPair, fetchExchangeRate]);

    useEffect(() => {
        fetchExchangeRate(currencyPair);
    }, [currencyPair, fetchExchangeRate]);

    useEffect(() => {
        setIsEntryPriceManuallyEdited(false);
    }, [currencyPair]);

    // Fetch conversion rate for pip value calculation
    useEffect(() => {
        const quoteCurrency = currencyPair.substring(3, 6);

        // Only fetch if quote currency differs from account currency
        if (quoteCurrency !== accountCurrency) {
            setLoading(true);
            const pair = `${quoteCurrency}${accountCurrency}`;

            fetch(`https://financialmodelingprep.com/api/v3/quote/${pair}?apikey=${API_KEY}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0 && data[0].price) {
                        setQuoteToAccountRate(data[0].price.toString());
                    } else {
                        console.warn("No conversion rate found:", data);
                        setQuoteToAccountRate('1');
                    }
                })
                .catch(err => {
                    console.error('Error fetching conversion rate:', err);
                    setQuoteToAccountRate('1');
                })
                .finally(() => setLoading(false));
        } else {
            setQuoteToAccountRate('1'); // Same currency, rate is 1:1
        }
    }, [currencyPair, accountCurrency, API_KEY]);

    // Fixed pip value calculation
  // CORRECTED FOREX CALCULATOR LOGIC - Based on Document Formulas

// Fixed pip value calculation - matches document exactly
  useEffect(() => {
    if (!entryPrice || parseFloat(entryPrice) === 0) return;

    const quoteCurrency = currencyPair.substring(3, 6);
    const baseCurrency = currencyPair.substring(0, 3);
    const isJPYQuote = quoteCurrency === 'JPY';
    const isJPYBase = baseCurrency === 'JPY';

    // Define instrument types
    const isIndices = ['^DJI', '^SPX', '^AXJO', '^N225', '^FTSE', '^IBEX', '^HSI', '^XNDX', '^GDAXI', '^FCHI']
      .some(sym => currencyPair.startsWith(sym));
    const isCryptoPair = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'DOG']
      .some(sym => currencyPair.startsWith(sym));
    const isCommodities = ['PLUSD', 'GCUSD', 'SIUSD', 'NGUSD', 'CLUSD', 'PAUSD', 'BZUSD']
      .some(sym => currencyPair.startsWith(sym));

    // Standard lot size (always 100,000 for forex, 1 for others as per document)
    const standardLotSize = (isCryptoPair || isIndices) ? 1 :
      (isCommodities ? 100 : 100000);

    let pipValue;

    // Calculate pip value based on document formulas
    if (isJPYQuote) {
      // JPY pairs: PV = (1000 × Lot) / Exchange_Rate
      if (accountCurrency === 'USD') {
        pipValue = (1000 * 1) / parseFloat(entryPrice);
      } else if (accountCurrency === 'JPY') {
        pipValue = 1000 * 1; // 1000 JPY per pip
      } else {
        // Convert to account currency
        pipValue = (1000 * 1 * parseFloat(quoteToAccountRate)) / parseFloat(entryPrice);
      }
    } else if (isJPYBase) {
      // JPY base pairs: PV = (10 × Lot) × Exchange_Rate (for JPY/USD type)
      if (accountCurrency === 'USD') {
        pipValue = 10 * 1 * parseFloat(entryPrice);
      } else if (accountCurrency === 'JPY') {
        pipValue = 10 * 1 / parseFloat(entryPrice);
      } else {
        pipValue = 10 * 1 * parseFloat(quoteToAccountRate);
      }
    } else if (isCommodities) {
      // Commodities: PV = (1 × Lot) / Exchange_Rate
      if (accountCurrency === 'USD') {
        pipValue = 1 * 1 / 1; // Usually USD denominated
      } else {
        pipValue = 1 * 1 * parseFloat(quoteToAccountRate);
      }
    } else if (isIndices) {
      // Indices: PV = (0.01 × Lot) / Exchange_Rate
      if (accountCurrency === 'USD') {
        pipValue = 0.01 * 1 / 1;
      } else if (quoteCurrency === 'JPY' && accountCurrency === 'USD') {
        // Special case for JP225 - convert from JPY to USD
        pipValue = 0.01 * 1 / parseFloat(entryPrice);
      } else {
        pipValue = 0.01 * 1 * parseFloat(quoteToAccountRate);
      }
    } else {
      // Standard forex pairs: PV = (10 × Lot) / Exchange_Rate
      if (accountCurrency === quoteCurrency) {
        pipValue = 10; // Direct quote currency (e.g., accountCurrency = EUR, quoteCurrency = EUR)
      } else if (accountCurrency === 'USD') {
        if (quoteCurrency !== 'USD') {
          pipValue = 10 / parseFloat(entryPrice); // e.g., USD/CHF → converts to USD
        } else {
          pipValue = 10; // e.g., EUR/USD → $10 per pip
        }
      } else {
        pipValue = 10 * parseFloat(quoteToAccountRate); // Non-USD account currency, convert via rate
      }
    }

    setPipValuePerLot(pipValue.toFixed(2));
  }, [currencyPair, entryPrice, accountCurrency, quoteToAccountRate]);

// Fixed position calculation - matches document formula exactly
  const calculatePosition = useCallback(() => {
    const ab = parseFloat(accountBalance) || 0;
    const rPct = parseFloat(riskPercentage ? riskPercentage.replace('%', '') : '0') || 0;
    const ra = parseFloat(riskAmount) || 0;
    const slPips = parseFloat(stopLossPips) || 0;
    const pv = parseFloat(pipValuePerLot) || 0;
    const ep = parseFloat(entryPrice) || 0;
    const slPrice = parseFloat(stopLossPrice) || 0;

    const quoteCurrency = currencyPair.substring(3, 6);
    const isJPYQuote = quoteCurrency === 'JPY';

    // Define instrument types
    const isIndices = ['^DJI', '^SPX', '^AXJO', '^N225', '^FTSE', '^IBEX', '^HSI', '^XNDX', '^GDAXI', '^FCHI']
      .some(sym => currencyPair.startsWith(sym));
    const isCryptoPair = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'DOG']
      .some(sym => currencyPair.startsWith(sym));
    const isCommodities = ['PLUSD', 'GCUSD', 'SIUSD', 'NGUSD', 'CLUSD', 'PAUSD', 'BZUSD']
      .some(sym => currencyPair.startsWith(sym));

    // Calculate risk amount if risk percentage is provided
    let calculatedRiskAmount = ra;
    if (riskPercentage && ab > 0 && !riskAmount) {
      calculatedRiskAmount = (ab * rPct) / 100;
      setRiskAmount(calculatedRiskAmount.toFixed(2));
    } else if (riskAmount && ab > 0 && !riskPercentage) {
      const calculatedRiskPct = (ra / ab) * 100;
      setRiskPercentage(calculatedRiskPct.toFixed(2) + '%');
    }

    // Calculate stop loss pips - matches document formulas
    let calculatedSlPips = slPips;
    if (ep > 0 && slPrice > 0 && !stopLossPips) {
      if (isJPYQuote || isCommodities || isIndices || isCryptoPair) {
        // Document shows: SLP = (E-SL) × 100
        calculatedSlPips = Math.abs(ep - slPrice) * 100;
      } else {
        // Document shows: SLP = (E-SL) × 10,000
        calculatedSlPips = Math.abs(ep - slPrice) * 10000;
      }
      setStopLossPips(calculatedSlPips.toFixed(2));
    } else if (slPips > 0 && ep > 0 && !stopLossPrice) {
      // Calculate stop loss price from pips
      let calculatedSlPrice;
      const direction = -1; // Assume long position (adjust as needed)

      if (isJPYQuote || isCommodities || isIndices || isCryptoPair) {
        calculatedSlPrice = ep + (direction * calculatedSlPips / 100);
      } else {
        calculatedSlPrice = ep + (direction * calculatedSlPips / 10000);
      }

      setStopLossPrice(calculatedSlPrice.toFixed(isJPYQuote ? 3 : 5));
    }

    // CORRECTED: Calculate position size using document formula
    // Formula: SLS = r/(SLP×PV)
    if (calculatedRiskAmount > 0 && calculatedSlPips > 0 && pv > 0) {
      const standardLotsResult = calculatedRiskAmount / (calculatedSlPips * pv);

      setStandardLots(standardLotsResult.toFixed(2));
      setMiniLots((standardLotsResult * 10).toFixed(1));
      setMicroLots((standardLotsResult * 100).toFixed(0));

      // Convert to units (standard lots × 100,000 for forex)
      const lotMultiplier = (isCryptoPair || isIndices) ? 1 :
        (isCommodities ? 100 : 100000);
      const unitsResult = standardLotsResult * lotMultiplier;
      setUnits(Math.round(unitsResult).toString());
    } else {
      setUnits('0');
      setStandardLots('0');
      setMiniLots('0');
      setMicroLots('0');
    }
  }, [accountBalance, riskPercentage, riskAmount, stopLossPips, entryPrice, stopLossPrice, pipValuePerLot, currencyPair]);

    const handleAccountBalanceChange = (value: React.SetStateAction<string>) => {
        setAccountBalance(value);
        // When account balance changes, recalculate but don't override user inputs
    };

    const handleRiskPercentageChange = (value: React.SetStateAction<string>) => {
        // if (typeof value === "string") {
        //     const numericValue = value.replace('%', '');
        //     // Use numericValue if needed
        // }
        setRiskPercentage(value);
        // Clear risk amount when manually editing risk percentage
        setRiskAmount('');
    };

    const handleRiskAmountChange = (value: React.SetStateAction<string>) => {
        setRiskAmount(value);
        // Clear risk percentage when manually editing risk amount
        setRiskPercentage('');
    };

    const handleStopLossPriceChange = (value: React.SetStateAction<string>) => {
        setStopLossPrice(value);
        // Clear stop loss pips when manually editing stop loss price
        setStopLossPips('');
    };

    const handleStopLossPipsChange = (value: React.SetStateAction<string>) => {
        setStopLossPips(value);
        // Clear stop loss price when manually editing stop loss pips
        setStopLossPrice('');
    };

    // Run calculation anytime relevant inputs change
    useEffect(() => {
        calculatePosition();
    }, [
        accountBalance,
        riskPercentage,
        riskAmount,
        stopLossPips,
        entryPrice,
        stopLossPrice,
        pipValuePerLot,
        currencyPair,
        calculatePosition
    ]);

    const handleReset = useCallback(() => {
        setAccountBalance('');
        setRiskPercentage('');
        setRiskAmount('');
        setStopLossPips('');
        setStopLossPrice('');
        setEntryPrice('');
        setPipValuePerLot('0');
        setUnits('0');
        setStandardLots('0');
        setMiniLots('0');
        setMicroLots('0');
        setIsEntryPriceManuallyEdited(false);
        setCurrencyPair('EURUSD');
        setAccountCurrency('USD');
        setQuoteToAccountRate('1');
    }, []);

    return (
        <SafeAreaView className="bg-white dark:bg-black-300 h-full p-4">
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >

                <View className="mb-2 mt-4">
                    {/*<Image source={images.logo} className="w-full h-32" resizeMode="contain" />*/}
                    <Text className="text-lg font-rubik-bold text-center mb-9 text-secondary-100 dark:text-white">FX Position Size Calculator</Text>
                </View>

                <View className="flex-row gap-4 mb-4" style={{ position: 'relative', zIndex: 10 }}>
                    {/* Account Currency Picker */}
                    <View className="flex-1" style={{ zIndex: accountCurrencyOpen ? 3000 : 1 }}>
                        <CurrencyPickerModal
                            accountCurrency={accountCurrency}
                            setAccountCurrency={setAccountCurrency}
                        />
                    </View>

                    {/* Instrument Picker */}
                    <View className="flex-1" style={{ zIndex: !accountCurrencyOpen ? 2000 : 1 }}>
                        <CustomCurrencyPicker
                            currencyPair={currencyPair}
                            setCurrencyPair={setCurrencyPair}
                            fetchExchangeRate={fetchExchangeRate}
                        />
                    </View>
                </View>

                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Account Balance</Text>
                        <EnhancedTextInput
                            className="p-4 border border-primary-100 rounded-md dark:text-white text-black"
                            placeholder="Account Balance"
                            placeholderTextColor="#374151"
                            value={accountBalance}
                            onChangeText={handleAccountBalanceChange}
                            keyboardType="numeric"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Risk %</Text>
                        <EnhancedTextInput
                            className="p-4 border border-primary-100 rounded-md text-black dark:text-white"
                            placeholder="Risk in %"
                            placeholderTextColor="#374151"
                            value={riskPercentage}
                            onChangeText={handleRiskPercentageChange}
                            onBlur={() => {
                                if (riskPercentage && !riskPercentage.includes('%')) {
                                    setRiskPercentage(riskPercentage + '%');
                                }
                            }}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Risk Amount</Text>
                        <TextInput
                            className="p-4 border border-primary-100 text-center rounded-md text-black dark:text-white"
                            placeholder="Risk Amount"
                            placeholderTextColor="#374151"
                            value={riskAmount}
                            onChangeText={handleRiskAmountChange}
                            keyboardType="numeric"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Stop Loss Pips</Text>
                        <TextInput
                            className="p-4 border border-primary-100 text-center rounded-md text-black dark:text-white"
                            placeholder="Stop Loss Pips"
                            placeholderTextColor="#374151"
                            value={stopLossPips}
                            onChangeText={handleStopLossPipsChange}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View className="flex-row gap-4 mb-4">
                    {/* Entry Price Input */}
                    <View className="flex-1">
                        <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Entry Price</Text>

                          <View className="relative">
                            <TextInput
                              value={entryPrice}
                              onChangeText={(text) => {
                                setEntryPrice(text);
                                setIsEntryPriceManuallyEdited(true);
                              }}
                              keyboardType="decimal-pad"
                              placeholder="Auto-filled entry price"
                              className="p-4 pr-10 border border-primary-100 rounded-md text-black dark:text-white"
                            />


                          <View className="absolute right-3 top-1/2 -translate-y-1/2">
                                {loading ? (
                                    <ActivityIndicator size="small" color="#0B6623" />
                                ) : (
                                    <TouchableOpacity onPress={handleRefreshRate}>
                                        <FontAwesome6 name="arrows-rotate" size={20} color="#0B6623" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    <View className="flex-1">
                        <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Stop Loss Price</Text>
                        <EnhancedTextInput
                            className="p-4 border border-primary-100 rounded-md text-black dark:text-white"
                            placeholder="Stop Loss Price"
                            placeholderTextColor="#374151"
                            value={stopLossPrice}
                            onChangeText={handleStopLossPriceChange}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View className="items-center mt-5">
                    <View className="flex-row items-center space-x-3">
                        <TouchableOpacity
                            onPress={calculatePosition}
                            className="bg-primary-100 px-6 shadow-md shadow-zinc-300 rounded-full py-4 mr-3"
                        >
                            <Text className="text-lg text-center font-rubik-medium text-white ml-2">Calculate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleReset}>
                            <FontAwesome6 name="rotate-right" size={22} color="#0B6623" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mt-4 w-full bg-secondary-100 border border-white rounded-2xl">
                    {[
                        { label: 'Risk Amount', value: riskAmount ? `${getCurrencySymbol(accountCurrency)}${riskAmount}` : `${getCurrencySymbol(accountCurrency)}0` },
                        { label: 'Units', value: units ? parseFloat(units).toLocaleString() : '0' },
                        { label: 'Standard Lots', value: standardLots },
                        { label: 'Mini Lots', value: miniLots },
                        { label: 'Micro Lots', value: microLots },
                        { label: 'Pip Value', value: pipValuePerLot ? `${getCurrencySymbol(accountCurrency)}${pipValuePerLot}` : `${getCurrencySymbol(accountCurrency)}0` },
                    ].map((item, index, arr) => (
                        <View
                            key={index}
                            className={`flex-row h-16 w-full items-center justify-between px-4 ${
                                index !== arr.length - 1 ? 'border-b border-white' : ''
                            }`}
                        >
                            <Text className="text-white font-rubik-medium">{item.label}</Text>
                            <Text className="text-white font-rubik-medium">{item.value}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default Forex;