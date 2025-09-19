import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  Image, 
  View, 
  StyleSheet, 
  ImageBackground,
  Animated
} from 'react-native';
import { Images } from './ImageAssets';

// Custom Button Component with image background
export const CustomButton = ({ 
  onPress, 
  text, 
  size = 'large', 
  color = 'default', 
  style, 
  textStyle,
  disabled = false,
  animated = false,
  animatedValue
}) => {
  const buttonImage = Images.buttons.main[size][color];
  
  const ButtonWrapper = animated ? Animated.View : View;
  
  return (
    <ButtonWrapper style={[{ transform: animated && animatedValue ? [{ scale: animatedValue }] : [] }]}>
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.8}
        disabled={disabled}
        style={style}
      >
        <ImageBackground 
          source={buttonImage} 
          style={[
            customStyles.buttonContainer,
            size === 'large' && customStyles.largeButton,
            size === 'small' && customStyles.smallButton,
            size === 'smallest' && customStyles.smallestButton,
          ]}
          imageStyle={{ borderRadius: size === 'large' ? 12 : size === 'small' ? 8 : 8 }}
          resizeMode="stretch"
        >
          <View style={customStyles.buttonTextContainer}>
            <Text style={[
              customStyles.buttonText, 
              size === 'large' && customStyles.largeButtonText,
              size === 'small' && customStyles.smallButtonText,
              size === 'smallest' && customStyles.smallestButtonText,
              textStyle
            ]}>{text}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </ButtonWrapper>
  );
};

// Circle Button Component
export const CircleButton = ({ onPress, type, style }) => {
  const buttonImage = Images.buttons.circle[type];
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <Image source={buttonImage} style={customStyles.circleButton} resizeMode="contain" />
    </TouchableOpacity>
  );
};

// Close Button Component
export const CloseButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <Image source={Images.buttons.close} style={customStyles.closeButton} resizeMode="contain" />
    </TouchableOpacity>
  );
};

// Panel Component with image background
export const Panel = ({ children, size = 'medium', style }) => {
  const panelImage = Images.panels[size === 'full' ? 'fullSize' : size];
  
  return (
    <ImageBackground 
      source={panelImage} 
      style={[
        customStyles.panel,
        size === 'full' && customStyles.fullPanel,
        size === 'medium' && customStyles.mediumPanel,
        size === 'small' && customStyles.smallPanel,
        size === 'smallest' && customStyles.smallestPanel,
        style
      ]}
      resizeMode="stretch"
    >
      {children}
    </ImageBackground>
  );
};

// Progress Bar Component
export const CustomProgressBar = ({ progress, width = 300, height = 20, type = 'bar' }) => {
  // Use a simple colored progress bar for better performance and appearance
  const progressColor = type === 'inGame' 
    ? (progress < 20 ? '#ff1744' : progress < 40 ? '#ff6b35' : '#00ff88')
    : '#4CAF50';
    
  const grooveColor = 'rgba(255, 255, 255, 0.2)';
  
  return (
    <View style={[customStyles.progressContainer, { width, height, backgroundColor: grooveColor, borderRadius: Math.min(height/2, 6) }]}>
      <Animated.View 
        style={[
          customStyles.progressFillAnimated, 
          { 
            width: `${progress}%`, 
            height,
            backgroundColor: progressColor,
            borderRadius: Math.min(height/2, 6),
          }
        ]} 
      />
    </View>
  );
};

// Text Input Box Component
export const CustomTextBox = ({ children, style }) => {
  return (
    <ImageBackground 
      source={Images.textBox} 
      style={[customStyles.textBox, style]}
      resizeMode="stretch"
    >
      {children}
    </ImageBackground>
  );
};

// Tab Button Component
export const TabButton = ({ text, active, onPress, style }) => {
  const buttonImage = active ? Images.tabs.button.active : Images.tabs.button.inactive;
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <ImageBackground 
        source={buttonImage} 
        style={customStyles.tabButton}
        imageStyle={{ borderRadius: 8 }}
        resizeMode="stretch"
      >
        <View style={customStyles.tabButtonTextContainer}>
          <Text style={[customStyles.tabText, active && customStyles.tabTextActive]}>{text}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

// Keyboard Key Component - simplified style like original
export const KeyboardKey = ({ 
  letter, 
  onPress, 
  isSpecial = false, 
  pressed = false,
  animatedValue 
}) => {
  const ButtonWrapper = animatedValue ? Animated.View : View;
  
  return (
    <ButtonWrapper style={[{ transform: animatedValue ? [{ scale: animatedValue }] : [] }]}>
      <TouchableOpacity 
        onPress={() => onPress(letter)} 
        activeOpacity={0.6}
        style={[
          customStyles.keyboardKey,
          isSpecial && customStyles.specialKey,
        ]}
      >
        <Text style={[
          customStyles.keyText,
          letter === 'ENTER' && customStyles.enterKeyText
        ]}>{letter === 'BACKSPACE' ? '⌫' : letter}</Text>
      </TouchableOpacity>
    </ButtonWrapper>
  );
};

// Rating Stars Component
export const RatingStars = ({ rating, maxRating = 3, type = 'inGame' }) => {
  const activeImage = type === 'inGame' 
    ? Images.progress.inGame.rating.active 
    : Images.levelSlot.rating.active;
  const inactiveImage = type === 'inGame' 
    ? Images.progress.inGame.rating.inactive 
    : Images.levelSlot.rating.inactive;
  
  return (
    <View style={customStyles.ratingContainer}>
      {[...Array(maxRating)].map((_, index) => (
        <Image 
          key={index}
          source={index < rating ? activeImage : inactiveImage} 
          style={customStyles.ratingStar}
          resizeMode="contain"
        />
      ))}
    </View>
  );
};

const customStyles = StyleSheet.create({
  // Button Styles
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  largeButton: {
    minWidth: 200,
    minHeight: 60,
    borderRadius: 12,
  },
  smallButton: {
    minWidth: 120,
    minHeight: 44,
    borderRadius: 8,
  },
  smallestButton: {
    minWidth: 100,
    minHeight: 35,
    borderRadius: 8,
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  largeButtonText: {
    fontSize: 18,
  },
  smallButtonText: {
    fontSize: 14,
  },
  smallestButtonText: {
    fontSize: 12,
  },
  
  // Circle Button
  circleButton: {
    width: 60,
    height: 60,
  },
  
  // Close Button
  closeButton: {
    width: 40,
    height: 40,
  },
  
  // Panel Styles
  panel: {
    padding: 20,
  },
  fullPanel: {
    minWidth: 350,
    minHeight: 500,
  },
  mediumPanel: {
    minWidth: 300,
    minHeight: 350,
  },
  smallPanel: {
    minWidth: 250,
    minHeight: 200,
  },
  smallestPanel: {
    minWidth: 200,
    minHeight: 150,
  },
  
  // Progress Bar
  progressContainer: {
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressFillAnimated: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  // Text Box
  textBox: {
    minHeight: 50,
    padding: 10,
    justifyContent: 'center',
  },
  
  // Tab Button
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 100,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButtonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Keyboard Key
  keyboardKey: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 35,
    height: 44,
    margin: 1.5,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  specialKey: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: 50,
  },
  keyText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  enterKeyText: {
    fontSize: 12,
  },
  
  // Rating
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingStar: {
    width: 20,
    height: 20,
  },
});
