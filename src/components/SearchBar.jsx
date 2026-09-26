function SearchBar({ value, onChange, onClear }) {
    return (
        <div className="search-bar">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search Pokémon..."
            />
            {value && (
                <button type="button" onClick={onClear}>
                    clear
                </button>
            )}
        </div>
    );
}

export default SearchBar;
