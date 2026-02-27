import Foundation

final class DraftEngine {
    // Data
    private(set) var champions: [Champion] = []
    private(set) var synergies: [Synergy] = []
    private(set) var counters: [Counter] = []
    private(set) var championMatchups: [String: ChampionMatchup] = [:]
    private(set) var tierList: TierList?
    private(set) var championMeta: [String: ChampionMeta] = [:]
    
    // Fast lookup
    private(set) var championMap: [String: Champion] = [:]
    
    // Bundle injection for portability and testing
    private let bundle: Bundle
    
    init(bundle: Bundle = .main) {
        self.bundle = bundle
        loadData()
    }
    
    private func loadData() {
        // Helper to load and decode JSON from the provided bundle
        func loadJSON<T: Decodable>(_ resource: String) -> T? {
            let name = (resource as NSString).deletingPathExtension
            let ext = (resource as NSString).pathExtension.isEmpty ? "json" : (resource as NSString).pathExtension
            
            guard let url = bundle.url(forResource: name, withExtension: ext) else {
                print("DraftEngine: Missing resource \(resource) in bundle \(bundle.bundlePath)")
                return nil
            }
            do {
                let data = try Data(contentsOf: url)
                return try JSONDecoder().decode(T.self, from: data)
            } catch {
                print("DraftEngine: Error decoding \(resource): \(error)")
                return nil
            }
        }
        
        // Load champions
        struct ChampionsWrapper: Codable { let champions: [Champion] }
        if let wrapper: ChampionsWrapper = loadJSON("champions.json") {
            self.champions = wrapper.champions
            self.championMap = Dictionary(uniqueKeysWithValues: self.champions.map { ($0.id, $0) })
        } else {
            self.champions = []
            self.championMap = [:]
        }
        
        // Load synergies
        struct SynergiesWrapper: Codable { let synergies: [Synergy] }
        if let wrapper: SynergiesWrapper = loadJSON("synergies.json") {
            self.synergies = wrapper.synergies
        } else {
            self.synergies = []
        }
        
        // Load counters
        struct CountersWrapper: Codable { let counters: [Counter] }
        var allCounters: [Counter] = []
        if let wrapper: CountersWrapper = loadJSON("counters.json") {
            allCounters.append(contentsOf: wrapper.counters)
        }
        if let wrapper: CountersWrapper = loadJSON("champion_counters.json") {
            allCounters.append(contentsOf: wrapper.counters)
        }
        self.counters = allCounters
        
        // Load champion matchups (if any files match the ChampionMatchup array structure)
        // Currently champion_counters.json uses the Counter structure, so we don't load it here.
        self.championMatchups = [:]
        
        // Load tier list
        self.tierList = loadJSON("tier_list.json")
        
        // Load meta
        struct MetaWrapper: Codable { let champion_meta: [String: ChampionMeta] }
        if let wrapper: MetaWrapper = loadJSON("champion_meta.json") {
            self.championMeta = wrapper.champion_meta
        } else {
            self.championMeta = [:]
        }
        
        // Enrich champions with tier data
        if let tiers = tierList?.championTiers {
            for i in 0..<champions.count {
                let id = champions[i].id
                if let info = tiers[id] {
                    var updated = champions[i]
                    updated.tier = info.tier
                    champions[i] = updated
                    championMap[id] = updated
                } else {
                    var updated = champions[i]
                    updated.tier = "B"
                    champions[i] = updated
                    championMap[id] = updated
                }
            }
        }
    }
    
    func getViableChampions(role: String) -> [Champion] {
        let viable = champions.filter { ( $0.roles[role] ?? 0 ) >= 0.5 }
        return viable.sorted { (c1, c2) in
            let v1 = c1.roles[role] ?? 0
            let v2 = c2.roles[role] ?? 0
            return v1 > v2
        }
    }
    
    func getTierScore(championId: String) -> Double {
        guard let tiers = tierList else { return 0.5 }
        if let tierInfo = tiers.championTiers[championId] {
            return tiers.tierScoring[tierInfo.tier] ?? 0.5
        }
        return 0.5
    }
    
    struct TeamAnalysis {
        let earlyPower: Double
        let latePower: Double
        let balanceScore: Double
        let powerCurve: String
        let adCount: Double
        let apCount: Double
    }
    
