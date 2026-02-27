import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function ChampionPicker({ champions, onPick, onClose, taken }) {
    const [search, setSearch] = useState('');
    const [animate, setAnimate] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [hoveredChamp, setHoveredChamp] = useState(null);

    useEffect(() => {
        setAnimate(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleImageError = (championId) => {
        setImageErrors(prev => ({ ...prev, [championId]: true }));
    };

    const filtered = champions.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !taken.includes(c.id)
    );

    const handlePick = (champ) => {
        onPick(champ);
        setAnimate(false);
        setTimeout(onClose, 200);
    };

    return (
        <div
            className={`modal-overlay ${animate ? 'modal-fade-in' : 'modal-fade-out'}`}
            onClick={onClose}
        >
            <div
                className={`modal-content ${animate ? 'modal-scale-in' : 'modal-scale-out'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Enhanced Header */}
                <div className="modal-header" style={{
                    padding: '28px 32px',
                    borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.98), rgba(5, 10, 15, 0.95))',
                    position: 'relative',
                    gap: '20px'
                }}>
                    {/* Decorative Line */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, var(--c-gold-1), transparent)',
                        filter: 'blur(2px)'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '4px',
                            height: '40px',
                            background: 'linear-gradient(180deg, var(--c-gold-1), transparent)',
                            borderRadius: '2px'
                        }} />
                        <h2 style={{
                            margin: 0,
                            fontFamily: 'var(--font-header)',
                            color: 'var(--c-gold-1)',
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontSize: '1.8rem',
                            textShadow: '0 0 20px rgba(212, 175, 55, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.8)'
                        }}>
                            ⬡ Select Champion
                        </h2>
                    </div>

                    {/* Enhanced Search Input */}
                    <input
                        type="text"
                        placeholder="Search champion..."
                        className="search-input"
                        style={{
                            width: '320px',
                            fontSize: '1rem',
                            padding: '14px 20px',
                            background: 'rgba(5, 10, 15, 0.9)',
                            border: '2px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '8px',
                            color: 'var(--c-gold-2)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    {/* Enhanced Close Button */}
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
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            fontWeight: '700',
                            lineHeight: '1'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 51, 102, 0.3)';
                            e.target.style.borderColor = 'var(--c-enemy)';
                            e.target.style.transform = 'scale(1.1) rotate(90deg)';
                            e.target.style.boxShadow = '0 0 20px rgba(255, 51, 102, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 51, 102, 0.1)';
                            e.target.style.borderColor = 'rgba(255, 51, 102, 0.3)';
                            e.target.style.transform = 'scale(1) rotate(0deg)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Stats Bar */}
                <div style={{
                    padding: '12px 32px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    color: 'rgba(212, 175, 55, 0.7)'
                }}>
                    <div>
                        <span style={{ color: 'var(--c-gold-1)', fontWeight: '700' }}>{filtered.length}</span>
                        {' '}champions available
                    </div>
                    <div>
                        <span style={{ color: 'var(--c-enemy)', fontWeight: '700' }}>{taken.length}</span>
                        {' '}already picked
                    </div>
                </div>

                {/* Champion Grid */}
                <div
                    className="champion-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '16px',
                        padding: '24px',
                        overflowY: 'auto',
                        flex: 1,
                        background: 'rgba(0, 0, 0, 0.2)'
                    }}
                >
                    {filtered.map((champ, index) => {
                        const hasError = imageErrors[champ.id];
                        const isHovered = hoveredChamp === champ.id;

                        return (
                            <div
                                key={champ.id}
                                className="grid-item"
                                onClick={() => handlePick(champ)}
                                onMouseEnter={() => setHoveredChamp(champ.id)}
                                onMouseLeave={() => setHoveredChamp(null)}
                                style={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    animationDelay: `${index * 0.02}s`,
                                    animation: 'championFadeIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both'
                                }}
                            >
                                {/* Image Container */}
                                <div className="img-wrapper" style={{
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    aspectRatio: '1',
                                    border: '3px solid rgba(212, 175, 55, 0.3)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                                    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                    transform: isHovered ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
                                    zIndex: isHovered ? 10 : 1
                                }}>
                                    {!hasError ? (
                                        <img
                                            src={champ.image_url}
                                            alt={champ.name}
                                            onError={() => handleImageError(champ.id)}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                transition: 'transform 0.4s ease',
                                                transform: isHovered ? 'scale(1.15)' : 'scale(1.1)',
                                                imageRendering: '-webkit-optimize-contrast',
                                                imageRendering: 'crisp-edges'
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
                                            color: 'rgba(212, 175, 55, 0.3)',
                                            fontFamily: 'var(--font-header)'
                                        }}>
                                            {champ.name.charAt(0)}
                                        </div>
                                    )}

                                    {/* Hover Glow Effect */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: '-3px',
                                        borderRadius: '12px',
                                        background: 'conic-gradient(from 0deg, transparent, var(--c-gold-1), transparent)',
                                        opacity: isHovered ? 0.6 : 0,
                                        transition: 'opacity 0.3s ease',
                                        pointerEvents: 'none',
                                        zIndex: -1,
                                        animation: isHovered ? 'rotate 3s linear infinite' : 'none'
                                    }} />

                                    {/* Selected Indicator Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0, 0, 0, 0.6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: isHovered ? 1 : 0,
                                        transition: 'opacity 0.3s ease',
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{
                                            fontSize: '2rem',
                                            color: 'var(--c-gold-1)',
                                            textShadow: '0 0 20px rgba(212, 175, 55, 0.8)',
                                            transform: isHovered ? 'scale(1)' : 'scale(0.5)',
                                            transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                        }}>
                                            ✓
                                        </div>
                                    </div>
                                </div>

                                {/* Champion Name */}
                                <div className="grid-name" style={{
                                    marginTop: '10px',
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-header)',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    color: isHovered ? 'var(--c-gold-1)' : 'var(--c-gold-2)',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%',
                                    textShadow: isHovered ? '0 0 10px rgba(212, 175, 55, 0.5)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {champ.name}
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {filtered.length === 0 && (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '60px 40px',
                            color: 'rgba(212, 175, 55, 0.5)',
                            fontFamily: 'var(--font-header)',
                            fontSize: '1.5rem',
                            letterSpacing: '2px',
                            textTransform: 'uppercase'
                        }}>
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '1rem',
                                opacity: 0.3,
                                animation: 'spin 4s linear infinite'
                            }}>⬡</div>
                            No Champions Found
                            <div style={{
                                fontSize: '0.9rem',
                                marginTop: '0.5rem',
                                color: 'rgba(212, 175, 55, 0.3)',
                                fontFamily: 'var(--font-body)',
                                textTransform: 'none',
                                letterSpacing: '1px',
                                fontWeight: '500'
                            }}>
                                {search ? 'Try a different search term' : 'All champions are already picked'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with keyboard hint */}
                <div style={{
                    padding: '16px 32px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'rgba(212, 175, 55, 0.5)'
                }}>
                    <span>
                        <kbd style={{
                            background: 'rgba(212, 175, 55, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            fontWeight: '700',
                            color: 'var(--c-gold-1)'
                        }}>ESC</kbd> to close
                    </span>
                    <span style={{ opacity: 0.3 }}>•</span>
                    <span>
                        Click to select champion
                    </span>
                </div>
            </div>

            <style jsx>{`
                @keyframes modalFadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }

                @keyframes modalFadeOut {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }

                @keyframes modalScaleIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.8) translateY(-50px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                @keyframes modalScaleOut {
                    0% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.8) translateY(-50px);
                    }
                }

                @keyframes championFadeIn {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .modal-fade-in {
                    animation: modalFadeIn 0.3s ease;
                }

                .modal-fade-out {
                    animation: modalFadeOut 0.2s ease;
                }

                .modal-scale-in {
                    animation: modalScaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                .modal-scale-out {
                    animation: modalScaleOut 0.2s ease;
                }

                kbd {
                    transition: all 0.2s ease;
                }

                kbd:hover {
                    background: rgba(212, 175, 55, 0.2);
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}

ChampionPicker.propTypes = {
    champions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        image_url: PropTypes.string.isRequired
    })).isRequired,
    onPick: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    taken: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired
};

ChampionPicker.defaultProps = {
    champions: [],
    taken: []
};

export default ChampionPicker;