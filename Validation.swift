import Foundation

let validWords: Set<String> = [
    "TOWER", "POWER", "WATER", "LATER", "LASER", "BEACH", "REACH", "TEACH", "PEACH",
    "PROWL", "GROWL", "BROWN", "CROWN", "FROWN", "DROWN", "SHOWN", "BLOWN", "FLOWN",
    "LOWER", "MOWER", "BOWER", "COWER", "SOWER", "ROWER", "VOTER", "NOTER", "OUTER",
    "ROUTE", "ABOUT", "SHOUT", "SCOUT", "CLOUT", "FLOUT", "GROUT", "SNOUT",
    "LAGER", "EAGER", "WAGER", "CAGER", "PAGER", "SAGER", "GAMER", "TAMER",
    "MAKER", "BAKER", "TAKER", "FAKER", "WAKER", "RAKER", "CAKER", "LAKER", "SAKER",
    "BRACE", "GRACE", "TRACE", "PLACE", "SPACE", "PEACE", "LEASE", "TEASE", "CEASE",
    "HEART", "START", "SMART", "CHART", "APART", "PARTY", "EARLY", "PEARL", "LEARN",
    "EARTH", "WORTH", "NORTH", "FORTH", "BIRTH", "GIRTH", "MIRTH", "BERTH", "PERTH"
]

func isValidWord(_ word: String) -> Bool {
    validWords.contains(word.uppercased())
}

func sharedLetters(_ word1: String, _ word2: String) -> Int {
    let letters1 = Array(word1.uppercased())
    let letters2 = Array(word2.uppercased())
    
    var freq1: [Character: Int] = [:]
    var freq2: [Character: Int] = [:]
    
    for l in letters1 { freq1[l, default: 0] += 1 }
    for l in letters2 { freq2[l, default: 0] += 1 }
    
    var count = 0
    for (letter, c1) in freq1 {
        if let c2 = freq2[letter] {
            count += min(c1, c2)
        }
    }
    return count
}

func validateWord(_ word: String, prev: String?, next: String?) -> WordValidation {
    let w = word.uppercased().trimmingCharacters(in: .whitespaces)
    if w.isEmpty { return .neutral }
    
    if !isValidWord(w) {
        return .invalid("❌ \(w) is not a valid word")
    }
    
    if let p = prev, !p.isEmpty {
        let shared = sharedLetters(p, w)
        if shared < 2 {
            return .invalid("❌ Shares only \(shared) with \(p)")
        }
    }
    
    if let n = next, !n.isEmpty {
        let shared = sharedLetters(w, n)
        if shared < 2 {
            return .invalid("❌ Shares only \(shared) with \(n)")
        }
    }
    
    return .valid("✅ \(w) looks good")
}

func validateChain(word1: String, word2: String, word3: String) -> (Bool, String) {
    let startWord = "TOWER"
    let endWord = "BEACH"
    
    let words = [word1.uppercased(), word2.uppercased(), word3.uppercased()]
    
    for word in words {
        if !isValidWord(word) {
            return (false, "❌ \(word) is not a valid word.")
        }
    }
    
    let pairs = [
        (startWord, words[0]),
        (words[0], words[1]),
        (words[1], words[2]),
        (words[2], endWord)
    ]
    
    for (a, b) in pairs {
        let shared = sharedLetters(a, b)
        if shared < 2 {
            return (false, "❌ \(a) and \(b) only share \(shared) letter(s). Need 2+.")
        }
    }
    
    return (true, "✅ Chain is valid!")
}