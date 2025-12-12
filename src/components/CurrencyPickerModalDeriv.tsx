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
