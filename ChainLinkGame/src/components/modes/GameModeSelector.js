import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameModeService from '../../services/GameModeService';
import BlitzMode from '../../modes/BlitzMode';
import ZenMode from '../../modes/ZenMode';
import SurvivalMode from '../../modes/SurvivalMode';
import TournamentMode from '../../modes/TournamentMode';
import PracticeMode from '../../modes/PracticeMode';

const { width } = Dimensions.get('window');

/**
 * GameModeSelector - Component for selecting and launching game modes
 */
const GameModeSelector = ({ 
  onModeSelect, 
  onBack, 
  playerLevel = 1, 
  playerStats = {},
  style 
}) => {
  const [availableModes, setAvailableModes] = useState([]);
  const [selectedMode, setSelectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modeInstances, setModeInstances] = useState({});

  useEffect(() => {
    initializeModes();
  }, []);

  /**
   * Initialize available game modes
   */
  const initializeModes = async () => {
    try {
      setIsLoading(true);
      
      // Get all available modes
      const modes = GameModeService.getAllModes();
      const available = [];
      
      for (const mode of modes) {
        // Check if mode is unlocked
        const isUnlocked = GameModeService.isModeUnlocked(mode.id, playerLevel);
        
        if (isUnlocked) {
          // Get mode stats
          const stats = await GameModeService.getModeStats(mode.id);
          available.push({
            ...mode,
            stats: stats,
            isUnlocked: true
          });
        } else {
          available.push({
            ...mode,
            stats: null,
            isUnlocked: false
          });
        }
      }
      
      setAvailableModes(available);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize modes:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle mode selection
   */
  const handleModeSelect = async (mode) => {
    if (!mode.isUnlocked) {
      Alert.alert(
        'Mode Locked',
        `This mode unlocks at level ${mode.unlockRequirement}. Keep playing to unlock it!`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setSelectedMode(mode);
      
      // Create mode instance
      let modeInstance = null;
      switch (mode.id) {
        case 'BLITZ':
          modeInstance = new BlitzMode();
          break;
        case 'ZEN':
          modeInstance = new ZenMode();
          break;
        case 'SURVIVAL':
          modeInstance = new SurvivalMode();
          break;
        case 'TOURNAMENT':
          modeInstance = new TournamentMode();
          break;
        case 'PRACTICE':
          modeInstance = new PracticeMode();
          break;
        default:
          modeInstance = null;
      }

      if (modeInstance) {
        await modeInstance.initialize();
        setModeInstances(prev => ({ ...prev, [mode.id]: modeInstance }));
        
        if (onModeSelect) {
          onModeSelect(mode, modeInstance);
        }
      }
    } catch (error) {
      console.error('Failed to initialize mode:', error);
      Alert.alert(
        'Error',
        'Failed to start game mode. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Get mode icon
   */
  const getModeIcon = (modeId) => {
    switch (modeId) {
      case 'SINGLE': return 'game-controller';
      case 'BLITZ': return 'flash';
      case 'ZEN': return 'leaf';
      case 'SURVIVAL': return 'heart';
      case 'TOURNAMENT': return 'trophy';
      case 'PRACTICE': return 'school';
      default: return 'help-circle';
    }
  };

  /**
   * Get mode color
   */
  const getModeColor = (mode) => {
    if (!mode.isUnlocked) return '#666';
    return mode.color || '#4A90E2';
  };

  /**
   * Format mode stats
   */
  const formatModeStats = (mode) => {
    if (!mode.stats) return 'No stats available';
    
    const { gamesPlayed, bestScore, averageScore } = mode.stats;
    return `${gamesPlayed} games • Best: ${bestScore.toLocaleString()}`;
  };

  /**
   * Render mode card
   */
  const renderModeCard = (mode) => {
    const isSelected = selectedMode?.id === mode.id;
    const iconName = getModeIcon(mode.id);
    const color = getModeColor(mode);
    
    return (
      <TouchableOpacity
        key={mode.id}
        style={[
          styles.modeCard,
          { borderColor: color },
          isSelected && styles.selectedCard
        ]}
        onPress={() => handleModeSelect(mode)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={iconName} size={24} color="#fff" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.modeName, { color: mode.isUnlocked ? '#fff' : '#666' }]}>
              {mode.name}
            </Text>
            <Text style={[styles.modeDescription, { color: mode.isUnlocked ? '#ccc' : '#666' }]}>
              {mode.description}
            </Text>
          </View>
          {!mode.isUnlocked && (
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: mode.isUnlocked ? '#ccc' : '#666' }]}>
              {formatModeStats(mode)}
            </Text>
          </View>
          
          <View style={styles.modeFeatures}>
            {mode.leaderboardEnabled && (
              <View style={styles.featureTag}>
                <Ionicons name="trophy" size={12} color="#FFD700" />
                <Text style={styles.featureText}>Leaderboard</Text>
              </View>
            )}
            {mode.dailyChallengesEnabled && (
              <View style={styles.featureTag}>
                <Ionicons name="calendar" size={12} color="#4CAF50" />
                <Text style={styles.featureText}>Daily</Text>
              </View>
            )}
            {mode.multiplayer && (
              <View style={styles.featureTag}>
                <Ionicons name="people" size={12} color="#2196F3" />
                <Text style={styles.featureText}>Multiplayer</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Modes</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game modes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Modes</Text>
      </View>
      
      <ScrollView 
        style={styles.modesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.modesListContent}
      >
        {availableModes.map(renderModeCard)}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Unlock new modes by leveling up!
          </Text>
        </View>
      </ScrollView>
    </View>
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
  modesList: {
    flex: 1,
  },
  modesListContent: {
    padding: 20,
  },
  modeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  lockIcon: {
    marginLeft: 12,
  },
  cardFooter: {
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#ccc',
    marginLeft: 4,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default GameModeSelector;
