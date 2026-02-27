#!/usr/bin/env python3
"""
Clean and complete all JSON files based on champions.json reference
"""
import json
from pathlib import Path

# Load Wild Rift champions reference
with open('data/champions.json', 'r') as f:
    wr_champs_list = json.load(f)['champions']
    wr_champs = {c['id']: c for c in wr_champs_list}

print(f"✓ Loaded {len(wr_champs)} Wild Rift champions from champions.json")

# =========================================================================
# 1. CLEAN TIER_LIST.JSON
# =========================================================================
print("\n" + "="*70)
print("CLEANING tier_list.json")
print("="*70)

with open('data/tier_list.json', 'r') as f:
    tier_data = json.load(f)

# Keep only WR champions
clean_tiers = {}
removed_count = 0
for champ_id, tier_info in tier_data['champion_tiers'].items():
    if champ_id in wr_champs:
        clean_tiers[champ_id] = tier_info
    else:
        removed_count += 1

missing = set(wr_champs.keys()) - set(clean_tiers.keys())
print(f"  Removed: {removed_count} non-WR champions")
print(f"  Missing: {len(missing)} champions")

# Add missing with default tier B
for champ_id in missing:
    clean_tiers[champ_id] = {
        "tier": "B",
        "notes": "Auto-generated - needs manual tier assignment"
    }

tier_data['champion_tiers'] = dict(sorted(clean_tiers.items()))

with open('data/tier_list.json', 'w') as f:
    json.dump(tier_data, f, indent=2)

print(f"  ✓ Saved {len(clean_tiers)} champions")

# =========================================================================
# 2. CLEAN CHAMPION_META.JSON  
# =========================================================================
print("\n" + "="*70)
print("CLEANING champion_meta.json")
print("="*70)

with open('data/champion_meta.json', 'r') as f:
    meta_data = json.load(f)

clean_meta = {}
removed_count = 0
for champ_id, meta_info in meta_data['champion_meta'].items():
    if champ_id in wr_champs:
        clean_meta[champ_id] = meta_info
    else:
        removed_count += 1

missing = set(wr_champs.keys()) - set(clean_meta.keys())
print(f"  Removed: {removed_count} non-WR champions")
print(f"  Missing: {len(missing)} champions")

# Add missing with intelligent defaults based on champion roles
for champ_id in missing:
    champ = wr_champs[champ_id]
    roles = list(champ.get('roles', {}).keys())
    
    # Determine power spike and stats based on primary role
    if 'support' in roles:
        power_spike = "mid"
        early_impact = 0.7
        late_scaling = 0.6
    elif 'adc' in roles:
        power_spike = "late"
        early_impact = 0.4
        late_scaling = 0.85
    elif 'jungle' in roles:
        power_spike = "mid"
        early_impact = 0.6
        late_scaling = 0.6
    elif 'mid' in roles:
        power_spike = "mid"
        early_impact =0.6
        late_scaling = 0.7
    else:  # top/baron
        power_spike = "mid"
        early_impact = 0.6
        late_scaling = 0.7
    
    clean_meta[champ_id] = {
        "power_spike": power_spike,
        "flex_roles": roles[:2] if len(roles) > 1 else roles,
        "early_impact": early_impact,
        "late_scaling": late_scaling
    }

meta_data['champion_meta'] = dict(sorted(clean_meta.items()))

with open('data/champion_meta.json', 'w') as f:
    json.dump(meta_data, f, indent=2)

print(f"  ✓ Saved {len(clean_meta)} champions")

# =========================================================================
# 3. VERIFY CHAMPION_COUNTERS.JSON
# =========================================================================
print("\n" + "="*70)
print("VERIFYING champion_counters.json")
print("="*70)

with open('data/champion_counters.json', 'r') as f:
    counter_data = json.load(f)

valid_entries = []
invalid_count = 0

for entry in counter_data:
    champ_id = entry.get('champion')
    
    # Check if champion exists
    if champ_id not in wr_champs:
        invalid_count += 1
        continue
    
    # Check counters
    valid_counters = []
    for counter in entry.get('counters', []):
        if counter['target'] in wr_champs:
            valid_counters.append(counter)
        else:
            invalid_count += 1
    
    # Check strong_against
    valid_strong = []
    for strong in entry.get('strong_against', []):
        if strong['target'] in wr_champs:
            valid_strong.append(strong)
        else:
            invalid_count += 1
    
    if valid_counters or valid_strong:
        entry['counters'] = valid_counters
        entry['strong_against'] = valid_strong
        valid_entries.append(entry)

with open('data/champion_counters.json', 'w') as f:
    json.dump(valid_entries, f, indent=2)

print(f"  Removed: {invalid_count} invalid matchups")
print(f"  ✓ Saved {len(valid_entries)} champion entries")

print("\n" + "="*70)
print("✅ ALL FILES CLEANED!")
print("="*70)
EOF
