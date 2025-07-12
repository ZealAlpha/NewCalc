import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    FlatList,
    TextInput,
    TouchableOpacity,
} from 'react-native';

type CurrencyItem = { label: string; value: string };

type Props = {
    accountCurrency: string;
    setAccountCurrency: (val: string) => void;
};

export default function CurrencyPickerModal({ accountCurrency, setAccountCurrency }: Props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const currencyItems: CurrencyItem[] = [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'JPY', value: 'JPY' },
        { label: 'CHF', value: 'CHF' },
        { label: 'CAD', value: 'CAD' },
        { label: 'AUD', value: 'AUD' },
        { label: 'NZD', value: 'NZD' },
        { label: 'CNY', value: 'CNY' },
        { label: 'CNH', value: 'CNH' },
        { label: 'CZK', value: 'CZK' },
        { label: 'DKK', value: 'DKK' },
        { label: 'HKD', value: 'HKD' },
        { label: 'KRW', value: 'KRW' },
        { label: 'KWD', value: 'KWD' },
        { label: 'INR', value: 'INR' },
        { label: 'MXN', value: 'MXN' },
        { label: 'NOK', value: 'NOK' },
        { label: 'PLN', value: 'PLN' },
        { label: 'RUB', value: 'RUB' },
        { label: 'SEK', value: 'SEK' },
        { label: 'SGD', value: 'SGD' },
        { label: 'TRY', value: 'TRY' },
        { label: 'ZAR', value: 'ZAR' },
    ];

    const filteredItems = currencyItems.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (item: CurrencyItem) => {
        setAccountCurrency(item.value);
        setModalVisible(false);
    };

    return (
        <View className="flex-1 justify-center">
            <Text className="text-sm font-rubik text-gray-700 dark:text-white mb-1">
                Account Currency
            </Text>

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="border border-orange-500 p-4 rounded bg-white dark:bg-black-300"
            >
                <Text className="text-gray-800 dark:text-white">
                    {accountCurrency || 'Select currency'}
                </Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center">
                    <View className="w-11/12 bg-white dark:bg-black-300 p-4 rounded-xl max-h-[80%]">

                        {/* Search bar */}
                        <TextInput
                            className="border border-gray-300 rounded px-3 py-2 mb-4 dark:text-white"
                            placeholder="Search currency"
                            placeholderTextColor="#374151"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />

                        {/* Currency List */}
                        <FlatList
                            data={filteredItems}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="py-2 border-b border-gray-100"
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text className="text-base text-gray-700 dark:text-white">{item.label}</Text>
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
