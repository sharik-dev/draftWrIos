import React, { useState } from 'react';
import PropTypes from 'prop-types';

function ChampionTable({ recommendations, filter, onChampionClick, isSelectionMode, takenChampions = [] }) {
    const [expandedId, setExpandedId] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const [hoveredId, setHoveredId] = useState(null);

    const filteredRecs = recommendations.filter(rec =>
        rec.champion.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredRecs.length === 0) {
        return (
            <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'rgba(212, 175, 55, 0.5)',
                fontFamily: 'var(--font-header)',
                fontSize: '1.5rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                animation: 'fadeIn 0.5s ease'
            }}>
                <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    opacity: 0.3
                }}>⬡</div>
                No Champions Found
                <div style={{
                    fontSize: '0.9rem',
                    marginTop: '0.5rem',
                    color: 'rgba(212, 175, 55, 0.3)',
                    fontFamily: 'var(--font-body)',
                    textTransform: 'none',
                    letterSpacing: '1px'
                }}>
                    Try adjusting your search filter
                </div>
            </div>
        );
    }

    const handleRowClick = (rec, e) => {
        // Check if champion is already taken
        const isTaken = takenChampions.includes(rec.champion.id);
        if (isTaken && isSelectionMode) {
            // Don't allow selection of taken champions
            return;
        }

        // Check if clicking on expand button area (right side)
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const isExpandButtonArea = clickX > rect.width - 60; // Last 60px is expand button area

        if (isExpandButtonArea) {
            // Always toggle expand when clicking the button area
            toggleExpand(rec.champion.id);
        } else if (isSelectionMode && onChampionClick) {
            // In selection mode, clicking the main area selects the champion
            onChampionClick(rec.champion);
        } else {
            // Otherwise toggle expand
            toggleExpand(rec.champion.id);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleImageError = (championId) => {
        setImageErrors(prev => ({ ...prev, [championId]: true }));
    };

    const getScoreColor = (score) => {
        if (score > 1.0) return 'var(--winrate-high)';
        if (score > 0.5) return 'var(--winrate-mid)';
        return 'var(--winrate-low)';
    };

    const getScoreGrade = (score) => {
        if (score > 1.2) return 'S+';
        if (score > 1.0) return 'S';
        if (score > 0.8) return 'A';
        if (score > 0.6) return 'B';
        if (score > 0.4) return 'C';
        return 'D';
    };

    const formatRoleViability = (viability) => {
        const percentage = Math.round(viability * 100);
        return `${percentage}%`;
    };

    return (
        <>
            {filteredRecs.map((rec, index) => {
                const isExpanded = expandedId === rec.champion.id;
                const hasImageError = imageErrors[rec.champion.id];
                const scoreColor = getScoreColor(rec.total_score);
                const scoreGrade = getScoreGrade(rec.total_score);
                const isHovered = hoveredId === rec.champion.id;
                const isTaken = takenChampions.includes(rec.champion.id);

                return (
                    <React.Fragment key={rec.champion.id}>
                        <div
                            className="rec-row"
                            onClick={(e) => handleRowClick(rec, e)}
                            onMouseEnter={() => !isTaken && setHoveredId(rec.champion.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{
                                animationDelay: `${index * 0.05}s`,
                                animation: 'slideInFromLeft 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both',
                                cursor: isTaken ? 'not-allowed' : (isSelectionMode ? 'pointer' : 'default'),
                                border: isTaken ? '1px solid rgba(255, 255, 255, 0.1)' : (isSelectionMode && isHovered ? '2px solid var(--c-gold-1)' : undefined),
                                boxShadow: isTaken ? 'none' : (isSelectionMode && isHovered ? '0 0 20px rgba(212, 175, 55, 0.3)' : undefined),
                                position: 'relative',
                                opacity: isTaken ? 0.4 : 1,
                                pointerEvents: isTaken && isSelectionMode ? 'none' : 'auto'
                            }}
                        >
                            {/* Role Viability */}
                            <div className="rec-role">
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        color: rec.tier_name === 'S+' ? '#ff0055' :
                                            rec.tier_name === 'S' ? '#00ccff' :
                                                rec.tier_name === 'A' ? '#00ff88' :
                                                    'rgba(255, 255, 255, 0.6)',
                                        textShadow: rec.tier_name === 'S+' || rec.tier_name === 'S' ? '0 0 10px currentColor' : 'none'
                                    }}>
                                        {rec.tier_name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: 'rgba(255, 255, 255, 0.4)',
                                        marginTop: '0px',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        TIER
                                    </div>

                                </div>
                            </div>

                            {/* Champion Info */}
                            <div className="rec-champion">
                                <div style={{ position: 'relative' }}>
                                    {!hasImageError ? (
                                        <img
                                            src={rec.champion.image_url}
                                            alt={rec.champion.name}
                                            className="rec-img"
                                            onError={() => handleImageError(rec.champion.id)}
                                            loading="lazy"
                                            style={{
                                                display: 'block'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="rec-img"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #0d1b2a, #050a0f)',
                                                color: 'rgba(212, 175, 55, 0.3)',
                                                fontSize: '1.5rem',
                                                fontWeight: '700',
                                                fontFamily: 'var(--font-header)'
                                            }}
                                        >
                                            {rec.champion.name.charAt(0)}
                                        </div>
                                    )}

                                    {/* Glow effect on hover */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: '-4px',
                                        borderRadius: '8px',
                                        background: `radial-gradient(circle at center, ${scoreColor}, transparent)`,
                                        opacity: '0',
                                        transition: 'opacity 0.3s ease',
                                        pointerEvents: 'none',
                                        zIndex: '-1'
                                    }} className="rec-img-glow" />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    minWidth: 0,
                                    flex: 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="rec-name">
                                            {rec.champion.name}
                                        </span>
                                        {/* Tier Badge */}
                                        {/* Tier badge moved to left column */}
                                    </div>

                                    {/* Additional info badges */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '6px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {isTaken && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                                borderRadius: '4px',
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                ✓ PICKED
                                            </span>
                                        )}
                                        {rec.synergy_explanations.length > 0 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(0, 255, 136, 0.15)',
                                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                                borderRadius: '4px',
                                                color: 'var(--winrate-high)',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {rec.synergy_explanations.length} Synergy
                                            </span>
                                        )}
                                        {rec.counter_explanations.length > 0 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(76, 201, 240, 0.15)',
                                                border: '1px solid rgba(76, 201, 240, 0.3)',
                                                borderRadius: '4px',
                                                color: 'var(--accent-blue)',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {rec.counter_explanations.length} Counter
                                            </span>
                                        )}
                                        {rec.vulnerability_explanations.length > 0 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(247, 37, 133, 0.15)',
                                                border: '1px solid rgba(247, 37, 133, 0.3)',
                                                borderRadius: '4px',
                                                color: 'var(--accent-red)',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {rec.vulnerability_explanations.length} Risque
                                            </span>
                                        )}
                                        {/* Early Impact Badge */}
                                        {rec.early_impact >= 0.75 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(255, 165, 0, 0.15)',
                                                border: '1px solid rgba(255, 165, 0, 0.4)',
                                                borderRadius: '4px',
                                                color: '#FFA500',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                ⚡ Début de Partie
                                            </span>
                                        )}
                                        {/* Late Scaling Badge */}
                                        {rec.late_scaling >= 0.85 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(138, 43, 226, 0.15)',
                                                border: '1px solid rgba(138, 43, 226, 0.4)',
                                                borderRadius: '4px',
                                                color: '#9370DB',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                📈 Fin de Partie
                                            </span>
                                        )}
                                        {/* Flex Pick Badge */}
                                        {rec.flex_score >= 0.15 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(255, 215, 0, 0.15)',
                                                border: '1px solid rgba(255, 215, 0, 0.4)',
                                                borderRadius: '4px',
                                                color: '#FFD700',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                🔄 Polyvalent
                                            </span>
                                        )}
                                        {/* Team Balance Badge */}
                                        {rec.balance_bonus >= 0.10 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(50, 205, 50, 0.15)',
                                                border: '1px solid rgba(50, 205, 50, 0.4)',
                                                borderRadius: '4px',
                                                color: '#32CD32',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                ⚖️ Équilibre
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Score with Grade */}
                            <div className="rec-score" style={{ color: scoreColor }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px'
                                }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'var(--font-mono)',
                                        opacity: '0.7',
                                        fontWeight: '600',
                                        letterSpacing: '1px'
                                    }}>
                                        {scoreGrade}
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '800',
                                        lineHeight: '1'
                                    }}>
                                        {(rec.total_score || 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Expand indicator */}
                            <div style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: `translateY(-50%) rotate(${isExpanded ? '180deg' : '0deg'})`,
                                color: 'rgba(212, 175, 55, 0.5)',
                                fontSize: '0.8rem',
                                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                pointerEvents: 'none'
                            }}>
                                ▼
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="rec-details" style={{
                                padding: '16px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                animation: 'slideDown 0.3s ease-out'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr', gap: '20px' }}>

                                    {/* Colonne Gauche: Stats & Style */}
                                    <div>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>PROFIL DU CHAMPION</h4>

                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                                ⚔️ Type: <strong style={{ color: '#fff' }}>{rec.champion.damage_type || 'Adaptatif'}</strong>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                                📈 Scaling: <strong style={{ color: '#fff' }}>{rec.champion.scaling === 'early' ? 'Début' : rec.champion.scaling === 'late' ? 'Fin' : 'Moyen'}</strong>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                                            {rec.champion.kit_tags && rec.champion.kit_tags.filter(t => t !== rec.champion.id).map(tag => (
                                                <span key={tag} style={{
                                                    fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px',
                                                    background: 'rgba(100, 200, 255, 0.1)', color: '#8cf', border: '1px solid rgba(100, 200, 255, 0.2)'
                                                }}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div style={{ fontSize: '0.85rem', color: '#ccc', fontStyle: 'italic', borderLeft: '3px solid var(--accent-blue)', paddingLeft: '10px', lineHeight: '1.4' }}>
                                            "{rec.champion.description || 'Un choix solide pour cette composition. Adaptez votre build selon la situation.'}"
                                        </div>
                                    </div>

                                    {/* Colonne Droite: Analyse Draft */}
                                    <div>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>ANALYSE DU DRAFT</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>

                                            {/* Synergies */}
                                            {rec.synergy_explanations.length > 0 ? (
                                                rec.synergy_explanations.map((e, i) => (
                                                    <li key={i} style={{ marginBottom: '8px', color: '#e0e0e0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                        <span style={{ color: 'var(--winrate-high)' }}>✓</span>
                                                        <span>{e.replace("with", "avec").replace("Knockups enable", "Les knockups activent").replace("Protect scalers", "Protège les hyperscalers").replace("Shields enable", "Les boucliers permettent").replace("Mobile teams can", "Les équipes mobiles peuvent")}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li style={{ color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>• Pas de synergie majeure détectée.</li>
                                            )}

                                            {/* Counters */}
                                            {rec.counter_explanations.length > 0 && (
                                                rec.counter_explanations.map((e, i) => (
                                                    <li key={i} style={{ marginBottom: '8px', color: 'var(--accent-blue)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                        <span>⚔️</span>
                                                        <span>{e.replace("Strong against", "Fort contre").replace("Good against", "Bon contre").replace("Counters", "Contre")}</span>
                                                    </li>
                                                ))
                                            )}

                                            {/* Risks */}
                                            {rec.vulnerability_explanations.length > 0 && (
                                                rec.vulnerability_explanations.map((e, i) => (
                                                    <li key={i} style={{ marginBottom: '8px', color: 'var(--accent-red)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                        <span>⚠️</span>
                                                        <span>{e.replace("Weak against", "Faible contre").replace("Vulnerable to", "Vulnérable à")}</span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Barre de Score Globale */}
                                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>PERTINENCE GLOBALE</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: scoreColor }}>{(rec.total_score || 0).toFixed(2)} / 5.0</span>
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                        <div style={{
                                            width: `${Math.min(((rec.total_score || 0) / 1.5) * 100, 100)}%`,
                                            height: '100%',
                                            background: scoreColor,
                                            borderRadius: '2px',
                                            boxShadow: `0 0 10px ${scoreColor}`
                                        }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            <style jsx>{`
                @keyframes slideInFromLeft {
                    0% {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fillBar {
                    0% {
                        width: 0;
                    }
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .rec-row:hover .rec-img-glow {
                    opacity: 0.3 !important;
                }
            `}</style>
        </>
    );
}

ChampionTable.propTypes = {
    recommendations: PropTypes.arrayOf(PropTypes.shape({
        champion: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            image_url: PropTypes.string.isRequired,
            role_viability: PropTypes.number.isRequired
        }).isRequired,
        total_score: PropTypes.number.isRequired,
        synergy_explanations: PropTypes.arrayOf(PropTypes.string),
        counter_explanations: PropTypes.arrayOf(PropTypes.string),
        vulnerability_explanations: PropTypes.arrayOf(PropTypes.string)
    })).isRequired,
    filter: PropTypes.string.isRequired,
    onChampionClick: PropTypes.func,
    isSelectionMode: PropTypes.bool,
    takenChampions: PropTypes.arrayOf(PropTypes.string)
};

ChampionTable.defaultProps = {
    recommendations: [],
    filter: '',
    onChampionClick: null,
    isSelectionMode: false,
    takenChampions: []
};

export default ChampionTable;