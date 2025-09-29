import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeSelection - Theme selection and management screen
 */
const ThemeSelection = ({ navigation }) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All Themes', icon: 'apps' },
    { id: 'default', name: 'Default', icon: 'home' },
    { id: 'seasonal', name: 'Seasonal', icon: 'calendar' },
    { id: 'premium', name: 'Premium', icon: 'diamond' },
    { id: 'custom', name: 'Custom', icon: 'brush' }
  ];

  useEffect(() => {
    loadThemes();
  }, []);

  /**
   * Load themes
   */
  const loadThemes = async () => {
    try {
      setLoading(true);
      await theme.loadThemeData();
    } catch (error) {
      console.error('Failed to load themes:', error);
      Alert.alert('Error', 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadThemes();
    setRefreshing(false);
  };

  /**
   * Apply theme
   */
  const applyTheme = async (themeId) => {
    try {
      const success = await theme.setCurrentThemeById(themeId);
      if (success) {
        Alert.alert(
          'Theme Applied!',
          'Theme has been successfully applied to your game.',
          [{ text: 'Awesome!' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply theme');
    }
  };

  /**
   * Unlock premium theme
   */
  const unlockPremiumTheme = (themeId) => {
    Alert.alert(
      'Premium Theme',
      'This is a premium theme. Purchase the premium pack to unlock all premium themes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Purchase', onPress: () => {
          // Navigate to purchase screen
          console.log('Navigate to purchase screen');
        }}
      ]
    );
  };

  /**
   * Create custom theme
   */
  const createCustomTheme = () => {
    navigation.navigate('CreateCustomTheme');
  };

  /**
   * Get filtered themes
   */
  const getFilteredThemes = () => {
    if (selectedCategory === 'all') {
      return theme.allThemes;
    }
    return theme.getThemesByCategory(selectedCategory);
  };

  /**
   * Render category tabs
   */
  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.categoryTabActive
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Ionicons 
            name={category.icon} 
            size={16} 
            color={selectedCategory === category.id ? '#fff' : '#666'} 
          />
          <Text style={[
            styles.categoryTabText,
            selectedCategory === category.id && styles.categoryTabTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  /**
   * Render theme card
   */
  const renderThemeCard = (themeItem) => {
    const isCurrent = theme.currentTheme?.id === themeItem.id;
    const isUnlocked = theme.isThemeUnlocked(themeItem.id);
    const isPremium = theme.isThemePremium(themeItem.id);

    return (
      <TouchableOpacity
        key={themeItem.id}
        style={[
          styles.themeCard,
          isCurrent && styles.currentTheme,
          !isUnlocked && styles.lockedTheme
        ]}
        onPress={() => {
          if (!isUnlocked && isPremium) {
            unlockPremiumTheme(themeItem.id);
          } else if (isUnlocked) {
            applyTheme(themeItem.id);
          }
        }}
        disabled={!isUnlocked && !isPremium}
      >
        {/* Theme Preview */}
        <View style={styles.themePreview}>
          <View style={[
            styles.colorPreview,
            { backgroundColor: themeItem.colors.primary }
          ]} />
          <View style={[
            styles.colorPreview,
            { backgroundColor: themeItem.colors.secondary }
          ]} />
          <View style={[
            styles.colorPreview,
            { backgroundColor: themeItem.colors.accent }
          ]} />
        </View>

        {/* Theme Info */}
        <View style={styles.themeInfo}>
          <View style={styles.themeHeader}>
            <Text style={[
              styles.themeName,
              !isUnlocked && styles.lockedText
            ]}>
              {themeItem.name}
            </Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.themeDescription,
            !isUnlocked && styles.lockedText
          ]}>
            {themeItem.description}
          </Text>
          
          {/* Theme Features */}
          <View style={styles.themeFeatures}>
            {themeItem.particles !== 'none' && (
              <View style={styles.featureTag}>
                <Ionicons name="sparkles" size={12} color="#666" />
                <Text style={styles.featureText}>Particles</Text>
              </View>
            )}
            {themeItem.music !== 'default' && (
              <View style={styles.featureTag}>
                <Ionicons name="musical-notes" size={12} color="#666" />
                <Text style={styles.featureText}>Music</Text>
              </View>
            )}
            {themeItem.custom && (
              <View style={styles.featureTag}>
                <Ionicons name="brush" size={12} color="#666" />
                <Text style={styles.featureText}>Custom</Text>
              </View>
            )}
          </View>
        </View>

        {/* Theme Status */}
        <View style={styles.themeStatus}>
          {!isUnlocked && isPremium ? (
            <View style={styles.lockedIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
          ) : isUnlocked ? (
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={isCurrent ? '#4CAF50' : '#4A90E2'} 
            />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render header
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Themes</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={createCustomTheme}
      >
        <Ionicons name="add" size={24} color="#4A90E2" />
      </TouchableOpacity>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="color-palette-outline" size={64} color="#666" />
      <Text style={styles.emptyTitle}>No Themes Available</Text>
      <Text style={styles.emptySubtitle}>
        {selectedCategory === 'custom' 
          ? 'Create your first custom theme!'
          : 'No themes found in this category.'}
      </Text>
      {selectedCategory === 'custom' && (
        <TouchableOpacity style={styles.createThemeButton} onPress={createCustomTheme}>
          <Text style={styles.createThemeButtonText}>Create Custom Theme</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading themes...</Text>
    </View>
  );

  const filteredThemes = getFilteredThemes();

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {renderCategoryTabs()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
      >
        {loading ? (
          renderLoading()
        ) : filteredThemes.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.themesContainer}>
            <Text style={styles.sectionTitle}>
              {categories.find(c => c.id === selectedCategory)?.name} ({filteredThemes.length})
            </Text>
            {filteredThemes.map(renderThemeCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    padding: 8,
  },
  categoryTabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  categoryTabActive: {
    backgroundColor: '#4A90E2',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  themesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  themeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTheme: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  lockedTheme: {
    opacity: 0.6,
  },
  themePreview: {
    flexDirection: 'row',
    marginRight: 16,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 4,
  },
  themeInfo: {
    flex: 1,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  lockedText: {
    color: '#999',
  },
  currentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  themeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  themeStatus: {
    marginLeft: 16,
  },
  lockedIcon: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createThemeButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createThemeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThemeSelection;
