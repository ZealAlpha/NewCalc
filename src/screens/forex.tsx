import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { View, Text, TextInput, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomCurrencyPicker from '../components/CustomCurrencyPicker.tsx';
import CurrencyPickerModal from "../components/CurrencyPickerModal.tsx";
import EnhancedTextInput from "../components/EnhancedTextInput.tsx";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';
import { ToastAndroid, Alert, Platform } from 'react-native';
import { useSettings } from '../context/SettingsContext.tsx';
import { ThemeContext } from '../components/ThemeContext';


const Forex = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [currencyPair, setCurrencyPair] = useState('EURUSD');
  const [, setIsCalculated] = useState(false);
  const [accountCurrencyOpen] = useState(false);
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [isEntryPriceManuallyEdited, setIsEntryPriceManuallyEdited] = useState(false);
  const { isAdvancedMode } = useSettings();

  // Move indicesQuoteCurrencies outside of component or memoize it
  const indicesQuoteCurrencies = useMemo(() => ({
    '^AXJO': 'AUD',
    '^N225': 'JPY',
    '^FTSE': 'GBP',
    '^IBEX': 'EUR',
    '^HSI': 'HKD',
    '^GDAXI': 'EUR',
    '^FCHI': 'EUR',
    '^DJI': 'USD',
    '^SPX': 'USD',
    '^XNDX': 'USD',
  }), []);

  // Helper function to extract quote currency based on pair length and type
  const getQuoteCurrency = useCallback((pair: string): string => {
    // Check if it's an index first
    if (indicesQuoteCurrencies[pair]) {
      return indicesQuoteCurrencies[pair];
    }

    // For crypto pairs with 7 characters
    if (pair.length === 7) {
      // Check if it starts with known 3-letter crypto symbols
      const threeLetterCryptos = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB'];
      if (threeLetterCryptos.some(sym => pair.startsWith(sym))) {
        return pair.substring(3, 7); // BTCBUSD → BUSD
      }
      // Check if it starts with known 4-letter crypto symbols
      const fourLetterCryptos = ['DOGE'];
      if (fourLetterCryptos.some(sym => pair.startsWith(sym))) {
        return pair.substring(4, 7); // DOGEUSD → USD
      }
    }

    // For commodities with 5 characters
    if (pair.length === 5) {
      return pair.substring(2, 5); // GCUSD → USD
    }

    // Default for 6-char forex pairs
    return pair.substring(3, 6); // EURUSD → USD
  }, [indicesQuoteCurrencies]);

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
  const [newstandardLots, setNewstandardLots] = useState('0');
  const [miniLots, setMiniLots] = useState('0');
  const [microLots, setMicroLots] = useState('0');
  const [loading, setLoading] = useState(false);
  const [quoteToAccountRate, setQuoteToAccountRate] = useState('1');
  const [IndicesExchangeRate, setIndicesExchangeRate] = useState<number | null>(null);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [takeProfitPip, setTakeProfitPip] = useState('0');
  const [rrr, setRrr] = useState('0');
  const [xp, setXp] = useState('0');



  const API_KEY = 'HdJ6P9Xswe51x5KLWiCORfvPc1cDlnKJ';

  type CacheEntry = {
    rate: string;
    timestamp: number;
  };

  const cache: Record<string, CacheEntry> = {};
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  const { showRiskRewardSection } = useSettings();

  const getCachedRate = (pair: string | number) => {
    const cached = cache[pair];
    if (!cached) return null;
    const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY;
    return isExpired ? null : cached.rate;
  };

  const setCachedRate = (pair: string | number, rate: string) => {
    cache[pair] = { rate, timestamp: Date.now() };
  };

  const indicesPairs = useMemo(() => [
    "^DJI", "^SPX", "^AXJO", "^N225", "^FTSE", "^IBEX", "^HSI", "^XNDX", "^GDAXI", "^FCHI"
  ], []);

  const fetchExchangeRate = useCallback(async (pair: string) => {
    if (!isEntryPriceManuallyEdited) {
      const originalPair = pair;
      const cached = getCachedRate(originalPair);
      if (cached) {
        setEntryPrice(cached);
        return;
      }

      setLoading(true);

      try {
        // 1) Fetch entry price for instrument (index or forex)
        const entryRes = await fetch(`https://financialmodelingprep.com/api/v3/quote/${originalPair}?apikey=${API_KEY}`);
        if (!entryRes.ok) throw new Error(`HTTP error! status: ${entryRes.status}`);
        const entryData = await entryRes.json();

        if (Array.isArray(entryData) && entryData.length > 0 && entryData[0].price) {
          const entryRate = entryData[0].price;
          const formatted = parseFloat(entryRate).toFixed(4).replace(/\.?0+$/, ''); // can be set to 5 later
          setEntryPrice(formatted);
          setCachedRate(originalPair, formatted);
        } else {
          console.warn("No entry price data received");
        }

        // 2) If this is an index, fetch the conversion between index quote currency and account currency.
        // @ts-ignore
        const quoteCurrency = indicesQuoteCurrencies[originalPair];
        if (quoteCurrency && accountCurrency !== quoteCurrency) {
          // Preferred pair: accountCurrency + quoteCurrency (e.g. USDJPY)
          const pairA = `${accountCurrency}${quoteCurrency}`;
          const pairB = `${quoteCurrency}${accountCurrency}`; // fallback (invert)

          let er = 1;
          // try preferred pair first
          try {
            const resA = await fetch(`https://financialmodelingprep.com/api/v3/quote/${pairA}?apikey=${API_KEY}`);
            if (resA.ok) {
              const dA = await resA.json();
              if (Array.isArray(dA) && dA.length > 0 && dA[0].price) {
                er = dA[0].price;
              } else {
                // fallback to reversed pair and invert
                const resB = await fetch(`https://financialmodelingprep.com/api/v3/quote/${pairB}?apikey=${API_KEY}`);
                if (resB.ok) {
                  const dB = await resB.json();
                  if (Array.isArray(dB) && dB.length > 0 && dB[0].price) {
                    er = 1 / dB[0].price;
                  }
                }
              }
            } else {
              // try reversed if preferred returns non-ok
              const resB = await fetch(`https://financialmodelingprep.com/api/v3/quote/${pairB}?apikey=${API_KEY}`);
              if (resB.ok) {
                const dB = await resB.json();
                if (Array.isArray(dB) && dB.length > 0 && dB[0].price) {
                  er = 1 / dB[0].price;
                }
              }
            }
          } catch (err) {
            console.warn('Error fetching conversion pair, falling back to 1', err);
            er = 1;
          }

          setIndicesExchangeRate(er);
        } else {
          // same currency or not an index
          setIndicesExchangeRate(1);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        // fallback so calculations don't explode
        setIndicesExchangeRate(1);
      } finally {
        setLoading(false);
      }
    }
  }, [isEntryPriceManuallyEdited, API_KEY, accountCurrency, indicesQuoteCurrencies]);

  const handleRefreshRate = useCallback(() => {
    setIsEntryPriceManuallyEdited(false);
    fetchExchangeRate(currencyPair);
  }, [currencyPair, fetchExchangeRate]);

  useEffect(() => {
    fetchExchangeRate(currencyPair);
  }, [currencyPair, fetchExchangeRate]);

  useEffect(() => {
    setIsEntryPriceManuallyEdited(false);
  }, [currencyPair]);

  useEffect(() => {
    const isIndices = indicesPairs.includes(currencyPair);

    if (isIndices) {
      // For indices, use the IndicesExchangeRate that's already being fetched
      // The conversion is handled in the fetchExchangeRate function
      setQuoteToAccountRate('1'); // Default to 1, actual conversion handled via IndicesExchangeRate
    } else {
      // Step 1: Extract quote currency using helper function
      const quoteCurrency = getQuoteCurrency(currencyPair);

      if (quoteCurrency !== accountCurrency) {
        setLoading(true);

        // Step 2: Convert BUSD to USD (since they're pegged 1:1)
        const effectiveQuoteCurrency = quoteCurrency === 'BUSD' ? 'USD' : quoteCurrency;

        // Step 3: Fetch conversion rate (e.g., USDGBP ≈ 0.749)
        const pair = `${effectiveQuoteCurrency}${accountCurrency}`;

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
        setQuoteToAccountRate('1');
      }
    }
  }, [currencyPair, accountCurrency, API_KEY, indicesPairs, getQuoteCurrency]);

  useEffect(() => {
    if (!entryPrice || parseFloat(entryPrice) === 0) return;

    const quoteCurrency = getQuoteCurrency(currencyPair);
    const baseCurrency = currencyPair.substring(0, 3);
    const commoditiesBaseCurrency = currencyPair.substring(0, 2);
    const isJPYQuote = quoteCurrency === 'JPY';
    const isXAG = commoditiesBaseCurrency === 'SI' || currencyPair.startsWith('XAGUSD');
    const isJPYBase = baseCurrency === 'JPY';
    const isNG = currencyPair.startsWith('NGUSD');
    const isIndices = indicesPairs.includes(currencyPair);
    const isCryptoPair = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'DOG'].some(sym => currencyPair.startsWith(sym));
    const isCommodities = ['PLUSD', 'GCUSD', 'SIUSD', 'NGUSD', 'CLUSD', 'PAUSD', 'BZUSD', 'XAUUSD', 'XAGUSD', 'XTIUSD', 'XBRUSD'].some(sym => currencyPair.startsWith(sym));
    const isJP225 = currencyPair.startsWith('^N225') || currencyPair.startsWith('JP225');
    const isHSI = currencyPair.startsWith('^HSI') || currencyPair.startsWith('HSI50');

    let pipValue;

    if (isCryptoPair) {
      // Step 4: Calculate pip value (0.01 × 0.749 = £0.00749)
      // For crypto pairs, pip value is typically 0.01 per unit
      if (accountCurrency === quoteCurrency || accountCurrency === 'USD' && quoteCurrency === 'BUSD') {
        pipValue = 0.01;
      } else {
        // Use the fetched conversion rate (quoteToAccountRate)
        pipValue = 0.01 * parseFloat(quoteToAccountRate);
      }
    } else if (isIndices) {
      // @ts-ignore
      const indexQuoteCurrency = indicesQuoteCurrencies[currencyPair];
      if (accountCurrency === indexQuoteCurrency) {
        pipValue = 0.01;
      } else {
        const exchangeRate = IndicesExchangeRate ?? 1;
        pipValue = 0.01 / exchangeRate;
      }
    } else if (isJPYQuote) {
      // Existing JPY quote logic
      if (accountCurrency === quoteCurrency) {
        pipValue = 1000;
      } else if (accountCurrency === 'USD') {
        pipValue = 1000 * parseFloat(quoteToAccountRate);
      } else if (accountCurrency === 'JPY') {
        pipValue = 1000;
      } else {
        pipValue = (1000 * parseFloat(quoteToAccountRate))
      }
    } else if (isJPYBase) {
      // Existing JPY base logic
      if (accountCurrency === quoteCurrency) {
        pipValue = 10 * parseFloat(entryPrice);
      } else if (accountCurrency === 'USD') {
        pipValue = 10 * parseFloat(entryPrice);
      } else if (accountCurrency === 'JPY') {
        pipValue = 10 / parseFloat(entryPrice);
      } else {
        pipValue = 10 * parseFloat(quoteToAccountRate);
      }
    } else if (isCommodities && isXAG) {
      // Silver logic
      if (accountCurrency === quoteCurrency) {
        pipValue = 50;
      } else if (accountCurrency === 'USD') {
        pipValue = 50;
      } else {
        pipValue = 50 * parseFloat(quoteToAccountRate);
      }
    } else if (isCommodities && isNG) {
      // Natural Gas specific logic - pip value is $10 per lot
      if (accountCurrency === quoteCurrency) {
        pipValue = 1;
      } else if (accountCurrency === 'USD') {
        pipValue = 1;
      } else {
        pipValue = parseFloat(quoteToAccountRate);
      }
    } else if (isCommodities) {
      // Commodities: $1 per lot per pip (except Silver and Natural Gas handled above)
      if (accountCurrency === quoteCurrency) {
        pipValue = 1;
      } else if (accountCurrency === 'USD') {
        pipValue = 1;
      } else {
        // quoteToAccountRate is USDGBP (e.g., 0.749), which is correct
        // $1 × 0.749 = £0.749
        pipValue = 1 * parseFloat(quoteToAccountRate);
      }
    } else {
      // Existing forex logic
      if (accountCurrency === quoteCurrency) {
        pipValue = 10;
      } else if (accountCurrency === 'USD') {
        if (quoteCurrency === 'USD') {
          pipValue = 10;
        } else {
          pipValue = 10 * parseFloat(quoteToAccountRate);
        }
      } else {
        pipValue = 10 * parseFloat(quoteToAccountRate);
      }
    }

    if (isJP225 || isHSI){
      setPipValuePerLot(pipValue.toFixed(8));
    } else {
      setPipValuePerLot(pipValue.toFixed(4));
    }
  }, [currencyPair, entryPrice, accountCurrency, quoteToAccountRate, IndicesExchangeRate, indicesQuoteCurrencies, indicesPairs, getQuoteCurrency]);

  const toNumeric = (s: string) => {
    const n = parseFloat(String(s).replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  const calculatePosition = useCallback(() => {
    const ab = parseFloat(accountBalance) || 0;
    const rPct = parseFloat(riskPercentage ? riskPercentage.replace('%', '') : '0') || 0;
    const ra = parseFloat(riskAmount) || 0;
    const slPips = parseFloat(stopLossPips) || 0;
    const pv = parseFloat(pipValuePerLot) || 0;
    const ep = parseFloat(entryPrice) || 0;
    const slPrice = parseFloat(stopLossPrice) || 0;
    const commoditiesBaseCurrency = currencyPair.substring(0, 2);
    const quoteCurrency = getQuoteCurrency(currencyPair);
    const isJPYQuote = quoteCurrency === 'JPY';
    const isXAG = commoditiesBaseCurrency === 'SI';
    const isNG = commoditiesBaseCurrency === 'NG';
    const isDoge = currencyPair.startsWith('DOG');
    const tp = parseFloat(takeProfitPrice) || 0;

    const isIndices = ['^DJI', '^SPX', '^AXJO', '^N225', '^FTSE', '^IBEX', '^HSI', '^XNDX', '^GDAXI', '^FCHI']
      .some(sym => currencyPair.startsWith(sym));
    const isCryptoPair = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'DOG']
      .some(sym => currencyPair.startsWith(sym));
    const isCommodities = ['PLUSD', 'GCUSD', 'SIUSD', 'NGUSD', 'CLUSD', 'PAUSD', 'BZUSD', 'XAUUSD', 'XAGUSD', 'XTIUSD', 'XBRUSD']
      .some(sym => currencyPair.startsWith(sym));

    let calculatedRiskAmount = ra;
    if (riskPercentage && ab > 0 && !riskAmount) {
      calculatedRiskAmount = (ab * rPct) / 100;
      setRiskAmount(calculatedRiskAmount.toFixed(2));
    } else if (riskAmount && ab > 0 && !riskPercentage) {
      const calculatedRiskPct = (ra / ab) * 100;
      setRiskPercentage(calculatedRiskPct.toFixed(2) + '%');
    }

    let calculatedSlPips = slPips;
    if (ep > 0 && slPrice > 0 && !stopLossPips) {
      if (isCryptoPair && isDoge) {
        calculatedSlPips = Math.abs(ep - slPrice) * 1000;
      } else if (isCryptoPair && !isDoge) {
        // For crypto, use simple price difference (no multiplier)
        calculatedSlPips = Math.abs(ep - slPrice) * 100;
      } else if (isJPYQuote || (isCommodities && !isNG) || isIndices) {
        // Document shows: SLP = (E-SL) × 100
        calculatedSlPips = Math.abs(ep - slPrice) * 100;
      } else if (isCommodities && isNG) {
        // Natural Gas uses 10,000 multiplier like forex pairs
        calculatedSlPips = Math.abs(ep - slPrice) * 10000;
      } else {
        // Document shows: SLP = (E-SL) × 10,000
        calculatedSlPips = Math.abs(ep - slPrice) * 10000;
      }
      setStopLossPips(calculatedSlPips.toFixed(2));
    } else if (slPips > 0 && ep > 0 && !stopLossPrice) {
      let calculatedSlPrice;
      const direction = -1;

      if (isCryptoPair) {
        // For crypto, direct price calculation
        calculatedSlPrice = ep + (direction * calculatedSlPips);
      } else if (isJPYQuote || (isCommodities && !isNG) || isIndices) {
        calculatedSlPrice = ep + (direction * calculatedSlPips / 100);
      } else if (isCommodities && isNG) {
        // Natural Gas uses 10,000 divisor like forex pairs
        calculatedSlPrice = ep + (direction * calculatedSlPips / 10000);
      } else {
        calculatedSlPrice = ep + (direction * calculatedSlPips / 10000);
      }

      setStopLossPrice(calculatedSlPrice.toFixed(isCryptoPair ? 1 : (isJPYQuote ? 3 : 5)));
    }

    let tpp = 0;

    // Only calculate RRR & EP if TP or TPP exists
    if (takeProfitPrice || (takeProfitPip && takeProfitPip !== "0")) {
      if (tp && ep) {
        if (isCryptoPair) tpp = Math.abs(tp - ep) * 100;
        else if (isIndices || isCommodities || isJPYQuote) tpp = Math.abs(tp - ep) * 100;
        else if (isNG) tpp = Math.abs(tp - ep) * 1000;
        else tpp = Math.abs(tp - ep) * 10000;

        setTakeProfitPip(tpp.toFixed(2));
      }

      // Validate range (entry must be between SL and TP)
      const isInvalidRange = (ep <= slPrice && ep <= tp) || (ep >= slPrice && ep >= tp);
      if (isInvalidRange) {
        setRrr("Error");
        setXp("Error");
      } else if (tpp > 0 && calculatedSlPips > 0 && calculatedRiskAmount > 0) {
        const riskrr = tpp / calculatedSlPips;
        const expectedProfit = riskrr * calculatedRiskAmount;
        setRrr(riskrr.toFixed(2));
        setXp(expectedProfit.toFixed(2));
      } else {
        setRrr("0");
        setXp("0");
      }
    } else {
      // If no Take Profit entered, clear RRR and EP but still calculate rest of data
      setRrr("0");
      setXp("0");
    }

    if (calculatedRiskAmount > 0 && calculatedSlPips > 0 && pv > 0) {
      let baseLotsResult = calculatedRiskAmount / (calculatedSlPips * pv);

      // Special handling for DOGE - multiply by 10 for standard lots
      if (isDoge) {
        const standardLotsResult = baseLotsResult * 10;
        setStandardLots(standardLotsResult.toFixed(2));
        setNewstandardLots(standardLotsResult.toFixed(1));
        setMiniLots((standardLotsResult * 10).toFixed(1));
        setMicroLots((standardLotsResult * 100).toFixed(0));
        setUnits(Math.round(baseLotsResult).toString());
      } else {
        setStandardLots(baseLotsResult.toFixed(3));
        setNewstandardLots(baseLotsResult.toFixed(2));
        setMiniLots((baseLotsResult * 10).toFixed(2));
        setMicroLots((baseLotsResult * 100).toFixed(1));

        const lotMultiplier = isIndices ? 100 :
          (isCryptoPair ? 1 :
            (isCommodities && isXAG) ? 1000 :
              (isCommodities && isNG) ? 10000 :
                (isCommodities) ? 100 : 100000);

        const unitsResult = baseLotsResult * lotMultiplier;
        setUnits(Math.round(unitsResult).toString());
      }
    } else {
      setUnits('0');
      setStandardLots('0');
      setNewstandardLots('0');
      setMicroLots('0');
    }
    setIsCalculated(true);
  }, [accountBalance, riskPercentage, riskAmount, stopLossPips, pipValuePerLot, entryPrice, stopLossPrice, currencyPair, takeProfitPrice, takeProfitPip, getQuoteCurrency]);


  const resetOutputs = () => {
    setUnits('0');
    setStandardLots('0');
    setNewstandardLots('0');
    setMiniLots('0');
    setMicroLots('0');
    // setRiskAmount('');
    setIsCalculated(false);
  };

  const handleAccountBalanceChange = (value: string) => {
    setAccountBalance(value);

    const ab = parseFloat(value) || 0;
    const rPct = parseFloat(riskPercentage?.replace('%', '') || '0');
    const ra = parseFloat(riskAmount || '0');

    // Recalculate Risk Amount if user is using Risk %
    if (riskPercentage && ab > 0) {
      const newRiskAmount = (ab * rPct) / 100;
      setRiskAmount(newRiskAmount.toFixed(2));
    }

    // Or recalc Risk % if user is using Risk Amount
    if (riskAmount && ab > 0 && !riskPercentage) {
      const newRiskPct = (ra / ab) * 100;
      setRiskPercentage(newRiskPct.toFixed(2) + '%');
    }

    resetOutputs();
  };


  const handleTakeProfitChange = (value: string) => {
    setTakeProfitPrice(value);
    const ep = parseFloat(entryPrice) || 0;
    const tp = parseFloat(value) || 0;
    if (!ep || !tp) return;

    const quoteCurrency = getQuoteCurrency(currencyPair);
    const isJPY = quoteCurrency === "JPY";
    const isNG = currencyPair.startsWith("NGUSD");
    const isCrypto = ["BTC", "ETH", "SOL", "BNB", "DOG", "XRP"].some(sym => currencyPair.startsWith(sym));
    const isIndices = currencyPair.startsWith("^");
    const isCommodities = ["PLUSD","GCUSD","SIUSD","NGUSD","CLUSD","PAUSD","BZUSD","XAUUSD","XAGUSD","XTIUSD","XBRUSD"].some(sym => currencyPair.startsWith(sym));

    let tpp = 0;
    if (isCrypto) tpp = Math.abs(tp - ep) * 100;
    else if (isIndices || isCommodities || isJPY) tpp = Math.abs(tp - ep) * 100;
    else if (isNG) tpp = Math.abs(tp - ep) * 1000;
    else tpp = Math.abs(tp - ep) * 10000;

    setTakeProfitPip(tpp.toFixed(2));
  };

  const handleTakeProfitPipsChange = (value: string) => {
    setTakeProfitPip(value);
    const ep = parseFloat(entryPrice) || 0;
    const tpp = parseFloat(value) || 0;
    if (!ep || !tpp) return;

    const quoteCurrency = getQuoteCurrency(currencyPair);
    const isJPY = quoteCurrency === "JPY";
    const isNG = currencyPair.startsWith("NGUSD");
    const isCrypto = ["BTC", "ETH", "SOL", "BNB", "DOG", "XRP"].some(sym => currencyPair.startsWith(sym));
    const isIndices = currencyPair.startsWith("^");
    const isCommodities = ["PLUSD","GCUSD","SIUSD","NGUSD","CLUSD","PAUSD","BZUSD","XAUUSD","XAGUSD","XTIUSD","XBRUSD"].some(sym => currencyPair.startsWith(sym));

    let tp = ep;
    if (isCrypto) tp = ep + tpp / 100;
    else if (isIndices || isCommodities || isJPY) tp = ep + tpp / 100;
    else if (isNG) tp = ep + tpp / 1000;
    else tp = ep + tpp / 10000;

    setTakeProfitPrice(tp.toFixed(5));
  };

  const handleRiskPercentageChange = (value: string) => {
    setRiskPercentage(value);
    if (accountBalance && value) {
      const ab = parseFloat(accountBalance) || 0;
      const rPct = parseFloat(value.replace('%', '')) || 0;
      const calculatedRiskAmount = (ab * rPct) / 100;
      setRiskAmount(calculatedRiskAmount.toFixed(2));
    } else {
      setRiskAmount('');
    }
    resetOutputs();
  };

  const handleRiskAmountChange = (value: string) => {
    setRiskAmount(value);
    if (accountBalance && value) {
      const ab = parseFloat(accountBalance) || 0;
      const ra = parseFloat(value) || 0;
      const calculatedRiskPct = (ra / ab) * 100;
      setRiskPercentage(calculatedRiskPct.toFixed(2) + '%');
    } else {
      setRiskPercentage('');
    }
    resetOutputs();
  };

  const handleStopLossPriceChange = (value: string) => {
    setStopLossPrice(value);
    if (entryPrice && value) {
      const ep = parseFloat(entryPrice) || 0;
      const slPrice = parseFloat(value) || 0;

      // Get instrument type data
      const quoteCurrency = getQuoteCurrency(currencyPair);
      const isJPYQuote = quoteCurrency === 'JPY';
      const isNG = currencyPair.startsWith('NGUSD');
      const isDoge = currencyPair.startsWith('DOG');

      const isIndices = ['^DJI', '^SPX', '^AXJO', '^N225', '^FTSE', '^IBEX', '^HSI', '^XNDX', '^GDAXI', '^FCHI']
        .some(sym => currencyPair.startsWith(sym));
      const isCryptoPair = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'DOG']
        .some(sym => currencyPair.startsWith(sym));
      const isCommodities = ['PLUSD', 'GCUSD', 'SIUSD', 'NGUSD', 'CLUSD', 'PAUSD', 'BZUSD', 'XAUUSD', 'XAGUSD', 'XTIUSD', 'XBRUSD']
        .some(sym => currencyPair.startsWith(sym));

      let calculatedSlPips;

      if (isCryptoPair && isDoge) {
        calculatedSlPips = Math.abs(ep - slPrice) * 1000;
      } else if (isCryptoPair && !isDoge) {
        calculatedSlPips = Math.abs(ep - slPrice) * 100;
      } else if (isJPYQuote || (isCommodities && !isNG) || isIndices) {
        calculatedSlPips = Math.abs(ep - slPrice) * 100;
      } else if (isCommodities && isNG) {
        calculatedSlPips = Math.abs(ep - slPrice) * 10000;
      } else {
        // Standard forex pairs
        calculatedSlPips = Math.abs(ep - slPrice) * 10000;
      }

      setStopLossPips(calculatedSlPips.toFixed(2));
    } else {
      setStopLossPips('');
    }
    resetOutputs();
  };

  const handleStopLossPipsChange = (value: string) => {
    setStopLossPips(value);
    if (entryPrice && value) {
      const ep = parseFloat(entryPrice) || 0;
      const slPips = parseFloat(value) || 0;
      const direction = -1; // Assuming long position (SL below entry)

      // Get instrument type data
      const quoteCurrency = getQuoteCurrency(currencyPair);
      const isJPYQuote = quoteCurrency === 'JPY';
      const isNG = currencyPair.startsWith('NGUSD');
      const isDoge = currencyPair.startsWith('DOG');

      const isIndices = ['^DJI', '^SPX', '^AXJO', '^N225', '^FTSE', '^IBEX', '^HSI', '^XNDX', '^GDAXI', '^FCHI']
        .some(sym => currencyPair.startsWith(sym));
      const isCryptoPair = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'DOG']
        .some(sym => currencyPair.startsWith(sym));
      const isCommodities = ['PLUSD', 'GCUSD', 'SIUSD', 'NGUSD', 'CLUSD', 'PAUSD', 'BZUSD', 'XAUUSD', 'XAGUSD', 'XTIUSD', 'XBRUSD']
        .some(sym => currencyPair.startsWith(sym));

      let calculatedSlPrice;

      if (isCryptoPair && isDoge) {
        calculatedSlPrice = ep + (direction * slPips / 1000);
      } else if (isCryptoPair && !isDoge) {
        calculatedSlPrice = ep + (direction * slPips / 100);
      } else if (isJPYQuote || (isCommodities && !isNG) || isIndices) {
        calculatedSlPrice = ep + (direction * slPips / 100);
      } else if (isCommodities && isNG) {
        calculatedSlPrice = ep + (direction * slPips / 10000);
      } else {
        // Standard forex pairs
        calculatedSlPrice = ep + (direction * slPips / 10000);
      }

      // Set appropriate decimal places based on instrument type
      const decimals = isCryptoPair ? (isDoge ? 6 : 2) : (isJPYQuote ? 3 : 5);
      setStopLossPrice(calculatedSlPrice.toFixed(decimals));
    } else {
      setStopLossPrice('');
    }
    resetOutputs();
  };

  const handleEntryPriceChange = (value: string) => {
    setEntryPrice(value);
    setIsEntryPriceManuallyEdited(true);
    if (stopLossPrice) setStopLossPips(''); // triggers SL Pips auto-update
    resetOutputs();
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
        if (riskAmount) {
          await AsyncStorage.setItem('riskAmount', riskAmount);
        }
      } catch (error) {
        console.warn('Error saving data to storage:', error);
      }
    };
    saveUserInputs();
  }, [accountBalance, riskAmount, riskPercentage]);

  // ♻️ Load saved Account Balance and Risk Percentage on startup
  useEffect(() => {
    const loadUserInputs = async () => {
      try {
        const savedBalance = await AsyncStorage.getItem('accountBalance');
        const savedRisk = await AsyncStorage.getItem('riskPercentage');
        const savedRiskAmount = await AsyncStorage.getItem('riskAmount');

        if (savedBalance !== null) {
          setAccountBalance(savedBalance);
        }
        if (savedRisk !== null) {
          setRiskPercentage(savedRisk);
        }
        if (savedRiskAmount) {
          setRiskAmount(savedRiskAmount);
        }
      } catch (error) {
        console.warn('Error loading data from storage:', error);
      }
    };
    loadUserInputs();
  }, []);

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
          setRiskAmount('');
          setStopLossPips('');
          setStopLossPrice('');
          setEntryPrice('');
          setPipValuePerLot('0');
          setUnits('0');
          setStandardLots('0');
          setNewstandardLots('0');
          setMiniLots('0');
          setMicroLots('0');
          setRrr('0');
          setXp('0');
          setTakeProfitPrice('');
          setTakeProfitPip('');
          setIsEntryPriceManuallyEdited(false);
          setQuoteToAccountRate('1');
          setTakeProfitPrice('');
          setTakeProfitPip('0');
          setRrr('0');
          setXp('0');

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
      // @ts-ignore
      singlePressTimer.current = setTimeout(() => {
        // Only clear form values (keep AsyncStorage)
        setStopLossPips('');
        setStopLossPrice('');
        setEntryPrice('');
        setPipValuePerLot('0');
        setUnits('0');
        setStandardLots('0');
        setNewstandardLots('0');
        setMiniLots('0');
        setMicroLots('0');
        setRrr('0');
        setXp('0');
        setTakeProfitPrice('');
        setTakeProfitPip('');
        setIsEntryPriceManuallyEdited(false);
        setQuoteToAccountRate('1');
        setTakeProfitPrice('');
        setTakeProfitPip('0');
        setRrr('0');
        setXp('0');

        if (Platform.OS === 'android') {
          ToastAndroid.show('Fields cleared (saved data preserved).', ToastAndroid.SHORT);
        } else {
          Alert.alert('Form Reset', 'Fields cleared (saved data preserved).');
        }
      }, DOUBLE_PRESS_DELAY);

      lastPress.current = now;
    }
  };

  const getUnitLabel = () => {
    if (!currencyPair) return 'Units';

    const pair = currencyPair.toUpperCase();

    // 🟨 Precious Metals (Gold, Silver, Palladium, Platinum)
    if (['XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'GCUSD', 'SIUSD', 'PAUSD', 'PLUSD'].includes(pair)) {
      return 'Ounce';
    }

    // 🟧 Energy Commodities (Brent Oil, Crude Oil, Natural Gas)
    if (['XBRUSD', 'BZUSD', 'CLUSD', 'XTIUSD', 'NGUSD', 'XNGUSD'].includes(pair)) {
      return 'Barrel';
    }

    const isNeededIndices = ['^DJI', '^SPX', '^AXJO', '^N225', '^FTSE', '^IBEX', '^HSI', '^XNDX', '^GDAXI', '^FCHI']
      .some(sym => currencyPair.startsWith(sym));

    // 🟥 Indices (contracts)
    if (isNeededIndices) {
      return 'Contract';
    }

    return 'Units'; // fallback
  };


  return (
    <SafeAreaProvider>
    <SafeAreaView className={`p-4 w-full h-full ${isDark ? 'bg-black-300' : 'bg-white'}`} >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        <View className=" mt-4">
          {/*<Image source={images.logo} className="w-full h-32" resizeMode="contain" />*/}
          <Text className="text-lg font-rubik-bold text-center mb-4 text-secondary-100 dark:text-white">FX Position Size Calculator</Text>
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
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Account Balance</Text>
            <EnhancedTextInput
              className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
              placeholder="Account Balance"
              placeholderTextColor="#374151"
              value={accountBalance}
              onChangeText={handleAccountBalanceChange}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row justify-between mb-1">
              <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Risk %</Text>
              {/* Only show when in Basic Mode */}
              {!isAdvancedMode && (
              <Text className={`text-sm font-rubik mb-1 mr-9 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                {riskAmount !== '0' ? `$${riskAmount}` : ''}
              </Text>
              )}
            </View>
              <EnhancedTextInput
                className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
                placeholder="Risk in %"
                placeholderTextColor="#374151"
                value={riskPercentage}
                onChangeText={handleRiskPercentageChange}
                onBlur={() => {
                  if (riskPercentage && !riskPercentage.includes('%')) {
                    setRiskPercentage(riskPercentage + '%');
                  }
                }}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              />
          </View>
        </View>

        {isAdvancedMode && (
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Risk Amount</Text>
            <TextInput
              className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
              placeholder="Risk Amount"
              placeholderTextColor="#374151"
              value={riskAmount}
              onChangeText={handleRiskAmountChange}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
          </View>

          <View className="flex-1">
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Stop Loss Pips</Text>
            <TextInput
              className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
              placeholder="Stop Loss Pips"
              placeholderTextColor="#374151"
              value={stopLossPips}
              onChangeText={handleStopLossPipsChange}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
          </View>
        </View>
        )}

        <View className="flex-row gap-4 mb-2">
          {/* Entry Price Input */}
          <View className="flex-1">
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Entry Price</Text>

            <View className="relative">
              <TextInput
                value={entryPrice}
                onChangeText={handleEntryPriceChange}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                placeholder="Auto-filled entry price"
                className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
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
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Stop Loss Price</Text>
            <EnhancedTextInput
              className={`p-4 border border-primary-100 rounded-md ${isDark ? 'text-white' : 'text-black'}`}
              placeholder="Stop Loss Price"
              placeholderTextColor="#374151"
              value={stopLossPrice}
              onChangeText={handleStopLossPriceChange}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
          </View>
        </View>

        <View className="items-center mt-3">
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

        <View className="mt-4 w-full bg-secondary-100 border border-white rounded-2xl overflow-hidden mb-2">

          {/* Units Row */}
          <View className="flex-row items-center justify-center border-b border-white px-4 py-3">
            <Text className="text-white font-rubik-bold mr-2">Standard Lots:</Text>
            <Text className="text-white font-rubik-bold text-lg">{standardLots} ({newstandardLots})</Text>
          </View>

          {/* 2x2 Table Grid */}
          <View className="border-t border-white">

            {/* Top Row: Standard Lots | Mini Lots */}
            <View className="flex-row border-b border-white">
              {/* Standard Lots */}
              <View className="w-1/2 border-r border-white px-4 py-3 flex-row items-center justify-between">
                <Text className="text-white font-rubik-medium">{getUnitLabel()}:</Text>
                <Text className="text-white font-rubik-medium">
                  {units ? parseFloat(units).toLocaleString() : '0'}
                </Text>
              </View>

              {/* Mini Lots */}
              <View className="w-1/2 px-4 py-3 flex-row items-center justify-between">
                <Text className="text-white font-rubik-medium">Mini Lots:</Text>
                <Text className="text-white font-rubik-medium">{miniLots}</Text>
              </View>
            </View>

            {/* Bottom Row: Micro Lots | Pip Value */}
            <View className="flex-row">
              {/* Micro Lots */}
              <View className="w-1/2 border-r border-white px-4 py-3 flex-row items-center justify-between">
                <Text className="text-white font-rubik-medium">Pip Value:</Text>
                <Text className="text-white font-rubik-medium">
                  {pipValuePerLot
                    ? `${getCurrencySymbol(accountCurrency)}${pipValuePerLot}`
                    : `${getCurrencySymbol(accountCurrency)}0`}
                </Text>
              </View>

              {/* Pip Value */}
              <View className="w-1/2 px-4 py-3 flex-row items-center justify-between">
                <Text className="text-white font-rubik-medium">Micro Lots:</Text>
                <Text className="text-white font-rubik-medium">{microLots}</Text>
              </View>
            </View>

          </View>
        </View>

        {showRiskRewardSection && (
          <View className="mt-3 w-full bg-black-200 border border-white rounded-2xl overflow-hidden mb-2">
            {/* 2x2 Table Grid with merged right column */}
            <View className="border-t border-white flex-row">
              {/* Left Column (Take Profit Inputs) */}
              <View className="w-1/2 border-r border-white">
                {/* Top Cell - Take Profit Price */}
                <View className="border-b border-white px-4 py-3 items-center justify-center">
                  <View className="w-full">
                    <TextInput
                      className="p-4 border border-accent-100 rounded-md text-white"
                      placeholder="Take Profit Price"
                      placeholderTextColor="#808080"
                      value={takeProfitPrice}
                      onChangeText={handleTakeProfitChange}
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                    />
                  </View>
                </View>

                {/* Bottom Cell - Take Profit Pips */}
                {isAdvancedMode && (
                <View className="px-4 py-3 items-center justify-center">
                  <View className="w-full">
                    <TextInput
                      className="p-4 border border-accent-100 rounded-md text-white"
                      placeholder="Take Profit Pips"
                      placeholderTextColor="#808080"
                      value={takeProfitPip}
                      onChangeText={handleTakeProfitPipsChange}
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                    />
                  </View>
                </View>
                )}
              </View>

              {/* Right Column (EP, Risk, RRR vertically stacked) */}
              <View className="w-1/2 px-4 py-3 justify-between">
                {/* EP */}
                <View className="flex-row items-center justify-between border-b border-white pb-3 mb-3">
                  <Text className="text-white font-rubik-medium">Profit:</Text>
                  <Text className="text-green-600 font-rubik-medium">{`≈${getCurrencySymbol(accountCurrency)}${xp}`}</Text>
                </View>

                {/* Risk */}
                <View className="flex-row items-center justify-between border-b border-white pb-3 mb-3">
                  <Text className="text-white font-rubik-medium">Risk:</Text>
                  <Text className="text-red-900 font-rubik-medium">
                    {riskAmount || '0'}
                  </Text>
                </View>

                {/* RRR */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-rubik-medium">R:R</Text>
                  <Text className="text-primary-300 font-rubik-medium">{`1 : ${rrr}`}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Forex;