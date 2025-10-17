// src/components/RatingModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface RatingModalProps {
  visible: boolean;
  onRateNow: () => void;
  onLater: () => void;
  onNever: () => void;
  appName?: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
                                                          visible,
                                                          onRateNow,
                                                          onLater,
                                                          onNever,
                                                          appName = "our app"
                                                        }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white dark:bg-primary-100 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-2xl mb-2">⭐</Text>
            <Text className="text-xl font-bold text-gray-800 dark:text-white text-center">
              Enjoying {appName}?
            </Text>
          </View>

          {/* Message */}
          <Text className="text-gray-600 dark:text-white font-rubik-medium text-center mb-6 leading-6">
            Your feedback helps us improve and reach more users. Would you mind rating us on the app store?
          </Text>

          {/* Buttons */}
          <View className="space-y-3">
            {/* Rate Now Button */}
            <TouchableOpacity
              onPress={onRateNow}
              className="bg-blue-500 py-3 px-6 rounded-xl mb-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center text-lg">
                Rate Now ⭐
              </Text>
            </TouchableOpacity>

            {/* Later Button */}
            <TouchableOpacity
              onPress={onLater}
              className="bg-gray-100 dark:bg-gray-700 py-3 px-6 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-center">
                Maybe Later
              </Text>
            </TouchableOpacity>

            {/* Never Button */}
            <TouchableOpacity
              onPress={onNever}
              activeOpacity={0.8}
            >
              <Text className="text-gray-400 dark:text-white mt-5 text-center text-sm py-2">
                Don't ask again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};