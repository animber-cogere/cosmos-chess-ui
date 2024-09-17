import { NavLink, Outlet } from "react-router-dom";

import { Profile } from "./chess/Profile";
import { CosmWasmChess } from "./chess/CosmWasmChess";
import { useCosmWasm, useLocalCosmWasm } from "./chess/useCosmWasm";

import { CHAIN_INFO, CONTRACT } from "./config/testnet";
//import { CHAIN_INFO, CONTRACT } from "./config/juno";
import { Address } from "./Address";

import "./App.css";

function App() {
  const cosmWasm = useLocalCosmWasm(CHAIN_INFO);//use `useCosmWasm(CHAIN_INFO)` for mainnet
  const contract = new CosmWasmChess(cosmWasm, CONTRACT);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <div className="App">
      <h1>COSMOS CHESS</h1>

      <nav>
        <NavLink className={navClass} to="challenges/">
          Challenges
        </NavLink>
        <NavLink className={navClass} to="games/">
          Games
        </NavLink>
        <NavLink className={navClass} to="rating/">
          Rating
        </NavLink>
        <Profile cosmWasm={cosmWasm} />
      </nav>

      <main>
        <Outlet context={contract} />
      </main>
    </div>
  );
}

export default App;
