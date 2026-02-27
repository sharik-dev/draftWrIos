"""
Wild Rift Draft Tool - FastAPI Backend
Provides REST API endpoints for the draft recommendation system.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
from pathlib import Path

# Add parent directory to path to import draft_engine
sys.path.append(str(Path(__file__).parent))
from draft_engine import DraftEngine

app = FastAPI(
    title="Wild Rift Draft Tool API",
    description="AI-Based draft recommendation system for Wild Rift",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize draft engine
engine = DraftEngine(data_dir="../data")


# Request/Response models
class RecommendationRequest(BaseModel):
    role: str
    team: Optional[List[str]] = []
    enemy_team: Optional[List[str]] = []
    banned_champions: Optional[List[str]] = []
    top_n: Optional[int] = 5


class ChampionInfo(BaseModel):
    id: str
    name: str
    description: str


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "message": "Wild Rift Draft Tool API",
        "version": "1.0.0",
        "endpoints": {
            "/champions": "Get all champions",
            "/champions/{role}": "Get champions for a specific role",
            "/recommend": "Get champion recommendations (POST)",
            "/champion/{champion_id}": "Get detailed champion info"
        }
    }


@app.get("/champions")
async def get_all_champions():
    """Get all available champions."""
    return {
        "champions": engine.champions,
        "count": len(engine.champions)
    }


@app.get("/champions/{role}")
async def get_champions_by_role(role: str):
    """Get all viable champions for a specific role."""
    viable = engine.get_viable_champions(role)
    
    if not viable:
        raise HTTPException(
            status_code=404,
            detail=f"No viable champions found for role: {role}"
        )
    
    return {
        "role": role,
        "champions": viable,
        "count": len(viable)
    }


@app.get("/champion/{champion_id}")
async def get_champion_details(champion_id: str):
    """Get detailed information about a specific champion."""
    if champion_id not in engine.champion_map:
        raise HTTPException(
            status_code=404,
            detail=f"Champion not found: {champion_id}"
        )
    
    return engine.champion_map[champion_id]


@app.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    """
    Get champion recommendations based on draft state.
    
    Args:
        request: RecommendationRequest with role, teams, and bans
        
    Returns:
        List of recommended champions with scores and explanations
    """
    try:
        recommendations = engine.recommend_champions(
            role=request.role,
            team=request.team,
            enemy_team=request.enemy_team,
            banned_champions=request.banned_champions,
            top_n=request.top_n
        )
        
        return {
            "role": request.role,
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )


@app.get("/roles")
async def get_available_roles():
    """Get all available roles in the game."""
    roles = set()
    for champion in engine.champions:
        roles.update(champion.get("roles", {}).keys())
    
    return {
        "roles": sorted(list(roles)),
        "count": len(roles)
    }


@app.get("/synergies")
async def get_synergies():
    """Get all synergy rules."""
    return {
        "synergies": engine.synergies,
        "count": len(engine.synergies)
    }


@app.get("/counters")
async def get_counters():
    """Get all counter rules."""
    return {
        "counters": engine.counters,
        "count": len(engine.counters)
    }


if __name__ == "__main__":
    import uvicorn
    print("🎮 Starting Wild Rift Draft Tool API...")
    print("📖 API Documentation: http://localhost:8000/docs")
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
