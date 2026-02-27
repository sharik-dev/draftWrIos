#!/usr/bin/env python3
"""
Test script to verify champion-specific counter system
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "backend"))

from draft_engine import DraftEngine

# Initialize engine
engine = DraftEngine(data_dir="data")

print("="*60)
print("TEST: Champion-Specific Counters")
print("="*60)

# Test 1: Fiora vs Aatrox (Fiora should counter Aatrox)
print("\n" + "="*60)
print("Test 1: Pick Fiora vs Aatrox")
print("="*60)

enemy_team = ["aatrox"]
recommendations = engine.recommend_champions(
    role="top",
    team=[],
    enemy_team=enemy_team,
    top_n=5
)

print(f"\nEnemy picked: Aatrox")
print("\nTop 5 recommendations to counter:")
for i, rec in enumerate(recommendations[:5], 1):
    print(f"\n{i}. {rec['champion']['name']} - Score: {rec['total_score']:.2f}")
    if rec['counter_explanations']:
        print("   Counters:")
        for exp in rec['counter_explanations']:
            print(f"     {exp}")

# Test 2: Vayne vs Tank comp (Malphite, Mundo, Garen)
print("\n" + "="*60)
print("Test 2: Vayne against tanks")
print("="*60)

enemy_team = ["malphite", "mundo", "garen"]
recommendations = engine.recommend_champions(
    role="adc",
    team=[],
    enemy_team=enemy_team,
    top_n=5
)

print(f"\nEnemy team: Malphite, Dr. Mundo, Garen (3 tanks)")
print("\nTop 5 ADC recommendations:")
for i, rec in enumerate(recommendations[:5], 1):
    print(f"\n{i}. {rec['champion']['name']} - Score: {rec['total_score']:.2f}")
    print(f"   Counter Score: {rec['counter_score']:.2f}")
    if rec['counter_explanations']:
        print("   Counters:")
        for exp in rec['counter_explanations'][:3]:  # Show first 3
            print(f"     {exp}")

# Test 3: Should warn about being countered
print("\n" + "="*60)
print("Test 3: Yasuo into Malphite (should show vulnerability)")
print("="*60)

enemy_team = ["malphite"]
# Get recommendations for mid with yasuo being evaluated
all_mid = engine.get_viable_champions("mid")
yasuo = next((c for c in all_mid if c["id"] == "yasuo"), None)

if yasuo:
    counter_score, counter_exp = engine.calculate_counter_score(yasuo, enemy_team)
    vuln_score, vuln_exp = engine.calculate_being_countered_score(yasuo, enemy_team)
    
    print(f"\nYasuo vs Malphite:")
    print(f"Counter Score (how much Yasuo counters): {counter_score:.2f}")
    print(f"Vulnerability Score (how much Yasuo is countered): {vuln_score:.2f}")
    
    if vuln_exp:
        print("\nVulnerabilities:")
        for exp in vuln_exp:
            print(f"  {exp}")

print("\n" + "="*60)
