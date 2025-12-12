import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Modal,
    FlatList,
    TouchableOpacity,
    TextInput, ScrollView, Keyboard,
    TouchableWithoutFeedback,
    Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { ThemeContext } from './ThemeContext.tsx';

type Props = {
    currencyPair: string;
    setCurrencyPair: (value: string) => void;
    fetchExchangeRate: (pair: string) => void;
};

type CurrencyItem = {
    label: string;
    value: string;
    description?: string;
    category?: string; // Add category to track which tab the item belongs to
};

export default function CustomCurrencyPicker({ currencyPair, setCurrencyPair, fetchExchangeRate }: Props) {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'All' | 'Forex' | 'Crypto' | 'Commodities' | 'Indices'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);

    const handleSelect = (item: CurrencyItem) => {
        setCurrencyPair(item.value);
        fetchExchangeRate(item.value);
        setModalVisible(false);
        setSearchTerm('');
    };

    const toggleFavorite = async (value: string) => {
        let updatedFavorites;
        if (favorites.includes(value)) {
            updatedFavorites = favorites.filter(fav => fav !== value);
        } else {
            updatedFavorites = [...favorites, value];
        }
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem('favoritePairs', JSON.stringify(updatedFavorites));
    };

    const loadFavorites = async () => {
        const stored = await AsyncStorage.getItem('favoritePairs');
        if (stored) setFavorites(JSON.parse(stored));
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    const forexPairs: CurrencyItem[] = [
        { label: 'EURUSD', value: 'EURUSD', description: 'Euro/United States Dollar' },
        { label: 'USDJPY', value: 'USDJPY', description: 'United States Dollar/Japanese Yen' },
        { label: 'GBPUSD', value: 'GBPUSD', description: 'Great British Pound/United States Dollar' },
        { label: 'USDCHF', value: 'USDCHF', description: 'United States Dollar/Swiss Franc' },
        { label: 'USDCAD', value: 'USDCAD', description: 'United States Dollar/Canadian Dollar' },
        { label: 'AUDUSD', value: 'AUDUSD', description: 'Australian Dollar/United States Dollar' },
        { label: 'EURGBP', value: 'EURGBP', description: 'Euro/Great British Pound' },
        { label: 'NZDUSD', value: 'NZDUSD', description: 'New Zealand Dollar/United States Dollar' },
        { label: 'AUDCAD', value: 'AUDCAD', description: 'Australian Dollar/Canadian Dollar' },
        { label: 'AUDCHF', value: 'AUDCHF', description: 'Australian Dollar/Swiss Franc' },
        { label: 'AUDJPY', value: 'AUDJPY', description: 'Australian Dollar/Japanese Yen' },
        { label: 'AUDNZD', value: 'AUDNZD', description: 'Australian Dollar/New Zealand Dollar' },
        { label: 'CADCHF', value: 'CADCHF', description: 'Canadian Dollar/Swiss Franc' },
        { label: 'CADJPY', value: 'CADJPY', description: 'Canadian Dollar/Japanese Yen' },
        { label: 'CHFJPY', value: 'CHFJPY', description: 'Swiss Franc/Japanese Yen' },
        { label: 'EURCAD', value: 'EURCAD', description: 'Euro/Canadian Dollar' },
        { label: 'EURCHF', value: 'EURCHF', description: 'Euro/Swiss Franc' },
        { label: 'AUDSGD', value: 'AUDSGD', description: 'Australian Dollar/Singapore Dollar' },
        { label: 'AUDTRY', value: 'AUDTRY', description: 'Australian Dollar/Turkish Lira' },
        { label: 'CADSGD', value: 'CADSGD', description: 'Canadian Dollar/Singapore Dollar' },
        { label: 'CHFSGD', value: 'CHFSGD', description: 'Swiss Franc/Singapore Dollar' },
        { label: 'GBPCHF', value: 'GBPCHF', description: 'Great British Pound/Swiss Franc' },
        { label: 'EURCZK', value: 'EURCZK', description: 'Euro/Czech Koruna' },
        { label: 'EURDKK', value: 'EURDKK', description: 'Euro/Danish Krone' },
        { label: 'EURHKD', value: 'EURHKD', description: 'Euro/Hong Kong Dollar' },
        { label: 'EURHUF', value: 'EURHUF', description: 'Euro/Hungarian Forint' },
        { label: 'EURMXN', value: 'EURMXN', description: 'Euro/Mexican Peso' },
        { label: 'EURNOK', value: 'EURNOK', description: 'Euro/Norwegian Krone' },
        { label: 'EURPLN', value: 'EURPLN', description: 'Euro/Polish Złoty' },
        { label: 'EURRUB', value: 'EURRUB', description: 'Euro/Russian Ruble' },
        { label: 'EURSEK', value: 'EURSEK', description: 'Euro/Swedish Krona' },
        { label: 'EURSGD', value: 'EURSGD', description: 'Euro/Singapore Dollar' },
        { label: 'EURTRY', value: 'EURTRY', description: 'Euro/Turkish Lira' },
        { label: 'EURZAR', value: 'EURZAR', description: 'Euro/South African Rand' },
        { label: 'GBPBGN', value: 'GBPBGN', description: 'Great British Pound/Bulgarian Lev' },
        { label: 'GBPDKK', value: 'GBPDKK', description: 'Great British Pound/Danish Krone' },
        { label: 'GBPHKD', value: 'GBPHKD', description: 'Great British Pound/Hong Kong Dollar' },
        { label: 'EURJPY', value: 'EURJPY', description: 'Euro/Japanese Yen' },
        { label: 'GBPJPY', value: 'GBPJPY', description: 'Great British Pound/Japanese Yen' },
        { label: 'EURAUD', value: 'EURAUD', description: 'Euro/Australian Dollar' },
        { label: 'GBPAUD', value: 'GBPAUD', description: 'Great British Pound/Australian Dollar' },
        { label: 'GBPCAD', value: 'GBPCAD', description: 'Great British Pound/Canadian Dollar' },
        { label: 'NZDJPY', value: 'NZDJPY', description: 'New Zealand Dollar/Japanese Yen' },
        { label: 'NZDCAD', value: 'NZDCAD', description: 'New Zealand Dollar/Canadian Dollar' },
        { label: 'NZDCHF', value: 'NZDCHF', description: 'New Zealand Dollar/Swiss Franc' },
        { label: 'EURNZD', value: 'EURNZD', description: 'Euro/New Zealand Dollar' },
        { label: 'GBPNZD', value: 'GBPNZD', description: 'Great British Pound/New Zealand Dollar' },
        { label: 'USDTRY', value: 'USDTRY', description: 'United States Dollar/Turkish Lira' },
        { label: 'USDZAR', value: 'USDZAR', description: 'United States Dollar/South African Rand' },
        { label: 'USDMXN', value: 'USDMXN', description: 'United States Dollar/Mexican Peso' },
        { label: 'USDSEK', value: 'USDSEK', description: 'United States Dollar/Swedish Krona' },
        { label: 'USDNOK', value: 'USDNOK', description: 'United States Dollar/Norwegian Krone' },
        { label: 'USDDKK', value: 'USDDKK', description: 'United States Dollar/Danish Krone' },
        { label: 'USDSGD', value: 'USDSGD', description: 'United States Dollar/Singapore Dollar' },
        { label: 'USDHKD', value: 'USDHKD', description: 'United States Dollar/Hong Kong Dollar' },
        { label: 'USDCZK', value: 'USDCZK', description: 'United States Dollar/Czech Koruna' },
        { label: 'USDHUF', value: 'USDHUF', description: 'United States Dollar/Hungarian Forint' },
        { label: 'USDPLN', value: 'USDPLN', description: 'United States Dollar/Polish Złoty' },
        { label: 'USDRUB', value: 'USDRUB', description: 'United States Dollar/Russian Ruble' },
        { label: 'USDINR', value: 'USDINR', description: 'United States Dollar/Indian Rupee' },
        { label: 'USDBRL', value: 'USDBRL', description: 'United States Dollar/Brazilian Real' },
        { label: 'USDCNH', value: 'USDCNH', description: 'United States Dollar/Chinese Yuan Offshore' },
        { label: 'USDTHB', value: 'USDTHB', description: 'United States Dollar/Thai Baht' },
        { label: 'JPYZAR', value: 'JPYZAR', description: 'Japanese Yen/South African Rand' },
        { label: 'GBPZAR', value: 'GBPZAR', description: 'Great British Pound/South African Rand' },
        { label: 'AUDZAR', value: 'AUDZAR', description: 'Australian Dollar/South African Rand' },
    ];

    const cryptoPairs: CurrencyItem[] = [
        { label: 'BTCUSD', value: 'BTCBUSD', description: 'Bitcoin/United States Dollar' },
        { label: 'ETHUSD', value: 'ETHUSD', description: 'Ethereum/United States Dollar' },
        { label: 'XRPUSD', value: 'XRPUSD', description: 'RIPPLE/United States Dollar' },
        { label: 'SOLUSD', value: 'SOLUSD', description: 'Solana/United States Dollar' },
        { label: 'BNBUSD', value: 'BNBUSD', description: 'Binance Coin/United States Dollar' },
        { label: 'DOGEUSD', value: 'DOGEUSD', description: 'Doge/United States Dollar' },
    ];

    const commoditiesPairs: CurrencyItem[] = [
        {
            label: "XPTUSD",
            value: "PLUSD",
            description: "Platinum / US Dollar"
        },
        {
            label: "XAUUSD",
            value: "GCUSD",
            description: "Gold / US Dollar"
        },
        {
            label: "XAGUSD",
            value: "SIUSD",
            description: "Silver / US Dollar"
        },
        {
            label: "XNGUSD",
            value: "NGUSD",
            description: "Natural Gas / US Dollar"
        },
        {
            label: "XTIUSD",
            value: "CLUSD",
            description: "Crude Oil / US Dollar"
        },
        {
            label: "XPDUSD",
            value: "PAUSD",
            description: "Palladium / US Dollar"
        },
        {
            label: "XBRUSD",
            value: "BZUSD",
            description: "Brent Oil / USD Dollar "
        },
    ];

    // const indicesPairs: CurrencyItem[] = [
    //     {
    //         label: 'US30',
    //         value: '^DJI',
    //         description: "Dow Jones Industrial Average"
    //     },
    //     {
    //         label: 'SP500',
    //         value: '^SPX',
    //         description: "S&P 500 Index"
    //     },
    //     {
    //         label: 'AUS200',
    //         value: '^AXJO',
    //         description: "S&P/ASX 200 Index"
    //     },
    //     {
    //         label: 'JP225',
    //         value: '^N225',
    //         description: "Neikkei 225 Index"
    //     },
    //     {
    //         label: 'UK100',
    //         value: '^FTSE',
    //         description: "FTSE 100 Index"
    //     },
    //     {
    //         label: 'IBEX35',
    //         value: '^IBEX',
    //         description: " IBEX 35 Index"
    //     },
    //     {
    //         label: 'HSI50',
    //         value: '^HSI',
    //         description: "Hang Seng Index"
    //     },
    //     {
    //         label: 'NAS100',
    //         value: '^XNDX',
    //         description: "NASDAQ 100 Index"
    //     },
    //     {
    //         label: 'GDAXI',
    //         value: '^GDAXI',
    //         description: "Dax 30 Index"
    //     },
    //     {
    //         label: 'FCHI40',
    //         value: '^FCHI',
    //         description: "CAC 40 Index"
    //     },
    // ];

    // Combined data with category tags
    const allData = {
        'Forex': forexPairs,
        'Crypto': cryptoPairs,
        'Commodities': commoditiesPairs,
        // 'Indices': indicesPairs
    };

    // Helper function to get display label for selected currency pair
    const getDisplayLabel = (value: string): string => {
        // Search through all categories to find the matching item
        for (const [, items] of Object.entries(allData)) {
            const foundItem = items.find(item => item.value === value);
            if (foundItem) {
                return foundItem.label;
            }
        }
        return value; // fallback to value if not found
    };

<<<<<<< HEAD
  const getActivePairs = (): CurrencyItem[] => {
    switch (activeTab) {
      case 'All':
        return Object.entries(allData).flatMap(([category, items]) =>
          items.map(item => ({ ...item, category }))
        );
      case 'Forex':
        return forexPairs;
      case 'Crypto':
        return cryptoPairs;
      case 'Commodities':
        return commoditiesPairs;
      case 'Indices':
        return indicesPairs;
      default:
        return [];
    }
  };
=======
    const getActivePairs = (): CurrencyItem[] => {
        switch (activeTab) {
            case 'Forex':
                return forexPairs;
            case 'Crypto':
                return cryptoPairs;
            case 'Commodities':
                return commoditiesPairs;
            // case 'Indices':
            //     return indicesPairs;
             default:
                return [];
        }
    };
>>>>>>> parent of 4973ed4 (Latest October)

    // Updated filtering logic to search across all tabs
    const getFilteredItems = (): CurrencyItem[] => {
        if (!searchTerm.trim()) {
            // If no search term, return items from active tab only
            return getActivePairs();
        } else {
            // If there's a search term, search across ALL tabs
            const allItems = Object.entries(allData).flatMap(([category, items]) =>
                items.map(item => ({ ...item, category }))
            );

            return allItems.filter(item =>
                item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
    };


  const filteredItems = getFilteredItems()
        .sort((a, b) => (favorites.includes(b.value) ? 1 : 0) - (favorites.includes(a.value) ? 1 : 0));

    return (
        <View className="flex-1 justify-center">
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Instrument</Text>

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`border border-orange-500 p-4 rounded ${isDark ? 'bg-black-300' : 'bg-white'}`}
            >
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {currencyPair ? getDisplayLabel(currencyPair) : 'Select Pair'}
                </Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View className="flex-1 bg-black/60 justify-center items-center">
                        <View className={`w-11/12  p-4 rounded-xl max-h-[80%] ${isDark ? 'bg-black-300' : 'bg-white'}`}>
                            {/* Tabs */}
                            <View className="flex-row justify-around mb-4">
<<<<<<< HEAD
                                <ScrollView horizontal showsHorizontalScrollIndicator={true} className="mb-4">
                                    {['All',
                                      'Forex',
=======
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                    {['Forex',
>>>>>>> parent of 4973ed4 (Latest October)
                                      'Crypto',
                                      'Commodities',
                                      // 'Indices'
                                    ].map(tab => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => setActiveTab(tab as any)}
                                            className="mr-14"
                                        >
                                            <Text className={`text-lg font-bold ${activeTab === tab ? 'text-orange-500' : 'text-gray-500'}`}>
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Search */}
                            <TextInput
                                className={`border border-gray-300 rounded px-3 py-2 mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                                placeholder="Search pairs"
                                placeholderTextColor="#374151"
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />

                            {/* Filtered List */}
                            <FlatList
                                data={filteredItems}
                                keyboardShouldPersistTaps="handled"
                                keyExtractor={(item) => `${item.category || activeTab}-${item.value}`}
                                renderItem={({ item }) => (
                                    <Pressable
                                        className="flex-row justify-between items-center py-3 px-2 border-b border-gray-100"
                                        onPress={() => {
                                            handleSelect(item);
                                            setTimeout(() => {
                                                Keyboard.dismiss();
                                            }, 100);
                                        }}
                                    >
                                        <View>
                                            <Text className={`text-base ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                                {item.label}
                                            </Text>
                                            {item.description && (
                                                <Text className={`text-sm ${isDark ? 'text-white' : 'text-gray-400'}`}>
                                                    {item.description}
                                                </Text>
                                            )}
                                            {searchTerm.trim() && item.category && (
                                                <Text className="text-xs text-orange-500 mt-1 font-medium">
                                                    {item.category}
                                                </Text>
                                            )}
                                        </View>

                                        <Pressable
                                            onPress={(e) => {
                                                e.stopPropagation?.();
                                                toggleFavorite(item.value);
                                            }}
                                        >
                                            <FontAwesome6
                                                name={favorites.includes(item.value) ? 'star' : 'star'}
                                                size={20}
                                                iconStyle={favorites.includes(item.value) ? 'solid' : 'regular'}
                                                color={favorites.includes(item.value) ? '#facc15' : '#9ca3af'}
                                            />
                                        </Pressable>
                                    </Pressable>
                                )}
                                style={{ maxHeight: 300 }}
                            />

                            {/* Close */}
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="mt-4 self-center"
                            >
                                <Text className="text-red-500 font-bold mb-3">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}