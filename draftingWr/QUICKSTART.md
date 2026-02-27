# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd /Users/sharikmohamed/Documents/Epitech/drafting/draftingWr
pip install -r requirements.txt
```

### Step 2: Test the Engine (Optional)
```bash
python test_engine.py
```

This will run 3 example scenarios and show you how the recommendation engine works.

### Step 3: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
python api.py
```

✅ Backend running at `http://localhost:8000`
📖 API docs at `http://localhost:8000/docs`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
python3 -m http.server 3000
```

✅ Frontend running at `http://localhost:3000`

---

## 🎮 Using the Web Interface

1. **Open** `http://localhost:3000` in your browser
2. **Select** your role (Top, Jungle, Mid, ADC, Support)
3. **Add** your teammates' picks
4. **Add** enemy picks
5. **Add** banned champions
6. **Click** "Generate Recommendations"
7. **Review** the top recommendations with detailed explanations!

---

## 🧪 Testing the API Directly

### Example: Get all champions
```bash
curl http://localhost:8000/champions
```

### Example: Get recommendations
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "role": "jungle",
    "team": ["malphite", "yasuo"],
    "enemy_team": ["jinx", "lux"],
    "banned_champions": ["leeSin"],
    "top_n": 5
  }'
```

---

## 📊 Project Features

✅ **30 Champions** with full kit data  
✅ **20+ Synergies** (Engage+AoE, Knockup+Yasuo, etc.)  
✅ **20+ Counters** (Mobility vs Skillshot, True Damage vs Tank, etc.)  
✅ **5 Roles** (Top, Jungle, Mid, ADC, Support)  
✅ **Explainable AI** - Every recommendation comes with reasoning  
✅ **Beautiful UI** - Modern dark theme with animations  
✅ **REST API** - Full FastAPI backend  

---

## 🎯 Example Use Cases

### Use Case 1: "My team has Malphite and Yasuo, what jungle should I pick?"
- Team synergy: Malphite knockup → Yasuo ult
- System recommends: Champions with engage or AoE to complement combo

### Use Case 2: "Enemy picked 3 assassins, who should I support with?"
- Counter analysis: Need peel and disengage
- System recommends: Janna, Lulu, Braum (peel champions)

### Use Case 3: "How do I counter true damage champions?"
- Counter analysis: Avoid tanks, pick burst or mobility
- System explains: True damage bypasses resistances

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`

**Frontend can't connect to backend?**
- Make sure backend is running on port 8000
- Check CORS settings in `backend/api.py`

**No recommendations showing?**
- Open browser console (F12) for errors
- Check that API is responding: visit `http://localhost:8000`

---

## 💡 Tips for Best Results

1. **Add multiple teammates** - More team data = better synergy calculations
2. **Add enemy picks** - Counter analysis improves with more enemy data
3. **Include bans** - Prevents banned champions from appearing
4. **Try different roles** - See how recommendations change per role
5. **Read explanations** - Learn champion interactions!

---

## 🎓 Learning Resources

The tool teaches you:
- Champion synergies (why certain champs work well together)
- Counter matchups (which kits beat which)
- Role viability (where champions are strongest)
- Kit tags (engage, poke, burst, mobility, etc.)

Use this tool to **learn** Wild Rift, not just to follow recommendations!

---

**Need help?** Check the full [README.md](README.md) for detailed documentation.
