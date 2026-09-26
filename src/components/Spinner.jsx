function Spinner({ size = 48, message = null, compact = false }) {
    return (
        <div className={`spinner-container ${compact ? "compact" : ""}`.trim()}>
            <svg
                className="pokeball-spin"
                width={size}
                height={size}
                viewBox="0 0 28 28"
            >
                <circle cx="14" cy="14" r="13" fill="#fff" stroke="#111" strokeWidth="1.5" />
                <path d="M1 14 Q1 1 14 1 Q27 1 27 14Z" fill="#e63946" />
                <rect x="1" y="12" width="26" height="4" fill="#111" />
                <circle cx="14" cy="14" r="4.5" fill="#111" />
                <circle cx="14" cy="14" r="2.5" fill="#fff" />
            </svg>
            {message && <p className="spinner-text">{message}</p>}
        </div>
    );
}

export default Spinner;
