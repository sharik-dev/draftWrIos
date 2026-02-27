import Foundation

struct L10n {
    static func tr(_ key: String, _ lang: String) -> String {
        let isFR = lang == "FR"
        
        let dict: [String: [String: String]] = [
            "draft_title": [
                "FR": "OUTIL DE DRAFT WILD RIFT",
                "EN": "WILD RIFT DRAFT TOOL"
            ],
            "draft_tab": ["FR": "Draft", "EN": "Draft"],
            "counters_tab": ["FR": "Counters", "EN": "Counters"],
            "ally_power": ["FR": "FORCE ALLIÉE", "EN": "ALLY POWER"],
            "enemy_power": ["FR": "FORCE ENNEMIE", "EN": "ENEMY POWER"],
            "hide_stats": ["FR": "MASQUER STATS", "EN": "HIDE STATS"],
            "show_stats": ["FR": "VOIR STATS DÉTAIL", "EN": "VIEW DETAILED STATS"],
            "search_placeholder": ["FR": "Chercher un champion...", "EN": "Search champion..."],
            "selecting_for": ["FR": "SÉLECTION POUR", "EN": "SELECTING FOR"],
            "ally": ["FR": "ALLIÉ", "EN": "ALLY"],
            "enemy": ["FR": "ENNEMI", "EN": "ENEMY"],
            "reset_draft": ["FR": "RÉINITIALISER LE DRAFT", "EN": "RESET DRAFT"],
            "who_to_counter": ["FR": "QUEL CHAMPION VOULEZ-VOUS CONTRER ?", "EN": "WHO IS YOUR TARGET?"],
            "on_role": ["FR": "À QUEL POSTE ?", "EN": "IN WHICH POSITION?"],
            "best_counters_for": ["FR": "MEILLEURS COUNTERS POUR", "EN": "BEST COUNTERS FOR"],
            "select_champion_prompt": ["FR": "Choisir Cible", "EN": "Select Target"],
            "choose_to_see_counters": ["FR": "Sélectionnez un champion pour découvrir ses faiblesses stratégiques.", "EN": "Select a champion to reveal tactical counters and weaknesses."],
            "done": ["FR": "TERMINÉ", "EN": "DONE"],
            "early": ["FR": "DÉBUT", "EN": "EARLY"],
            "late": ["FR": "FIN", "EN": "LATE"],
            "damage": ["FR": "DÉGÂTS", "EN": "DAMAGE"],
            "score": ["FR": "SCORE", "EN": "SCORE"],
            "pick": ["FR": "Choisir...", "EN": "Pick..."],
            "select_target": ["FR": "CIBLE DU CONTRE", "EN": "COUNTER TARGET"],
            "need_ap": ["FR": "⚖️ Équilibre : Besoin de dégâts magiques", "EN": "⚖️ Balance: Need magic damage"],
            "need_ad": ["FR": "⚖️ Équilibre : Besoin de dégâts physiques", "EN": "⚖️ Balance: Need physical damage"],
            "mixed_useful": ["FR": "⚖️ Polyvalence : Dégâts mixtes utiles", "EN": "⚖️ Versatility: Mixed damage useful"],
            "balance_early": ["FR": "⏳ Stabilise le scaling (Fin de partie)", "EN": "⏳ Bolsters late-game scaling"],
            "balance_late": ["FR": "⚡ Renforce l'impact en début de jeu", "EN": "⚡ Boosts early-game pressure"],
            "synergy_with": ["FR": "✓ %@ avec %@ : %@", "EN": "✓ %@ with %@: %@"],
            "strength_vs": ["FR": "⚔ Avantage contre %@ : %@", "EN": "⚔ Advantage vs %@: %@"],
            "strong_against": ["FR": "⚔ Fort contre %@ : %@", "EN": "⚔ Strong against %@: %@"],
            "hard_countered": ["FR": "⚠ Sévèrement contré par %@ : %@", "EN": "⚠ Hard countered by %@: %@"],
            "weak_against": ["FR": "⚠ Faible contre %@ : %@", "EN": "⚠ Weak against %@: %@"],
            "countered_by_arch": ["FR": "⚠ Contré par %@ (%@) : %@", "EN": "⚠ Countered by %@ (%@): %@"]
        ]
        
        return dict[key]?[lang] ?? key
    }
}