    func analyzeTeamComposition(team: [String]) -> TeamAnalysis {
        if team.isEmpty {
            return TeamAnalysis(earlyPower: 0.5, latePower: 0.5, balanceScore: 1.0, powerCurve: "mid", adCount: 0, apCount: 0)
        }
        
        var earlyScores: [Double] = []
        var lateScores: [Double] = []
        
        for id in team {
            let meta = championMeta[id]
            earlyScores.append(meta?.earlyImpact ?? 0.5)
            lateScores.append(meta?.lateScaling ?? 0.5)
        }
        
        let avgEarly = earlyScores.reduce(0, +) / Double(earlyScores.count)
        let avgLate = lateScores.reduce(0, +) / Double(lateScores.count)
        
        let balance = 1.0 - abs(avgEarly - avgLate)
        
        var curve = "mid"
        if avgEarly > avgLate + 0.2 {
            curve = "early"
        } else if avgLate > avgEarly + 0.2 {
            curve = "late"
        }
        
        var adCount = 0.0
        var apCount = 0.0
        
        for id in team {
            if let champ = championMap[id] {
                switch champ.damageType {
                case "AD": adCount += 1
                case "AP": apCount += 1
                case "Mixed", "Adaptive":
                    adCount += 0.5
                    apCount += 0.5
                default: break
                }
            }
        }
        
        return TeamAnalysis(earlyPower: avgEarly, latePower: avgLate, balanceScore: balance, powerCurve: curve, adCount: adCount, apCount: apCount)
    }
    
    func calculateFlexScore(championId: String, role: String) -> Double {
        let meta = championMeta[championId]
        let flexRoles = meta?.flexRoles ?? [role]
        let count = flexRoles.count
        
        if count >= 4 { return 0.3 }
        else if count == 3 { return 0.2 }
        else if count == 2 { return 0.1 }
        else { return 0.0 }
    }
    
    func calculateSynergyScore(champion: Champion, team: [String], lang: String = "FR") -> (Double, [String]) {
        var totalScore = 0.0
        var explanations: [String] = []
        var synergyCounts: [String: Int] = [:]
        
        var champTags = Set(champion.kitTags)
        champTags.insert(champion.id)
        
        for teammateId in team {
            guard let teammate = championMap[teammateId] else { continue }
            var teammateTags = Set(teammate.kitTags)
            teammateTags.insert(teammate.id)
            
            for synergy in synergies {
                let synTags = Set(synergy.tags)
                if synTags.count == 2 {
                    let tagsList = Array(synTags)
                    if (champTags.contains(tagsList[0]) && teammateTags.contains(tagsList[1])) ||
                       (champTags.contains(tagsList[1]) && teammateTags.contains(tagsList[0])) {
                        
                        let synergyName = synergy.getName(lang)
                        let count = (synergyCounts[synergyName] ?? 0) + 1
                        synergyCounts[synergyName] = count
                        
                        var multiplier = 1.0
                        if count == 2 { multiplier = 0.75 }
                        else if count == 3 { multiplier = 0.5 }
                        else if count > 3 { multiplier = 0.33 }
                        
                        let contrib = synergy.score * multiplier
                        totalScore += contrib
                        
                        let format = L10n.tr("synergy_with", lang)
                        explanations.append(String(format: format, synergyName, teammate.name, synergy.explanation.get(lang)))
                    }
                }
            }
        }
        
        if !team.isEmpty {
            totalScore = totalScore / Double(team.count)
        }
        
        return (totalScore, explanations)
    }
    
    func calculateCounterScore(champion: Champion, enemyTeam: [String], lang: String = "FR") -> (Double, [String]) {
        var totalScore = 0.0
        var explanations: [String] = []
        
        let champTags = Set(champion.kitTags)
        let champId = champion.id
        
        // Specific matchups from championMatchups (if any)
        if let matchups = championMatchups[champId] {
            if let countersList = matchups.counters {
                for counter in countersList {
                    if enemyTeam.contains(counter.target) {
                        totalScore += counter.strength
                        let enemyName = championMap[counter.target]?.name ?? counter.target
                        let format = L10n.tr("strength_vs", lang)
                        // "%@ — Advantage vs %@: %@" -> champion.name, enemyName, reason
                        explanations.append(String(format: format, champion.name, enemyName, counter.reason.get(lang)))
                    }
                }
            }
            if let strongAgainst = matchups.strongAgainst {
                for strong in strongAgainst {
                    if enemyTeam.contains(strong.target) {
                        totalScore += strong.strength
                        let enemyName = championMap[strong.target]?.name ?? strong.target
                        let format = L10n.tr("strong_against", lang)
                        // "%@ — Strong against %@: %@" -> champion.name, enemyName, reason
                        explanations.append(String(format: format, champion.name, enemyName, strong.reason.get(lang)))
                    }
                }
            }
        }
        
        // Archetype counters & Extended counter data
        for enemyId in enemyTeam {
            guard let enemy = championMap[enemyId] else { continue }
            let enemyTags = Set(enemy.kitTags)
            
            for counter in counters {
                let attackerTags = Set(counter.attackerTags)
                let defenderTags = Set(counter.defenderTags)
                
                // 1. Tag-based match
                let tagMatch = attackerTags.isSubset(of: champTags) && !defenderTags.intersection(enemyTags).isEmpty
                
                // 2. Specific champion match in strong_against
                let specificMatch = counter.strongAgainst?.champions.contains(enemyId) ?? false
                
                if tagMatch || specificMatch {
                    let score = specificMatch ? counter.score * 1.2 : counter.score
                    totalScore += score
                    
                    let exp = specificMatch ? (counter.strongAgainst?.explanation.get(lang) ?? counter.explanation.get(lang)) : counter.explanation.get(lang)
                    let format = L10n.tr("strength_vs", lang)
                    // "%@ — Advantage vs %@: %@" -> champion.name, enemy.name, explanation
                    explanations.append(String(format: format, champion.name, enemy.name, exp))
                }
            }
        }
        
        if !enemyTeam.isEmpty {
            totalScore = totalScore / Double(enemyTeam.count)
        }
        
        return (totalScore, explanations)
    }
    
