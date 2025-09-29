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
import LightningPassService from '../../services/LightningPassService';
import IAPService from '../../services/IAPService';

const { width, height } = Dimensions.get('window');

/**
 * LightningPassScreen - Premium subscription management screen
 */
const LightningPassScreen = ({ 
  onBack, 
  style 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lightningPassService, setLightningPassService] = useState(null);
  const [iapService, setIapService] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [userBenefits, setUserBenefits] = useState(null);
  const [features, setFeatures] = useState(null);
  const [products, setProducts] = useState({});
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
   * Initialize services
   */
  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Initialize services
      const lightningPass = new LightningPassService();
      const iap = new IAPService();
      
      await Promise.all([
        lightningPass.initialize(),
        iap.initialize()
      ]);
      
      setLightningPassService(lightningPass);
      setIapService(iap);
      
      // Load data
      const subStatus = await lightningPass.getSubscriptionStatus();
      const benefits = lightningPass.getUserBenefits();
      const featureList = lightningPass.getLightningPassFeatures();
      const productData = iap.getProducts('subscriptions');
      
      setSubscriptionStatus(subStatus);
      setUserBenefits(benefits);
      setFeatures(featureList);
      setProducts(productData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Lightning Pass services:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle subscription
   */
  const handleSubscription = async (planId) => {
    try {
      setIsLoading(true);
      
      const result = await lightningPassService.subscribeToLightningPass(planId);
      
      if (result.success) {
        Alert.alert(
          'Welcome to Lightning Pass!',
          'You now have access to all premium features!',
          [{ text: 'OK' }]
        );
        
        // Refresh data
        const newStatus = await lightningPassService.getSubscriptionStatus();
        const newBenefits = lightningPassService.getUserBenefits();
        
        setSubscriptionStatus(newStatus);
        setUserBenefits(newBenefits);
      } else {
        Alert.alert(
          'Subscription Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Subscription failed:', error);
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
   * Handle cancellation
   */
  const handleCancellation = async () => {
    Alert.alert(
      'Cancel Lightning Pass',
      'Are you sure you want to cancel your Lightning Pass subscription? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              const result = await lightningPassService.cancelLightningPassSubscription();
              
              if (result.success) {
                Alert.alert(
                  'Subscription Cancelled',
                  'Your Lightning Pass subscription has been cancelled. You will retain access until the end of your billing period.',
                  [{ text: 'OK' }]
                );
                
                // Refresh data
                const newStatus = await lightningPassService.getSubscriptionStatus();
                setSubscriptionStatus(newStatus);
              } else {
                Alert.alert(
                  'Cancellation Failed',
                  'Something went wrong. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Cancellation failed:', error);
              Alert.alert(
                'Cancellation Failed',
                error.message || 'Something went wrong. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  /**
   * Claim daily bonus
   */
  const claimDailyBonus = async () => {
    try {
      setIsLoading(true);
      
      const result = await lightningPassService.claimDailyBonus();
      
      if (result.success) {
        Alert.alert(
          'Daily Bonus Claimed!',
          `You received ${result.coins} coins and ${result.hints} hints!`,
          [{ text: 'OK' }]
        );
        
        // Refresh benefits
        const newBenefits = lightningPassService.getUserBenefits();
        setUserBenefits(newBenefits);
      } else {
        Alert.alert(
          'Bonus Already Claimed',
          'You have already claimed your daily bonus today. Come back tomorrow!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Daily bonus claim failed:', error);
      Alert.alert(
        'Bonus Claim Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render subscription status
   */
  const renderSubscriptionStatus = () => {
    if (!subscriptionStatus) return null;

    if (subscriptionStatus.hasPass) {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.activeStatus}>
            <Ionicons name="flash" size={24} color="#FFD700" />
            <Text style={styles.statusTitle}>Lightning Pass Active</Text>
            <Text style={styles.statusSubtitle}>
              {subscriptionStatus.daysRemaining} days remaining
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.claimButton}
            onPress={claimDailyBonus}
            activeOpacity={0.7}
          >
            <Ionicons name="gift" size={20} color="#fff" />
            <Text style={styles.claimButtonText}>Claim Daily Bonus</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancellation}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.inactiveStatus}>
            <Ionicons name="flash-outline" size={24} color="#666" />
            <Text style={styles.statusTitle}>Lightning Pass Inactive</Text>
            <Text style={styles.statusSubtitle}>
              Subscribe to unlock premium features
            </Text>
          </View>
        </View>
      );
    }
  };

  /**
   * Render features
   */
  const renderFeatures = () => {
    if (!features) return null;

    const featureList = [
      { key: 'noAds', icon: 'eye-off', title: 'No Ads', description: 'Enjoy ad-free gameplay' },
      { key: 'premiumThemes', icon: 'color-palette', title: 'Premium Themes', description: 'Access exclusive themes' },
      { key: 'exclusiveContent', icon: 'star', title: 'Exclusive Content', description: 'Special challenges and rewards' },
      { key: 'prioritySupport', icon: 'headset', title: 'Priority Support', description: 'Get help faster' },
      { key: 'exclusiveChallenges', icon: 'trophy', title: 'Exclusive Challenges', description: 'Special daily challenges' },
      { key: 'earlyAccess', icon: 'rocket', title: 'Early Access', description: 'Try new features first' },
      { key: 'customAvatars', icon: 'person', title: 'Custom Avatars', description: 'Premium avatar options' },
      { key: 'advancedStats', icon: 'analytics', title: 'Advanced Stats', description: 'Detailed performance tracking' },
      { key: 'cloudSave', icon: 'cloud', title: 'Cloud Save', description: 'Sync progress across devices' }
    ];

    return (
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        {featureList.map(feature => (
          <View key={feature.key} style={styles.featureItem}>
            <Ionicons 
              name={feature.icon} 
              size={24} 
              color={features[feature.key] ? '#4CAF50' : '#666'} 
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            {features[feature.key] && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render subscription plans
   */
  const renderSubscriptionPlans = () => {
    if (!products || Object.keys(products).length === 0) return null;

    return (
      <View style={styles.plansContainer}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        {Object.entries(products).map(([planId, plan]) => (
          <TouchableOpacity
            key={planId}
            style={[
              styles.planCard,
              planId === 'lightningPassYearly' && styles.featuredPlan
            ]}
            onPress={() => handleSubscription(planId)}
            activeOpacity={0.7}
          >
            {planId === 'lightningPassYearly' && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>SAVE 33%</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Ionicons name="flash" size={32} color="#FFD700" />
              <Text style={styles.planTitle}>Lightning Pass</Text>
              <Text style={styles.planDuration}>
                {plan.duration === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </View>
            
            <Text style={styles.planDescription}>{plan.description}</Text>
            
            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.planFeatureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.planFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.planFooter}>
              <Text style={styles.planPrice}>${plan.price}</Text>
              <Text style={styles.planPeriod}>
                {plan.duration === 'monthly' ? '/month' : '/year'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Render user benefits
   */
  const renderUserBenefits = () => {
    if (!userBenefits || !subscriptionStatus?.hasPass) return null;

    return (
      <View style={styles.benefitsContainer}>
        <Text style={styles.sectionTitle}>Your Benefits</Text>
        
        <View style={styles.benefitItem}>
          <Ionicons name="logo-bitcoin" size={20} color="#FFD700" />
          <Text style={styles.benefitText}>
            Daily Bonus: {userBenefits.dailyBonus.coins} coins
          </Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="bulb" size={20} color="#FFD700" />
          <Text style={styles.benefitText}>
            Daily Bonus: {userBenefits.dailyBonus.hints} hints
          </Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="color-palette" size={20} color="#9C27B0" />
          <Text style={styles.benefitText}>
            Exclusive Themes: {userBenefits.exclusiveThemes.length} unlocked
          </Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="trophy" size={20} color="#FF6B6B" />
          <Text style={styles.benefitText}>
            Exclusive Challenges: {userBenefits.exclusiveChallenges.length} unlocked
          </Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="person" size={20} color="#2196F3" />
          <Text style={styles.benefitText}>
            Premium Avatars: {userBenefits.premiumAvatars.length} unlocked
          </Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="cloud" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>
            Cloud Save: {userBenefits.cloudSaveEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lightning Pass</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Lightning Pass...</Text>
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
        <Text style={styles.headerTitle}>Lightning Pass</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderSubscriptionStatus()}
        {renderFeatures()}
        {renderUserBenefits()}
        {renderSubscriptionPlans()}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  activeStatus: {
    alignItems: 'center',
    marginBottom: 16,
  },
  inactiveStatus: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    textDecorationLine: 'underline',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureInfo: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  featureDescription: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  plansContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  featuredPlan: {
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
  planHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  planDuration: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  planPeriod: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 4,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 12,
  },
});

export default LightningPassScreen;
