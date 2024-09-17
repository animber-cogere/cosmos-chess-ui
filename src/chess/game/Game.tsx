import { StdFee } from "@cosmjs/amino";
import { Chess, ChessInstance, Move } from "chess.js";
import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { Address } from "../../Address";

import {
  CosmWasmChess,
  ChessGame,
  isMakeMove,
  isOfferDraw,
  formatGameSummaryStatus,
} from "../CosmWasmChess";
import { ChessBoard, MoveList } from "../chessboard";
import "./Game.css";
import { formatBlockTime } from "../formatBlockTime";

export interface GameState {
  // chess.js game
  chess?: ChessInstance;
  // whether draw was offered on last move
  drawOffered?: boolean;
  // error loading game
  error?: unknown;
  // estimated gas fee
  fee?: number | StdFee | "auto";
  // game from contract
  game?: ChessGame;
  // game history
  history?: Move[];
  // whether player can interact with board
  interactive?: boolean;
  // board orientation
  orientation?: "w" | "b";
  // move that is not yet submitted
  pendingMove?: Move;
  // current status, loading, game over, etc
  status?: string;
  // next turn
  turn?: "w" | "b";
}

export function Game() {
  const contract = useOutletContext<CosmWasmChess>();
  const { game_id } = useParams();

  const address = contract.address;
  const [state, setState] = useState<GameState>({});
  const [turn, setTurn] = useState<boolean>(false);

  // update board/controls when address changes
  useEffect(() => {
    setState((state) => {
      return { ...state, address: contract.address };
    });
    updateGame();
  }, [contract.address]);

  // load the game
  useEffect(() => {
    loadGame();
  }, [game_id, turn]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTurn();
    }, 2000); // Interval set to 2000 milliseconds (2 seconds)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  function estimateFee(game: ChessGame): number | StdFee | "auto" {
    let gas = "200000";
    let moves = game.moves.length;

    if (moves >= 60) {
      // 0.4.1 crosses 250k around move 80
      gas = "300000";
    } else if (moves >= 20) {
      // 0.4.1 crosses 200k around move 25
      gas = "250000";
    }

    return {
      amount: [],
      gas,
    };
  }

  function formatSummary(game: ChessGame) {
    return (
      <dl className="summary">
        <dt>White</dt>
        <dd>
          {game.player1 === address ? (
            "you"
          ) : (
            <Address address={game.player1} />
          )}
        </dd>
        <dt>Black</dt>
        <dd>
          {game.player2 === address ? (
            "you"
          ) : (
            <Address address={game.player2} />
          )}
        </dd>
        <dt>
          Block Limit <small>(entire game, per player)</small>
        </dt>
        <dd>
          {formatBlockTime(game.block_limit)}
          {!game.status && (game.block_limit || game.block_limit === 0) ? (
            <>
              {" "}
              <button
                className="declareTimeout"
                disabled={
                  // game is not started
                  game.moves.length === 0 ||
                  // current user is not player
                  !(game.player1 === address || game.player2 === address)
                }
                onClick={onDeclareTimeoutClick}
              >
                Declare Timeout
              </button>
            </>
          ) : (
            <></>
          )}
        </dd>
      </dl>
    );
  }

  async function loadGame(): Promise<void> {
    setStatus("Loading Game");
    if (!game_id) {
      return;
    }
    return contract
      .getGame(+game_id)
      .then((game: ChessGame) => {
        setState((state) => {
          return {
            ...state,
            chess: parseGame(game),
            fee: estimateFee(game),
            game,
            pendingMove: undefined,
            status: undefined,
          };
        });
        updateGame();
      })
      .catch(setError);
  }

  async function onAcceptDrawClick(): Promise<void> {
    if (!game_id) {
      return;
    }
    setStatus("Executing Accept Draw");
    return contract
      .acceptDraw(+game_id, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  async function updateTurn(): Promise<void> {
    if (!game_id || !contract.address)
      return;

    await contract
      .getTurn(+game_id, contract.address)
      .then((turn_) => {
        setTurn(turn_);
      })
      .catch(() => {
        setTurn(false);
      });
  }

  async function isValidMove(move: Move): Promise<boolean> {
    if (!game_id || !contract.address)
      return false;

    let san = move.san;
    
    // contract expects zeros
    if (san.indexOf("O") === 0) {
      san = san.replace(/o/gi, "0");
    }

    let valid = false;
    try {
      valid = await contract
        .validMove(+game_id, contract.address, san);
    } catch (e) {
    }

    return valid;
  }

  async function onBoardMove(pendingMove: Move): Promise<void> {
    setState((state) => {
      return { ...state, pendingMove };
    });
    updateGame();
  }

  async function onCancelMoveClick(): Promise<void> {
    setState((state) => {
      return state.game
        ? { ...state, chess: parseGame(state.game), pendingMove: undefined }
        : state;
    });
    updateGame();
  }

  async function onDeclareTimeoutClick(): Promise<void> {
    if (!game_id || !state.game?.block_limit) {
      return;
    }
    setStatus(`Declaring Timeout`);
    return contract
      .declareTimeout(+game_id, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  async function onMakeMoveClick(): Promise<void> {
    if (!game_id || !state.pendingMove) {
      return;
    }
    let move = state.pendingMove.san;
    // contract expects zeros
    if (move.indexOf("O") === 0) {
      move = move.replace(/o/gi, "0");
    }
    setStatus(`Executing Move (${move})`);
    return contract
      .makeMove(+game_id, state.pendingMove.san, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  async function onOfferDrawClick(): Promise<void> {
    if (!game_id || !state.pendingMove) {
      return;
    }
    const move = state.pendingMove.san;
    setStatus(`Executing Offer Draw (${move})`);
    return contract
      .offerDraw(+game_id, state.pendingMove.san, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  async function onResignClick(): Promise<void> {
    if (!game_id) {
      return;
    }
    setStatus("Executing Resign");
    return contract
      .resign(+game_id, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  function parseGame(game: ChessGame): ChessInstance {
    const chess = new Chess();
    game.moves.forEach((move) => {
      const action = move[1];
      if (isMakeMove(action)) {
        chess.move(action.move);
      } else if (isOfferDraw(action)) {
        chess.move(action.offer_draw);
      }
    });
    return chess;
  }

  function setError(error: any) {
    setState((state) => {
      return { ...state, error, status: undefined };
    });
  }

  function setStatus(status: string) {
    setState((state) => {
      return { ...state, error: undefined, status };
    });
  }

  function updateGame(): void {
    setState((state) => {
      const { chess, game } = state;
      if (!chess || !game) {
        return state;
      }
      // check if draw offered
      let drawOffered = false;
      if (game.moves.length > 0) {
        drawOffered = isOfferDraw(game.moves[game.moves.length - 1][1]);
      }
      const history = chess.history({ verbose: true });
      // check whether current player can make move
      const turn = chess.turn();
      const interactive =
        !game.status &&
        !state.pendingMove &&
        ((turn === "w" && game.player1 === address) ||
          (turn === "b" && game.player2 === address));
      // which way the board should face
      const orientation = address === game.player2 ? "b" : "w";
      // updated state
      return {
        ...state,
        drawOffered,
        history,
        interactive,
        orientation,
        turn,
      };
    });
  }

  return (
    <div className="game-wrapper">
      <div className="game">
        <h2>
          Game {game_id}{" "}
          <small>
            (
            {formatGameSummaryStatus(
              state.game?.status,
              state.turn === "b" ? "black" : "white"
            )}
            )
          </small>
        </h2>

        {state.error ? <p className="error">{`${state.error}`}</p> : ""}
        {state.status ? <p className="status">{state.status}</p> : ""}

        {state.chess ? (
          <div className="board">
            <ChessBoard
              chess={state.chess}
              interactive={state.interactive}
              isValidMove={isValidMove}
              onMove={onBoardMove}
              orientation={state.orientation}
            />
          </div>
        ) : (
          ""
        )}

        {state.game?.status ? (
          <p className="status">Game over</p>
        ) : (
          <>
            <div className="actions">
              <button
                className="cancel"
                disabled={!state.pendingMove}
                onClick={onCancelMoveClick}
              >
                Cancel
              </button>
              <button
                className="makeMove"
                disabled={!state.pendingMove}
                onClick={onMakeMoveClick}
              >
                Make Move
              </button>
              <button
                className="acceptDraw"
                disabled={!state.drawOffered}
                onClick={onAcceptDrawClick}
              >
                Accept Draw
              </button>
              <button
                className="offerDraw"
                disabled={state.drawOffered || !state.pendingMove}
                onClick={onOfferDrawClick}
              >
                Offer Draw
              </button>
              <button
                className="resign"
                disabled={!state.interactive}
                onClick={onResignClick}
              >
                Resign
              </button>
            </div>
          </>
        )}
      </div>

      <div className="controls">
        <h3>Details</h3>
        {state.game ? formatSummary(state.game) : <></>}

        <h4>Moves</h4>
        {state.history?.length ? (
          <MoveList moves={state.history} />
        ) : (
          "no moves yet"
        )}
      </div>
    </div>
  );
}
