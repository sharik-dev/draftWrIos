import SwiftUI
import Combine

class DraftViewModel: ObservableObject {
    @Published var engine = DraftEngine()
    
    // Localisation
    @Published var language: String = "FR"
    
    // Draft State
    @Published var teamPicks: [Champion?] = Array(repeating: nil, count: 5)
    @Published var enemyPicks: [Champion?] = Array(repeating: nil, count: 5)
    @Published var bannedChampions: [String] = []
    
    // UI State
    @Published var recommendations: [Recommendation] = []
    @Published var filters = FilterState()
    @Published var activeSlot: SlotSelection?
    @Published var loading = false
    
    // Counter Lookup state
    @Published var lookupTarget: Champion?
    @Published var lookupRole: String = "top"
    @Published var lookupResults: [Recommendation] = []
    
    struct FilterState {
        var role: String = "top"
        var search: String = ""
    }
    
    struct SlotSelection {
        var side: Side
        var index: Int
        
        enum Side { case ally, enemy }
    }
    
    let slotRoles = ["top", "jungle", "mid", "adc", "support"]
    
    init() {
        updateRecommendations()
    }
    
    func selectSlot(side: SlotSelection.Side, index: Int) {
        activeSlot = SlotSelection(side: side, index: index)
        filters.role = slotRoles[index]
        updateRecommendations()
    }
    
    func updateRecommendations() {
        let teamIds = teamPicks.compactMap { $0?.id }
        let enemyIds = enemyPicks.compactMap { $0?.id }
        
        // If selecting for enemy, we want recommendations that synergize with enemy and counter ally
        let isSelectingEnemy = activeSlot?.side == .enemy
        let apiTeam = isSelectingEnemy ? enemyIds : teamIds
        let apiEnemy = isSelectingEnemy ? teamIds : enemyIds
        
        recommendations = engine.recommendChampions(
            role: filters.role,
            team: apiTeam,
            enemyTeam: apiEnemy,
            banned: bannedChampions,
            topN: 50
        )
        
        // Apply search filter
        if !filters.search.isEmpty {
            recommendations = recommendations.filter {
                $0.champion.name.lowercased().contains(filters.search.lowercased())
            }
        }
    }
    
    func updateLookupResults() {
        guard let target = lookupTarget else {
            lookupResults = []
            return
        }
        
        // Recommande des champions efficaces contre la cible sur le rôle choisi
        lookupResults = engine.recommendChampions(
            role: lookupRole,
            team: [],
            enemyTeam: [target.id],
            banned: [],
            topN: 50
        )
    }
    
    func pickChampion(_ champion: Champion) {
        guard let slot = activeSlot else { return }
        
        // Check if already picked
        let allPicked = (teamPicks + enemyPicks).compactMap { $0?.id }
        if allPicked.contains(champion.id) { return }
        
        if slot.side == .ally {
            teamPicks[slot.index] = champion
        } else {
            enemyPicks[slot.index] = champion
        }
        
        // Update
        updateRecommendations()
    }
    
    func removePick(side: SlotSelection.Side, index: Int) {
        if side == .ally {
            teamPicks[index] = nil
        } else {
            enemyPicks[index] = nil
        }
        selectSlot(side: side, index: index)
    }
    
    func resetDraft() {
        teamPicks = Array(repeating: nil, count: 5)
        enemyPicks = Array(repeating: nil, count: 5)
        bannedChampions = []
        activeSlot = nil
        filters = FilterState()
        lookupTarget = nil
        lookupRole = "top"
        lookupResults = []
        updateRecommendations()
    }
    
    var teamStrength: Double {
        calculateStrength(picks: teamPicks)
    }
    
    var enemyStrength: Double {
        calculateStrength(picks: enemyPicks)
    }
    
    var teamStats: TeamStats {
        computeStats(picks: teamPicks)
    }
    
    var enemyStats: TeamStats {
        computeStats(picks: enemyPicks)
    }
    
    private func calculateStrength(picks: [Champion?]) -> Double {
        let validPicks = picks.compactMap { $0 }
        if validPicks.isEmpty { return 0 }
        
        let tierWeights: [String: Double] = [
            "S+": 1.0, "S": 0.9, "A": 0.75, "B": 0.60, "C": 0.40, "D": 0.20
        ]
        
        let total = validPicks.reduce(0) { sum, pick in
            sum + (tierWeights[pick.tier ?? "B"] ?? 0.60)
        }
        
        return min(total / 5.0, 1.0)
    }
    
    private func computeStats(picks: [Champion?]) -> TeamStats {
        let ids = picks.compactMap { $0?.id }
        if ids.isEmpty {
            return TeamStats(adPercent: 50, apPercent: 50, timeScore: 50, damageScore: 0, damagePercent: 0)
        }
        
        let analysis = engine.analyzeTeamComposition(team: ids)
        let totalDamage = max(analysis.adCount + analysis.apCount, 0.0001)
        let adPct = Int(round((analysis.adCount / totalDamage) * 100))
        let apPct = max(0, 100 - adPct)
        
        let early = analysis.earlyPower
        let late = analysis.latePower
        let sum = max(early + late, 0.0001)
        let timeScore = (late / sum) * 100.0 // 0 = early, 100 = late
        
        let n = Double(ids.count)
        let normalizedDamage = min(1.0, (analysis.adCount + analysis.apCount) / max(n, 1.0))
        let damageScore = normalizedDamage * 3.0
        let damagePercent = normalizedDamage * 100.0
        
        return TeamStats(adPercent: adPct, apPercent: apPct, timeScore: timeScore, damageScore: damageScore, damagePercent: damagePercent)
    }
}

