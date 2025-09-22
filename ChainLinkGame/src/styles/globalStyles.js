import { StyleSheet } from 'react-native';
import { UI_CONSTANTS } from '../utils/constants';

export const globalStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: UI_CONSTANTS.PRIMARY_COLOR, // NYT-style blue background
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameBoard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 0,
    paddingHorizontal: 15,
  },
  
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
  },
  rulesButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  
  // Timer styles
  timerContainer: {
    alignItems: 'center',
    marginVertical: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  timerMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  timerMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b35',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 107, 53, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressBar: {
    width: 300,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  speedBonusContainer: {
    marginTop: 10,
    height: 25,
    justifyContent: 'center',
  },
  speedBonusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  
  // Button styles
  simpleButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  simpleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 8,
    minWidth: 200,
  },
  primaryButtonText: {
    color: UI_CONSTANTS.PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  multiplayerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 8,
    minWidth: 200,
  },
  multiplayerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 8,
    minWidth: 200,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Feedback styles
  feedbackContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    position: 'relative',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
  },
  animatedSuccessContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 10,
  },
  feedback: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  feedbackError: {
    color: UI_CONSTANTS.ERROR_COLOR,
  },
  feedbackSuccess: {
    color: 'white',
  },
  
  // Controls styles
  controlsContainer: {
    minHeight: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  
  // Keyboard styles
  keyboard: {
    width: '100%',
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 8,
    marginTop: 'auto',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
    paddingHorizontal: 2,
  },
});
