import React, { useState } from 'react';
import PropTypes from 'prop-types';

function RecommendationsList({ recommendations, onSelectChampion, allChampions, takenChampions }) {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);

    const handleCardClick = (recommendation) => {
        setSelectedRecommendation(recommendation);
        setShowPicker(true);
    };

    const handleChampionPick = (champion) => {
        if (onSelectChampion) {
            onSelectChampion(champion);
        }
        setShowPicker(false);
        setSelectedRecommendation(null);
    };

    const handleClosePicker = () => {
        setShowPicker(false);
        setSelectedRecommendation(null);
    };

    if (recommendations.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(5, 10, 15, 0.95))',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    opacity: 0.3,
                    animation: 'spin 4s linear infinite'
                }}>⬡</div>
                <h3 style={{
                    fontFamily: 'var(--font-header)',
                    fontSize: '1.8rem',
                    color: 'var(--c-gold-1)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '0.5rem'
                }}>
                    No Recommendations
                </h3>
                <p style={{
                    color: 'rgba(212, 175, 55, 0.6)',
                    marginTop: '1rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem'
                }}>
                    Try adjusting your team composition or role selection
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="recommendations-list" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {recommendations.map((rec, index) => (
                    <RecommendationCard
                        key={rec.champion.id}
                        recommendation={rec}
                        rank={index + 1}
                        onClick={() => handleCardClick(rec)}
                    />
                ))}
            </div>

            {/* Champion Picker Modal */}
            {showPicker && allChampions && (
                <ChampionPickerModal
                    champions={allChampions}
                    takenChampions={takenChampions || []}
                    onPick={handleChampionPick}
                    onClose={handleClosePicker}
                    recommendation={selectedRecommendation}
                />
            )}
        </>
    );
}

RecommendationsList.propTypes = {
    recommendations: PropTypes.array.isRequired,
    onSelectChampion: PropTypes.func,
    allChampions: PropTypes.array,
    takenChampions: PropTypes.array
};

