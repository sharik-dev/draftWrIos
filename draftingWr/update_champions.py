
import json
import re

# Mapping for special DDragon names
DDRAGON_NAME_MAP = {
    "Dr. Mundo": "DrMundo",
    "Jarvan IV": "JarvanIV",
    "Kai'Sa": "Kaisa",
    "Kha'Zix": "Khazix",
    "Kog'Maw": "KogMaw",
    "Lee Sin": "LeeSin",
    "Master Yi": "MasterYi",
    "Miss Fortune": "MissFortune",
    "Nunu & Willump": "Nunu",
    "Twisted Fate": "TwistedFate",
    "Vel'Koz": "Velkoz",
    "Xin Zhao": "XinZhao",
    "Wukong": "MonkeyKing",
    "Aurelion Sol": "AurelionSol",
    "Renata Glasc": "Renata",
    "Bel'Veth": "Belveth",
    "Cho'Gath": "Chogath",
    "Rek'Sai": "Reksai",
    "Tahm Kench": "TahmKench"
}

# Role mapping (Wild Rift terms -> Internal IDs)
ROLE_MAP = {
    "Baron": "top",
    "Mid": "mid",
    "Jungle": "jungle",
    "ADC": "adc",
    "Support": "support"
}

# Default tags by role
DEFAULT_TAGS = {
    "top": ["melee", "bruiser", "solo"],
    "jungle": ["jungle", "gank", "farm"],
    "mid": ["burst", "mage", "roam"],
    "adc": ["ranged", "physical", "dps", "carry"],
    "support": ["utility", "protect", "cc"]
}

def get_ddragon_name(name):
    if name in DDRAGON_NAME_MAP:
        return DDRAGON_NAME_MAP[name]
    # Remove spaces and apostrophes for standard cases
    clean = name.replace(" ", "").replace("'", "").replace(".", "")
    return clean

def parse_roles(role_str):
    parts = role_str.split(" / ")
    roles = {}
    
    primary_role = ROLE_MAP.get(parts[0], "mid")
    roles[primary_role] = 1.0
    
    if len(parts) > 1:
        secondary_role = ROLE_MAP.get(parts[1], "mid")
        roles[secondary_role] = 0.6
        
    return roles

def infer_tags(roles, name):
    primary_role = list(roles.keys())[0] # The 1.0 one
    tags = DEFAULT_TAGS.get(primary_role, []).copy()
    
    # Simple heuristics
    if "Assass" in name or primary_role == "jungle":
        tags.append("mobility")
    if primary_role == "support" or "Tank" in name:
        tags.append("cc")
        
    return list(set(tags)) # unique

def main():
    # Load specific existing data to preserve high quality entries
    try:
        with open('data/champions.json', 'r') as f:
            existing_data = json.load(f)
            existing_champs = {c['name']: c for c in existing_data['champions']}
    except FileNotFoundError:
        existing_champs = {}

    new_champs = []
    
    with open('champions_list.txt', 'r') as f:
        for line in f:
            if not line.strip(): continue
            name, role_str = line.strip().split('|')
            
            ddragon_name = get_ddragon_name(name)
            image_url = f"https://ddragon.leagueoflegends.com/cdn/15.2.1/img/champion/{ddragon_name}.png"
            
            # Special case for future champs or exclusives
            if name in ["Mel", "Ambessa", "Aurora", "Norra"]:
                # Use a specific fallback or icon if known, otherwise keep DDragon format 
                # (it will likely fail 404, React will handle it)
                pass

            if name in existing_champs:
                champ = existing_champs[name]
                champ['image_url'] = image_url # Update image URL
                new_champs.append(champ)
            else:
                roles = parse_roles(role_str)
                champ = {
                    "id": ddragon_name[0].lower() + ddragon_name[1:], # camelCase ish
                    "name": name,
                    "roles": roles,
                    "kit_tags": infer_tags(roles, name),
                    "damage_type": "Adaptive", # Default
                    "scaling": "mid",
                    "description": f"{role_str} champion",
                    "image_url": image_url
                }
                new_champs.append(champ)

    # Sort by name
    new_champs.sort(key=lambda x: x['name'])
    
    output = {"champions": new_champs}
    
    with open('data/champions.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Generated {len(new_champs)} champions.")

if __name__ == "__main__":
    main()
