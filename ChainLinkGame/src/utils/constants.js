// Keyboard layout for the game
export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

// Comprehensive word database organized by difficulty and letter diversity
export const WORD_DATABASE = {
  // Easy words - common letters, familiar words
  easy: [
    "TOWER", "BEACH", "WATER", "REACH", "HEART", "SPACE", "EARTH", "CHART",
    "HOUSE", "RIVER", "HORSE", "CHAIR", "TABLE", "PHONE", "PAPER", "PLACE",
    "WORLD", "BREAD", "CLEAN", "CLEAR", "LIGHT", "PLANT", "STONE", "FLAME"
  ],
  
  // Medium words - mix of common/uncommon letters
  medium: [
    "STORM", "PEACE", "CREAM", "STEAM", "MAGIC", "TRUTH", "MATCH", "TEACH",
    "BRAVE", "SMILE", "BLAME", "SCALE", "DREAM", "TREND", "MUSIC", "DANCE",
    "SONIC", "PANIC", "OCEAN", "PLANE", "CROWN", "CLOWN", "GROWN", "SLANT",
    "SHARP", "SMART", "START", "SPORT", "SHORT", "SHIRT", "SHIFT", "SHELF"
  ],
  
  // Hard words - uncommon letters, challenging combinations
  hard: [
    "PROXY", "QUILT", "ZEBRA", "FJORD", "WALTZ", "BLITZ", "QUIRK", "ZESTY",
    "JUMPY", "FIZZY", "JAZZY", "DIZZY", "FUZZY", "PIZZA", "BUZZ", "FRIZZ",
    "EXPAT", "SIXTH", "WRECK", "XERUS", "YACHT", "YOUTH", "ZONAL", "ZOWIE"
  ],
  
  // Vowel-heavy words for different challenges
  vowelHeavy: [
    "AUDIO", "ADIEU", "OUIJA", "QUEUE", "EERIE", "OZONE", "AZURE", "AGILE",
    "AISLE", "ALIEN", "ALIVE", "ALONE", "ARISE", "AWAKE", "EAGLE", "EARLY"
  ],
  
  // Consonant clusters for complexity
  consonantHeavy: [
    "CRYPT", "LYMPH", "PSYCH", "GHOST", "THUMB", "CRUMB", "PLUMB", "DWELL",
    "SWIFT", "SWIRL", "SWEPT", "SWING", "TWIST", "FROST", "TRUST", "CRUSH"
  ]
};

// Fallback words for when API fails
export const FALLBACK_WORDS = [
  "TOWER", "BEACH", "WATER", "REACH", "HEART", "SPACE", "EARTH", "CHART",
  "HOUSE", "RIVER", "HORSE", "CHAIR", "TABLE", "PHONE", "PAPER", "PLACE",
  "WORLD", "BREAD", "CLEAN", "CLEAR", "LIGHT", "PLANT", "STONE", "FLAME"
];

// Game configuration constants
export const GAME_CONFIG = {
  INITIAL_TIME: 30,
  MIN_TIME: 15,
  ROUNDS_PER_GAME: 10,
  LEVEL_UP_THRESHOLD: 5,
  MIN_SHARED_LETTERS: 2,
  TIMER_INTERVAL: 100, // milliseconds
  WORD_LENGTH: 5
};

// Scoring configuration
export const SCORING = {
  BASE_POINTS: 100,
  TIME_MULTIPLIER: 10,
  SKIP_PENALTY: -50,
  MAX_STREAK_MULTIPLIER: 10,
  LEVEL_BONUS_MULTIPLIER: 5,
  SPEED_BONUS: {
    SUPER_FAST: 100, // 80%+ time left
    FAST: 50,        // 60%+ time left
    MEDIUM: 25       // 40%+ time left
  }
};

// Animation durations
export const ANIMATIONS = {
  KEY_PRESS_DURATION: 50,
  SUCCESS_MESSAGE_DURATION: 400,
  SUCCESS_MESSAGE_HOLD: 1200,
  STREAK_ANIMATION_DURATION: 300,
  STREAK_ANIMATION_HOLD: 1500,
  CONFIRM_ANIMATION_DURATION: 200
};

// Timer thresholds for speed bonuses
export const TIMER_THRESHOLDS = {
  SUPER_FAST: 0.8, // 80% of initial time
  FAST: 0.6,       // 60% of initial time
  MEDIUM: 0.4      // 40% of initial time
};

// API endpoints
export const API_ENDPOINTS = {
  DICTIONARY: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  RANDOM_WORDS: 'https://random-words-api.vercel.app/word'
};

// Game modes
export const GAME_MODES = {
  SINGLE: 'single',
  MULTIPLAYER: 'multiplayer'
};

// Error types
export const ERROR_TYPES = {
  INVALID: 'invalid',
  SUCCESS: 'success',
  SKIPPED: 'skipped'
};

// UI constants
export const UI_CONSTANTS = {
  FONT_FAMILY: 'Bodoni Moda',
  PRIMARY_COLOR: '#1EB2E8',
  SUCCESS_COLOR: '#4CAF50',
  ERROR_COLOR: '#ff6b6b',
  WARNING_COLOR: '#ff6b35'
};
