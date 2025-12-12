import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    Modal,
    FlatList,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { ThemeContext } from './ThemeContext.tsx';

type CurrencyItem = { label: string; value: string };

type Props = {
    accountCurrency: string;
    setAccountCurrency: (val: string) => void;
};

export default function CurrencyPickerModal({ accountCurrency, setAccountCurrency }: Props) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
    const [modalVisible, setModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const currencyItems: CurrencyItem[] = [
        { label: 'USD', value: 'USD' },
        // { label: 'EUR', value: 'EUR' },
        // { label: 'GBP', value: 'GBP' },
        // { label: 'JPY', value: 'JPY' },
        // { label: 'CHF', value: 'CHF' },
        // { label: 'CAD', value: 'CAD' },
        // { label: 'AUD', value: 'AUD' },
        // { label: 'NZD', value: 'NZD' },
        // { label: 'CNY', value: 'CNY' },
        // { label: 'CNH', value: 'CNH' },
        // { label: 'CZK', value: 'CZK' },
        // { label: 'DKK', value: 'DKK' },
        // { label: 'HKD', value: 'HKD' },
        // { label: 'KRW', value: 'KRW' },
        // { label: 'KWD', value: 'KWD' },
        // { label: 'INR', value: 'INR' },
        // { label: 'MXN', value: 'MXN' },
        // { label: 'NOK', value: 'NOK' },
        // { label: 'PLN', value: 'PLN' },
        // { label: 'RUB', value: 'RUB' },
        // { label: 'SEK', value: 'SEK' },
        // { label: 'SGD', value: 'SGD' },
        // { label: 'TRY', value: 'TRY' },
        // { label: 'ZAR', value: 'ZAR' },
    ];

    const filteredItems = currencyItems.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (item: CurrencyItem) => {
        setAccountCurrency(item.value);
        setModalVisible(false);
        setSearchTerm('');
    };

    return (
        <View className="flex-1 justify-center">
            <Text className={`text-sm font-rubik mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Account Currency
            </Text>

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`border border-orange-500 p-4 rounded ${isDark ? 'bg-black-300' : 'bg-white'}`}
            >
                <Text className={` ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {accountCurrency || 'Select currency'}
                </Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center">
                    <View className={`w-11/12  p-4 rounded-xl max-h-[80%] ${isDark ? 'bg-black-300' : 'bg-white'}`}>

                        {/* Search bar */}
                        <TextInput
                            className={`border border-gray-300 rounded px-3 py-2 mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                            placeholder="Search currency"
                            placeholderTextColor="#374151"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />

                        {/* Currency List */}
                      <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item.value}
                        numColumns={3}                          // 👈 enables grid
                        columnWrapperStyle={{ gap: 10 }}        // 👈 spacing between columns
                        contentContainerStyle={{ gap: 10 }}     // 👈 spacing between rows
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => handleSelect(item)}
                            className="
                                flex-1
                                items-center
                                justify-center
                                py-3
                                rounded-lg
                                bg-gray-100
                                dark:bg-black-200
                            "
                            style={{ minHeight: 65 }}        // ensures consistent grid box height
                          >
                            <Text className="text-gray-800 dark:text-white font-semibold">
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        )}
                        style={{ maxHeight: 300 }}
                      />

                      {/* Close button */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="mt-4 self-center"
                        >
                            <Text className="text-red-500 font-bold mb-3">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
