import React, { useState } from 'react';

const TeamStatsPanel = ({ picks, side }) => {
    const [isOpen, setIsOpen] = useState(false);

    // --- STATS CALCULATIONS ---

    // 1. Damage Type (AD/AP)
    const calculateDamageDist = (team) => {
        let ad = 0, ap = 0, count = 0;
        team.forEach(pick => {
            if (pick) {
                count++;
                const type = pick.damage_type || 'Adaptive';
                if (type === 'AD') ad += 1;
                else if (type === 'AP') ap += 1;
                else { ad += 0.5; ap += 0.5; }
            }
        });
        if (count === 0) return { ad: 50, ap: 50 };
        return { ad: Math.round((ad / count) * 100), ap: Math.round((ap / count) * 100) };
    };

    // 2. Power Spike (Early/Late)
    const calculateTimeDist = (team) => {
        let score = 0, count = 0;
        team.forEach(pick => {
            if (pick) {
                count++;
                // scaling: early (20), mid (50), late (80)
                const sc = pick.scaling || 'mid';
                if (sc === 'early') score += 20;
                else if (sc === 'late') score += 80;
                else score += 50;
            }
        });
        if (count === 0) return 50; // Mid game default
        return Math.round(score / count);
    };

    // 3. Raw Damage Rating (1-3)
    const calculateDamageRating = (team) => {
        let totalDmg = 0;
        let maxDmg = 0;

        // Tags indicating low/med damage roles
        const lowDmgTags = ['tank', 'support', 'utility', 'enchanter', 'warden', 'protector'];
        const medDmgTags = ['bruiser', 'fighter', 'diver', 'juggernaut', 'skirmisher'];

        team.forEach(pick => {
            if (pick) {
                maxDmg += 3;
                const tags = pick.kit_tags || [];

                let rating = 3; // Default High (Mage, Carry, Assassin)

                if (tags.some(t => lowDmgTags.includes(t))) rating = 1;
                else if (tags.some(t => medDmgTags.includes(t))) rating = 2;

                totalDmg += rating;
            }
        });

        if (maxDmg === 0) return 0;
        // Returns scaled value relative to 3 max
        // Actually we want percentage for bar, and raw value for text
        return (totalDmg / maxDmg) * 100;
    };

    const dist = calculateDamageDist(picks);
    const time = calculateTimeDist(picks);
    const dmgRaw = calculateDamageRating(picks);

    // Colors based on side
    // But actually the colors are fixed for the stats (Orange/Purple, Cyan/Rose)
    // We just might want slight theme adjustments? No, keep it consistent.

    return (
        <div className="stats-panel-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Toggle Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: 'pointer',
                    marginTop: '8px',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    background: 'rgba(0,0,0,0.2)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
            >
                {isOpen ? '▲ Masquer Stats' : '▼ Voir Stats Détail'}
            </div>

            {/* COLLAPSIBLE CONTENT */}
            <div style={{
                maxHeight: isOpen ? '200px' : '0',
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                marginTop: isOpen ? '8px' : '0',
                display: 'flex', flexDirection: 'column', gap: '8px', width: '140px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>

                {/* 1. AD/AP Bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 'bold', marginBottom: '2px' }}>
                        <span style={{ color: '#ffae42' }}>AD {dist.ad}%</span>
                        <span style={{ color: '#c77dff' }}>AP {dist.ap}%</span>
                    </div>
                    <div style={{ height: '5px', width: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', display: 'flex', overflow: 'hidden' }}>
                        <div style={{ width: `${dist.ad}%`, background: 'linear-gradient(90deg, #ffae42, #ff7b00)', height: '100%' }} />
                        <div style={{ width: `${dist.ap}%`, background: 'linear-gradient(90deg, #9d4edd, #c77dff)', height: '100%' }} />
                    </div>
                </div>

                {/* 2. Early/Late Bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 'bold', marginBottom: '2px', color: '#00f2ff' }}>
                        <span>EARLY</span>
                        <span style={{ color: '#ff0055' }}>LATE</span>
                    </div>
                    <div style={{ height: '5px', width: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', left: `${time}%`, top: 0, bottom: 0, width: '4px', background: '#fff',
                            boxShadow: '0 0 5px #fff', transform: 'translateX(-50%)', zIndex: 2
                        }} />
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #00f2ff, #2a2a72, #ff0055)' }} />
                    </div>
                </div>

                {/* 3. Damage Rating Bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 'bold', marginBottom: '2px', color: '#ff3333' }}>
                        <span>DAMAGE</span>
                        <span>{(dmgRaw / 33.3).toFixed(1)}/3</span>
                    </div>
                    <div style={{ height: '5px', width: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${dmgRaw}%`, height: '100%', background: 'linear-gradient(90deg, #550000, #ff0000)' }} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeamStatsPanel;
