import React, { useState } from 'react';
import PropTypes from 'prop-types';

const roles = [
    {
        id: 'top',
        icon: '🛡️',
        name: 'Top',
        fullName: 'Top Lane',
        color: '#4a90e2',
        description: 'Bruisers & Tanks'
    },
    {
        id: 'jungle',
        icon: '🌲',
        name: 'Jungle',
        fullName: 'Jungle',
        color: '#7cb342',
        description: 'Map Control'
    },
    {
        id: 'mid',
        icon: '⚡',
        name: 'Mid',
        fullName: 'Mid Lane',
        color: '#ffa726',
        description: 'Mages & Assassins'
    },
    {
        id: 'adc',
        icon: '🎯',
        name: 'ADC',
        fullName: 'Bot Lane',
        color: '#e57373',
        description: 'Marksmen'
    },
    {
        id: 'support',
        icon: '💚',
        name: 'Support',
        fullName: 'Support',
        color: '#81c784',
        description: 'Enchanters & Tanks'
    },
];

function RoleSelector({ selectedRole, onRoleChange }) {
    const [hoveredRole, setHoveredRole] = useState(null);

    return (
        <div
            className="card role-card"
            style={{
                background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(5, 10, 15, 0.95))',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* Card Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '2px solid rgba(212, 175, 55, 0.2)',
                position: 'relative'
            }}>
                <div style={{
                    width: '4px',
                    height: '28px',
                    background: 'linear-gradient(180deg, var(--c-gold-1), transparent)',
                    borderRadius: '2px'
                }} />
                <h3 style={{
                    margin: 0,
                    fontFamily: 'var(--font-header)',
                    fontSize: '1.5rem',
                    color: 'var(--c-gold-1)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
                }}>
                    Select Role
                </h3>

                {/* Decorative element */}
                <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--c-gold-1), transparent)',
                    filter: 'blur(2px)'
                }} />
            </div>

            {/* Role Selector Grid */}
            <div
                className="role-selector"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px'
                }}
            >
                {roles.map((role, index) => {
                    const isSelected = selectedRole === role.id;
                    const isHovered = hoveredRole === role.id;

                    return (
                        <button
                            key={role.id}
                            className={`role-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => onRoleChange(role.id)}
                            onMouseEnter={() => setHoveredRole(role.id)}
                            onMouseLeave={() => setHoveredRole(null)}
                            style={{
                                background: isSelected
                                    ? `linear-gradient(135deg, ${role.color}33, ${role.color}11)`
                                    : 'linear-gradient(135deg, rgba(20, 40, 60, 0.6), rgba(10, 20, 30, 0.6))',
                                border: isSelected
                                    ? `2px solid ${role.color}`
                                    : '2px solid rgba(212, 175, 55, 0.2)',
                                borderRadius: '10px',
                                padding: '16px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                position: 'relative',
                                overflow: 'hidden',
                                transform: isHovered || isSelected ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                                boxShadow: isSelected
                                    ? `0 8px 24px ${role.color}44, inset 0 0 20px ${role.color}22`
                                    : isHovered
                                        ? '0 6px 20px rgba(0, 0, 0, 0.4)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.3)',
                                animationDelay: `${index * 0.1}s`,
                                animation: 'roleButtonEntry 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both'
                            }}
                        >
                            {/* Background Glow Effect */}
                            <div style={{
                                position: 'absolute',
                                inset: '-2px',
                                borderRadius: '10px',
                                background: `conic-gradient(from 0deg, transparent, ${role.color}, transparent)`,
                                opacity: isSelected ? 0.4 : 0,
                                transition: 'opacity 0.3s ease',
                                animation: isSelected ? 'rotate 4s linear infinite' : 'none',
                                zIndex: 0
                            }} />

                            {/* Content */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <span
                                    className="role-icon"
                                    style={{
                                        fontSize: isSelected ? '2.5rem' : '2.2rem',
                                        display: 'block',
                                        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                        filter: isSelected
                                            ? `drop-shadow(0 0 10px ${role.color})`
                                            : 'none',
                                        transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
                                    }}
                                >
                                    {role.icon}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <span style={{
                                    fontFamily: 'var(--font-header)',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    color: isSelected ? role.color : 'var(--c-gold-2)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    transition: 'color 0.3s ease',
                                    textShadow: isSelected ? `0 0 10px ${role.color}88` : 'none'
                                }}>
                                    {role.name}
                                </span>

                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    color: isSelected ? `${role.color}cc` : 'rgba(212, 175, 55, 0.5)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    transition: 'color 0.3s ease',
                                    fontWeight: '600'
                                }}>
                                    {role.description}
                                </span>
                            </div>

                            {/* Active Indicator */}
                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: role.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    color: '#fff',
                                    fontWeight: '700',
                                    boxShadow: `0 0 15px ${role.color}`,
                                    animation: 'checkmarkPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                    zIndex: 2
                                }}>
                                    ✓
                                </div>
                            )}

                            {/* Bottom Accent Line */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: isSelected
                                    ? `linear-gradient(90deg, transparent, ${role.color}, transparent)`
                                    : 'transparent',
                                transition: 'all 0.3s ease',
                                filter: 'blur(1px)'
                            }} />
                        </button>
                    );
                })}
            </div>

            {/* Selected Role Info */}
            {selectedRole && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: `1px solid ${roles.find(r => r.id === selectedRole)?.color}44`,
                    animation: 'fadeSlideIn 0.4s ease'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{
                                fontSize: '1.5rem',
                                filter: `drop-shadow(0 0 8px ${roles.find(r => r.id === selectedRole)?.color})`
                            }}>
                                {roles.find(r => r.id === selectedRole)?.icon}
                            </span>
                            <div>
                                <div style={{
                                    fontFamily: 'var(--font-header)',
                                    fontSize: '0.9rem',
                                    color: roles.find(r => r.id === selectedRole)?.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: '700'
                                }}>
                                    {roles.find(r => r.id === selectedRole)?.fullName}
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    color: 'rgba(212, 175, 55, 0.6)',
                                    textTransform: 'uppercase',
                                    marginTop: '2px'
                                }}>
                                    Currently Selected
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '6px 12px',
                            background: `${roles.find(r => r.id === selectedRole)?.color}22`,
                            border: `1px solid ${roles.find(r => r.id === selectedRole)?.color}44`,
                            borderRadius: '6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: roles.find(r => r.id === selectedRole)?.color,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Active
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes roleButtonEntry {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes checkmarkPop {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes fadeSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .role-btn {
                    font-family: var(--font-body);
                    outline: none;
                }

                .role-btn:focus {
                    outline: 2px solid var(--c-gold-1);
                    outline-offset: 2px;
                }

                .role-btn:active {
                    transform: translateY(-2px) scale(0.98);
                }
            `}</style>
        </div>
    );
}

RoleSelector.propTypes = {
    selectedRole: PropTypes.string.isRequired,
    onRoleChange: PropTypes.func.isRequired,
};

export default RoleSelector;