    func calculateBeingCounteredScore(champion: Champion, enemyTeam: [String], lang: String = "FR") -> (Double, [String]) {
        var totalScore = 0.0
        var explanations: [String] = []
        
        let champTags = Set(champion.kitTags)
        let champId = champion.id
        
        for enemyId in enemyTeam {
            guard let enemy = championMap[enemyId] else { continue }
            
            // Re-check specific matchups from enemy perspective
            if let enemyMatchups = championMatchups[enemyId] {
                if let enemyCounters = enemyMatchups.counters {
                    for counter in enemyCounters {
                        if counter.target == champId {
                            let penalty = abs(counter.strength)
                            totalScore += penalty
                            let format = L10n.tr("hard_countered", lang)
                            // "%@ — Countered by %@: %@" -> champion.name, enemy.name, reason
                            explanations.append(String(format: format, champion.name, enemy.name, counter.reason.get(lang)))
                        }
                    }
                }
                if let enemyStrongAgainst = enemyMatchups.strongAgainst {
                    for strong in enemyStrongAgainst {
                        if strong.target == champId {
                            let penalty = abs(strong.strength)
                            totalScore += penalty
                            let format = L10n.tr("weak_against", lang)
                            // "%@ — Weak against %@: %@" -> champion.name, enemy.name, reason
                            explanations.append(String(format: format, champion.name, enemy.name, strong.reason.get(lang)))
                        }
                    }
                }
            }
            
            // Archetype vulnerabilities & Specific counters
            var enemyTagsWithId = Set(enemy.kitTags)
            enemyTagsWithId.insert(enemy.id)
            
            for counter in counters {
                let attackerTags = Set(counter.attackerTags)
                let defenderTags = Set(counter.defenderTags)
                
                let tagMatch = attackerTags.isSubset(of: enemyTagsWithId) && !defenderTags.intersection(champTags).isEmpty
                let specificMatch = counter.strongAgainst?.champions.contains(champId) ?? false
                
                if tagMatch || specificMatch {
                    let score = specificMatch ? counter.score * 1.2 : counter.score
                    totalScore += score
                    
                    let exp = specificMatch ? (counter.strongAgainst?.explanation.get(lang) ?? counter.explanation.get(lang)) : counter.explanation.get(lang)
                    let format = L10n.tr("countered_by_arch", lang)
                    // "📐 %@ (%@) — %@" -> champion.name, archetype/counter name, explanation
                    explanations.append(String(format: format, champion.name, counter.getName(lang), exp))
                }
            }
        }
        
        if !enemyTeam.isEmpty {
            totalScore = totalScore / Double(enemyTeam.count)
        }
        
        return (totalScore, explanations)
    }
    
