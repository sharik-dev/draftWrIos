import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];

const ROLE_DATA = {
    top: {
        name: 'TOP',
        displayName: 'Top Lane',
        icon: 'top',
        emoji: '🛡️',
        color: '#4a90e2'
    },
    jungle: {
        name: 'JUNGLE',
        displayName: 'Jungle',
        icon: 'jungle',
        emoji: '🌲',
        color: '#7cb342'
    },
    mid: {
        name: 'MID',
        displayName: 'Mid Lane',
        icon: 'middle',
        emoji: '⚡',
        color: '#ffa726'
    },
    adc: {
        name: 'ADC',
        displayName: 'Bot Lane',
        icon: 'bottom',
        emoji: '🎯',
        color: '#e57373'
    },
    support: {
        name: 'SUPPORT',
        displayName: 'Support',
        icon: 'utility',
        emoji: '💚',
        color: '#81c784'
    }
};

function DraftColumn({ title, picks, side, onSlotClick, onRemovePick, headerClass, activeSlotIndex }) {
    const [imageErrors, setImageErrors] = useState({});
    const [hoveredSlot, setHoveredSlot] = useState(null);

    const getRoleIcon = (index) => {
        const role = ROLES[index] || 'fill';
        const iconName = ROLE_DATA[role]?.icon || 'fill';
        return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${iconName}.png`;
    };

    const getRoleData = (index) => {
        const role = ROLES[index];
        return ROLE_DATA[role] || { name: 'FILL', displayName: 'Fill', emoji: '⭐', color: '#999' };
    };

    const handleImageError = (index) => {
        setImageErrors(prev => ({ ...prev, [index]: true }));
    };

    const handleSlotClick = (e, index) => {
        if (e.target.closest('.remove-btn')) return;
        onSlotClick(side, index);
    };

    return (
        <div className={`column ${side}-column`}>
            {/* Enhanced Header */}
            <div className={`column-header ${headerClass}`}>
                <h2 style={{ position: 'relative', zIndex: 1 }}>
                    {title}
                </h2>

                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '20px',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem',
                    opacity: '0.3',
                    animation: 'spin 6s linear infinite'
                }}>⬡</div>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '20px',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem',
                    opacity: '0.3',
                    animation: 'spin 6s linear infinite reverse'
                }}>⬡</div>
            </div>

            {/* Pick Slots */}
            <div className="pick-slots">
                {picks.map((pick, index) => {
                    const roleData = getRoleData(index);
                    const hasImageError = imageErrors[index];
                    const isHovered = hoveredSlot === index;
                    const isEmpty = !pick;
                    const isActive = activeSlotIndex === index;

                    return (
                        <div
                            key={index}
                            className={`pick-slot ${side}-side ${pick ? 'active' : ''} ${isHovered ? 'hovered' : ''} ${isActive ? 'slot-active' : ''}`}
                            onClick={(e) => handleSlotClick(e, index)}
                            onMouseEnter={() => setHoveredSlot(index)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                animation: 'slideInFromSide 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both',
                                border: isActive ? `2px solid ${side === 'team' ? 'var(--c-ally)' : 'var(--c-enemy)'}` : undefined,
                                boxShadow: isActive ? `0 0 30px ${side === 'team' ? 'rgba(0, 255, 200, 0.5)' : 'rgba(255, 51, 102, 0.5)'}` : undefined
                            }}
                        >
                            <div className="slot-layout">
                                {/* Role Icon with Enhanced Styling */}
                                <div
                                    className="role-icon-container"
                                    style={{
                                        background: isEmpty
                                            ? 'rgba(212, 175, 55, 0.08)'
                                            : `linear-gradient(135deg, ${roleData.color}22, transparent)`,
                                        borderColor: isEmpty
                                            ? 'rgba(212, 175, 55, 0.2)'
                                            : `${roleData.color}44`
                                    }}
                                >
                                    <img
                                        src={getRoleIcon(index)}
                                        alt={roleData.name}
                                        className="role-icon-img"
                                        style={{
                                            filter: isEmpty
                                                ? 'brightness(0.8) contrast(0.9) drop-shadow(0 0 4px rgba(212, 175, 55, 0.3))'
                                                : `brightness(1.2) contrast(1.1) drop-shadow(0 0 6px ${roleData.color}88)`
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    {/* Emoji Fallback */}
                                    <div style={{
                                        display: 'none',
                                        fontSize: '1.2rem',
                                        filter: 'none'
                                    }}>
                                        {roleData.emoji}
                                    </div>
                                </div>

                                {/* Champion Section */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flex: 1,
                                    minWidth: 0,
                                    gap: '12px'
                                }}>
                                    {/* Champion Circle */}
                                    <div
                                        className="champion-circle"
                                        style={{
                                            position: 'relative',
                                            flexShrink: 0
                                        }}
                                    >
                                        {pick && !hasImageError ? (
                                            <>
                                                <img
                                                    src={pick.image_url}
                                                    alt={pick.name}
                                                    onError={() => handleImageError(index)}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'center',
                                                        imageRendering: '-webkit-optimize-contrast',
                                                        imageRendering: 'crisp-edges'
                                                    }}
                                                />
                                                {/* Animated border on hover */}
                                                {isHovered && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: '-3px',
                                                        borderRadius: '50%',
                                                        background: side === 'ally'
                                                            ? 'conic-gradient(from 0deg, transparent, var(--c-ally), transparent)'
                                                            : 'conic-gradient(from 0deg, transparent, var(--c-enemy), transparent)',
                                                        animation: 'rotate 3s linear infinite',
                                                        zIndex: -1
                                                    }} />
                                                )}
                                            </>
                                        ) : pick && hasImageError ? (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #0d1b2a, #050a0f)',
                                                fontSize: '1.8rem',
                                                fontWeight: '700',
                                                color: side === 'ally' ? 'var(--c-ally)' : 'var(--c-enemy)',
                                                fontFamily: 'var(--font-header)'
                                            }}>
                                                {pick.name.charAt(0)}
                                            </div>
                                        ) : (
                                            <div className="empty-circle">
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    opacity: isHovered ? 0.6 : 0.3,
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    +
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Champion Info */}
                                    <div className="slot-info">
                                        <span
                                            className="slot-name"
                                            style={{
                                                color: pick
                                                    ? (side === 'ally' ? 'var(--c-ally)' : 'var(--c-enemy)')
                                                    : 'var(--c-gold-2)'
                                            }}
                                        >
                                            {pick ? pick.name : (
                                                <span style={{
                                                    opacity: 0.5,
                                                    fontWeight: 600,
                                                    letterSpacing: '1px'
                                                }}>
                                                    {side === 'ally' ? 'SELECT' : 'ENEMY'}
                                                </span>
                                            )}
                                        </span>
                                        <span
                                            className="slot-status"
                                            style={{
                                                color: isEmpty ? 'rgba(212, 175, 55, 0.5)' : roleData.color,
                                                fontWeight: '700'
                                            }}
                                        >
                                            {roleData.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                {pick && (
                                    <button
                                        className="remove-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemovePick(side, index, e);
                                        }}
                                        title={`Remove ${pick.name}`}
                                        style={{
                                            position: 'relative',
                                            zIndex: 10
                                        }}
                                    >
                                        ✖
                                    </button>
                                )}
                            </div>

                            {/* Slot Status Indicator */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '3px',
                                height: pick ? '60%' : '0%',
                                background: side === 'ally'
                                    ? 'linear-gradient(180deg, var(--c-ally), transparent)'
                                    : 'linear-gradient(180deg, var(--c-enemy), transparent)',
                                borderRadius: '0 2px 2px 0',
                                transition: 'height 0.3s ease',
                                boxShadow: pick ? `0 0 10px ${side === 'ally' ? 'var(--c-ally)' : 'var(--c-enemy)'}` : 'none'
                            }} />
                        </div>
                    );
                })}
            </div>

            {/* Column Footer Stats */}
            <div style={{
                padding: '16px 20px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'rgba(212, 175, 55, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                <span style={{
                    fontWeight: '700',
                    color: side === 'ally' ? 'var(--c-ally)' : 'var(--c-enemy)',
                    fontSize: '0.9rem'
                }}>
                    {picks.filter(p => p).length}
                </span>
                /
                <span style={{ opacity: 0.5 }}>
                    {picks.length}
                </span>
                <span style={{ marginLeft: '4px' }}>
                    Champions
                </span>
            </div>

            <style jsx>{`
                @keyframes slideInFromSide {
                    0% {
                        opacity: 0;
                        transform: translateX(${side === 'ally' ? '-30px' : '30px'});
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
}

DraftColumn.propTypes = {
    title: PropTypes.string.isRequired,
    picks: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        image_url: PropTypes.string
    })).isRequired,
    side: PropTypes.oneOf(['ally', 'enemy']).isRequired,
    onSlotClick: PropTypes.func.isRequired,
    onRemovePick: PropTypes.func.isRequired,
    headerClass: PropTypes.string.isRequired,
    activeSlotIndex: PropTypes.number
};

DraftColumn.defaultProps = {
    picks: [null, null, null, null, null],
    activeSlotIndex: null
};

export default DraftColumn;