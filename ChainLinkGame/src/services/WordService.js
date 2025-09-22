import { WORD_DATABASE, FALLBACK_WORDS, API_ENDPOINTS, GAME_CONFIG } from '../utils/constants';

class WordService {
  /**
   * Check if a word is valid using the dictionary API
   * @param {string} word - The word to validate
   * @returns {Promise<boolean>} - True if word is valid
   */
  static async checkWord(word) {
    try {
      console.log(`🌐 Making API call for word: ${word}`);
      const response = await fetch(`${API_ENDPOINTS.DICTIONARY}/${word}`);
      
      if (!response.ok) {
        console.log(`❌ Word "${word}" not found in dictionary`);
        return false;
      }
      
      console.log(`✅ Word "${word}" is valid`);
      return true;
    } catch (err) {
      console.log(`🚨 API error for "${word}":`, err);
      return false;
    }
  }

  /**
   * Smart word selection algorithm for challenging and diverse puzzles
   * @param {number} count - Number of words to select
   * @param {number} currentRound - Current round number
   * @param {string[]} previousWords - Previously used words to avoid repetition
   * @returns {string[]} - Array of selected words
   */
  static selectSmartWords(count = 2, currentRound = 1, previousWords = []) {
    console.log(`🧠 Smart word selection: Round ${currentRound}, Previous: ${previousWords.join(', ')}`);
    
    // Determine difficulty based on round progression
    let difficultyMix;
    if (currentRound <= 3) {
      difficultyMix = { easy: 0.6, medium: 0.3, hard: 0.1 }; // Start easier
    } else if (currentRound <= 7) {
      difficultyMix = { easy: 0.3, medium: 0.5, hard: 0.2 }; // Increase difficulty
    } else {
      difficultyMix = { easy: 0.2, medium: 0.4, hard: 0.4 }; // High difficulty
    }
    
    // Analyze previous words to avoid repetition
    const usedLetters = new Set();
    const usedPatterns = new Set();
    previousWords.forEach(word => {
      word.split('').forEach(letter => usedLetters.add(letter));
      usedPatterns.add(word.substring(0, 2)); // Track word patterns
      usedPatterns.add(word.substring(-2)); // Track ending patterns
    });
    
    // Score words based on diversity and challenge
    const scoreWord = (word) => {
      let score = 0;
      
      // Diversity bonus - prefer words with new letters
      const wordLetters = new Set(word.split(''));
      const newLetters = [...wordLetters].filter(letter => !usedLetters.has(letter));
      score += newLetters.length * 10; // +10 per new letter
      
      // Pattern diversity - avoid similar word patterns
      const startPattern = word.substring(0, 2);
      const endPattern = word.substring(-2);
      if (!usedPatterns.has(startPattern)) score += 15;
      if (!usedPatterns.has(endPattern)) score += 15;
      
      // Letter frequency challenge - prefer less common letters
      const uncommonLetters = ['Q', 'X', 'Z', 'J', 'K', 'V', 'W', 'Y'];
      const uncommonCount = word.split('').filter(letter => uncommonLetters.includes(letter)).length;
      score += uncommonCount * 8; // +8 per uncommon letter
      
      // Vowel/consonant balance
      const vowels = word.split('').filter(letter => 'AEIOU'.includes(letter)).length;
      const idealVowels = 2; // Ideal 2 vowels per word
      score += 5 - Math.abs(vowels - idealVowels) * 2; // Penalty for too many/few vowels
      
      return score;
    };
    
    // Create candidate pool based on difficulty mix
    const candidates = [];
    
    // Add words from each difficulty category
    Object.entries(difficultyMix).forEach(([difficulty, ratio]) => {
      const categoryWords = WORD_DATABASE[difficulty] || [];
      const neededCount = Math.ceil(count * ratio * 3); // Get extra for selection
      const shuffled = [...categoryWords].sort(() => Math.random() - 0.5);
      candidates.push(...shuffled.slice(0, neededCount));
    });
    
    // Add special category words for variety
    if (Math.random() < 0.3) { // 30% chance for vowel-heavy
      candidates.push(...WORD_DATABASE.vowelHeavy.slice(0, 2));
    }
    if (Math.random() < 0.2) { // 20% chance for consonant-heavy
      candidates.push(...WORD_DATABASE.consonantHeavy.slice(0, 2));
    }
    
    // Score all candidates and select best ones
    const scoredWords = candidates
      .filter(word => !previousWords.includes(word)) // Avoid recent words
      .map(word => ({ word, score: scoreWord(word) }))
      .sort((a, b) => b.score - a.score); // Sort by score descending
    
    // Select top scoring words with some randomness
    const selectedWords = [];
    for (let i = 0; i < count && i < scoredWords.length; i++) {
      // Add some randomness - pick from top 5 candidates
      const candidateIndex = Math.floor(Math.random() * Math.min(5, scoredWords.length - i));
      selectedWords.push(scoredWords[candidateIndex].word);
      scoredWords.splice(candidateIndex, 1); // Remove selected word
    }
    
    console.log(`🎯 Smart selection result: ${selectedWords.join(', ')}`);
    return selectedWords;
  }

