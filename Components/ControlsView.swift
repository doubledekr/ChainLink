import SwiftUI

struct ControlsView: View {
    @Binding var word1: String
    @Binding var word2: String
    @Binding var word3: String
    @Binding var gameStarted: Bool
    @Binding var gameEnded: Bool
    @Binding var resultMessage: String
    @Binding var puzzleSuccess: Bool
    
    var body: some View {
        HStack(spacing: 15) {
            Button(action: {
                let (valid, message) = validateChain(word1: word1, word2: word2, word3: word3)
                puzzleSuccess = valid
                resultMessage = message
                gameEnded = true
            }) {
                Text("Submit Chain")
                    .modifier(ButtonModifier())
            }
            .disabled(!gameStarted || gameEnded)
        }
        .padding()
    }
}

struct ButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.blue)
            .foregroundColor(.white)
            .font(.headline.bold())
            .cornerRadius(8)
    }
}