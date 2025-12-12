import {View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import images from "../constants/images";
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';

const Index = () => {
  const navigation = useNavigation();

  return (
        <SafeAreaView className="w-full h-full bg-primary-100">
            <View className="mb-9 mt-14">
                <Image source={images.logo} className="w-full h-32" resizeMode="contain" />
                <Text className="text-lg font-rubik-bold text-center text-white">FX Crypto Calculator</Text>
            </View>

            <View className="flex-1 justify-center items-center">
                {/* Forex Button */}
                <Pressable
                  // Help me Push this one to the Forex page
                  onPress={() => navigation.navigate('Layout', { screen: 'Forex' })}
                  className="bg-white px-6 py-4 rounded-2xl w-3/4 items-center mb-4"
                >
                    <View className="flex-row items-center">
                        <FontAwesome6 name="chart-line" iconStyle="solid" size={22} color="#0B6623" />
                        <Text className="ml-2 text-secondary-100 text-lg font-rubik-bold">Forex P.S Calculator</Text>
                    </View>
                </Pressable>


                {/* Crypto Button */}
                <Pressable
                  // Help me Push this one to the Crypto page
                  onPress={() => navigation.navigate('Layout', { screen: 'Crypto' })}
                    className="bg-secondary-100 px-6 py-4 rounded-2xl w-3/4 items-center mb-4"
                >
                    <View className="flex-row items-center">
                        <FontAwesome6 name="bitcoin" iconStyle="brand" size={22} color="#ffffff" />
                        <Text className="ml-2 text-white text-lg font-rubik-bold">Crypto P.S Calculator</Text>
                    </View>
                </Pressable>

              {/* Deriv Button */}
              <Pressable
                // Help me Push this one to the Deriv page
                onPress={() => navigation.navigate('Layout', { screen: 'Deriv' })}
                className="bg-red-600 px-6 py-4 rounded-2xl w-3/4 items-center"
              >
                <View className="flex-row items-center">
                    <FontAwesome6 name="chart-line" iconStyle="solid" size={22} color="#ffffff" />
                    <Text className="ml-2 text-white text-lg font-rubik-bold">Deriv S.I Calculator</Text>
                </View>
              </Pressable>
            </View>
        </SafeAreaView>
    )
}
export default Index
