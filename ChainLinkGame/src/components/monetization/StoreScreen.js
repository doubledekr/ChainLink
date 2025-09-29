import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IAPService from '../../services/IAPService';
import LightningPassService from '../../services/LightningPassService';
import AdService from '../../services/AdService';

const { width } = Dimensions.get('window');

/**
 * StoreScreen - In-app purchase and subscription store
 */
const StoreScreen = ({ 
  onBack, 
  userCoins = 0, 
  userHints = 0, 
  userLives = 0,
  style 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iapService, setIapService] = useState(null);
  const [lightningPassService, setLightningPassService] = useState(null);
  const [adService, setAdService] = useState(null);
  const [products, setProducts] = useState({});
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [selectedTab, setSelectedTab] = useState('coins');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeServices();
  }, []);

  useEffect(() => {
    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  /**
   * Initialize monetization services
   */
  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Initialize services
      const iap = new IAPService();
      const lightningPass = new LightningPassService();
      const ads = new AdService();
      
      await Promise.all([
        iap.initialize(),
        lightningPass.initialize(),
        ads.initialize()
      ]);
      
      setIapService(iap);
      setLightningPassService(lightningPass);
      setAdService(ads);
      
      // Load products and subscription status
      const productData = iap.getProducts();
      const subStatus = await lightningPass.getSubscriptionStatus();
      
      setProducts(productData);
      setSubscriptionStatus(subStatus);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize store services:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle coin purchase
   */
  const handleCoinPurchase = async (packId) => {
    try {
      setIsLoading(true);
      
      const result = await iapService.purchaseCoins(packId);
      
      if (result.success) {
        Alert.alert(
          'Purchase Successful!',
          `You received ${result.coins} coins!`,
          [{ text: 'OK' }]
        );
        
        // Refresh user data
        // In a real app, this would trigger a refresh of user data
      } else {
        Alert.alert(
          'Purchase Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Coin purchase failed:', error);
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle power-up purchase
   */
  const handlePowerUpPurchase = async (packId) => {
    try {
      setIsLoading(true);
      
      const result = await iapService.purchasePowerUps(packId);
      
      if (result.success) {
        Alert.alert(
          'Purchase Successful!',
          `You received ${result.powerUps.description}!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Purchase Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Power-up purchase failed:', error);
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle theme purchase
   */
  const handleThemePurchase = async (packId) => {
    try {
      setIsLoading(true);
      
      const result = await iapService.purchaseThemes(packId);
      
      if (result.success) {
        Alert.alert(
          'Purchase Successful!',
          `You unlocked ${result.themes} themes!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Purchase Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Theme purchase failed:', error);
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Lightning Pass subscription
   */
  const handleLightningPassSubscription = async (planId) => {
    try {
      setIsLoading(true);
      
      const result = await lightningPassService.subscribeToLightningPass(planId);
      
      if (result.success) {
        Alert.alert(
          'Welcome to Lightning Pass!',
          'You now have access to all premium features!',
          [{ text: 'OK' }]
        );
        
        // Refresh subscription status
        const newStatus = await lightningPassService.getSubscriptionStatus();
        setSubscriptionStatus(newStatus);
      } else {
        Alert.alert(
          'Subscription Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Lightning Pass subscription failed:', error);
      Alert.alert(
        'Subscription Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle rewarded ad
   */
  const handleRewardedAd = async () => {
    try {
      setIsLoading(true);
      
      const result = await adService.showRewardedAd('store', (reward) => {
        Alert.alert(
          'Reward Earned!',
          `You received ${reward.amount} ${reward.type}!`,
          [{ text: 'OK' }]
        );
      });
      
      if (!result) {
        Alert.alert(
          'Ad Not Available',
          'No rewarded ads available right now. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Rewarded ad failed:', error);
      Alert.alert(
        'Ad Failed',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render coin packs
   */
  const renderCoinPacks = () => {
    const coinPacks = products.coins || {};
    
    return (
      <View style={styles.productsContainer}>
        {Object.entries(coinPacks).map(([packId, pack]) => (
          <TouchableOpacity
            key={packId}
            style={[styles.productCard, packId === 'medium' && styles.featuredCard]}
            onPress={() => handleCoinPurchase(packId)}
            activeOpacity={0.7}
          >
            {packId === 'medium' && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>BEST VALUE</Text>
              </View>
            )}
            
            <View style={styles.productHeader}>
              <Ionicons name="logo-bitcoin" size={32} color="#FFD700" />
              <Text style={styles.coinAmount}>{pack.coins}</Text>
            </View>
            
            <Text style={styles.productDescription}>{pack.description}</Text>
            
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>${pack.price}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Render power-up packs
   */
  const renderPowerUpPacks = () => {
    const powerUpPacks = products.powerUps || {};
    
    return (
      <View style={styles.productsContainer}>
        {Object.entries(powerUpPacks).map(([packId, pack]) => (
          <TouchableOpacity
            key={packId}
            style={styles.productCard}
            onPress={() => handlePowerUpPurchase(packId)}
            activeOpacity={0.7}
          >
            <View style={styles.productHeader}>
              <Ionicons name={getPowerUpIcon(packId)} size={32} color="#4CAF50" />
              <Text style={styles.powerUpAmount}>
                {pack.hints || pack.lives || pack.boosters}
              </Text>
            </View>
            
            <Text style={styles.productDescription}>{pack.description}</Text>
            
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>${pack.price}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Render theme packs
   */
  const renderThemePacks = () => {
    const themePacks = products.themes || {};
    
    return (
      <View style={styles.productsContainer}>
        {Object.entries(themePacks).map(([packId, pack]) => (
          <TouchableOpacity
            key={packId}
            style={styles.productCard}
            onPress={() => handleThemePurchase(packId)}
            activeOpacity={0.7}
          >
            <View style={styles.productHeader}>
              <Ionicons name="color-palette" size={32} color="#9C27B0" />
              <Text style={styles.themeName}>Themes</Text>
            </View>
            
            <Text style={styles.productDescription}>{pack.description}</Text>
            
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>${pack.price}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Render Lightning Pass subscriptions
   */
  const renderLightningPass = () => {
    const subscriptions = products.subscriptions || {};
    
    return (
      <View style={styles.productsContainer}>
        {Object.entries(subscriptions).map(([planId, plan]) => (
          <TouchableOpacity
            key={planId}
            style={[styles.productCard, styles.subscriptionCard]}
            onPress={() => handleLightningPassSubscription(planId)}
            activeOpacity={0.7}
          >
            <View style={styles.subscriptionHeader}>
              <Ionicons name="flash" size={32} color="#FFD700" />
              <Text style={styles.subscriptionTitle}>Lightning Pass</Text>
              <Text style={styles.subscriptionDuration}>
                {plan.duration === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </View>
            
            <Text style={styles.productDescription}>{plan.description}</Text>
            
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>${plan.price}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Render free rewards section
   */
  const renderFreeRewards = () => {
    return (
      <View style={styles.productsContainer}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={handleRewardedAd}
          activeOpacity={0.7}
        >
          <View style={styles.productHeader}>
            <Ionicons name="gift" size={32} color="#FF6B6B" />
            <Text style={styles.freeRewardTitle}>Free Rewards</Text>
          </View>
          
          <Text style={styles.productDescription}>
            Watch an ad to earn free coins and power-ups!
          </Text>
          
          <View style={styles.productFooter}>
            <Text style={styles.freeText}>FREE</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Get power-up icon
   */
  const getPowerUpIcon = (packId) => {
    switch (packId) {
      case 'hints': return 'bulb';
      case 'lives': return 'heart';
      case 'boosters': return 'rocket';
      default: return 'help-circle';
    }
  };

  /**
   * Render tab content
   */
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'coins':
        return renderCoinPacks();
      case 'powerUps':
        return renderPowerUpPacks();
      case 'themes':
        return renderThemePacks();
      case 'lightningPass':
        return renderLightningPass();
      case 'free':
        return renderFreeRewards();
      default:
        return renderCoinPacks();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading store...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store</Text>
        
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Ionicons name="logo-bitcoin" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{userCoins}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="bulb" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{userHints}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
            <Text style={styles.statValue}>{userLives}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'coins', label: 'Coins', icon: 'logo-bitcoin' },
            { id: 'powerUps', label: 'Power-ups', icon: 'rocket' },
            { id: 'themes', label: 'Themes', icon: 'color-palette' },
            { id: 'lightningPass', label: 'Lightning Pass', icon: 'flash' },
            { id: 'free', label: 'Free', icon: 'gift' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                selectedTab === tab.id && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.id ? '#fff' : '#ccc'} 
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTabContent()}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ccc',
  },
  tabContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  featuredCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  featuredBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  productHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  coinAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  powerUpAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginTop: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  freeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  subscriptionCard: {
    width: '100%',
  },
  subscriptionHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  subscriptionDuration: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  featuresContainer: {
    marginVertical: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  freeRewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 8,
  },
});

export default StoreScreen;
