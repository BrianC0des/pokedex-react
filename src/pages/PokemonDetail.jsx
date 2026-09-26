import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import "../App.css";

const STAT_LABELS = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SP.ATK",
    "special-defense": "SP.DEF",
    speed: "SPD",
};

const STAT_MAX = {
    hp: 255,
    attack: 190,
    defense: 230,
    "special-attack": 194,
    "special-defense": 230,
    speed: 180,
};

function StatRow({ statKey, value, mounted }) {
    const label = STAT_LABELS[statKey] ?? statKey.toUpperCase();
    const max = STAT_MAX[statKey] ?? 255;
    const pct = Math.min(100, Math.round((value / max) * 100));

    return (
        <div className="stat-row">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
            <div className="stat-track">
                <div className={`stat-fill ${statKey}`} style={{ width: mounted ? `${pct}%` : "0%" }} />
            </div>
            <span className="stat-max">/{max}</span>
        </div>
    );
}

function PokemonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState(null);
    const [statsMounted, setStatsMounted] = useState(false);
    const [moves, setMoves] = useState([]);

    useEffect(() => {
        let cancelled = false;
        axios
            .get(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then((res) => {
                if (!cancelled) {
                    setPokemon(res.data);
                    setStatsMounted(false);
                }
            })
            .catch(console.error);
        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (!pokemon) return;
        const t = setTimeout(() => setStatsMounted(true), 80);
        return () => clearTimeout(t);
    }, [pokemon]);

    useEffect(() => {
        if (!pokemon?.moves?.length) return;
        let cancelled = false;

        const levelUpMoves = pokemon.moves
            .map((m) => {
                const details = m.version_group_details.find(
                    (v) => v.move_learn_method.name === "level-up",
                );
                return {
                    name: m.move.name,
                    url: m.move.url,
                    level: details ? details.level_learned_at : 0,
                };
            })
            .filter((m) => m.level > 0)
            .sort((a, b) => b.level - a.level);

        const selectedMoves = (
            levelUpMoves.length > 0 ? levelUpMoves : pokemon.moves.map((m) => m.move)
        ).slice(0, 4);

        Promise.all(
            selectedMoves.map((m) =>
                axios.get(m.url).then((res) => ({
                    name: res.data.name,
                    power: res.data.power,
                    pp: res.data.pp,
                    damage_class: res.data.damage_class,
                    type: res.data.type,
                })),
            ),
        )
            .then((results) => {
                if (!cancelled) setMoves(results);
            })
            .catch(() => {
                if (!cancelled) setMoves([]);
            });

        return () => {
            cancelled = true;
        };
    }, [pokemon]);

    if (!pokemon) {
        return (
            <div className="backdrop">
                <Spinner message="LOADING DETAILS..." />
            </div>
        );
    }

    const primaryType = pokemon.types[0]?.type.name ?? "normal";
    const padId = `#${String(pokemon.id).padStart(3, "0")}`;
    const totalBST = pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);

    const animSprite =
        pokemon.sprites.other?.showdown?.front_default ?? pokemon.sprites.front_default ?? "";
    const artworkSprite =
        pokemon.sprites.other?.["official-artwork"]?.front_default ??
        pokemon.sprites.front_default ??
        "";

    return (
        <div className="backdrop" onClick={() => navigate(-1)}>
            <div className={`modal-box ${primaryType}`} onClick={(e) => e.stopPropagation()}>
                <div className="detail-header">
                    <div className="detail-header-left">
                        <span className="detail-name">{pokemon.name}</span>
                        <span className="detail-id">{padId}</span>
                        <div className="detail-pills">
                            {pokemon.types.map((t) => (
                                <img
                                    key={t.type.name}
                                    src={`/type-pills/${t.type.name}.png`}
                                    alt={t.type.name}
                                    className="detail-pill-img"
                                />
                            ))}
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={() => navigate(-1)}>
                        ✕ CLOSE
                    </button>
                </div>

                <div className="detail-body">
                    <div className="detail-left-col">
                        <div className="detail-pedestal-wrap">
                            <div className="detail-pedestal">
                                <div className="detail-pedestal-glow" />
                                <img
                                    src={animSprite || artworkSprite}
                                    alt={pokemon.name}
                                    className="detail-sprite"
                                />
                            </div>
                            <div className="detail-pedestal-base" />
                        </div>

                        <div className="detail-metrics">
                            <div className="detail-metric-card">
                                <div className="detail-metric-label">HEIGHT</div>
                                <div className="detail-metric-value">{(pokemon.height / 10).toFixed(1)} m</div>
                            </div>
                            <div className="detail-metric-card">
                                <div className="detail-metric-label">WEIGHT</div>
                                <div className="detail-metric-value">{(pokemon.weight / 10).toFixed(1)} kg</div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-right-col">
                        <div className="detail-stats-title">BASE STATS</div>

                        {pokemon.stats.map((s) => (
                            <StatRow
                                key={s.stat.name}
                                statKey={s.stat.name}
                                value={s.base_stat}
                                mounted={statsMounted}
                            />
                        ))}

                        <div className="detail-bst-box">
                            <div className="detail-bst-label">TOTAL BST</div>
                            <div className="detail-bst-value">{totalBST}</div>
                        </div>
                    </div>
                </div>

                <div className="detail-skills-section">
                    <div className="detail-skills-title">SKILLS & ATTACKS</div>
                    {moves.length === 0 ? (
                        <div className="detail-skills-loading">LOADING SKILLS...</div>
                    ) : (
                        <div className="detail-skills-grid">
                            {moves.map((m) => (
                                <div key={m.name} className="detail-skill-card">
                                    <div className="detail-skill-info">
                                        <img
                                            src={`/type-icons/${m.type?.name || primaryType}.svg`}
                                            alt={m.type?.name || primaryType}
                                            className="detail-skill-type-icon"
                                        />
                                        <div>
                                            <div className="detail-skill-name">{m.name.replace(/-/g, " ")}</div>
                                            <div className="detail-skill-meta">
                                                {m.damage_class?.name} · PP {m.pp}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="detail-skill-power">{m.power ?? "—"}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PokemonDetail;
