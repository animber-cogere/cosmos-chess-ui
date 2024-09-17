import { ReactNode, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import { ChessGameSummary, CosmWasmChess } from "../CosmWasmChess";
import "./Games.css";
import { GameSummary } from "./GameSummary";

export function Games() {
  const contract = useOutletContext<CosmWasmChess>();
  const [state, setState] = useState<{
    // list of max game_id where previous page ended (for previous button)
    after: number[];
    games?: ChessGameSummary[];
    // whether to show games that are over
    game_over?: boolean;
    // whether loading
    loading?: boolean;
    // whether to show only games for current address
    player_only?: boolean;
    status?: ReactNode;
    error?: unknown;
  }>({
    after: [],
    game_over: !!contract.address,
    player_only: !!contract.address,
  });

  useEffect(() => {
    loadGames();
  }, [contract.address, state.after, state.game_over, state.player_only]);

  // sort player games first when connected
  useEffect(() => {
    updateGames();
  }, [contract.address]);

  async function loadGames(): Promise<void> {
    setState({ ...state, loading: true, status: "Loading games" });
    return contract
      .getGames({
        // filters now that there are too many games
        after:
          state.after.length > 0
            ? state.after[state.after.length - 1]
            : undefined,
        game_over: state.game_over,
        player: state.player_only ? contract.address : undefined,
      })
      .then((games: ChessGameSummary[]) => {
        setState((state) => {
          let status: ReactNode | undefined = undefined;
          if (games.length === 0) {
            status = (
              <>
                No games yet,{" "}
                <Link to="/challenges">find or create a challenge</Link>
              </>
            );
          }
          return { ...state, games, loading: undefined, status };
        });
      })
      .catch((error: any) => {
        setState((state) => {
          return { ...state, error, loading: undefined, status: undefined };
        });
      })
      .then(updateGames);
  }

  function nextPage(): void {
    const after = state.after.slice();
    if (state.games && state.games.length) {
      after.push(Math.max(...state.games.map((g) => g.game_id)));
    }
    setState((state) => {
      return {
        ...state,
        after,
      };
    });
  }

  function previousPage(): void {
    const after = state.after.slice();
    after.pop();
    setState((state) => {
      return {
        ...state,
        after,
      };
    });
  }

  function toggleGameOver(): void {
    setState((state) => {
      return {
        ...state,
        // reset after since page sizes change
        after: [],
        game_over: !state.game_over,
      };
    });
  }

  function togglePlayerOnly(): void {
    setState((state) => {
      return {
        ...state,
        // reset after since page sizes change
        after: [],
        player_only: !state.player_only,
      };
    });
  }

  async function updateGames(): Promise<void> {
    setState((state) => {
      if (!state.games) {
        return state;
      }

      const games = state.games.slice();
      // sort player games first, then by game id desc (newer first)
      const address = contract.address || "none";
      games.sort((a, b) => {
        const in_a = address === a.player1 || address === a.player2;
        const in_b = address === b.player1 || address === b.player2;
        if (in_a && !in_b) {
          return -1;
        } else if (!in_a && in_b) {
          return 1;
        } else {
          return a.game_id > b.game_id ? -1 : 1;
        }
      });

      return { ...state, games };
    });
  }

  const playerGames = (state.games ?? []).filter(
    (g) => g.player1 === contract.address || g.player2 === contract.address
  );
  const otherGames = (state.games ?? []).filter(
    (g) => g.player1 !== contract.address && g.player2 !== contract.address
  );

  return (
    <div className="games-wrapper">
      <div className="games">
        <h2>Games</h2>
        {state.error ? <p className="error">{`${state.error}`}</p> : <></>}
        {state.status ? <p className="status">{state.status}</p> : <></>}
        {playerGames.length > 0 ? (
          <>
            <h3>Your Games</h3>
            {playerGames.map((game) => (
              <GameSummary game={game} key={game.game_id} />
            ))}
          </>
        ) : (
          <></>
        )}

        {otherGames.length > 0 ? (
          <>
            {playerGames.length > 0 ? <h3>Other Games</h3> : ""}
            {otherGames.map((game) => (
              <GameSummary game={game} key={game.game_id} />
            ))}
          </>
        ) : (
          <></>
        )}
      </div>

      <div className="games-actions">
        <h3>Page {state.after.length + 1}</h3>
        <div className="games-actions-buttons">
          <button
            onClick={previousPage}
            disabled={state.loading || state.after.length == 0}
          >
            Previous Page
          </button>
          <button
            onClick={nextPage}
            disabled={state.loading || !state.games || state.games.length < 25}
          >
            Next Page
          </button>
        </div>

        <label>
          <input
            type="checkbox"
            checked={state.player_only}
            disabled={state.loading || !contract.address}
            onChange={togglePlayerOnly}
          />
          Only Your Games
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.game_over}
            disabled={state.loading}
            onChange={toggleGameOver}
          />
          Show Game Over
        </label>
      </div>
    </div>
  );
}
