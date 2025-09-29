import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdService from '../../services/AdService';

const { width, height } = Dimensions.get('window');

/**
 * AdManager - Component for managing and displaying ads
 */
const AdManager = ({ 
  adType = 'banner',
  placement = 'default',
  style,
  onAdLoaded,
  onAdFailed,
  onAdClicked,
  onAdClosed
}) => {
  const [adService, setAdService] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adData, setAdData] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeAdService();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isLoaded]);

  /**
   * Initialize ad service
   */
  const initializeAdService = async () => {
    try {
      const service = new AdService();
      await service.initialize();
      setAdService(service);
      
      // Load ad based on type
      await loadAd();
    } catch (error) {
      console.error('Failed to initialize ad service:', error);
      if (onAdFailed) {
        onAdFailed(error);
      }
    }
  };

  /**
   * Load ad based on type
   */
  const loadAd = async () => {
    if (!adService) return;

    try {
      setIsLoading(true);
      
      let result = false;
      let adInfo = null;
      
      switch (adType) {
        case 'banner':
          result = await adService.showBannerAd(placement);
          if (result) {
            adInfo = {
              type: 'banner',
              placement: placement,
              title: 'Sponsored Content',
              description: 'Check out this amazing offer!',
              cta: 'Learn More'
            };
          }
          break;
          
        case 'interstitial':
          result = await adService.showInterstitialAd(placement);
          if (result) {
            adInfo = {
              type: 'interstitial',
              placement: placement,
              title: 'Special Offer',
              description: 'Limited time deal - don\'t miss out!',
              cta: 'Get Offer'
            };
          }
          break;
          
        case 'rewarded':
          result = await adService.showRewardedAd(placement, (reward) => {
            console.log('Reward received:', reward);
          });
          if (result) {
            adInfo = {
              type: 'rewarded',
              placement: placement,
              title: 'Earn Rewards',
              description: 'Watch this ad to earn free coins!',
              cta: 'Watch & Earn'
            };
          }
          break;
          
        case 'native':
          result = await adService.showNativeAd(placement);
          if (result) {
            adInfo = {
              type: 'native',
              placement: placement,
              title: 'Recommended for You',
              description: 'Discover new games and apps',
              cta: 'Download Now'
            };
          }
          break;
          
        default:
          result = false;
      }
      
      if (result && adInfo) {
        setAdData(adInfo);
        setIsLoaded(true);
        setIsLoading(false);
        
        if (onAdLoaded) {
          onAdLoaded(adInfo);
        }
      } else {
        setIsLoading(false);
        if (onAdFailed) {
          onAdFailed(new Error('Ad not available'));
        }
      }
    } catch (error) {
      console.error('Failed to load ad:', error);
      setIsLoading(false);
      if (onAdFailed) {
        onAdFailed(error);
      }
    }
  };

  /**
   * Handle ad click
   */
  const handleAdClick = () => {
    if (adService && adData) {
      adService.handleAdClick(adData.type, adData.placement);
      
      if (onAdClicked) {
        onAdClicked(adData);
      }
    }
  };

  /**
   * Handle ad close
   */
  const handleAdClose = () => {
    if (onAdClosed) {
      onAdClosed(adData);
    }
  };

  /**
   * Render banner ad
   */
  const renderBannerAd = () => {
    if (!isLoaded || !adData) return null;

    return (
      <Animated.View 
        style={[
          styles.bannerAd,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.adContent}
          onPress={handleAdClick}
          activeOpacity={0.8}
        >
          <View style={styles.adHeader}>
            <Text style={styles.adLabel}>Ad</Text>
            <TouchableOpacity onPress={handleAdClose} style={styles.closeButton}>
              <Ionicons name="close" size={16} color="#ccc" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.adBody}>
            <View style={styles.adIcon}>
              <Ionicons name="megaphone" size={24} color="#4A90E2" />
            </View>
            
            <View style={styles.adInfo}>
              <Text style={styles.adTitle}>{adData.title}</Text>
              <Text style={styles.adDescription}>{adData.description}</Text>
            </View>
            
            <View style={styles.adCta}>
              <Text style={styles.ctaText}>{adData.cta}</Text>
              <Ionicons name="arrow-forward" size={16} color="#4A90E2" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /**
   * Render interstitial ad
   */
  const renderInterstitialAd = () => {
    if (!isLoaded || !adData) return null;

    return (
      <Animated.View 
        style={[
          styles.interstitialAd,
          {
            opacity: fadeAnim,
            transform: [{
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })
            }]
          }
        ]}
      >
        <View style={styles.interstitialContent}>
          <TouchableOpacity onPress={handleAdClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#ccc" />
          </TouchableOpacity>
          
          <View style={styles.interstitialBody}>
            <View style={styles.interstitialIcon}>
              <Ionicons name="gift" size={48} color="#FFD700" />
            </View>
            
            <Text style={styles.interstitialTitle}>{adData.title}</Text>
            <Text style={styles.interstitialDescription}>{adData.description}</Text>
            
            <TouchableOpacity
              style={styles.interstitialCta}
              onPress={handleAdClick}
              activeOpacity={0.8}
            >
              <Text style={styles.interstitialCtaText}>{adData.cta}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  /**
   * Render rewarded ad
   */
  const renderRewardedAd = () => {
    if (!isLoaded || !adData) return null;

    return (
      <Animated.View 
        style={[
          styles.rewardedAd,
          {
            opacity: fadeAnim,
            transform: [{
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })
            }]
          }
        ]}
      >
        <View style={styles.rewardedContent}>
          <TouchableOpacity onPress={handleAdClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#ccc" />
          </TouchableOpacity>
          
          <View style={styles.rewardedBody}>
            <View style={styles.rewardedIcon}>
              <Ionicons name="logo-bitcoin" size={48} color="#FFD700" />
            </View>
            
            <Text style={styles.rewardedTitle}>{adData.title}</Text>
            <Text style={styles.rewardedDescription}>{adData.description}</Text>
            
            <View style={styles.rewardInfo}>
              <Ionicons name="gift" size={20} color="#4CAF50" />
              <Text style={styles.rewardText}>Earn 50 Coins</Text>
            </View>
            
            <TouchableOpacity
              style={styles.rewardedCta}
              onPress={handleAdClick}
              activeOpacity={0.8}
            >
              <Text style={styles.rewardedCtaText}>{adData.cta}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  /**
   * Render native ad
   */
  const renderNativeAd = () => {
    if (!isLoaded || !adData) return null;

    return (
      <Animated.View 
        style={[
          styles.nativeAd,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.nativeContent}
          onPress={handleAdClick}
          activeOpacity={0.8}
        >
          <View style={styles.nativeHeader}>
            <Text style={styles.nativeLabel}>Sponsored</Text>
          </View>
          
          <View style={styles.nativeBody}>
            <View style={styles.nativeIcon}>
              <Ionicons name="apps" size={32} color="#4A90E2" />
            </View>
            
            <View style={styles.nativeInfo}>
              <Text style={styles.nativeTitle}>{adData.title}</Text>
              <Text style={styles.nativeDescription}>{adData.description}</Text>
            </View>
            
            <View style={styles.nativeCta}>
              <Text style={styles.nativeCtaText}>{adData.cta}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /**
   * Render loading state
   */
  const renderLoading = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading ad...</Text>
      </View>
    );
  };

  /**
   * Render ad based on type
   */
  const renderAd = () => {
    switch (adType) {
      case 'banner':
        return renderBannerAd();
      case 'interstitial':
        return renderInterstitialAd();
      case 'rewarded':
        return renderRewardedAd();
      case 'native':
        return renderNativeAd();
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderLoading()}
      {renderAd()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#ccc',
  },
  bannerAd: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  adContent: {
    padding: 12,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  adBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adIcon: {
    marginRight: 12,
  },
  adInfo: {
    flex: 1,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  adDescription: {
    fontSize: 12,
    color: '#ccc',
  },
  adCta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  ctaText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginRight: 4,
  },
  interstitialAd: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  interstitialContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  interstitialBody: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  interstitialIcon: {
    marginBottom: 20,
  },
  interstitialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  interstitialDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  interstitialCta: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  interstitialCtaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  rewardedAd: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  rewardedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  rewardedBody: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  rewardedIcon: {
    marginBottom: 20,
  },
  rewardedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  rewardedDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  rewardedCta: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rewardedCtaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nativeAd: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  nativeContent: {
    padding: 16,
  },
  nativeHeader: {
    marginBottom: 12,
  },
  nativeLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  nativeBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nativeIcon: {
    marginRight: 16,
  },
  nativeInfo: {
    flex: 1,
  },
  nativeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  nativeDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  nativeCta: {
    marginLeft: 16,
  },
  nativeCtaText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

export default AdManager;
