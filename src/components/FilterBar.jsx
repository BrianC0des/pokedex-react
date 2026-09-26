const TYPES = [
    'fire', 'water', 'grass', 'electric', 'poison', 'psychic',
    'ice', 'dragon', 'ghost', 'dark', 'steel', 'fairy',
    'bug', 'flying', 'fighting', 'ground', 'rock', 'normal',
];

function FilterBar({ activeType, onTypeChange }) {
    return (
        <div className="filter-bar">
            <button
                className={`filter-pill all ${activeType === 'all' ? 'active' : ''}`}
                onClick={() => onTypeChange('all')}
            >
                ALL
            </button>

            {TYPES.map((type) => (
                <button
                    key={type}
                    className={`filter-pill ${type} ${activeType === type ? 'active' : ''}`}
                    onClick={() => onTypeChange(type)}
                >
                    <img
                        src={`/type-icons/${type}.svg`}
                        alt={type}
                    />
                    {type.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

export default FilterBar;
