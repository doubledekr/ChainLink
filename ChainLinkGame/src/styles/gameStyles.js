import { StyleSheet } from 'react-native';

export const gameStyles = StyleSheet.create({
  // Word display styles
  puzzleArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  wordDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordContainer: {
    marginVertical: 4,
    alignItems: 'center',
  },
  inputContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  // Letter tile styles
  letterTile: {
    backgroundColor: '#ffd54f',
    width: 65,
    height: 65,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 4,
    borderTopColor: '#fff176',
    borderLeftColor: '#fff176',
    borderRightColor: '#ff8f00',
    borderBottomColor: '#ff8f00',
    shadowColor: '#d84315',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  letterText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5d4037',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  emptyLetterTile: {
    backgroundColor: 'rgba(255, 213, 79, 0.3)',
    width: 65,
    height: 65,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 3,
    borderColor: 'rgba(255, 213, 79, 0.6)',
    borderStyle: 'dashed',
  },
  emptyLetterText: {
    fontSize: 26,
    color: 'rgba(255, 213, 79, 0.8)',
    fontWeight: 'bold',
  },
  errorTile: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff0000'
  },
  successTile: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32'
  },
  
  // Streak animation styles
  streakOverlay: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    pointerEvents: 'none',
  },
  fireEmojiContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fireEmoji: {
    fontSize: 36,
    marginHorizontal: 4,
    textShadowColor: 'rgba(255, 140, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  streakText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
