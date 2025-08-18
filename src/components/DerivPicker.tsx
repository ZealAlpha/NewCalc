import React, { useState, useEffect } from 'react';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'Volatility' | 'Boom & Crash' | 'Jump Indices' | 'Step Index' | 'Hybrid Indices' | 'Others'>('Volatility');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleSelect = (item: CurrencyItem) => {
    setCurrencyPair(item.value);
    fetchExchangeRate(item.value);
    setModalVisible(false);
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

  const volatilityPairs = [
    { label: 'Volatility 10 Index', value: 'R_10' },
    { label: 'Volatility 25 Index', value: 'R_25' },
    { label: 'Volatility 50 Index', value: 'R_50' },
    { label: 'Volatility 75 Index', value: 'R_75' },
    { label: 'Volatility 100 Index', value: 'R_100' },
    { label: 'Volatility 10 (1s) Index', value: 'RDB10' },
    { label: 'Volatility 15 (1s) Index', value: 'RDB15' },
    { label: 'Volatility 25 (1s) Index', value: 'RDB25' },
    { label: 'Volatility 30 (1s) Index', value: 'RDB30' },
    { label: 'Volatility 50 (1s) Index', value: 'RDB50' },
    { label: 'Volatility 75 (1s) Index', value: 'RDB75' },
    { label: 'Volatility 90 (1s) Index', value: 'RDB90' },
    { label: 'Volatility 100 (1s) Index', value: 'RDB100' },
    { label: 'Volatility 150 (1s) Index', value: 'RDB150' },
    { label: 'Volatility 250 (1s) Index', value: 'RDB250' },
  ];

  const boomPairs = [
    { label: 'Boom 1000 Index', value: 'BOOM1000' },
    { label: 'Crash 1000 Index', value: 'CRASH1000' },
    { label: 'Boom 500 Index', value: 'BOOM500' },
    { label: 'Crash 500 Index', value: 'CRASH500' },
    { label: 'Boom 300 Index', value: 'BOOM300' },
    { label: 'Crash 300 Index', value: 'CRASH300' },
    { label: 'Boom 600 Index', value: 'BOOM600' },
    { label: 'Crash 600 Index', value: 'CRASH600' },
    { label: 'Boom 900 Index', value: 'BOOM900' },
    { label: 'Crash 900 Index', value: 'CRASH900' },
  ];

  const jumpPairs = [
    { label: 'Jump 10 Index', value: 'JD10' },
    { label: 'Jump 25 Index', value: 'JD25' },
    { label: 'Jump 50 Index', value: 'JD50' },
    { label: 'Jump 75 Index', value: 'JD75' },
    { label: 'Jump 100 Index', value: 'JD100' },
  ];

  const stepIndexPairs = [
    { label: "Step Index", value: "STEP" },
    { label: "Step Index 200", value: "STEP200" },
    { label: "Step Index 300", value: "STEP300" },
    { label: "Step Index 400", value: "STEP400" },
    { label: "Step Index 500", value: "STEP500" },
    { label: "Skew Step Index 4 Down", value: "SKSD4" },
    { label: "Skew Step Index 4 Up", value: "SKSU4" },
    { label: "Skew Step Index 5 Down", value: "SKSD5" },
    { label: "Skew Step Index 5 Up", value: "SKSU5" },
    { label: "Multi Step 2 index", value: "MS2" },
    { label: "Multi Step 3 index", value: "MS3" },
    { label: "Multi Step 4 index", value: "MS4" },
  ];

  const hybridPairs = [
    { label: 'VOL Over Crash 400', value: 'VOLOVC400' },
    { label: 'VOL Over Crash 750', value: 'VOLOVC750' },
    { label: 'VOL Over Crash 550', value: 'VOLOVC550' },
    { label: 'VOL Over Boom 400', value: 'VOLOVB400' },
    { label: 'VOL Over Boom 750', value: 'VOLOVB750' },
    { label: 'VOL Over Boom 550', value: 'VOLOVB550' },
  ];

  const otherPairs = [
    { label: 'Range Break 100 Index', value: 'RB100' },
    { label: 'Range Break 200 Index', value: 'RB200' },
    { label: 'Trek Up Index', value: 'TRKUP' },
    { label: 'Trek Down Index', value: 'TRKDWN' },
    { label: 'DEX 600 Up', value: 'DX600UP' },
    { label: 'DEX 600 Down', value: 'DX600DOWN' },
    { label: 'DEX 900 Up', value: 'DX900UP' },
    { label: 'DEX 900 Down', value: 'DX900DOWN' },
    { label: 'DEX1500 UP', value: 'DX1500UP' },
    { label: 'DEX1500 DOWN', value: 'DX1500DOWN' },
    { label: 'Drift Switch Index 10', value: 'DSWITCH10' },
    { label: 'Drift Switch Index 20', value: 'DSWITCH20' },
    { label: 'Drift Switch Index 30', value: 'DSWITCH30' },
    { label: 'EUR Basket', value: 'BAEUR' },
    { label: 'GBP Basket', value: 'BAGBP' },
    { label: 'AUD Basket', value: 'BAAUD' },
    { label: 'USD Basket', value: 'BAUSD' },
    { label: 'Gold Basket', value: 'BAGOLD' },
  ];

  // Combined data with category tags
  const allData = {
    'Volatility': volatilityPairs,
    'Boom & Crash': boomPairs,
    'Jump Indices': jumpPairs,
    'Step Index': stepIndexPairs,
    'Hybrid Indices': hybridPairs,
    'Others': otherPairs
  };

  // Helper function to get display label for selected currency pair
  const getDisplayLabel = (value: string): string => {
    // Search through all categories to find the matching item
    for (const [category, items] of Object.entries(allData)) {
      const foundItem = items.find(item => item.value === value);
      if (foundItem) {
        return foundItem.label;
      }
    }
    return value; // fallback to value if not found
  };

  const getActivePairs = (): CurrencyItem[] => {
    switch (activeTab) {
      case 'Volatility':
        return volatilityPairs;
      case 'Boom & Crash':
        return boomPairs;
      case 'Jump Indices':
        return jumpPairs;
      case 'Step Index':
        return stepIndexPairs;
        case 'Hybrid Indices':
          return hybridPairs;
          case 'Others':
            return otherPairs
      default:
        return [];
    }
  };

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
        item.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };


  const filteredItems = getFilteredItems()
    .sort((a, b) => (favorites.includes(b.value) ? 1 : 0) - (favorites.includes(a.value) ? 1 : 0));

  return (
    <View className="flex-1 justify-center">
      <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">Instrument</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="border border-orange-500 p-4 rounded bg-white dark:bg-black-300"
      >
        <Text className="text-gray-800 dark:text-white">
          {currencyPair ? getDisplayLabel(currencyPair) : 'Select Pair'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1 bg-black/60 justify-center items-center">
            <View className="w-11/12 bg-white dark:bg-black-300 p-4 rounded-xl max-h-[80%]">
              {/* Tabs */}
              <View className="flex-row justify-around mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  {['Volatility',
                    'Boom & Crash',
                    'Jump Indices',
                    'Step Index',
                    'Hybrid Indices',
                    'Others'
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
                className="border border-gray-300 rounded px-3 py-2 mb-4 dark:text-white"
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
                      <Text className="text-base text-gray-700 dark:text-white">
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
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