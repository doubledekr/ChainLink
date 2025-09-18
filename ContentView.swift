import SwiftUI
import Combine

struct ContentView: View {
    @State private var timeRemaining = 60
    @State private var gameStarted = false
    @State private var gameEnded = false
    @State private var resultMessage = ""
    @State private var puzzleSuccess = false
    
    @State private var word1 = ""
    @State private var word2 = ""
    @State private var word3 = ""
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        VStack(spacing: 20) {
            VStack {
                Text("🔗 Chain Link")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                Text("Connect the words by sharing letters")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                Text(timerText)
                    .font(.headline)
                    .foregroundColor(timeRemaining <= 10 ? .orange : .red)
            }
            .multilineTextAlignment(.center)
            
            if !gameEnded {
                InstructionsView()
                GameAreaView(
                    word1: $word1,
                    word2: $word2,
                    word3: $word3,
                    gameStarted: $gameStarted,
                    timeRemaining: $timeRemaining,
                    gameEnded: $gameEnded
                )
                ControlsView(
                    word1: $word1,
                    word2: $word2,
                    word3: $word3,
                    gameStarted: $gameStarted,
                    gameEnded: $gameEnded,
                    resultMessage: $resultMessage,
                    puzzleSuccess: $puzzleSuccess
                )
            } else {
                VStack(spacing: 20) {
                    Text(puzzleSuccess ? "🎉 Success!" : "❌ Failed")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(puzzleSuccess ? .green : .red)
                    Text(resultMessage)
                        .font(.headline)
                        .multilineTextAlignment(.center)
                    Button("Try Again") {
                        resetGame()
                    }
                    .modifier(ButtonModifier())
                }
            }
        }
        .padding()
        .onReceive(timer) { _ in
            if gameStarted && !gameEnded && timeRemaining > 0 {
                timeRemaining -= 1
            }
            
            if timeRemaining == 0 && !gameEnded {
                let (valid, message) = validateChain(word1: word1, word2: word2, word3: word3)
                puzzleSuccess = valid
                resultMessage = "⏰ Time’s Up! \(message)"
                gameEnded = true
            }
        }
    }
    
    private var timerText: String {
        if gameStarted && !gameEnded {
            let minutes = timeRemaining / 60
            let seconds = timeRemaining % 60
            return "⏰ \(minutes):\(String(format: "%02d", seconds)) remaining"
        } else if gameEnded {
            return "⏰ Game Over"
        } else {
            return "⏰ Type your first word to start!"
        }
    }
    
    private func resetGame() {
        word1 = ""
        word2 = ""
        word3 = ""
        gameStarted = false
        gameEnded = false
        timeRemaining = 60
        resultMessage = ""
        puzzleSuccess = false
    }
}