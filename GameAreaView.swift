import SwiftUI

struct GameAreaView: View {
    @Binding var word1: String
    @Binding var word2: String
    @Binding var word3: String
    @Binding var gameStarted: Bool
    @Binding var timeRemaining: Int
    @Binding var gameEnded: Bool
    
    @State private var feedback1: WordValidation = .neutral
    @State private var feedback2: WordValidation = .neutral
    @State private var feedback3: WordValidation = .neutral
    
    var body: some View {
        VStack(spacing: 15) {
            WordRowView(letters: ["T","O","W","E","R"], isStartEnd: true)
            
            ValidatedWordInput(word: $word1, feedback: $feedback1, label: "Enter word 1")
                .onChange(of: word1) { _ in validateInputs() }
            
            ValidatedWordInput(word: $word2, feedback: $feedback2, label: "Enter word 2")
                .onChange(of: word2) { _ in validateInputs() }
            
            ValidatedWordInput(word: $word3, feedback: $feedback3, label: "Enter word 3")
                .onChange(of: word3) { _ in validateInputs() }
            
            WordRowView(letters: ["B","E","A","C","H"], isStartEnd: true)
        }
        .padding(.vertical, 20)
    }
    
    private func validateInputs() {
        if !gameStarted, !(word1 + word2 + word3).isEmpty {
            gameStarted = true
            gameEnded = false
            timeRemaining = 60
        }
        
        feedback1 = validateWord(word1, prev: "TOWER", next: word2)
        feedback2 = validateWord(word2, prev: word1, next: word3)
        feedback3 = validateWord(word3, prev: word2, next: "BEACH")
    }
}