    func recommendChampions(role: String, team: [String], enemyTeam: [String], banned: [String], topN: Int = 10, lang: String = "FR") -> [Recommendation] {
        let viable = getViableChampions(role: role)
        let allPicked = Set(team + enemyTeam + banned)
        let filteredViable = viable.filter { !allPicked.contains($0.id) }
        
        let teamAnalysis = analyzeTeamComposition(team: team)
        let teamSize = team.count
        let isJungle = role == "jungle"
        
        var recommendations: [Recommendation] = []
        
        // Precompute weights based on team size
        let weights: [String: Double]
        if teamSize <= 1 {
            // Early draft: prioritize flex picks and strong meta
            weights = ["tier": 0.40, "synergy": 0.20, "counter": 0.40, "vuln": -0.45, "flex": 0.25, "viability": 0.15, "balance": 0.05, "jungle": 0.10]
        } else if teamSize <= 3 {
            // Mid draft: high focus on counters and emerging synergy
            weights = ["tier": 0.25, "synergy": 0.40, "counter": 0.60, "vuln": -0.55, "flex": 0.10, "viability": 0.15, "balance": 0.10, "jungle": 0.10]
        } else {
            // Late draft: max synergy for finalizing the comp + counter-focused
            weights = ["tier": 0.15, "synergy": 0.70, "counter": 0.50, "vuln": -0.70, "flex": 0.05, "viability": 0.10, "balance": 0.20, "jungle": 0.10]
        }
        
        for champ in filteredViable {
            let champId = champ.id
            let meta = championMeta[champId]
            
            let (synergyScore, synergyExp) = calculateSynergyScore(champion: champ, team: team, lang: lang)
            let (counterScore, counterExp) = calculateCounterScore(champion: champ, enemyTeam: enemyTeam, lang: lang)
            let (vulnScore, vulnExp) = calculateBeingCounteredScore(champion: champ, enemyTeam: enemyTeam, lang: lang)
            let tierScore = getTierScore(championId: champId)
            let flexScore = calculateFlexScore(championId: champId, role: role)
            
            let earlyImpact = meta?.earlyImpact ?? 0.5
            let lateScaling = meta?.lateScaling ?? 0.5
            
            var balanceBonus = 0.0
            if teamAnalysis.powerCurve == "early" && lateScaling > 0.7 {
                balanceBonus = 0.15
            } else if teamAnalysis.powerCurve == "late" && earlyImpact > 0.7 {
                balanceBonus = 0.15
            } else {
                balanceBonus = teamAnalysis.balanceScore * 0.05
            }
            
            var earlyJungleBonus = 0.0
            if isJungle && earlyImpact > 0.7 {
                earlyJungleBonus = earlyImpact * 0.1
            }
            
            var damageBalanceBonus = 0.0
            var finalSynergyExp = synergyExp
            
            if teamAnalysis.adCount >= 2.5 && teamAnalysis.apCount < 1.5 {
                if champ.damageType == "AP" {
                    damageBalanceBonus = 0.20
                    finalSynergyExp.insert(L10n.tr("need_ap", lang), at: 0)
                } else if ["Mixed", "Adaptive"].contains(champ.damageType) {
                    damageBalanceBonus = 0.10
                    finalSynergyExp.insert(L10n.tr("mixed_useful", lang), at: 0)
                }
            } else if teamAnalysis.apCount >= 2.5 && teamAnalysis.adCount < 1.5 {
                if champ.damageType == "AD" {
                    damageBalanceBonus = 0.20
                    finalSynergyExp.insert(L10n.tr("need_ad", lang), at: 0)
                } else if ["Mixed", "Adaptive"].contains(champ.damageType) {
                    damageBalanceBonus = 0.10
                    finalSynergyExp.insert(L10n.tr("mixed_useful", lang), at: 0)
                }
            }
            
            if balanceBonus > 0 && teamAnalysis.powerCurve == "early" {
                finalSynergyExp.append(L10n.tr("balance_early", lang))
            } else if balanceBonus > 0 && teamAnalysis.powerCurve == "late" {
                finalSynergyExp.append(L10n.tr("balance_late", lang))
            }
            
            let roleViability = champ.roles[role] ?? 0
            
            let totalScore = (tierScore * weights["tier"]!) +
                             (synergyScore * weights["synergy"]!) +
                             (counterScore * weights["counter"]!) +
                             (vulnScore * weights["vuln"]!) +
                             (flexScore * weights["flex"]!) +
                             (roleViability * weights["viability"]!) +
                             (balanceBonus * weights["balance"]!) +
                             (earlyJungleBonus * weights["jungle"]!) +
                             damageBalanceBonus
            
            recommendations.append(Recommendation(
                champion: champ,
                totalScore: totalScore,
                tierScore: tierScore,
                tierName: champ.tier ?? "B",
                synergyScore: synergyScore,
                counterScore: counterScore,
                vulnerabilityScore: vulnScore,
                flexScore: flexScore,
                earlyImpact: earlyImpact,
                lateScaling: lateScaling,
                balanceBonus: balanceBonus,
                synergyExplanations: finalSynergyExp,
                counterExplanations: counterExp,
                vulnerabilityExplanations: vulnExp
            ))
        }
        
        return Array(recommendations.sorted { $0.totalScore > $1.totalScore }.prefix(topN))
    }
}
