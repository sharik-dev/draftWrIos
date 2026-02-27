import Foundation

struct Champion: Codable, Identifiable {
    let id: String
    let name: String
    let roles: [String: Double]
    let kitTags: [String]
    let damageType: String
    let scaling: String
    let description: LocalizedText
    let imageUrl: String
    var tier: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, roles, description
        case kitTags = "kit_tags"
        case damageType = "damage_type"
        case scaling
        case imageUrl = "image_url"
        case tier
    }
}

struct Synergy: Codable {
    let name: String
    let tags: [String]
    let score: Double
    let explanation: LocalizedText
}

struct Counter: Codable {
    let name: String
    let attackerTags: [String]
    let defenderTags: [String]
    let score: Double
    let explanation: LocalizedText
    
    enum CodingKeys: String, CodingKey {
        case name, score, explanation
        case attackerTags = "attacker_tags"
        case defenderTags = "defender_tags"
    }
}

struct ChampionMatchup: Codable {
    let champion: String
    let counters: [MatchupDetail]?
    let strongAgainst: [MatchupDetail]?
    
    enum CodingKeys: String, CodingKey {
        case champion, counters
        case strongAgainst = "strong_against"
    }
}

struct MatchupDetail: Codable {
    let target: String
    let strength: Double
    let reason: LocalizedText
}

struct LocalizedText: Codable {
    let fr: String
    let en: String
    
    func get(_ lang: String) -> String {
        return lang.uppercased() == "EN" ? en : fr
    }
}

struct TierList: Codable {
    let tierScoring: [String: Double]
    let championTiers: [String: TierInfo]
    
    enum CodingKeys: String, CodingKey {
        case tierScoring = "tier_scoring"
        case championTiers = "champion_tiers"
    }
}

struct TierInfo: Codable {
    let tier: String
}

struct ChampionMeta: Codable {
    let earlyImpact: Double?
    let lateScaling: Double?
    let flexRoles: [String]?
    
    enum CodingKeys: String, CodingKey {
        case earlyImpact = "early_impact"
        case lateScaling = "late_scaling"
        case flexRoles = "flex_roles"
    }
}

struct Recommendation: Identifiable {
    let id = UUID()
    let champion: Champion
    let totalScore: Double
    let tierScore: Double
    let tierName: String
    let synergyScore: Double
    let counterScore: Double
    let vulnerabilityScore: Double
    let flexScore: Double
    let earlyImpact: Double
    let lateScaling: Double
    let balanceBonus: Double
    let synergyExplanations: [String]
    let counterExplanations: [String]
    let vulnerabilityExplanations: [String]
}

// Simple aggregated stats used by TeamStatsView
struct TeamStats {
    let adPercent: Int          // 0..100
    let apPercent: Int          // 0..100
    let timeScore: Double       // 0..100 (0 early, 100 late)
    let damageScore: Double     // 0..3
    let damagePercent: Double   // 0..100
}

