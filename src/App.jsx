import { Routes, Route } from "react-router-dom";
import PokemonDetail from "./pages/PokemonDetail";
import PokemonGrid from "./pages/PokemonGrid";
import "./App.css";
function App() {
    return (
        <Routes>
            <Route path="/" element={<PokemonGrid />}>
                <Route path="pokemon/:id" element={<PokemonDetail />} />
            </Route>
        </Routes>
    );
}

export default App;
