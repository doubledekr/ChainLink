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
import AchievementService from '../../services/AchievementService';
import RewardService from '../../services/RewardService';

const { width, height } = Dimensions.get('window');

/**
 * AchievementScreen - Achievement tracking and display screen
 */
const AchievementScreen = ({ 
  onBack, 
  style 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [achievementService, setAchievementService] = useState(null);
  const [rewardService, setRewardService] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievementStats, setAchievementStats] = useState(null);
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
      const achievement = new AchievementService();
      const reward = new RewardService();
      
      await Promise.all([
        achievement.initialize(),
        reward.initialize()
      ]);
      
      setAchievementService(achievement);
      setRewardService(reward);
      
      // Load achievements and stats
      const allAchievements = achievement.getAllAchievements();
      const stats = achievement.getAchievementStats();
      
      setAchievements(allAchievements);
      setAchievementStats(stats);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize achievement services:', error);
      setIsLoading(false);
    }
  };

  /**
   * Get filtered achievements
   */
  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return achievements;
    }
    return achievements.filter(achievement => achievement.category === selectedCategory);
  };

  /**
   * Get achievement rarity color
   */
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FFD700';
      default: return '#666';
    }
  };

  /**
   * Get achievement rarity border
   */
  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FFD700';
      default: return '#333';
    }
  };

  /**
   * Format achievement progress
   */
  const formatProgress = (achievement) => {
    const requirements = achievement.requirements;
    const progress = achievement.progress || 0;
    
    // Get the first requirement for progress display
    const firstRequirement = Object.entries(requirements)[0];
    if (!firstRequirement) return '0/0';
    
    const [key, value] = firstRequirement;
    return `${Math.min(progress, value)}/${value}`;
  };

  /**
   * Get achievement progress percentage
   */
  const getProgressPercentage = (achievement) => {
    const requirements = achievement.requirements;
    const progress = achievement.progress || 0;
    
    // Get the first requirement for progress calculation
    const firstRequirement = Object.entries(requirements)[0];
    if (!firstRequirement) return 0;
    
    const [key, value] = firstRequirement;
    return Math.min((progress / value) * 100, 100);
  };

  /**
   * Render achievement card
   */
  const renderAchievementCard = (achievement) => {
    const isUnlocked = achievement.unlocked;
    const progressPercentage = getProgressPercentage(achievement);
    const rarityColor = getRarityColor(achievement.rarity);
    const rarityBorder = getRarityBorder(achievement.rarity);
    
    return (
      <View
        key={achievement.id}
        style={[
          styles.achievementCard,
          { borderColor: rarityBorder },
          isUnlocked && styles.unlockedCard
        ]}
      >
        <View style={styles.achievementHeader}>
          <View style={[styles.achievementIcon, { backgroundColor: rarityColor }]}>
            <Ionicons 
              name={achievement.icon} 
              size={24} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, { color: isUnlocked ? '#fff' : '#666' }]}>
              {achievement.name}
            </Text>
            <Text style={[styles.achievementDescription, { color: isUnlocked ? '#ccc' : '#666' }]}>
              {achievement.description}
            </Text>
          </View>
          
          <View style={styles.achievementPoints}>
            <Text style={[styles.pointsText, { color: rarityColor }]}>
              {achievement.points}
            </Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>
        
        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: rarityColor
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {formatProgress(achievement)}
            </Text>
          </View>
        )}
        
        {isUnlocked && (
          <View style={styles.unlockedContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.unlockedText}>
              Unlocked {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
            </Text>
          </View>
        )}
        
        {achievement.hidden && !isUnlocked && (
          <View style={styles.hiddenContainer}>
            <Ionicons name="lock-closed" size={16} color="#666" />
            <Text style={styles.hiddenText}>Hidden Achievement</Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Render category tabs
   */
  const renderCategoryTabs = () => {
    const categories = [
      { id: 'all', label: 'All', icon: 'grid' },
      { id: 'gameplay', label: 'Gameplay', icon: 'game-controller' },
      { id: 'progression', label: 'Progression', icon: 'trending-up' },
      { id: 'social', label: 'Social', icon: 'people' },
      { id: 'collection', label: 'Collection', icon: 'library' },
      { id: 'special', label: 'Special', icon: 'star' },
      { id: 'seasonal', label: 'Seasonal', icon: 'calendar' }
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tabButton,
              selectedCategory === category.id && styles.activeTab
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={category.icon} 
              size={18} 
              color={selectedCategory === category.id ? '#fff' : '#ccc'} 
            />
            <Text style={[
              styles.tabText,
              selectedCategory === category.id && styles.activeTabText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  /**
   * Render achievement statistics
   */
  const renderAchievementStats = () => {
    if (!achievementStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Achievement Progress</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievementStats.unlocked}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievementStats.locked}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievementStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((achievementStats.unlocked / achievementStats.total) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
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
          <Text style={styles.headerTitle}>Achievements</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
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
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>
      
      {renderAchievementStats()}
      {renderCategoryTabs()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {getFilteredAchievements().map(renderAchievementCard)}
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
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  tabsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
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
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  unlockedCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  unlockedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
  },
  hiddenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  hiddenText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default AchievementScreen;
