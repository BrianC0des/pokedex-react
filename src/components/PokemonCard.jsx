import { useState } from "react";
import Spinner from "./Spinner";

function PokemonCard({ pokemon }) {
    const [imgLoaded, setImgLoaded] = useState(false);

    if (!pokemon) {
        return (
            <div className="card loading-card">
                <Spinner size={30} compact />
            </div>
        );
    }

    const staticImage = pokemon.sprites?.front_default;
    const artWork = pokemon.sprites?.other?.["official-artwork"]?.front_default;
    const spriteSrc = staticImage || artWork || "";

    const formattedId = String(pokemon.id).padStart(3, "0");
    const pokemonType = pokemon.types?.[0]?.type?.name || "normal";
    const pokemonName = pokemon.name?.toUpperCase() || "";
    const pokemonHpStat = pokemon.stats?.[0]?.base_stat || 0;

    return (
        <div className={`card ${pokemonType}`}>
            <div className="cardUpper">
                <span>{pokemonName}</span>
                <span className="statHP">{`${pokemonHpStat} HP`}</span>
            </div>
            <div className="spriteContainer">
                {!imgLoaded && <Spinner size={22} compact />}
                <img
                    src={spriteSrc}
                    alt={pokemon.name}
                    className={`pokemonSprite ${imgLoaded ? "loaded" : "loading"}`}
                    onLoad={() => setImgLoaded(true)}
                />
            </div>
            <div className="cardLower">
                <div className="types">
                    {pokemon.types?.map((t) => (
                        <img
                            key={t.type.name}
                            src={`/type-icons/${t.type.name}.svg`}
                            alt={t.type.name}
                            className="typeIcon"
                        />
                    ))}
                </div>
                <span className="pokemonId">{`#${formattedId}`}</span>
            </div>
        </div>
    );
}

export default PokemonCard;
