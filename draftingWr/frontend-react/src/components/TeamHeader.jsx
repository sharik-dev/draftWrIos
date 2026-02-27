import React from 'react';
import TeamStatsPanel from './TeamStatsPanel';

const TeamHeader = ({ title, picks, strength, colorVar }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
        }}>
            <div style={{
                fontFamily: 'var(--font-header)',
                fontSize: '0.9rem',
                color: `var(${colorVar})`,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
            }}>
                {title}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    fontFamily: 'var(--font-header)',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: `var(${colorVar})`,
                    textShadow: `0 0 20px var(${colorVar})`
                }}>
                    {strength.toFixed(2)}
                </div>
                <div style={{
                    width: '100px',
                    height: '12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: `1px solid var(${colorVar})`
                }}>
                    <div style={{
                        width: `${strength * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, var(${colorVar}), transparent)`,
                        boxShadow: `0 0 10px var(${colorVar})`,
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>

            {/* New Stats Panel */}
            <TeamStatsPanel picks={picks} side={title === 'ALLY' ? 'team' : 'enemy'} />

        </div>
    );
};

export default TeamHeader;
