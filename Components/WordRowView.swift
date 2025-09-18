import SwiftUI

struct WordRowView: View {
    let letters: [String]
    let isStartEnd: Bool
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(letters, id: \.self) { letter in
                Text(letter)
                    .frame(width: 50, height: 50)
                    .background(isStartEnd ? Color.blue : Color(.systemGray6))
                    .foregroundColor(isStartEnd ? .white : .black)
                    .font(.title2.bold())
                    .cornerRadius(8)
            }
        }
    }
}