function RecommendationCard({ recommendation, rank, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const {
        champion,
        total_score,
        synergy_score,
        counter_score,
        vulnerability_score,
        synergy_explanations,
        counter_explanations,
        vulnerability_explanations
    } = recommendation;

    const getRankEmoji = (r) => {
        if (r === 1) return '🥇';
        if (r === 2) return '🥈';
        if (r === 3) return '🥉';
        return `${r}.`;
    };

    const getRankColor = (r) => {
        if (r === 1) return '#ffd700';
        if (r === 2) return '#c0c0c0';
        if (r === 3) return '#cd7f32';
        return 'var(--c-gold-1)';
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

    return (
        <div
            className="recommendation-card"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(5, 10, 15, 0.95))',
                border: `2px solid ${isHovered ? 'var(--c-gold-1)' : 'rgba(212, 175, 55, 0.3)'}`,
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
                boxShadow: isHovered
                    ? '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.2)'
                    : '0 4px 16px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${rank * 0.1}s`,
                animation: 'cardEntry 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both'
            }}
        >
            {/* Rank Badge */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                fontSize: '2rem',
                filter: `drop-shadow(0 0 10px ${getRankColor(rank)})`,
                transition: 'transform 0.3s ease',
                transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1) rotate(0deg)',
                zIndex: 10
            }}>
                {getRankEmoji(rank)}
            </div>

            {/* Click Indicator */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '8px 12px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--c-gold-1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: isHovered ? 1 : 0.5,
                transition: 'all 0.3s ease',
                fontWeight: '700'
            }}>
                Click to Select
            </div>

            {/* Header Section */}
            <div className="recommendation-header" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '24px',
                paddingTop: '40px'
            }}>
                {/* Champion Image */}
                <div style={{
                    position: 'relative',
                    flexShrink: 0
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '12px',
                        border: `3px solid ${getScoreColor(total_score)}`,
                        overflow: 'hidden',
                        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 30px ${getScoreColor(total_score)}44`,
                        transition: 'all 0.4s ease',
                        transform: isHovered ? 'scale(1.1) rotate(-3deg)' : 'scale(1) rotate(0deg)',
                        position: 'relative'
                    }}>
                        {!imageError ? (
                            <img
                                src={champion.image_url}
                                alt={champion.name}
                                onError={() => setImageError(true)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    imageRendering: '-webkit-optimize-contrast'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #0d1b2a, #050a0f)',
                                fontSize: '2.5rem',
                                fontWeight: '700',
                                color: getScoreColor(total_score),
                                fontFamily: 'var(--font-header)'
                            }}>
                                {champion.name.charAt(0)}
                            </div>
                        )}

                        {/* Animated border */}
                        {isHovered && (
                            <div style={{
                                position: 'absolute',
                                inset: '-3px',
                                borderRadius: '12px',
                                background: `conic-gradient(from 0deg, transparent, ${getScoreColor(total_score)}, transparent)`,
                                animation: 'rotate 3s linear infinite',
                                zIndex: -1
                            }} />
                        )}
                    </div>

                    {/* Grade Badge */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        right: '-8px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: getScoreColor(total_score),
                        border: '2px solid rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-header)',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        color: '#000',
                        boxShadow: `0 4px 12px ${getScoreColor(total_score)}88`,
                        animation: 'pulse 2s ease-in-out infinite'
                    }}>
                        {getScoreGrade(total_score)}
                    </div>
                </div>

                {/* Champion Info */}
                <div className="champion-title" style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="champion-name" style={{
                        margin: '0 0 8px 0',
                        fontFamily: 'var(--font-header)',
                        fontSize: '1.8rem',
                        color: 'var(--c-gold-1)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        textShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
                        transition: 'all 0.3s ease'
                    }}>
                        {champion.name}
                    </h3>
                    <p className="champion-desc" style={{
                        margin: '0 0 12px 0',
                        color: 'rgba(212, 175, 55, 0.7)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5'
                    }}>
                        {champion.description}
                    </p>

                    {/* Score Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: `${getScoreColor(total_score)}22`,
                        border: `2px solid ${getScoreColor(total_score)}44`,
                        borderRadius: '8px',
                        fontFamily: 'var(--font-header)',
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: getScoreColor(total_score),
                        textShadow: `0 0 10px ${getScoreColor(total_score)}`
                    }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>SCORE</span>
                        {total_score.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Champion Stats */}
            <div className="champion-info" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div className="info-item" style={{
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.1)'
                }}>
                    <div className="info-label" style={{
                        fontSize: '0.7rem',
                        color: 'rgba(212, 175, 55, 0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        Damage Type
                    </div>
                    <div className="info-value" style={{
                        fontFamily: 'var(--font-header)',
                        fontSize: '1rem',
                        color: 'var(--c-gold-2)',
                        fontWeight: '700'
                    }}>
                        {champion.damage_type}
                    </div>
                </div>

                <div className="info-item" style={{
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.1)'
                }}>
                    <div className="info-label" style={{
                        fontSize: '0.7rem',
                        color: 'rgba(212, 175, 55, 0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        Power Spike
                    </div>
                    <div className="info-value" style={{
                        fontFamily: 'var(--font-header)',
                        fontSize: '1rem',
                        color: 'var(--c-gold-2)',
                        fontWeight: '700'
                    }}>
                        {champion.scaling}
                    </div>
                </div>

                <div className="info-item" style={{
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.1)'
                }}>
                    <div className="info-label" style={{
                        fontSize: '0.7rem',
                        color: 'rgba(212, 175, 55, 0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        Role Fit
                    </div>
                    <div className="info-value" style={{
                        fontFamily: 'var(--font-header)',
                        fontSize: '1rem',
                        color: 'var(--winrate-high)',
                        fontWeight: '700'
                    }}>
                        {(champion.role_viability * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            {/* Kit Tags */}
            {champion.kit_tags && champion.kit_tags.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'rgba(212, 175, 55, 0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        Kit Tags
                    </div>
                    <div className="kit-tags" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                    }}>
                        {champion.kit_tags.map(tag => (
                            <span key={tag} className="kit-tag" style={{
                                padding: '4px 10px',
                                background: 'rgba(212, 175, 55, 0.1)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                color: 'var(--c-gold-1)',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Score Breakdown */}
            <div className="score-breakdown" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div className="breakdown-item" style={{
                    padding: '12px',
                    background: 'rgba(0, 255, 136, 0.08)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div className="breakdown-label" style={{
                        fontSize: '0.7rem',
                        color: 'var(--winrate-high)',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '600'
                    }}>
                        Synergy
                    </div>
                    <div className="breakdown-value" style={{
                        fontFamily: 'var(--font-header)',
                        fontSize: '1.3rem',
                        color: 'var(--winrate-high)',
                        fontWeight: '800'
                    }}>
                        {synergy_score.toFixed(2)}
                    </div>
                </div>

                <div className="breakdown-item" style={{
                    padding: '12px',
                    background: 'rgba(76, 201, 240, 0.08)',
                    border: '1px solid rgba(76, 201, 240, 0.2)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div className="breakdown-label" style={{
                        fontSize: '0.7rem',
                        color: 'var(--accent-blue)',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '600'
                    }}>
                        Counter
                    </div>
                    <div className="breakdown-value" style={{
                        fontFamily: 'var(--font-header)',
                        fontSize: '1.3rem',
                        color: 'var(--accent-blue)',
                        fontWeight: '800'
                    }}>
                        {counter_score.toFixed(2)}
                    </div>
                </div>

                <div className="breakdown-item" style={{
                    padding: '12px',
                    background: 'rgba(247, 37, 133, 0.08)',
                    border: '1px solid rgba(247, 37, 133, 0.2)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div className="breakdown-label" style={{
                        fontSize: '0.7rem',
                        color: 'var(--accent-red)',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '600'
                    }}>
                        Vulnerability
                    </div>
                    <div className="breakdown-value" style={{
                        fontFamily: 'var(--font-header)',
                        fontSize: '1.3rem',
                        color: 'var(--accent-red)',
                        fontWeight: '800'
                    }}>
                        {vulnerability_score.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Explanations */}
            <div className="explanations">
                {synergy_explanations && synergy_explanations.length > 0 && (
                    <div className="explanation-section" style={{
                        marginBottom: '16px',
                        padding: '16px',
                        background: 'rgba(0, 255, 136, 0.05)',
                        borderLeft: '4px solid var(--winrate-high)',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{
                            margin: '0 0 12px 0',
                            fontFamily: 'var(--font-header)',
                            fontSize: '1rem',
                            color: 'var(--winrate-high)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🤝 Team Synergies
                        </h4>
                        <ul className="explanation-list" style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0
                        }}>
                            {synergy_explanations.map((exp, i) => (
                                <li key={i} style={{
                                    padding: '8px 0',
                                    color: 'rgba(245, 240, 230, 0.9)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    paddingLeft: '20px',
                                    position: 'relative'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: 0,
                                        color: 'var(--winrate-high)',
                                        fontWeight: '700'
                                    }}>▸</span>
                                    {exp}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {counter_explanations && counter_explanations.length > 0 && (
                    <div className="explanation-section" style={{
                        marginBottom: '16px',
                        padding: '16px',
                        background: 'rgba(76, 201, 240, 0.05)',
                        borderLeft: '4px solid var(--accent-blue)',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{
                            margin: '0 0 12px 0',
                            fontFamily: 'var(--font-header)',
                            fontSize: '1rem',
                            color: 'var(--accent-blue)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            ⚔️ Counters Enemy
                        </h4>
                        <ul className="explanation-list" style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0
                        }}>
                            {counter_explanations.map((exp, i) => (
                                <li key={i} style={{
                                    padding: '8px 0',
                                    color: 'rgba(245, 240, 230, 0.9)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    paddingLeft: '20px',
                                    position: 'relative'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: 0,
                                        color: 'var(--accent-blue)',
                                        fontWeight: '700'
                                    }}>▸</span>
                                    {exp}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {vulnerability_explanations && vulnerability_explanations.length > 0 && (
                    <div className="explanation-section" style={{
                        padding: '16px',
                        background: 'rgba(247, 37, 133, 0.05)',
                        borderLeft: '4px solid var(--accent-red)',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{
                            margin: '0 0 12px 0',
                            fontFamily: 'var(--font-header)',
                            fontSize: '1rem',
                            color: 'var(--accent-red)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            ⚠️ Vulnerabilities
                        </h4>
                        <ul className="explanation-list" style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0
                        }}>
                            {vulnerability_explanations.map((exp, i) => (
                                <li key={i} style={{
                                    padding: '8px 0',
                                    color: 'rgba(245, 240, 230, 0.9)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    paddingLeft: '20px',
                                    position: 'relative'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: 0,
                                        color: 'var(--accent-red)',
                                        fontWeight: '700'
                                    }}>▸</span>
                                    {exp}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes cardEntry {
                    0% {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
}

RecommendationCard.propTypes = {
    recommendation: PropTypes.object.isRequired,
    rank: PropTypes.number.isRequired,
    onClick: PropTypes.func
};

// Champion Picker Modal Component
function ChampionPickerModal({ champions, takenChampions, onPick, onClose, recommendation }) {
    const [search, setSearch] = useState('');
    const [imageErrors, setImageErrors] = useState({});
    const [hoveredChamp, setHoveredChamp] = useState(null);

    const handleImageError = (championId) => {
        setImageErrors(prev => ({ ...prev, [championId]: true }));
    };

    const filtered = champions.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !takenChampions.includes(c.id)
    );

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.3s ease',
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #0d1b2a, #050a0f)',
                    border: '3px solid var(--c-gold-1)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 80px rgba(0, 0, 0, 0.9), 0 0 100px rgba(212, 175, 55, 0.3)',
                    width: '90%',
                    maxWidth: '900px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'modalEntry 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal content - same as ChampionPicker but simplified */}
                <div style={{
                    padding: '28px 32px',
                    borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontFamily: 'var(--font-header)',
                        color: 'var(--c-gold-1)',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        fontSize: '1.8rem'
                    }}>
                        ⬡ Select Champion
                    </h2>

                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                        style={{
                            flex: 1,
                            maxWidth: '320px',
                            padding: '14px 20px',
                            background: 'rgba(5, 10, 15, 0.9)',
                            border: '2px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '8px',
                            color: 'var(--c-gold-2)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}
                    />

                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 51, 102, 0.1)',
                            border: '2px solid rgba(255, 51, 102, 0.3)',
                            borderRadius: '8px',
                            color: 'var(--c-enemy)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '8px 14px',
                            fontWeight: '700'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '16px',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    {filtered.map((champ, index) => {
                        const hasError = imageErrors[champ.id];
                        const isHovered = hoveredChamp === champ.id;

                        return (
                            <div
                                key={champ.id}
                                onClick={() => onPick(champ)}
                                onMouseEnter={() => setHoveredChamp(champ.id)}
                                onMouseLeave={() => setHoveredChamp(null)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease',
                                    transform: isHovered ? 'translateY(-8px) scale(1.05)' : 'none'
                                }}
                            >
                                <div style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    aspectRatio: '1',
                                    border: `3px solid ${isHovered ? 'var(--c-gold-1)' : 'rgba(212, 175, 55, 0.3)'}`,
                                    boxShadow: isHovered ? '0 8px 32px rgba(212, 175, 55, 0.4)' : 'none',
                                    position: 'relative'
                                }}>
                                    {!hasError ? (
                                        <img
                                            src={champ.image_url}
                                            alt={champ.name}
                                            onError={() => handleImageError(champ.id)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #0d1b2a, #050a0f)',
                                            fontSize: '2.5rem',
                                            fontWeight: '700',
                                            color: 'rgba(212, 175, 55, 0.3)'
                                        }}>
                                            {champ.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    marginTop: '10px',
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-header)',
                                    fontSize: '0.9rem',
                                    color: isHovered ? 'var(--c-gold-1)' : 'var(--c-gold-2)',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>
                                    {champ.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }

                @keyframes modalEntry {
                    0% {
                        opacity: 0;
                        transform: scale(0.8) translateY(-50px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

ChampionPickerModal.propTypes = {
    champions: PropTypes.array.isRequired,
    takenChampions: PropTypes.array.isRequired,
    onPick: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    recommendation: PropTypes.object
};

export default RecommendationsList;