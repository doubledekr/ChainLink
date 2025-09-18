import SwiftUI

enum WordValidation {
    case neutral
    case valid(String)
    case invalid(String)
}

struct ValidatedWordInput: View {
    @Binding var word: String
    @Binding var feedback: WordValidation
    let label: String
    
    var body: some View {
        VStack(spacing: 4) {
            TextField(label, text: $word)
                .textCase(.uppercase)
                .padding()
                .font(.title3.bold())
                .multilineTextAlignment(.center)
                .frame(maxWidth: 300)
                .background(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(borderColor, lineWidth: 2)
                )
                .cornerRadius(8)
            
            switch feedback {
            case .neutral:
                EmptyView()
            case .valid(let msg):
                Text(msg).font(.footnote).foregroundColor(.green)
            case .invalid(let msg):
                Text(msg).font(.footnote).foregroundColor(.red)
            }
        }
    }
    
    private var borderColor: Color {
        switch feedback {
        case .neutral: return Color(.systemGray3)
        case .valid: return .green
        case .invalid: return .red
        }
    }
}