  /**
   * Fetch random words using smart selection algorithm
   * @param {number} count - Number of words to fetch
   * @returns {Promise<string[]>} - Array of words
   */
  static async fetchRandomWords(count = 2) {
    try {
      console.log(`🎲 Generating ${count} smart words`);
      
      // Use smart word selection instead of API
      const words = this.selectSmartWords(count, 1, []);
      
      console.log(`✅ Got smart words: ${words.join(', ')}`);
      return words;
    } catch (err) {
      console.log(`🚨 Error in smart word generation:`, err);
      // Fallback to simple random selection
      const allWords = Object.values(WORD_DATABASE).flat();
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
  }

  /**
   * Generate a fresh puzzle with two words
   * @returns {Promise<{start: string, end: string}>} - Puzzle object
   */
  static async generateFreshPuzzle() {
    try {
      console.log('🎮 Generating fresh puzzle...');
      const words = await this.fetchRandomWords(2);
      const startWord = words[0];
      const endWord = words[1];
      
      console.log(`🎯 New puzzle: ${startWord} → ${endWord}`);
      return { start: startWord, end: endWord };
    } catch (err) {
      console.log('🚨 Error generating puzzle, using fallback');
      const shuffled = [...FALLBACK_WORDS].sort(() => Math.random() - 0.5);
      return { start: shuffled[0], end: shuffled[1] };
    }
  }

  /**
   * Calculate shared letters between two words
   * @param {string} word1 - First word
   * @param {string} word2 - Second word
   * @returns {number} - Number of shared letters
   */
  static getSharedLetters(word1, word2) {
    const letters1 = word1.toLowerCase().split('');
    const letters2 = word2.toLowerCase().split('');
    
    // Count frequency of each letter in both words
    const freq1 = {};
    const freq2 = {};
    
    letters1.forEach(letter => freq1[letter] = (freq1[letter] || 0) + 1);
    letters2.forEach(letter => freq2[letter] = (freq2[letter] || 0) + 1);
    
    // Count shared letters (minimum of frequencies)
    let sharedCount = 0;
    for (const letter in freq1) {
      if (freq2[letter]) {
        sharedCount += Math.min(freq1[letter], freq2[letter]);
      }
    }
    
    return sharedCount;
  }

  /**
   * Validate if a word can bridge two other words
   * @param {string} word - The bridge word to validate
   * @param {string} startWord - The starting word
   * @param {string} endWord - The ending word
   * @returns {Promise<boolean>} - True if valid bridge word
   */
  static async validateBridgeWord(word, startWord, endWord) {
    console.log(`🔍 Validating bridge word: ${word} between ${startWord} and ${endWord}`);
    
    // First check if it's a valid English word
    const isValidWord = await this.checkWord(word);
    if (!isValidWord) {
      console.log(`❌ "${word}" is not a valid English word`);
      return false;
    }
    
    // Then check if it bridges the two words (shares ≥2 letters with both)
    const sharedWithStart = this.getSharedLetters(word, startWord);
    const sharedWithEnd = this.getSharedLetters(word, endWord);
    
    console.log(`📊 Letter sharing: ${word} shares ${sharedWithStart} with ${startWord}, ${sharedWithEnd} with ${endWord}`);
    
    if (sharedWithStart >= GAME_CONFIG.MIN_SHARED_LETTERS && sharedWithEnd >= GAME_CONFIG.MIN_SHARED_LETTERS) {
      console.log(`✅ "${word}" is a valid bridge word!`);
      return true;
    } else {
      console.log(`❌ "${word}" doesn't share enough letters`);
      return false;
    }
  }

  /**
   * Fetch words for chaining in the next puzzle
   * @param {number} count - Number of words to fetch
   * @param {number} solved - Number of puzzles solved
   * @param {string[]} previousWords - Previous words to avoid
   * @returns {Promise<string[]>} - Array of words for chaining
   */
  static async fetchWordsForChaining(count = 1, solved = 0, previousWords = []) {
    try {
      console.log(`🎲 Fetching ${count} words for chaining`);
      
      // Use smart word selection with current progress
      const words = this.selectSmartWords(count, solved + 1, previousWords);
      
      console.log(`✅ Got chaining words: ${words.join(', ')}`);
      return words;
    } catch (err) {
      console.log(`🚨 Error fetching chaining words:`, err);
      // Fallback to simple random selection
      const allWords = Object.values(WORD_DATABASE).flat();
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
  }
}

export default WordService;
