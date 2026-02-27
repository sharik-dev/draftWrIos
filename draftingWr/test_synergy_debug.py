#!/usr/bin/env python3
"""
Test script to debug synergy calculation
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "backend"))

from draft_engine import DraftEngine

# Initialize engine
engine = DraftEngine(data_dir="data")

# Test with multiple allies
print("="*60)
print("TEST: Synergies with multiple allies")
print("="*60)

# Test team composition
team = ["yasuo", "malphite", "thresh"]  # Mid: Yasuo, Top: Malphite, Support: Thresh
enemy_team = ["jinx"]

print(f"\nYour Team:")
for champ_id in team:
    champ = engine.champion_map.get(champ_id)
    if champ:
        print(f"  - {champ['name']} (tags: {', '.join(champ.get('kit_tags', []))})")

print(f"\nEnemy Team:")
for champ_id in enemy_team:
    champ = engine.champion_map.get(champ_id)
    if champ:
        print(f"  - {champ['name']}")

print("\n" + "="*60)
print("Testing jungle recommendations:")
print("="*60)

recommendations = engine.recommend_champions(
    role="jungle",
    team=team,
    enemy_team=enemy_team,
    top_n=3
)

for i, rec in enumerate(recommendations, 1):
    champ = rec['champion']
    print(f"\n{i}. {champ['name']} - Total Score: {rec['total_score']:.2f}")
    print(f"   Synergy Score: {rec['synergy_score']:.2f}")
    
    if rec['synergy_explanations']:
        print(f"   Synergy Explanations:")
        for exp in rec['synergy_explanations']:
            print(f"     • {exp}")
    else:
        print(f"   No synergies found!")

print("\n" + "="*60)
print("Checking synergy data:")
print("="*60)
print(f"Total synergies loaded: {len(engine.synergies)}")
print("\nFirst 5 synergies:")
for syn in engine.synergies[:5]:
    print(f"  - {syn['name']}: {syn['tags']}")
