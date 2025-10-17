import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import DerivPicker from '../components/DerivPicker.tsx';
import CurrencyPickerModal from "../components/CurrencyPickerModal.tsx";
import EnhancedTextInput from "../components/EnhancedTextInput.tsx";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid, Alert, Platform } from 'react-native';
import { useSettings } from '../context/SettingsContext.tsx';

// Comprehensive instruments data with tick size (TS), tick value (TV), and minimum lot
const INSTRUMENTS = {
  // Volatility Indices
  'R_10': { name: "Volatility 10 Index", TS: 0.001, TV: 0.001, minLot: 0.5 },
  'R_25': { name: "Volatility 25 Index", TS: 0.001, TV: 0.001, minLot: 0.5 },
  'R_50': { name: "Volatility 50 Index", TS: 0.0001, TV: 0.0001, minLot: 4.0 },
  'R_75': { name: "Volatility 75 Index", TS: 0.01, TV: 0.01, minLot: 0.001 },
  'R_100': { name: "Volatility 100 Index", TS: 0.01, TV: 0.01, minLot: 0.5 },
  // Volatility 1s Indices (RDB series)
  'RDB10': { name: "Volatility 10 (1s) Index", TS: 0.01, TV: 0.01, minLot: 0.5 },
  'RDB15': { name: "Volatility 15 (1s) Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'RDB25': { name: "Volatility 25 (1s) Index", TS: 0.01, TV: 0.01, minLot: 0.005 },
  'RDB30': { name: "Volatility 30 (1s) Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'RDB50': { name: "Volatility 50 (1s) Index", TS: 0.01, TV: 0.01, minLot: 0.005 },
  'RDB75': { name: "Volatility 75 (1s) Index", TS: 0.01, TV: 0.01, minLot: 0.05 },
  'RDB90': { name: "Volatility 90 (1s) Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'RDB100': { name: "Volatility 100 (1s) Index", TS: 0.01, TV: 0.01, minLot: 0.2 },
  'RDB150': { name: "Volatility 150 (1s) Index", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'RDB250': { name: "Volatility 250 (1s) Index", TS: 0.01, TV: 0.01, minLot: 0.5 },

  // Boom & Crash Indices
  'BOOM1000': { name: "Boom 1000 Index", TS: 0.0001, TV: 0.0001, minLot: 0.2 },
  'CRASH1000': { name: "Crash 1000 Index", TS: 0.0001, TV: 0.0001, minLot: 0.2 },
  'BOOM500': { name: "Boom 500 Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'CRASH500': { name: "Crash 500 Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'BOOM300': { name: "Boom 300 Index", TS: 0.001, TV: 0.001, minLot: 0.1 },
  'CRASH300': { name: "Crash 300 Index", TS: 0.001, TV: 0.001, minLot: 0.5 },
  'BOOM600': { name: "Boom 600 Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'CRASH600': { name: "Crash 600 Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'BOOM900': { name: "Boom 900 Index", TS: 0.001, TV: 0.001, minLot: 0.2 },
  'CRASH900': { name: "Crash 900 Index", TS: 0.001, TV: 0.001, minLot: 0.2 },

  // Jump Indices
  'JD10': { name: "Jump 10 Index", TS: 0.01, TV: 0.01, minLot: 0.01 },
  'JD25': { name: "Jump 25 Index", TS: 0.01, TV: 0.01, minLot: 0.01 },
  'JD50': { name: "Jump 50 Index", TS: 0.01, TV: 0.01, minLot: 0.01 },
  'JD75': { name: "Jump 75 Index", TS: 0.01, TV: 0.01, minLot: 0.01 },
  'JD100': { name: "Jump 100 Index", TS: 0.01, TV: 0.01, minLot: 0.01 },

  // Step Indices
  'STEP': { name: "Step Index", TS: 0.1, TV: 1, minLot: 0.1 },
  'STEP200': { name: "Step Index 200", TS: 0.1, TV: 1, minLot: 0.1 },
  'STEP300': { name: "Step Index 300", TS: 0.1, TV: 1, minLot: 0.1 },
  'STEP400': { name: "Step Index 400", TS: 0.1, TV: 1, minLot: 0.1 },
  'STEP500': { name: "Step Index 500", TS: 0.1, TV: 1, minLot: 0.1 },

  // Skew Step Indices
  'SKSD4': { name: "Skew Step Index 4 Down", TS: 0.1, TV: 1, minLot: 0.1 },
  'SKSU4': { name: "Skew Step Index 4 Up", TS: 0.1, TV: 1, minLot: 0.1 },
  'SKSD5': { name: "Skew Step Index 5 Down", TS: 0.1, TV: 1, minLot: 0.1 },
  'SKSU5': { name: "Skew Step Index 5 Up", TS: 0.1, TV: 1, minLot: 0.1 },

  // Multi Step Indices
  'MS2': { name: "Multi Step 2 Index", TS: 0.01, TV: 0.1, minLot: 0.1 },
  'MS3': { name: "Multi Step 3 Index", TS: 0.01, TV: 0.1, minLot: 0.1 },
  'MS4': { name: "Multi Step 4 Index", TS: 0.01, TV: 0.1, minLot: 0.1 },

  // VOL Over Crash/Boom Indices
  'VOLOVC400': { name: "VOL Over Crash 400", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'VOLOVC750': { name: "VOL Over Crash 750", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'VOLOVC550': { name: "VOL Over Crash 550", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'VOLOVB400': { name: "VOL Over Boom 400", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'VOLOVB750': { name: "VOL Over Boom 750", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'VOLOVB550': { name: "VOL Over Boom 550", TS: 0.01, TV: 0.01, minLot: 0.1 },

  // Range Break Indices
  'RB100': { name: "Range Break 100 Index", TS: 0.01, TV: 0.1, minLot: 0.01 },
  'RB200': { name: "Range Break 200 Index", TS: 0.01, TV: 0.1, minLot: 0.01 },

  // Trek Indices
  'TRKUP': { name: "Trek Up Index", TS: 0.1, TV: 0.01, minLot: 0.1 },
  'TRKDWN': { name: "Trek Down Index", TS: 0.1, TV: 0.01, minLot: 0.1 },

  // DEX Indices
  'DX600UP': { name: "DEX 600 Up", TS: 0.1, TV: 0.01, minLot: 0.1 },
  'DX600DOWN': { name: "DEX 600 Down", TS: 0.1, TV: 0.01, minLot: 0.1 },
  'DX900UP': { name: "DEX 900 Up", TS: 0.1, TV: 0.01, minLot: 0.1 },
  'DX900DOWN': { name: "DEX 900 Down", TS: 0.1, TV: 0.1, minLot: 0.01 },
  'DX1500UP': { name: "DEX 1500 Up", TS: 0.1, TV: 0.01, minLot: 0.1 },
  'DX1500DOWN': { name: "DEX 1500 Down", TS: 0.01, TV: 0.01, minLot: 0.01 },

  // Drift Switch Indices
  'DSWITCH10': { name: "Drift Switch Index 10", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'DSWITCH20': { name: "Drift Switch Index 20", TS: 0.01, TV: 0.01, minLot: 0.1 },
  'DSWITCH30': { name: "Drift Switch Index 30", TS: 0.01, TV: 0.01, minLot: 0.1 },

  // Baskets
  'BAEUR': { name: "EUR Basket", TS: 0.001, TV: 0.1, minLot: 0.1 },
  'BAGBP': { name: "GBP Basket", TS: 0.001, TV: 0.1, minLot: 0.1 },
  'BAAUD': { name: "AUD Basket", TS: 0.001, TV: 0.1, minLot: 0.1 },
  'BAUSD': { name: "USD Basket", TS: 0.001, TV: 0.1, minLot: 0.1 },
  'BAGOLD': { name: "Gold Basket", TS: 0.001, TV: 0.001, minLot: 0.1 },

  // Default fallback
  'default': { name: "Default", TS: 0.001, TV: 0.001, minLot: 0.5 }
};

const Deriv = () => {
  const ws = useRef<WebSocket | null>(null);
  const [currencyPair, setCurrencyPair] = useState('R_10');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [accountBalance, setAccountBalance] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('');
  const [riskAmount, setRiskAmount] = useState('');
  const [stopLossTick, setStopLossTick] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [pipValuePerLot, setPipValuePerLot] = useState('0');
  const [standardLots, setStandardLots] = useState('0');
  const [loading, setLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [takeProfit, setTakeProfit] = useState('');
  const [result, setResult] = useState({ ep: '0', rrr: '0' });



  // Helper function to get instrument data
  const getInstrument = (currencyPair: string) => {
    return INSTRUMENTS[currencyPair as keyof typeof INSTRUMENTS] || INSTRUMENTS.default;
  };

  const toNumeric = (s: string) => {
    const n = parseFloat(String(s).replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // Helper function to calculate decimals from minLot
  const decimalsFromMinLot = (minLot: number) => {
    if (!isFinite(minLot) || minLot <= 0) return 0;
    const s = String(minLot);
    if (!s.includes(".")) return 0;
    const dec = s.split(".")[1].replace(/0+$/, "");
    return dec.length;
  };

  // Helper function to floor to specific decimals
  const roundToDecimals = (value: number, decimals: number) => {
    if (!isFinite(value)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };

  const { showRiskRewardSection } = useSettings();

  // Helper function to get currency symbol
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
      // case 'CNY': case 'CNH': return '¥';
      // case 'CZK': return 'Kč';
      // case 'DKK': return 'kr ';
      // case 'HKD': return 'HK$';
      // case 'KRW': return '₩';
      // case 'KWD': return 'KD ';
      // case 'INR': return '₹';
      // case 'MXN': return 'Mex$';
      // case 'NOK': return 'kr ';
      // case 'PLN': return 'zł ';
      // case 'RUB': return '₽';
      // case 'SEK': return 'kr ';
      // case 'SGD': return 'S$';
      // case 'TRY': return '₺';
      case 'ZAR': return 'R ';
      default: return '';
    }
  };

  // Function to close WebSocket and clean up
  const closeWebSocket = useCallback(() => {
    if (ws.current) {
      if (subscriptionId) {
        ws.current.send(JSON.stringify({ forget: subscriptionId }));
        console.log('Unsubscribed from:', subscriptionId);
      }
      ws.current.close();
      ws.current = null;
      setSubscriptionId(null);
      setLoading(false);
    }
  }, [subscriptionId]);

  // Function to fetch the exchange rate from the Deriv API
  const fetchExchangeRate = useCallback((pair: string) => {
    console.log('Fetching exchange rate for:', pair);
    if (loading) {
      console.log('Already loading, skipping fetch for:', pair);
      return;
    }

    setLoading(true);

    // Close any existing WebSocket connection
    closeWebSocket();

    // Create new WebSocket connection
    ws.current = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=96246');

    ws.current.onopen = () => {
      // console.log('Deriv WebSocket connected for:', pair);
      const subscribeMessage = {
        ticks: pair,
        subscribe: 1
      };
      if (ws.current) {
        ws.current.send(JSON.stringify(subscribeMessage));
        // console.log('Subscribing to:', pair);
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message for', pair, ':', data);

      if (data.msg_type === 'tick' && data.tick) {
        const rate = data.tick.ask || data.tick.quote;
        if (rate) {
          const formatted = parseFloat(rate).toFixed(5);
          setEntryPrice(formatted);
          setLoading(false);
          console.log('Received price:', formatted, 'for', pair);
          closeWebSocket(); // Close connection after receiving first tick
        }
      } else if (data.msg_type === 'ticks' && data.subscription) {
        setSubscriptionId(data.subscription.id);
        console.log('Subscription ID for', pair, ':', data.subscription.id);
      } else if (data.error) {
        setEntryPrice('');
        // console.error('Deriv API error for', pair, ':', data.error.message);
        setLoading(false);
        closeWebSocket();
      }
    };

    ws.current.onerror = (error) => {
      console.error('Deriv WebSocket error for', pair, ':', error);
      setLoading(false);
      closeWebSocket();
    };

    ws.current.onclose = () => {
      // console.log('Deriv WebSocket closed for:', pair);
      setLoading(false);
      setSubscriptionId(null);
    };
  }, [loading, closeWebSocket]);

  // Handle refresh button click
  const handleRefreshRate = useCallback(() => {
    console.log('Refresh button clicked, fetching for:', currencyPair);
    fetchExchangeRate(currencyPair);
  }, [currencyPair, fetchExchangeRate]);

  // Fetch price when currency pair changes
  useEffect(() => {
    console.log('Currency pair changed to:', currencyPair);
    setTimeout(() => {
      fetchExchangeRate(currencyPair);
    }, 100); // Small delay to ensure state is settled
  }, [currencyPair, fetchExchangeRate]);

  // Update tick value when currency pair changes
  useEffect(() => {
    const instrument = getInstrument(currencyPair);
    setPipValuePerLot(instrument.TV.toFixed(6));
  }, [currencyPair]);

  useEffect(() => {
    fetchExchangeRate(currencyPair);
  }, [currencyPair, fetchExchangeRate]);

  // Update tick value when currency pair changes
  useEffect(() => {
    if (!entryPrice || toNumeric(entryPrice) === 0) {
      const instrument = getInstrument(currencyPair);
      setPipValuePerLot(instrument.TV.toFixed(6));
      return;
    }

    const instrument = getInstrument(currencyPair);
    setPipValuePerLot(instrument.TV.toFixed(6));
  }, [currencyPair, entryPrice]);

  // Updated calculatePosition function with correct formula
  const calculatePosition = useCallback(() => {
    const ab = toNumeric(accountBalance) || 0;
    const rPct = parseFloat(riskPercentage ? riskPercentage.replace('%', '') : '0') || 0;
    const ra = parseFloat(riskAmount) || 0;
    const slTicks = parseFloat(stopLossTick) || 0;
    const ep = toNumeric(entryPrice) || 0;
    const slPrice = toNumeric(stopLossPrice) || 0;

    // Get instrument data
    const instrument = getInstrument(currencyPair);
    const { TS, TV, minLot } = instrument;

    let calculatedRiskAmount = ra;
    if (riskPercentage && ab > 0 && !riskAmount) {
      calculatedRiskAmount = (ab * rPct) / 100;
      setRiskAmount(calculatedRiskAmount.toFixed(2));
    } else if (riskAmount && ab > 0 && !riskPercentage) {
      const calculatedRiskPct = (ra / ab) * 100;
      setRiskPercentage(calculatedRiskPct.toFixed(2) + '%');
    }

    let calculatedSlTicks = slTicks;
    if (ep > 0 && slPrice > 0 && !stopLossTick && TS > 0) {
      const priceDiff = Math.abs(ep - slPrice);
      calculatedSlTicks = Math.round(priceDiff / TS);
      setStopLossTick(calculatedSlTicks.toString());

    } else if (slTicks > 0 && ep > 0 && !stopLossPrice && TS > 0) {
      const direction = -1; // Assuming long position
      const calculatedSlPrice = ep + (direction * calculatedSlTicks * TS);

      // Get decimals from TS
      const priceDecimals = String(TS).includes('.') ? String(TS).split('.')[1].length : 0;
      setStopLossPrice(calculatedSlPrice.toFixed(priceDecimals));
    }

    if (calculatedRiskAmount > 0 && calculatedSlTicks > 0 && TV > 0) {
      let lots = calculatedRiskAmount / (calculatedSlTicks * TV);

      const lotDecimals = decimalsFromMinLot(minLot);
      lots = roundToDecimals(lots, lotDecimals);

      if (lots > 0 && lots < minLot) {
        lots = minLot;
      }

      setStandardLots(lots.toFixed(lotDecimals));
    } else {
      setStandardLots('0');
    }


    // Update tick value display
    const decimals = decimalsFromMinLot(minLot);
    setPipValuePerLot(TV.toFixed(Math.max(decimals, 2)));
    setIsCalculated(true);
  }, [accountBalance, riskPercentage, riskAmount, stopLossTick, entryPrice, stopLossPrice, currencyPair]);

  const resetOutputs = () => {
    setStandardLots('0');
    setPipValuePerLot('0');
    setIsCalculated(false);
  };

  const formatWithCommas = (value: string) => {
    // Remove all non-numeric except decimal
    const numericValue = value.replace(/,/g, '').replace(/[^\d.]/g, '');
    if (numericValue === '') return '';

    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // add commas to integer part
    return parts.join('.');
  };

  const handleAccountBalanceChange = (value: React.SetStateAction<string>) => {
    const formatted = formatWithCommas(value);
    setAccountBalance(formatted);
  };

  const handleRiskPercentageChange = (value: string) => {
    setRiskPercentage(value);
    if (accountBalance && value) {
      const ab = toNumeric(accountBalance) || 0;
      const rPct = parseFloat(value.replace('%', '')) || 0;
      const calculatedRiskAmount = (ab * rPct) / 100;
      setRiskAmount(calculatedRiskAmount.toFixed(2));
    } else {
      setRiskAmount('');
    }
    resetOutputs(); // clear lot size outputs
  };

  const handleRiskAmountChange = (value: React.SetStateAction<string>) => {
    setRiskAmount(value);
    setRiskPercentage('');
  };

  const handleStopLossPriceChange = (value: React.SetStateAction<string>) => {
    const formatted = formatWithCommas(value);
    setStopLossPrice(formatted);
    setStopLossTick('');
    resetOutputs();

    const ep = toNumeric(entryPrice) || 0;
    const slPrice = toNumeric(value) || 0;
    const instrument = getInstrument(currencyPair);
    const { TS } = instrument;

    if (ep > 0 && slPrice > 0 && TS > 0) {
      const priceDiff = Math.abs(ep - slPrice);
      const calculatedSlTicks = Math.round(priceDiff / TS);
      setStopLossTick(calculatedSlTicks.toString());
    }
  };

  // 💾 Persist Account Balance and Risk Percentage
  useEffect(() => {
    const saveUserInputs = async () => {
      try {
        if (accountBalance) {
          await AsyncStorage.setItem('accountBalance', accountBalance);
        }
        if (riskPercentage) {
          await AsyncStorage.setItem('riskPercentage', riskPercentage);
        }
      } catch (error) {
        console.warn('Error saving data to storage:', error);
      }
    };
    saveUserInputs();
  }, [accountBalance, riskPercentage]);


  // Calculate Take Profit
  // let rrr = '0';
  // let expectedProfit = '0';

  // ♻️ Load saved Account Balance and Risk Percentage on startup
  useEffect(() => {
    const loadUserInputs = async () => {
      try {
        const savedBalance = await AsyncStorage.getItem('accountBalance');
        const savedRisk = await AsyncStorage.getItem('riskPercentage');

        if (savedBalance !== null) {
          setAccountBalance(savedBalance);
        }
        if (savedRisk !== null) {
          setRiskPercentage(savedRisk);
        }
      } catch (error) {
        console.warn('Error loading data from storage:', error);
      }
    };
    loadUserInputs();
  }, []);


  const areBasicFieldsFilled = () => {
    return (
      accountBalance &&
      (riskPercentage || riskAmount) &&
      stopLossPrice &&
      entryPrice &&
      parseFloat(entryPrice) > 0 &&
      parseFloat(stopLossPrice) > 0
    );
  };

  const calculateTakeProfit = (tpValue: string) => {
    const TP = parseFloat(tpValue);
    const E = parseFloat(entryPrice);
    const SL = parseFloat(stopLossPrice);
    const C = parseFloat(accountBalance.replace(/,/g, ''));
    const R = parseFloat(riskPercentage.replace('%', '')) / 100;

    if (!C || !R || !E || !SL || !TP) {
      setResult({ ep: '0', rrr: '0' });
      return;
    }

    // Ensure Entry Price is between SL and TP
    const isValid =
      (E > SL && E < TP) || (E < SL && E > TP);

    if (!isValid) {
      setResult({ ep: 'Error', rrr: 'Error' });
      return;
    }

    const riskAmount = C * R;
    const rawRRR = (TP - E) / (E - SL);
    const formattedRRR = rawRRR.toFixed(2);

    if (rawRRR <= 0 || !isFinite(rawRRR)) {
      setResult({ ep: 'Error', rrr: 'Error' });
      return;
    }

    const EP = (rawRRR * riskAmount).toFixed(2);

    setResult({ ep: EP, rrr: formattedRRR });
  };


  const handleStopLossPipsChange = (value: React.SetStateAction<string>) => {
    setStopLossTick(value);
    setStopLossPrice('');
  };

  const handleEntryPriceChange = (value: string) => {
    const formatted = formatWithCommas(value);
    setEntryPrice(formatted);
    if (stopLossPrice) setStopLossTick('');
    resetOutputs();
  };

  // 🔁 Auto-clear EP/RRR when Entry or Stop Loss changes
  useEffect(() => {
    // Only clear if there’s a current result showing
    if (result.ep !== '0' || result.rrr !== '0') {
      setResult({ ep: '0', rrr: '0' });
      setTakeProfit('');
    }
  }, [entryPrice, stopLossPrice]);


  // useEffect(() => {
  //   calculatePosition();
  // }, [
  //   accountBalance,
  //   riskPercentage,
  //   riskAmount,
  //   stopLossTick,
  //   entryPrice,
  //   stopLossPrice,
  //   currencyPair,
  //   calculatePosition
  // ]);

  const lastPress = useRef(0);
  const singlePressTimer = useRef(null);

  const handleReset = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    // ✅ Detect Double-Tap
    if (now - lastPress.current < DOUBLE_PRESS_DELAY) {
      // 🔹 Double-tap detected → clear timeout first
      if (singlePressTimer.current) {
        clearTimeout(singlePressTimer.current);
        singlePressTimer.current = null;
      }

      // 🔹 Clear AsyncStorage and reset everything
      (async () => {
        try {
          await AsyncStorage.multiRemove(['accountBalance', 'riskPercentage']);
          setAccountBalance('');
          setRiskPercentage('');
          setEntryPrice('');
          setStopLossPrice('');
          setEntryPrice('');
          setPipValuePerLot('0');
          setStandardLots('0');
          setTakeProfit('');
          setResult({ ep: '0', rrr: '0' });

          if (Platform.OS === 'android') {
            ToastAndroid.show('All saved data has been removed.', ToastAndroid.SHORT);
          } else {
            Alert.alert('Data Cleared', 'All saved data has been removed.');
          }
        } catch (error) {
          console.warn('Error clearing AsyncStorage:', error);
        }
      })();

      lastPress.current = 0; // reset timer
    } else {
      // 🟡 Single tap → wait to check if another tap comes
      singlePressTimer.current = setTimeout(() => {
        // Only clear form values (keep AsyncStorage)
        setEntryPrice('');
        setStopLossPrice('');
        setEntryPrice('');
        setPipValuePerLot('0');
        setStandardLots('0');
        setTakeProfit('');
        setResult({ ep: '0', rrr: '0' });

        if (Platform.OS === 'android') {
          ToastAndroid.show('Fields cleared (saved data preserved).', ToastAndroid.SHORT);
        } else {
          Alert.alert('Form Reset', 'Fields cleared (saved data preserved).');
        }
      }, DOUBLE_PRESS_DELAY);

      lastPress.current = now;
    }
  };

  // Clean up the WebSocket connection when the component unmounts
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <SafeAreaView className="bg-white dark:bg-black-300 h-full p-4">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-2 mt-4">
          <Text className="text-lg font-rubik-bold text-center mb-9 text-secondary-100 dark:text-white">Deriv Sythetics Indices Lot Calculator</Text>
        </View>

        <View className="flex-row gap-4 mb-4" style={{ position: 'relative', zIndex: 10 }}>
          <View className="flex-1">
            <CurrencyPickerModal
              accountCurrency={accountCurrency}
              setAccountCurrency={setAccountCurrency}
            />
          </View>

          <View className="flex-1" style={{ zIndex: 1 }}>
            <DerivPicker
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
            <EnhancedTextInput
              className="p-4 border border-primary-100 text-center rounded-md text-black dark:text-white"
              placeholder="Risk Amount"
              placeholderTextColor="#374151"
              value={riskAmount}
              onChangeText={handleRiskAmountChange}
              keyboardType="numeric"
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Stop Loss Tick</Text>
            <EnhancedTextInput
              className="p-4 border border-primary-100 text-center rounded-md text-black dark:text-white"
              placeholder="Stop Loss Ticks"
              placeholderTextColor="#374151"
              value={stopLossTick}
              onChangeText={handleStopLossPipsChange}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Entry Price</Text>
            <View className="relative">
              <EnhancedTextInput
                value={entryPrice}
                onChangeText={handleEntryPriceChange}
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

        <View className="mt-4 mb-1 w-full bg-red-600 border border-white rounded-2xl">
          {[
            // { label: 'Risk Amount', value: riskAmount ? `${getCurrencySymbol(accountCurrency)}${riskAmount}` : `${getCurrencySymbol(accountCurrency)}0` },
            { label: 'Lots', value: isCalculated ? standardLots : '0' },
            { label: 'Tick Value', value: isCalculated ? `${getCurrencySymbol(accountCurrency)}${pipValuePerLot}` : `${getCurrencySymbol(accountCurrency)}0` },
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

        {showRiskRewardSection && (
        <View className="mt-4 w-full bg-black-200 border border-white rounded-2xl overflow-hidden mb-2">
          {/* Table Grid */}
          <View className="border-t border-white flex-row">

            {/* LEFT COLUMN - Take Profit Input */}
            <View className="w-1/2 border-r border-white px-4 py-5 justify-center">
              <TextInput
                className="p-4 border border-accent-100 rounded-xl text-white text-center"
                placeholder="Take Profit Price"
                placeholderTextColor="#808080"
                value={takeProfit}
                onChangeText={(value) => {
                  setTakeProfit(value);
                  calculateTakeProfit(value);
                }}
                keyboardType="numeric"
              />
            </View>


            {/* RIGHT COLUMN - EP, Risk, RRR */}
            <View className="w-1/2 px-4 py-5 justify-center items-center">
              {areBasicFieldsFilled() && takeProfit ? (
                <View className="w-full">
                  {/* Expected Profit */}
                  <View className="flex-row justify-between border-b border-white/30 pb-2 mb-2">
                    <Text className="text-white font-rubik-medium">Profit:</Text>
                    <Text
                      className={`font-rubik-bold ${
                        result.ep === 'Error' ? 'text-red-500' : 'text-green-400'
                      }`}
                    >
                      {result.ep === 'Error'
                        ? 'Error'
                        : `≈${getCurrencySymbol(accountCurrency)}${result.ep}`}
                    </Text>
                  </View>

                  {/* Risk */}
                  <View className="flex-row justify-between border-b border-white/30 pb-2 mb-2">
                    <Text className="text-white font-rubik-medium">Risk:</Text>
                    <Text className="text-red-400 font-rubik-bold">
                      {getCurrencySymbol(accountCurrency)}{riskAmount || '0'}
                    </Text>
                  </View>

                  {/* RRR */}
                  <View className="flex-row justify-between">
                    <Text className="text-white font-rubik-medium">RRR:</Text>
                    <Text
                      className={`font-rubik-bold ${
                        result.rrr === 'Error' ? 'text-red-500' : 'text-purple-400'
                      }`}
                    >
                      {result.rrr === 'Error' ? 'Error' : `1:${result.rrr}`}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default Deriv;
