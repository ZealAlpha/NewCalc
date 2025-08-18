import {View, Text, Pressable, TouchableOpacity, Alert} from 'react-native'
import React, { useState, useEffect } from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
// import Purchases from 'react-native-purchases';

const Premium = () => {
  const [selected, setSelected] = useState("monthly");
  // const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [customerInfo, setCustomerInfo] = useState(null);

  // Map your package IDs to RevenueCat product identifiers
  // const packageMapping = {
  //   monthly: 'monthly_premium',
  //   yearly: 'yearly_premium',
  //   lifetime: 'lifetime_premium'
  // };

  const packages = [
    { id: "monthly", label: "$2.95/Month" },
    { id: "yearly", label: "$19/Yearly" },
    { id: "lifetime", label: "$98 Lifetime Access" },
  ];

  // useEffect(() => {
  //   initializeRevenueCat();
  // }, []);

  // const initializeRevenueCat = async () => {
  //   try {
  //     // Configure RevenueCat
  //     await Purchases.configure({
  //       apiKey: 'YOUR_REVENUECAT_API_KEY', // Replace with your actual API key
  //       appUserID: null, // Optional: set a custom user ID
  //     });
  //
  //     // Get current customer info
  //     const customerInfo = await Purchases.getCustomerInfo();
  //     setCustomerInfo(customerInfo);
  //
  //     // Get available offerings
  //     const offerings = await Purchases.getOfferings();
  //     setOfferings(offerings);
  //
  //     console.log('Available offerings:', offerings);
  //   } catch (error) {
  //     console.error('Error initializing RevenueCat:', error);
  //   }
  // };

  // const handlePurchase = async () => {
  //   if (!offerings) {
  //     Alert.alert('Error', 'Products not loaded yet. Please try again.');
  //     return;
  //   }
  //
  //   setLoading(true);
  //
  //   try {
  //     // Get the selected package from offerings
  //     const currentOffering = offerings.current;
  //     if (!currentOffering) {
  //       throw new Error('No current offering available');
  //     }
  //
  //     // Find the package based on selected ID
  //     const selectedPackageId = packageMapping[selected];
  //     const packageToPurchase = currentOffering.availablePackages.find(
  //       pkg => pkg.product.identifier === selectedPackageId
  //     );
  //
  //     if (!packageToPurchase) {
  //       throw new Error(`Package ${selectedPackageId} not found in offerings`);
  //     }
  //
  //     // Make the purchase
  //     const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
  //
  //     if (purchaseResult.customerInfo.entitlements.active['premium']) {
  //       // User now has premium access
  //       Alert.alert(
  //         'Success!',
  //         'Welcome to Premium! Your purchase was successful.',
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => {
  //               // Navigate back or update UI
  //               console.log('Premium activated!');
  //             }
  //           }
  //         ]
  //       );
  //     }
  //   } catch (error) {
  //     if (error.code === 'PURCHASE_CANCELLED') {
  //       // User cancelled purchase
  //       console.log('Purchase cancelled');
  //     } else {
  //       // Other error occurred
  //       console.error('Purchase error:', error);
  //       Alert.alert('Error', 'Purchase failed. Please try again.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const restorePurchases = async () => {
  //   try {
  //     setLoading(true);
  //     const customerInfo = await Purchases.restorePurchases();
  //     setCustomerInfo(customerInfo);
  //
  //     if (customerInfo.entitlements.active['premium']) {
  //       Alert.alert('Success', 'Premium access restored!');
  //     } else {
  //       Alert.alert('No Purchases', 'No previous purchases found to restore.');
  //     }
  //   } catch (error) {
  //     console.error('Restore error:', error);
  //     Alert.alert('Error', 'Failed to restore purchases.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // // Check if user already has premium
  // const hasPremium = customerInfo?.entitlements.active['premium'];
  //
  // if (hasPremium) {
  //   return (
  //     <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-black-300">
  //       <Text className="text-black dark:text-white text-3xl mb-6 font-rubik-medium">
  //         You're Premium! 🎉
  //       </Text>
  //       <Text className="text-secondary-100 dark:text-white font-rubik text-lg text-center mb-6">
  //         Thank you for supporting our app!
  //       </Text>
  //     </SafeAreaView>
  //   );
  // }

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
            // onPress={handlePurchase}
            disabled={loading}
            className={`px-6 shadow-md shadow-zinc-300 rounded-full py-4 mr-3 ${
              loading ? 'bg-gray-400' : 'bg-primary-100'
            }`}
          >
            <Text className="text-lg text-center font-rubik-medium text-white ml-2">
              {loading ? 'Processing...' : 'Purchase'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Restore Purchases Button */}
        <TouchableOpacity
          // onPress={restorePurchases}
          disabled={loading}
          className="mt-4"
        >
          <Text className="text-primary-100 font-rubik text-base underline">
            Restore Purchases
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Premium