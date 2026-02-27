
import json

# Load champions
with open('data/champions.json', 'r') as f:
    data = json.load(f)

# Add champion ID as a tag to its own kit_tags
for champ in data['champions']:
    champ_id = champ['id']
    if champ_id not in champ.get('kit_tags', []):
        champ.setdefault('kit_tags', []).append(champ_id) # e.g. "xayah" tag added to Xayah

# Save back
with open('data/champions.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Updated {len(data['champions'])} champions with self-tags.")
