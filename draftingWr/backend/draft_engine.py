"""
Wild Rift Draft Engine - Kit-Based Recommendation System
This module calculates champion recommendations based on kit synergies and counters.
"""

import json
from typing import List, Dict, Tuple
from pathlib import Path


class DraftEngine:
    """
    Main draft engine that analyzes team compositions and recommends champions.
    Uses kit-based analysis instead of meta/winrate data.
    """
    
    def __init__(self, data_dir: str = "data"):
        """Initialize the draft engine by loading all data files."""
        self.data_dir = Path(data_dir)
        self.champions = self._load_json("champions.json")["champions"]
        self.synergies = self._load_json("synergies.json")["synergies"]
        self.counters = self._load_json("counters.json")["counters"]
        self.champion_counters = self._load_json("champion_counters.json")  # Specific champion matchups
        self.tier_list = self._load_json("tier_list.json")  # Meta tier ratings
        self.champion_meta = self._load_json("champion_meta.json").get("champion_meta", {})  # Early/late, flex roles
        
        # Create lookup dictionaries for faster access
        self.champion_map = {c["id"]: c for c in self.champions}
        
        # Create champion counter lookup map for quick access
        self.champion_counter_map = {cc["champion"]: cc for cc in self.champion_counters}
        
        # Extract tier scoring and champion tiers
        self.tier_scoring = self.tier_list.get("tier_scoring", {})
        self.champion_tiers = self.tier_list.get("champion_tiers", {})
        
        # Enrich champions with tier data for easy frontend access
        for champ in self.champions:
            champ_id = champ["id"]
            tier_info = self.champion_tiers.get(champ_id, {})
            champ["tier"] = tier_info.get("tier", "B")
        
    def _load_json(self, filename: str) -> dict:
        """Load a JSON file from the data directory."""
        filepath = self.data_dir / filename
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def get_viable_champions(self, role: str) -> List[Dict]:
        """
        Get all champions that are viable for a specific role.
        
        Args:
            role: The role to filter by (e.g., 'mid', 'adc', 'support')
            
        Returns:
            List of champions with their viability score for the role
        """
        viable = []
        for champ in self.champions:
            if role in champ.get("roles", {}):
                viability = champ["roles"][role]
                if viability >= 0.5:  # Only include if >= 50% viable
                    viable.append({
                        **champ,
                        "role_viability": viability
                    })
        
        # Sort by viability (highest first)
        viable.sort(key=lambda x: x["role_viability"], reverse=True)
        return viable
    
    def get_tier_score(self, champion_id: str) -> float:
        """
        Get the tier score for a champion based on current meta.
        
        Args:
            champion_id: Champion ID
            
        Returns:
            Tier score (0.0 to 1.0), defaults to 0.5 if not in tier list
        """
        if champion_id in self.champion_tiers:
            tier = self.champion_tiers[champion_id].get("tier", "B")
            return self.tier_scoring.get(tier, 0.5)
        return 0.5  # Default to middle tier if not found
    
    def analyze_team_composition(self, team: List[str]) -> Dict:
        """
        Analyze team composition for balance metrics.
        
        Returns dict with:
        - early_power: Average early game strength
        - late_power: Average late game strength
        - balance_score: How balanced the comp is
        - power_curve: 'early', 'mid', or 'late' focused
        """
        if not team:
            return {
                "early_power": 0.5,
                "late_power": 0.5,
                "balance_score": 1.0,
                "power_curve": "mid"
            }
        
        early_scores = []
        late_scores = []
        
        for champ_id in team:
            meta = self.champion_meta.get(champ_id, {})
            early_scores.append(meta.get("early_impact", 0.5))
            late_scores.append(meta.get("late_scaling", 0.5))
        
        avg_early = sum(early_scores) / len(early_scores)
        avg_late = sum(late_scores) / len(late_scores)
        
        # Balance score: penalize extreme one-sidedness
        balance = 1.0 - abs(avg_early - avg_late)
        
        # Determine power curve
        if avg_early > avg_late + 0.2:
            curve = "early"
        elif avg_late > avg_early + 0.2:
            curve = "late"
        else:
            curve = "mid"
        
        # Calculate damage type distribution
        ad_count = 0
        ap_count = 0
        
        for champ_id in team:
            if champ_id in self.champion_map:
                dmg_type = self.champion_map[champ_id].get("damage_type", "Adaptive")
                if dmg_type == "AD":
                    ad_count += 1
                elif dmg_type == "AP":
                    ap_count += 1
                elif dmg_type in ["Mixed", "Adaptive"]:
                    ad_count += 0.5
                    ap_count += 0.5
        
        return {
            "early_power": avg_early,
            "late_power": avg_late,
            "balance_score": balance,
            "power_curve": curve,
            "ad_count": ad_count,
            "ap_count": ap_count
        }
    
    def calculate_flex_score(self, champion_id: str, role: str) -> float:
        """Calculate flexibility bonus for champions that can fill multiple roles."""
        meta = self.champion_meta.get(champion_id, {})
        flex_roles = meta.get("flex_roles", [role])
        
        # More flex roles = higher score
        flex_count = len(flex_roles)
        
        if flex_count >= 4:
            return 0.3  # Super flex (Pantheon, Gragas)
        elif flex_count == 3:
            return 0.2  # High flex
        elif flex_count == 2:
            return 0.1  # Moderate flex
        else:
            return 0.0  # No flex
    
    def calculate_synergy_score(self, champion: Dict, team: List[str]) -> Tuple[float, List[str]]:
        """
        Calculate synergy score between a champion and existing team.
        
        Args:
            champion: Champion data dictionary
            team: List of champion IDs already on the team
            
        Returns:
            Tuple of (synergy_score, list of synergy explanations)
        """
        total_score = 0.0
        explanations = []
        synergy_counts = {}  # Track how many times each synergy type appears
        
        champ_tags = set(champion.get("kit_tags", []))
        
        # Add champion ID to tags for special synergies (e.g., Yasuo)
        champ_tags.add(champion["id"])
        
        for teammate_id in team:
            if teammate_id not in self.champion_map:
                continue
                
            teammate = self.champion_map[teammate_id]
            teammate_tags = set(teammate.get("kit_tags", []))
            teammate_tags.add(teammate["id"])
            
            # Check all synergy rules
            for synergy in self.synergies:
                syn_tags = set(synergy["tags"])
                synergy_name = synergy["name"]
                
                # Check if tags match between champion and teammate
                if len(syn_tags) == 2:
                    tags_list = list(syn_tags)
                    # Check both directions of synergy
                    if (tags_list[0] in champ_tags and tags_list[1] in teammate_tags) or \
                       (tags_list[1] in champ_tags and tags_list[0] in teammate_tags):
                        
                        # Apply diminishing returns for repeated synergies
                        synergy_counts[synergy_name] = synergy_counts.get(synergy_name, 0) + 1
                        count = synergy_counts[synergy_name]
                        
                        # Diminishing returns: 100%, 75%, 50%, 33% for 1st, 2nd, 3rd, 4th+ occurrences
                        if count == 1:
                            multiplier = 1.0
                        elif count == 2:
                            multiplier = 0.75
                        elif count == 3:
                            multiplier = 0.5
                        else:
                            multiplier = 0.33
                        
                        score_contribution = synergy["score"] * multiplier
                        total_score += score_contribution
                        
                        explanations.append(
                            f"✓ {synergy['name']} with {teammate['name']}: {synergy['explanation']}"
                            + (f" (x{multiplier:.0%})" if multiplier < 1.0 else "")
                        )
        
        # Normalize by team size to avoid favoring larger teams
        if team:
            total_score = total_score / len(team)
        
        return total_score, explanations
    
    def calculate_counter_score(self, champion: Dict, enemy_team: List[str]) -> Tuple[float, List[str]]:
        """
        Calculate how well a champion counters the enemy team.
        
        Args:
            champion: Champion data dictionary
            enemy_team: List of enemy champion IDs
            
        Returns:
            Tuple of (counter_score, list of counter explanations)
        """
        total_score = 0.0
        explanations = []
        
        champ_tags = set(champion.get("kit_tags", []))
        champ_tags.add(champion["id"])
        champ_id = champion["id"]
        
        # Check for specific champion counters first (higher priority)
        if champ_id in self.champion_counter_map:
            champion_matchups = self.champion_counter_map[champ_id]
            
            # Check counters (champions this champion counters)
            for counter in champion_matchups.get("counters", []):
                if counter["target"] in enemy_team:
                    bonus_score = counter["strength"]
                    total_score += bonus_score
                    enemy_name = self.champion_map.get(counter["target"], {}).get("name", counter["target"])
                    explanations.append(
                        f"⚔ Matchup Advantage vs {enemy_name}: {counter['reason']} (+{bonus_score:.2f})"
                    )
            
            # Check strong_against (additional positive matchups)
            for strong in champion_matchups.get("strong_against", []):
                if strong["target"] in enemy_team:
                    bonus_score = strong["strength"]
                    total_score += bonus_score
                    enemy_name = self.champion_map.get(strong["target"], {}).get("name", strong["target"])
                    explanations.append(
                        f"⚔ Strong Against {enemy_name}: {strong['reason']} (+{bonus_score:.2f})"
                    )
        
        # Then check archetype-based counters
        for enemy_id in enemy_team:
            if enemy_id not in self.champion_map:
                continue
                
            enemy = self.champion_map[enemy_id]
            enemy_tags = set(enemy.get("kit_tags", []))
            
            # Check all counter rules
            for counter in self.counters:
                attacker_tags = set(counter["attacker_tags"])
                defender_tags = set(counter["defender_tags"])
                
                # Check if this champion (attacker) counters enemy (defender)
                if attacker_tags.issubset(champ_tags) and \
                   len(defender_tags.intersection(enemy_tags)) > 0:
                    total_score += counter["score"]
                    explanations.append(
                        f"⚔ {counter['name']} vs {enemy['name']}: {counter['explanation']}"
                    )
        
        # Normalize by enemy team size
        if enemy_team:
            total_score = total_score / len(enemy_team)
        
        return total_score, explanations
    
    def calculate_being_countered_score(self, champion: Dict, enemy_team: List[str]) -> Tuple[float, List[str]]:
        """
        Calculate how much this champion is countered by enemy team.
        Lower is better (we want to avoid being countered).
        
        Args:
            champion: Champion data dictionary
            enemy_team: List of enemy champion IDs
            
        Returns:
            Tuple of (vulnerability_score, list of vulnerability explanations)
        """
        total_score = 0.0
        explanations = []
        
        champ_tags = set(champion.get("kit_tags", []))
        champ_id = champion["id"]
        
        # Check for specific champion vulnerabilities (being countered)
        for enemy_id in enemy_team:
            if enemy_id not in self.champion_map:
                continue
            
            # Check if the enemy champion has this champion in their counters list
            if enemy_id in self.champion_counter_map:
                enemy_matchups = self.champion_counter_map[enemy_id]
                
                # Check if we're in their counters list
                for counter in enemy_matchups.get("counters", []):
                    if counter["target"] == champ_id:
                        penalty_score = abs(counter["strength"])  # Negative becomes positive penalty
                        total_score += penalty_score
                        enemy_name = self.champion_map.get(enemy_id, {}).get("name", enemy_id)
                        explanations.append(
                            f"⚠ Hard Countered by {enemy_name}: {counter['reason']} (-{penalty_score:.2f})"
                        )
                
                # Check strong_against
                for strong in enemy_matchups.get("strong_against", []):
                    if strong["target"] == champ_id:
                        penalty_score = abs(strong["strength"])
                        total_score += penalty_score
                        enemy_name = self.champion_map.get(enemy_id, {}).get("name", enemy_id)
                        explanations.append(
                            f"⚠ Weak Against {enemy_name}: {strong['reason']} (-{penalty_score:.2f})"
                        )
        
        # Then check archetype-based vulnerabilities
        for enemy_id in enemy_team:
            if enemy_id not in self.champion_map:
                continue
                
            enemy = self.champion_map[enemy_id]
            enemy_tags = set(enemy.get("kit_tags", []))
            enemy_tags.add(enemy["id"])
            
            # Check all counter rules (reversed - enemy is attacker)
            for counter in self.counters:
                attacker_tags = set(counter["attacker_tags"])
                defender_tags = set(counter["defender_tags"])
                
                # Check if enemy counters this champion
                if attacker_tags.issubset(enemy_tags) and \
                   len(defender_tags.intersection(champ_tags)) > 0:
                    total_score += counter["score"]
                    explanations.append(
                        f"⚠ Countered by {enemy['name']} ({counter['name']}): {counter['explanation']}"
                    )
        
        # Normalize by enemy team size
        if enemy_team:
            total_score = total_score / len(enemy_team)
        
        return total_score, explanations
    
    def recommend_champions(
        self,
        role: str,
        team: List[str] = None,
        enemy_team: List[str] = None,
        banned_champions: List[str] = None,
        top_n: int = 5
    ) -> List[Dict]:
        """
        Recommend champions for a specific role based on team composition.
        
        Args:
            role: Role to recommend for
            team: List of champion IDs already picked by your team
            enemy_team: List of champion IDs picked by enemy
            banned_champions: List of banned champion IDs
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended champions with scores and explanations
        """
        team = team or []
        enemy_team = enemy_team or []
        banned_champions = banned_champions or []
        
        # Get viable champions for role
        viable = self.get_viable_champions(role)
        
        # Filter out already picked and banned champions
        all_picked = set(team + enemy_team + banned_champions)
        viable = [c for c in viable if c["id"] not in all_picked]
        
        # Analyze current team composition
        team_analysis = self.analyze_team_composition(team)
        team_size = len(team)
        is_jungle = role == "jungle"
        
        # Calculate scores for each champion
        recommendations = []
        
        for champ in viable:
            champ_id = champ["id"]
            champ_meta = self.champion_meta.get(champ_id, {})
            
            # Calculate different score components
            synergy_score, synergy_exp = self.calculate_synergy_score(champ, team)
            counter_score, counter_exp = self.calculate_counter_score(champ, enemy_team)
            vulnerability_score, vulnerability_exp = self.calculate_being_countered_score(champ, enemy_team)
            tier_score = self.get_tier_score(champ_id)
            flex_score = self.calculate_flex_score(champ_id, role)
            
            # Early/Late game fit with team
            early_impact = champ_meta.get("early_impact", 0.5)
            late_scaling = champ_meta.get("late_scaling", 0.5)
            
            # Team balance score: reward filling gaps in team composition
            if team_analysis["power_curve"] == "early" and late_scaling > 0.7:
                balance_bonus = 0.15  # Team needs late game
            elif team_analysis["power_curve"] == "late" and early_impact > 0.7:
                balance_bonus = 0.15  # Team needs early game
            else:
                balance_bonus = team_analysis["balance_score"] * 0.05
            
            # Jungle early impact bonus
            early_game_score = 0.0
            if is_jungle and early_impact > 0.7:
                early_game_score = early_impact * 0.1  # Bonus for early game junglers
                
            # Damage Type Balance Bonus
            damage_balance_bonus = 0.0
            damage_explanation = None
            
            champ_dmg = champ.get("damage_type", "Adaptive")
            
            # If team is heavy on AD (3+ AD users), need AP
            if team_analysis.get("ad_count", 0) >= 2.5 and team_analysis.get("ap_count", 0) < 1.5:
                if champ_dmg == "AP":
                    damage_balance_bonus = 0.20
                    damage_explanation = "⚖️ Équilibre les dégâts : Besoin de Magie"
                elif champ_dmg in ["Mixed", "Adaptive"]:
                    damage_balance_bonus = 0.10
                    damage_explanation = "⚖️ Équilibre les dégâts : Dégâts Mixtes utiles"
                    
            # If team is heavy on AP (3+ AP users), need AD
            elif team_analysis.get("ap_count", 0) >= 2.5 and team_analysis.get("ad_count", 0) < 1.5:
                if champ_dmg == "AD":
                    damage_balance_bonus = 0.20
                    damage_explanation = "⚖️ Équilibre les dégâts : Besoin de Physique"
                elif champ_dmg in ["Mixed", "Adaptive"]:
                    damage_balance_bonus = 0.10
                    damage_explanation = "⚖️ Équilibre les dégâts : Dégâts Mixtes utiles"
            
            if damage_explanation:
                synergy_exp.insert(0, damage_explanation)  # Add to top of explanations
            

            # Adaptive weighting based on draft stage
            # Balanced weights for good differentiation without over-extrapolation
            if team_size <= 1:
                # Early draft: prioritize flex picks and strong meta
                weights = {
                    "tier": 0.35,
                    "synergy": 0.25,
                    "counter": 0.35,
                    "vulnerability": -0.40,
                    "flex": 0.20,
                    "viability": 0.15,
                    "balance": 0.08,
                    "early_jungle": 0.10
                }
            elif team_size <= 3:
                # Mid draft: balance synergy and counters
                weights = {
                    "tier": 0.25,
                    "synergy": 0.50,
                    "counter": 0.45,
                    "vulnerability": -0.50,
                    "flex": 0.10,
                    "viability": 0.15,
                    "balance": 0.15,
                    "early_jungle": 0.10
                }
            else:
                # Late draft: heavily focus on synergy and filling gaps
                weights = {
                    "tier": 0.20,
                    "synergy": 0.75,
                    "counter": 0.40,
                    "vulnerability": -0.65,
                    "flex": 0.05,
                    "viability": 0.12,
                    "balance": 0.25,
                    "early_jungle": 0.10
                }
            
            # Combined score
            total_score = (
                tier_score * weights["tier"] +
                synergy_score * weights["synergy"] +
                counter_score * weights["counter"] +
                vulnerability_score * weights["vulnerability"] +
                flex_score * weights["flex"] +
                champ["role_viability"] * weights["viability"] +
                balance_bonus * weights["balance"] +
                early_game_score * weights["early_jungle"] +
                damage_balance_bonus
            )
            
            # Get tier info for display
            tier_info = self.champion_tiers.get(champ_id, {})
            tier_name = tier_info.get("tier", "B")
            
            recommendations.append({
                "champion": champ,
                "total_score": total_score,
                "tier_score": tier_score,
                "tier_name": tier_name,
                "synergy_score": synergy_score,
                "counter_score": counter_score,
                "vulnerability_score": vulnerability_score,
                "flex_score": flex_score,
                "early_impact": early_impact,
                "late_scaling": late_scaling,
                "balance_bonus": balance_bonus,
                "synergy_explanations": synergy_exp,
                "counter_explanations": counter_exp,
                "vulnerability_explanations": vulnerability_exp
            })
        
        # Sort by total score (highest first)
        recommendations.sort(key=lambda x: x["total_score"], reverse=True)
        
        return recommendations[:top_n]
    
    def explain_recommendation(self, recommendation: Dict) -> str:
        """
        Generate a detailed explanation for a recommendation.
        
        Args:
            recommendation: A recommendation dictionary from recommend_champions
            
        Returns:
            Formatted explanation string
        """
        champ = recommendation["champion"]
        
        explanation = f"\n{'='*60}\n"
        explanation += f"🎯 {champ['name']} - Score: {recommendation['total_score']:.2f}\n"
        explanation += f"{'='*60}\n\n"
        
        explanation += f"📊 Component Scores:\n"
        explanation += f"  • Synergy: {recommendation['synergy_score']:.2f}\n"
        explanation += f"  • Counter: {recommendation['counter_score']:.2f}\n"
        explanation += f"  • Vulnerability: {recommendation['vulnerability_score']:.2f}\n"
        explanation += f"  • Role Fit: {champ['role_viability']:.2f}\n\n"
        
        explanation += f"📝 Champion Info:\n"
        explanation += f"  • {champ['description']}\n"
        explanation += f"  • Damage Type: {champ['damage_type']}\n"
        explanation += f"  • Power Spike: {champ['scaling']}\n"
        explanation += f"  • Kit Tags: {', '.join(champ['kit_tags'])}\n\n"
        
        if recommendation['synergy_explanations']:
            explanation += f"🤝 Team Synergies:\n"
            for exp in recommendation['synergy_explanations']:
                explanation += f"  {exp}\n"
            explanation += "\n"
        
        if recommendation['counter_explanations']:
            explanation += f"⚔️  Counters Enemy:\n"
            for exp in recommendation['counter_explanations']:
                explanation += f"  {exp}\n"
            explanation += "\n"
        
        if recommendation['vulnerability_explanations']:
            explanation += f"⚠️  Vulnerabilities:\n"
            for exp in recommendation['vulnerability_explanations']:
                explanation += f"  {exp}\n"
            explanation += "\n"
        
        return explanation


