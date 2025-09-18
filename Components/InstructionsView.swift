import SwiftUI

struct InstructionsView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("How to Play:")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 5) {
                Text("• Fill in 3 words to connect the start word to the end word")
                Text("• Each word must share at least 2 letters with the adjacent word")
                Text("• All words must be valid English words")
                Text("• You have 60 seconds once you start typing")
            }
            .foregroundColor(.gray)
            .font(.subheadline)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}