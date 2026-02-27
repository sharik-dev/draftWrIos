#!/usr/bin/env python3
"""
Quick test script for the Draft Engine
Demonstrates the recommendation system with example scenarios
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / 'backend'))
from draft_engine import DraftEngine


def print_separator():
    print("\n" + "="*70 + "\n")


def test_scenario_1():
    """Test: Looking for jungle with engage comp"""
    print("🎯 SCENARIO 1: Team Needs Jungle")
    print_separator()
    
    engine = DraftEngine(data_dir="data")
    
    team = ["malphite", "yasuo"]  # Top: Malphite, Mid: Yasuo
    enemy_team = ["jinx", "lux"]  # ADC: Jinx, Mid: Lux
    banned = ["leeSin", "masterYi"]
    
    print(f"Your Team: {', '.join([engine.champion_map[c]['name'] for c in team])}")
    print(f"Enemy Team: {', '.join([engine.champion_map[c]['name'] for c in enemy_team])}")
    print(f"Banned: {', '.join([engine.champion_map[c]['name'] for c in banned])}")
    print(f"\n🔍 Looking for: JUNGLE")
    print_separator()
    
    recommendations = engine.recommend_champions(
        role="jungle",
        team=team,
        enemy_team=enemy_team,
        banned_champions=banned,
        top_n=3
    )
    
    if recommendations:
        print(engine.explain_recommendation(recommendations[0]))
        print("\n📋 Other Top Picks:")
        for i, rec in enumerate(recommendations[1:], 2):
            print(f"  {i}. {rec['champion']['name']} - Score: {rec['total_score']:.2f}")


def test_scenario_2():
    """Test: Looking for support with poke comp"""
    print("\n\n🎯 SCENARIO 2: Team Needs Support (Poke Comp)")
    print_separator()
    
    engine = DraftEngine(data_dir="data")
    
    team = ["ezreal", "lux", "gragas"]  # ADC: Ezreal, Mid: Lux, Jungle: Gragas
    enemy_team = ["darius", "alistar"]  # Top: Darius, Support: Alistar
    banned = ["thresh", "blitzcrank"]
    
    print(f"Your Team: {', '.join([engine.champion_map[c]['name'] if c in engine.champion_map else c for c in team])}")
    print(f"Enemy Team: {', '.join([engine.champion_map[c]['name'] for c in enemy_team])}")
    print(f"Banned: {', '.join([engine.champion_map[c]['name'] for c in banned])}")
    print(f"\n🔍 Looking for: SUPPORT")
    print_separator()
    
    recommendations = engine.recommend_champions(
        role="support",
        team=team,
        enemy_team=enemy_team,
        banned_champions=banned,
        top_n=3
    )
    
    if recommendations:
        print(engine.explain_recommendation(recommendations[0]))
        print("\n📋 Other Top Picks:")
        for i, rec in enumerate(recommendations[1:], 2):
            print(f"  {i}. {rec['champion']['name']} - Score: {rec['total_score']:.2f}")


def test_scenario_3():
    """Test: Counter picking for mid lane"""
    print("\n\n🎯 SCENARIO 3: Counter Pick Mid Lane")
    print_separator()
    
    engine = DraftEngine(data_dir="data")
    
    team = ["amumu", "jinx", "thresh"]  # Jungle, ADC, Support
    enemy_team = ["yasuo", "zed"]  # Enemy picked Yasuo and Zed
    banned = ["akali"]
    
    print(f"Your Team: {', '.join([engine.champion_map[c]['name'] for c in team])}")
    print(f"Enemy Team: {', '.join([engine.champion_map[c]['name'] for c in enemy_team])}")
    print(f"Banned: {', '.join([engine.champion_map[c]['name'] for c in banned])}")
    print(f"\n🔍 Looking for: MID (Counter Pick)")
    print_separator()
    
    recommendations = engine.recommend_champions(
        role="mid",
        team=team,
        enemy_team=enemy_team,
        banned_champions=banned,
        top_n=3
    )
    
    if recommendations:
        print(engine.explain_recommendation(recommendations[0]))
        print("\n📋 Other Top Picks:")
        for i, rec in enumerate(recommendations[1:], 2):
            print(f"  {i}. {rec['champion']['name']} - Score: {rec['total_score']:.2f}")


if __name__ == "__main__":
    print("\n" + "🎮 WILD RIFT DRAFT TOOL - TEST SCENARIOS ".center(70, "="))
    
    try:
        test_scenario_1()
        test_scenario_2()
        test_scenario_3()
        
        print("\n\n" + "✅ ALL TESTS COMPLETED SUCCESSFULLY! ".center(70, "="))
        print("\n💡 TIP: Run the API (python backend/api.py) and open the web UI!")
        print("   Then visit http://localhost:8000/docs for API documentation\n")
        
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
