// src/services/iapService.js
import RNIap, {
  purchaseErrorListener,
  finishTransaction,
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  requestSubscription,
  purchaseUpdatedListener as purchaseListener,
} from 'react-native-iap';

class IAPService {
  constructor() {
    this.products = [];
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
  }

  // Product IDs - must match your App Store Connect and Google Play Console
  productIds = [
    'monthly_premium',
    'yearly_premium',
    'lifetime_premium'
  ];

  async initializeIAP() {
    try {
      await initConnection();
      console.log('IAP connection initialized');

      // Get available products
      const products = await getProducts(this.productIds);
      this.products = products;
      console.log('Available products:', products);

      // Set up purchase listeners
      this.setupPurchaseListeners();

      return { success: true, products };
    } catch (error) {
      console.error('IAP initialization failed:', error);
      return { success: false, error };
    }
  }

  setupPurchaseListeners() {
    // Purchase success listener
    this.purchaseUpdateSubscription = purchaseListener((purchase) => {
      console.log('Purchase successful:', purchase);

      // Verify purchase and grant premium access
      this.handlePurchaseSuccess(purchase);
    });

    // Purchase error listener
    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.error('Purchase failed:', error);
      this.handlePurchaseError(error);
    });
  }

  async handlePurchaseSuccess(purchase) {
    try {
      // Here you would typically:
      // 1. Verify the purchase with your backend
      // 2. Grant premium access
      // 3. Update user's premium status

      console.log('Processing purchase:', purchase.productId);

      // For now, just finish the transaction
      await finishTransaction(purchase, false);

      // Update premium status in your app
      await this.updatePremiumStatus(purchase.productId);

      return { success: true };
    } catch (error) {
      console.error('Error processing purchase:', error);
      return { success: false, error };
    }
  }

  async updatePremiumStatus(productId) {
    // Store premium status locally (you might want to use AsyncStorage or your state management)
    // This is where you'd update your app's premium state
    console.log('User is now premium with:', productId);
  }

  handlePurchaseError(error) {
    console.error('Purchase error:', error);
    // Handle different error types
    if (error.code === 'E_USER_CANCELLED') {
      console.log('User cancelled the purchase');
    } else if (error.code === 'E_ITEM_UNAVAILABLE') {
      console.log('Item unavailable');
    } else {
      console.log('Purchase failed:', error.message);
    }
  }

  async purchaseProduct(productId) {
    try {
      if (productId === 'lifetime_premium') {
        // Non-consumable product
        await requestPurchase(productId);
      } else {
        // Subscription products
        await requestSubscription(productId);
      }
    } catch (error) {
      console.error('Purchase request failed:', error);
      throw error;
    }
  }

  async restorePurchases() {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('Restored purchases:', purchases);

      // Process restored purchases
      for (const purchase of purchases) {
        await this.handlePurchaseSuccess(purchase);
      }

      return { success: true, purchases };
    } catch (error) {
      console.error('Restore purchases failed:', error);
      return { success: false, error };
    }
  }

  async endConnection() {
    try {
      // Remove listeners
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
      }

      // End IAP connection
      await endConnection();
      console.log('IAP connection ended');
    } catch (error) {
      console.error('Error ending IAP connection:', error);
    }
  }

  getProductById(productId) {
    return this.products.find(product => product.productId === productId);
  }

  getProducts() {
    return this.products;
  }
}

export default new IAPService();