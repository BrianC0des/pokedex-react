import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import PokemonCard from "../components/PokemonCard";
import Pagination from "../components/Pagination";
import FilterBar from "../components/FilterBar";

const PAGE_SIZE = 25;

function PokemonGrid() {
    const [pokemon, setPokemon] = useState([]);
    const [allNames, setAllNames] = useState([]);
    const [typeNames, setTypeNames] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";
    const activeType = searchParams.get("type") || "all";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [searchTerm, setSearchTerm] = useState(query);
    const [prevQuery, setPrevQuery] = useState(query);

    if (query !== prevQuery) {
        setPrevQuery(query);
        setSearchTerm(query);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextParams = new URLSearchParams(searchParams);
            const trimmed = searchTerm.trim();
            if (trimmed) {
                nextParams.set("q", trimmed);
            } else {
                nextParams.delete("q");
            }
            if (trimmed !== (searchParams.get("q") || "")) {
                nextParams.delete("page");
                setSearchParams(nextParams);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, searchParams, setSearchParams]);

    useEffect(() => {
        async function fetchAllNames() {
            const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1300");
            setAllNames(response.data.results);
        }
        fetchAllNames();
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (activeType !== "all") {
            axios
                .get(`https://pokeapi.co/api/v2/type/${activeType}`)
                .then((response) => {
                    if (!cancelled) {
                        setTypeNames(response.data.pokemon.map((p) => p.pokemon));
                    }
                })
                .catch(console.error);
        }
        return () => {
            cancelled = true;
        };
    }, [activeType]);

    const base = typeNames !== null ? typeNames : allNames;

    const filtered = useMemo(
        () => (query ? base.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())) : base),
        [query, base],
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

    useEffect(() => {
        if (base.length === 0) return;

        async function hydrate() {
            setIsLoading(true);
            try {
                const startIndex = (currentPage - 1) * PAGE_SIZE;
                const slice = filtered.slice(startIndex, startIndex + PAGE_SIZE);
                const responses = await Promise.all(slice.map((p) => axios.get(p.url)));
                setPokemon(responses.map((res) => res.data));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        hydrate();
    }, [currentPage, filtered]);

    function handlePageChange(newPage) {
        const nextParams = new URLSearchParams(searchParams);
        if (newPage > 1) {
            nextParams.set("page", newPage);
        } else {
            nextParams.delete("page");
        }
        setSearchParams(nextParams);
    }

    function handleTypeChange(type) {
        const nextParams = new URLSearchParams(searchParams);
        if (type === "all") {
            nextParams.delete("type");
        } else {
            nextParams.set("type", type);
        }
        nextParams.delete("page");
        setSearchParams(nextParams);
        setTypeNames(null);
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <svg width="28" height="28" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="13" fill="#fff" stroke="#000" strokeWidth="1.5" />
                        <path d="M1 14 Q1 1 14 1 Q27 1 27 14Z" fill="#e63946" />
                        <rect x="1" y="12" width="26" height="4" fill="#111" />
                        <circle cx="14" cy="14" r="4.5" fill="#111" />
                        <circle cx="14" cy="14" r="2.5" fill="#fff" />
                    </svg>
                    <span className="navbar-title">Pokédex</span>
                    <span className="navbar-count">{allNames.length} POKÉMON</span>
                </div>

                <div className="navbar-search-wrap">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="navbar-search"
                        type="text"
                        placeholder="SEARCH POKÉMON OR #ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="navbar-search-hint">CTRL+K</span>
                </div>
            </nav>

            <div className="grid-container">
                <FilterBar activeType={activeType} onTypeChange={handleTypeChange} />

                <p className="result-count">
                    SHOWING <strong>{isLoading ? 0 : Math.min(PAGE_SIZE, filtered.length)}</strong> OF{" "}
                    <strong>{filtered.length}</strong> RESULTS
                </p>

                <div className="grid">
                    {isLoading
                        ? Array.from({ length: Math.min(PAGE_SIZE, filtered.length || PAGE_SIZE) }).map((_, i) => (
                              <PokemonCard key={`skeleton-${i}`} pokemon={null} />
                          ))
                        : pokemon.map((p) => (
                              <Link key={p.id} to={`/pokemon/${p.id}`} className="card-link">
                                  <PokemonCard pokemon={p} />
                              </Link>
                          ))}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
                <Outlet />
            </div>
        </>
    );
}

export default PokemonGrid;
