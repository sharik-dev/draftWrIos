import Foundation

struct L10n {
    static func tr(_ key: String, _ lang: String) -> String {
        let isFR = lang == "FR"
        
        let dict: [String: [String: String]] = [
            "draft_title": ["FR": "WILD RIFT DRAFT MASTER", "EN": "WILD RIFT DRAFT MASTER"],
            "draft_tab": ["FR": "Draft", "EN": "Draft"],
            "counters_tab": ["FR": "Counters", "EN": "Counters"],
            "ally_power": ["FR": "POTENTIEL ALLIÉ", "EN": "ALLY POTENTIAL"],
            "enemy_power": ["FR": "POTENTIEL ENNEMI", "EN": "ENEMY POTENTIAL"],
            "hide_stats": ["FR": "RÉDUIRE", "EN": "HIDE"],
            "show_stats": ["FR": "DÉTAILS DES STATS", "EN": "SHOW STATS"],
            "search_placeholder": ["FR": "Rechercher...", "EN": "Search..."],
            "selecting_for": ["FR": "RECOMMANDATION POUR", "EN": "RECOMMENDING FOR"],
            "ally": ["FR": "ALLIÉ", "EN": "ALLY"],
            "enemy": ["FR": "ENNEMI", "EN": "ENEMY"],
            "reset_draft": ["FR": "RÉINITIALISER TOUT", "EN": "RESET DRAFT"],
            "who_to_counter": ["FR": "ANALYSE DE CONTRE-PICK", "EN": "COUNTER-PICK ANALYSIS"],
            "on_role": ["FR": "RÔLE", "EN": "ROLE"],
            "best_counters_for": ["FR": "MENACES PRINCIPALES POUR", "EN": "PRIMARY THREATS TO"],
            "select_champion_prompt": ["FR": "Cible", "EN": "Target"],
            "choose_to_see_counters": ["FR": "Choisissez un champion pour voir ses meilleurs contres.", "EN": "Select a champion to reveal their primary counters."],
            "done": ["FR": "OK", "EN": "DONE"],
            "early": ["FR": "EARLY", "EN": "EARLY"],
            "late": ["FR": "LATE", "EN": "LATE"],
            "damage": ["FR": "MENACE", "EN": "THREAT"],
            "score": ["FR": "SCORE", "EN": "SCORE"],
            "pick": ["FR": "Pick", "EN": "Pick"],
            "select_target": ["FR": "CIBLE À ANALYSER", "EN": "TARGET TO ANALYZE"],
            "need_ap": ["FR": "⚖️ Équilibre : Manque de dégâts magiques", "EN": "⚖️ Balance: Low magic damage"],
            "need_ad": ["FR": "⚖️ Équilibre : Manque de dégâts physiques", "EN": "⚖️ Balance: Low physical damage"],
            "mixed_useful": ["FR": "⚖️ Dégâts mixtes : Difficiles à contrer", "EN": "⚖️ Mixed damage: Harder to itemize"],
            "balance_early": ["FR": "⏳ Attention : Faiblesse en fin de jeu", "EN": "⏳ Warning: Late-game scaling dip"],
            "balance_late": ["FR": "⚡ Attention : Faiblesse en début de jeu", "EN": "⚡ Warning: Early-game pressure dip"],
            "synergy_with": ["FR": "✨ %@ — Combo avec %@ : %@", "EN": "✨ %@ — Synergy with %@: %@"],
            "strength_vs": ["FR": "⚔️ %@ — Avantage vs %@ : %@", "EN": "⚔️ %@ — Advantage vs %@: %@"],
            "strong_against": ["FR": "🔥 %@ — Fort contre %@ : %@", "EN": "🔥 %@ — Strong against %@: %@"],
            "hard_countered": ["FR": "⚠️ %@ — Contré par %@ : %@", "EN": "⚠️ %@ — Countered by %@: %@"],
            "weak_against": ["FR": "🛡️ %@ — Faible face à %@ : %@", "EN": "🛡️ %@ — Weak against %@: %@"],
            "countered_by_arch": ["FR": "📐 %@ (%@) — %@", "EN": "📐 %@ (%@) — %@"],
            "side": ["FR": "POSITION", "EN": "POSITION"],
            "ally_stats_title": ["FR": "ANALYSE ALLIÉE", "EN": "ALLY ANALYSIS"],
            "enemy_stats_title": ["FR": "ANALYSE ENNEMIE", "EN": "ENEMY ANALYSIS"],
            "top": ["FR": "TOP", "EN": "TOP"],
            "jungle": ["FR": "JUNGLE", "EN": "JUNGLE"],
            "mid": ["FR": "MID", "EN": "MID"],
            "adc": ["FR": "ADC", "EN": "ADC"],
            "support": ["FR": "SUPPORT", "EN": "SUPPORT"]
        ]
        
        return dict[key]?[lang] ?? key
    }
}
