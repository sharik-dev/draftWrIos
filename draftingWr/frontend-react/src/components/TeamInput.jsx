import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function TeamInput({ title, champions, selectedChampions, onChampionsChange, excludeChampions, type }) {
    const [input, setInput] = useState('');
    const [filteredChampions, setFilteredChampions] = useState([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowAutocomplete(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        if (value.trim().length === 0) {
            setShowAutocomplete(false);
            return;
        }

        const allSelected = [...selectedChampions, ...excludeChampions];
        const filtered = champions.filter(champ =>
            !allSelected.includes(champ.id) &&
            champ.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);

        setFilteredChampions(filtered);
        setShowAutocomplete(filtered.length > 0);
    };

    const handleSelectChampion = (championId) => {
        onChampionsChange([...selectedChampions, championId]);
        setInput('');
        setShowAutocomplete(false);
    };

    const handleRemoveChampion = (championId) => {
        onChampionsChange(selectedChampions.filter(id => id !== championId));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && filteredChampions.length > 0) {
            handleSelectChampion(filteredChampions[0].id);
        }
    };

    const getChampionPillClass = () => {
        if (type === 'enemy') return 'champion-pills enemy-pills';
        if (type === 'ban') return 'champion-pills ban-pills';
        return 'champion-pills';
    };

    return (
        <div className="card team-card">
            <h3>{title}</h3>
            <div className="team-container">
                <div className="champion-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="champion-input"
                        placeholder="Type champion name..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />
                    {showAutocomplete && (
                        <div ref={dropdownRef} className="autocomplete-dropdown active">
                            {filteredChampions.map(champ => (
                                <div
                                    key={champ.id}
                                    className="autocomplete-item"
                                    onClick={() => handleSelectChampion(champ.id)}
                                >
                                    <strong>{champ.name}</strong>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                                        - {champ.damage_type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={getChampionPillClass()}>
                    {selectedChampions.map(championId => {
                        const champ = champions.find(c => c.id === championId);
                        return champ ? (
                            <div key={championId} className="champion-pill">
                                <span>{champ.name}</span>
                                <button
                                    className="pill-remove"
                                    onClick={() => handleRemoveChampion(championId)}
                                >
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}
                </div>
            </div>
        </div>
    );
}

TeamInput.propTypes = {
    title: PropTypes.string.isRequired,
    champions: PropTypes.array.isRequired,
    selectedChampions: PropTypes.array.isRequired,
    onChampionsChange: PropTypes.func.isRequired,
    excludeChampions: PropTypes.array.isRequired,
    type: PropTypes.oneOf(['team', 'enemy', 'ban']).isRequired,
};

export default TeamInput;
