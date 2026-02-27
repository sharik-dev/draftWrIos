import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './App.css';

// Components
import DraftColumn from './components/DraftColumn';
import ChampionTable from './components/ChampionTable';
import TeamHeader from './components/TeamHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Draft State
  const [teamPicks, setTeamPicks] = useState(Array(5).fill(null));
  const [enemyPicks, setEnemyPicks] = useState(Array(5).fill(null));

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({ role: 'top', search: '' }); // Default to top

  // Active slot selection (instead of modal)
  const [activeSlot, setActiveSlot] = useState({
    side: null, // 'team' or 'enemy'
    index: null
  });

  // Role mapping for slots (Top, Jungle, Mid, ADC, Support)
  const SLOT_ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];

  // Load champions on mount
  useEffect(() => {
    loadChampions();
  }, []);

  // Auto-refresh recommendations when picks change or filters change
  useEffect(() => {
    if (champions.length > 0) {
      updateRecommendations();
    }
  }, [teamPicks, enemyPicks, filters.role, champions]);

  const loadChampions = async () => {
    try {
      const response = await axios.get(`${API_URL}/champions`);
      setChampions(response.data.champions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load champions:', error);
      setLoading(false);
    }
  };

  const updateRecommendations = async () => {
    // Construct current state for API
    const team = teamPicks.filter(c => c !== null).map(c => c.id);
    const enemy = enemyPicks.filter(c => c !== null).map(c => c.id);
    const bans = []; // Add bans support later if needed

    // If we're selecting for enemy team, invert the logic
    // Enemy slot should get recommendations that synergize with enemy team and counter ally team
    const isSelectingEnemy = activeSlot.side === 'enemy';
    const apiTeam = isSelectingEnemy ? enemy : team;
    const apiEnemy = isSelectingEnemy ? team : enemy;

    try {
      const response = await axios.post(`${API_URL}/recommend`, {
        role: filters.role,
        team: apiTeam,
        enemy_team: apiEnemy,
        banned_champions: bans,
        top_n: 200 // Get many to scroll
      });

      // Merge champion data - keep backend data but add local image if needed
      const enhancedRecs = response.data.recommendations.map(rec => {
        const localChamp = champions.find(c => c.id === rec.champion.id);
        return {
          ...rec,
          champion: {
            ...rec.champion, // Keep backend data (includes role_viability!)
            image_url: localChamp?.image_url || rec.champion.image_url // Just add image
          }
        };
      });

      setRecommendations(enhancedRecs);
    } catch (error) {
      console.error('Error getting recommendations', error);
    }
  };

  // When a slot is clicked, set it as active and change role filter
  const handleSlotClick = (side, index) => {
    setActiveSlot({ side, index });
    const role = SLOT_ROLES[index];
    setFilters({ ...filters, role });
  };

  // When a recommended champion is clicked, assign it to the active slot
  const handleRecommendationClick = (champion) => {
    if (!activeSlot.side || activeSlot.index === null) {
      // No active slot, ignore
      return;
    }

    const { side, index } = activeSlot;

    // Check if already picked
    const allPicked = [...teamPicks, ...enemyPicks].filter(p => p).map(p => p.id);
    if (allPicked.includes(champion.id)) {
      console.warn('Champion already picked');
      return;
    }

    if (side === 'team') {
      const newPicks = [...teamPicks];
      newPicks[index] = champion;
      setTeamPicks(newPicks);
    } else {
      const newPicks = [...enemyPicks];
      newPicks[index] = champion;
      setEnemyPicks(newPicks);
    }

    // Keep the slot active for quick successive picks, or clear it
    // setActiveSlot({ side: null, index: null }); // Uncomment to clear after pick
  };

  const handleRemovePick = (side, index, e) => {
    e.stopPropagation();
    if (side === 'team') {
      const newPicks = [...teamPicks];
      newPicks[index] = null;
      setTeamPicks(newPicks);
    } else {
      const newPicks = [...enemyPicks];
      newPicks[index] = null;
      setEnemyPicks(newPicks);
    }

    // Re-activate the slot after removal
    setActiveSlot({ side, index });
    const role = SLOT_ROLES[index];
    setFilters({ ...filters, role });
  };

  // Calculate team strength (0-1 scale)
  const calculateTeamStrength = (picks) => {
    const validPicks = picks.filter(p => p);
    if (validPicks.length === 0) return 0;

    // Tier score for contribution to TOTAL team strength (max 1.0 for 5 champs)
    // S+ contributes 0.20 (20%), D contributes 0.06 (6%)
    const tierScores = {
      'S+': 1.0,
      'S': 0.9,
      'A': 0.75,
      'B': 0.60,
      'C': 0.40,
      'D': 0.20
    };

    // Calculate total score (cumulative)
    // Max score possible is 5.0 (5 x S+)
    const totalScore = validPicks.reduce((sum, pick) => {
      const tier = pick.tier || 'B';
      return sum + (tierScores[tier] || 0.60);
    }, 0);

    // Normalize to 0-1 range (divide by 5 slots)
    // A single S+ champion gives 0.20 (20% strength)
    // A full team of B champions gives 0.60 (60% strength)
    return Math.min(totalScore / 5, 1.0);
  };

  const teamStrength = calculateTeamStrength(teamPicks);
  const enemyStrength = calculateTeamStrength(enemyPicks);

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (loading) return <div className="app-loading">{t('app.loading')}</div>;

  return (
    <div className="app">
      <header className="header header-centered">
        <h1> <img src="./src/assets/Gemini_Generated_Image_6.png" alt="Logo" width="20" height="20" /> {t('app.title')}</h1>

        <div className="lang-switcher">
          <button onClick={() => i18n.changeLanguage('fr')}>🇫🇷</button>
          <button onClick={() => i18n.changeLanguage('en')}>🇬🇧</button>
        </div>
      </header>

      <div className="main-content">
        {/* Left Column: Your Team */}
        <DraftColumn
          title="ALLY"
          picks={teamPicks}
          side="team"
          onSlotClick={handleSlotClick}
          onRemovePick={handleRemovePick}
          headerClass="ally-header"
          activeSlotIndex={activeSlot.side === 'team' ? activeSlot.index : null}
        />

        {/* Center Column: Recommendations */}
        <div className="column center-panel">
          {/* Enhanced Header with Team Scores */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(5, 10, 15, 0.95))',
            borderRadius: '12px 12px 0 0',
            borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
            alignItems: 'center'
          }}>
            <TeamHeader
              title="FORCE ALLIÉE"
              picks={teamPicks}
              strength={teamStrength}
              colorVar="--c-ally"
            />

            {/* VS */}
            <div style={{
              fontFamily: 'var(--font-header)',
              fontSize: '3rem',
              color: 'var(--c-gold-1)',
              textShadow: '0 0 30px rgba(212, 175, 55, 0.8)',
              fontWeight: '800',
              letterSpacing: '4px'
            }}>
              VS
            </div>

            <TeamHeader
              title="FORCE ENNEMIE"
              picks={enemyPicks}
              strength={enemyStrength}
              colorVar="--c-enemy"
            />
          </div>

          {/* Controls Bar (Search + Role Filters) */}
          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un champion..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <div className="role-filters">
              {['top', 'jungle', 'mid', 'adc', 'support'].map(role => (
                <button
                  key={role}
                  className={`role-icon-btn ${filters.role === role ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, role })}
                  title={role}
                >
                  <img
                    src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${role.toLowerCase().replace('support', 'utility').replace('mid', 'middle').replace('adc', 'bottom')}.png`}
                    alt={role}
                    style={{ width: '20px', filter: 'invert(1)' }}
                    onError={(e) => {
                      // Fallback if generic icon fails
                      e.target.style.display = 'none';
                      e.target.parentNode.innerText = role[0].toUpperCase();
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Active slot indicator */}
          {activeSlot.side && activeSlot.index !== null && (
            <div style={{
              padding: '12px 20px',
              background: activeSlot.side === 'team'
                ? 'rgba(0, 255, 200, 0.1)'
                : 'rgba(255, 51, 102, 0.1)',
              border: activeSlot.side === 'team'
                ? '1px solid rgba(0, 255, 200, 0.3)'
                : '1px solid rgba(255, 51, 102, 0.3)',
              borderRadius: '8px',
              margin: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: activeSlot.side === 'team' ? 'var(--c-ally)' : 'var(--c-enemy)',
                  boxShadow: `0 0 10px ${activeSlot.side === 'team' ? 'var(--c-ally)' : 'var(--c-enemy)'}`,
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                <span style={{ color: 'var(--c-gold-1)', fontWeight: '700' }}>
                  Sélection pour {activeSlot.side === 'team' ? 'ALLIÉ' : 'ENNEMI'} - {SLOT_ROLES[activeSlot.index].toUpperCase()}
                </span>
              </div>
              {activeSlot.side === 'enemy' && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontStyle: 'italic',
                  paddingLeft: '20px'
                }}>
                  Affiche les champions qui synergisent avec l'équipe ennemie et contrent vos alliés
                </div>
              )}
            </div>
          )}

          <div className="rec-list">
            <ChampionTable
              recommendations={recommendations}
              filter={filters.search}
              onChampionClick={handleRecommendationClick}
              isSelectionMode={activeSlot.side !== null}
              takenChampions={[...teamPicks, ...enemyPicks].filter(p => p).map(p => p.id)}
            />
          </div>
        </div>

        {/* Right Column: Enemy Team */}
        <DraftColumn
          title="OPPONENT"
          picks={enemyPicks}
          side="enemy"
          onSlotClick={handleSlotClick}
          onRemovePick={handleRemovePick}
          headerClass="enemy-header"
          activeSlotIndex={activeSlot.side === 'enemy' ? activeSlot.index : null}
        />
      </div>
    </div>
  );
}

export default App;
