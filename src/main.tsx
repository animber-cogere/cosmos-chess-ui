import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  ChainInfoID,
  WalletManagerProvider,
  WalletType,
} from "@noahsaso/cosmodal";

import { Buffer } from "buffer/";
(globalThis as any).Buffer = Buffer;

import App from "./App";
import { Challenges } from "./chess/challenges/Challenges";
import { Game } from "./chess/game/Game";
import { Games } from "./chess/games/Games";
import { Ratings } from "./chess/ratings/Ratings";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <WalletManagerProvider
      defaultChainId={ChainInfoID.Juno1}
      enabledWalletTypes={[WalletType.Keplr, WalletType.WalletConnectKeplr]}
      localStorageKey="CosmosChess_already_connected"
      walletConnectClientMeta={{
        name: "COSMOS CHESS",
        description: "A dApp for playing Chess on Juno.",
        url: "https://cosmoschess.aleph0cap.com",
        icons: [],
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="challenges" element={<Challenges />} />
            <Route path="games">
              <Route path=":game_id" element={<Game />} />
              <Route index element={<Games />} />
            </Route>
            <Route index element={<Navigate to="/games" />} />
            <Route path="rating" element={<Ratings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletManagerProvider>
  </StrictMode>
);