if __name__ == "__main__":
    # Example usage
    engine = DraftEngine()
    
    print("🎮 Wild Rift Draft Tool - Kit-Based Recommendation Engine\n")
    
    # Example scenario
    team = ["malphite", "thresh"]  # Top: Malphite, Support: Thresh
    enemy_team = ["yasuo", "jinx"]  # Mid: Yasuo, ADC: Jinx
    banned = ["leeSin", "masterYi"]
    
    print(f"Your Team: {', '.join([engine.champion_map[c]['name'] for c in team])}")
    print(f"Enemy Team: {', '.join([engine.champion_map[c]['name'] for c in enemy_team])}")
    print(f"Banned: {', '.join([engine.champion_map[c]['name'] for c in banned])}\n")
    print("="*60)
    print("Looking for: JUNGLE")
    print("="*60)
    
    # Get recommendations for jungle
    recommendations = engine.recommend_champions(
        role="jungle",
        team=team,
        enemy_team=enemy_team,
        banned_champions=banned,
        top_n=5
    )
    
    # Print top recommendation with full explanation
    if recommendations:
        print(engine.explain_recommendation(recommendations[0]))
        
        print("\n📋 Other Top Picks:")
        for i, rec in enumerate(recommendations[1:], 2):
            print(f"{i}. {rec['champion']['name']} - Score: {rec['total_score']:.2f}")
