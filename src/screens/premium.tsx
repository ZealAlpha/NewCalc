import {View, Text, Pressable, TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import {SafeAreaView} from "react-native-safe-area-context";

const Premium = () => {

    const [selected, setSelected] = useState("monthly");

    const packages = [
        { id: "monthly", label: "$1/Month" },
        { id: "yearly", label: "$10/Yearly" },
        { id: "lifetime", label: "$40 Lifetime Access" },
    ];

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-black-300">
            <Text className="text-black dark:text-white text-3xl mb-6 font-rubik-medium">
                Get Premium
            </Text>
            <View className="mb-6 space-y-1">
                <Text className="text-secondary-100 dark:text-white font-rubik text-xl">✓ Remove Ads</Text>
                <Text className="text-sm text-secondary-100 dark:text-white font-rubik text-xl">✓ Custom Price</Text>
                <Text className="text-sm text-secondary-100 dark:text-white font-rubik text-xl">✓ Faster Experience</Text>
            </View>

            <View className="space-y-4 w-full px-4">
                {packages.map((pkg) => (
                    <Pressable
                        key={pkg.id}
                        onPress={() => setSelected(pkg.id)}
                        className={`flex-row h-32 w-full border rounded-2xl items-center justify-between mb-4 p-4 ${
                            selected === pkg.id
                                ? "bg-white border-primary"
                                : "bg-secondary-100 border-white"
                        }`}
                    >
                        <Text
                            className={`font-rubik-medium text-lg ${
                                selected === pkg.id ? "text-black" : "text-white"
                            }`}
                        >
                            {pkg.label}
                        </Text>
                        {/* Radio circle */}
                        <View
                            className={`w-6 h-6 rounded-full border-2 ${
                                selected === pkg.id ? "border-primary bg-primary" : "border-white"
                            } items-center justify-center`}
                        >
                            {selected === pkg.id && (
                                <View className="w-2.5 h-2.5 rounded-full bg-primary-100" />
                            )}
                        </View>
                    </Pressable>
                ))}
            </View>
            <View className="items-center mt-5">
                <View className="flex-row items-center space-x-3">
                    <TouchableOpacity
                        // onPress={}
                        className="bg-primary-100 px-6 shadow-md shadow-zinc-300 rounded-full py-4 mr-3"
                    >
                        <Text className="text-lg text-center font-rubik-medium text-white ml-2">Purchase</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>

    )
}
export default Premium
