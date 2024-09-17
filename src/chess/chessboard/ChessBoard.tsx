import { useState } from "react";
import { ChessInstance, Move, Square } from "chess.js";
import { ChessPieceSvg as ChessPiece } from "./ChessPieceSvg";
import "./ChessBoard.css";

export interface ChessBoardProps {
  chess: ChessInstance;
  interactive?: boolean;
  isValidMove: (move: Move) => Promise<boolean>;
  onMove?: (move: Move) => void;
  orientation?: "w" | "b";
  position?: string;
}

export function ChessBoard(props: ChessBoardProps) {
  const [state, setState] = useState<{
    pendingMove?: Move;
    selected?: Square;
  }>({});

  const history = props.chess.history({ verbose: true });
  let lastMove = history ? history[history.length - 1] : undefined;

  function getSquare(square: Square) {
    const piece = props.chess.get(square);
    const lastMoveClass =
      lastMove && (lastMove.from === square || lastMove.to === square)
        ? " lastmove"
        : "";
    const selectedClass = square === state.selected ? " selected" : "";

    return (
      <div
        className={square + " square" + lastMoveClass + selectedClass}
        key={square}
        onClick={() => onSquareClick(square)}
      >
        {piece ? <ChessPiece piece={piece} /> : ""}
      </div>
    );
  }

  function onSquareClick(square: Square): void {
    if (!props.chess || !(props.interactive ?? true)) {
      return;
    }

    // try to move from existing selected square
    if (state.selected) {
      let move = props.chess
        .moves({
          square: state.selected,
          verbose: true,
        })
        .find((move: Move) => move.to === square);
      if (move) {
        // try to make move (not null if move succeeded)
        props.isValidMove(move).then(
          valid => {
            if (valid) {
              props.chess.move(move);
              setState((state) => {
                return {
                  ...state,
                  selected: undefined,
                };
              });
              if (props.onMove) {
                props.onMove(move!);
              }
              return;
            }
          }
        );
        // fall through and try to select new square
      }
    }

    // select square if piece with valid moves
    const moves = props.chess.moves({
      square,
      verbose: true,
    });
    // update selected
    setState((state) => {
      return { ...state, selected: moves.length !== 0 ? square : undefined };
    });
  }

  // squares in render order
  let squares;
  if (props.orientation === "w") {
    // black squares first at top of grid
    squares = props.chess.SQUARES;
  } else {
    // white squares first at top of grid
    squares = props.chess.SQUARES.slice().reverse();
  }

  /**
   * Render a board square.
   *
   * At left and right edges of board, also add row label.
   * Separate function for key.
   */
  function BoardSquare({ square, index }: { square: Square; index: number }) {
    const row = square.charAt(1);
    return (
      <>
        {index % 8 == 0 ? (
          <div className="row left" key={`row-left-${row}`}>
            {row}
          </div>
        ) : (
          ""
        )}
        {getSquare(square)}
        {index % 8 == 7 ? (
          <div className="row right" key={`row-right-${row}`}>
            {row}
          </div>
        ) : (
          ""
        )}
      </>
    );
  }

  return (
    <section className="ChessBoard">
      {/* top column labels */}
      <div className="empty" key="top-left"></div>
      {squares.slice(0, 8).map((square) => {
        const col = square.charAt(0);
        return (
          <div className="col top" key={`col-top-${col}`}>
            {col}
          </div>
        );
      })}
      <div className="empty" key="top-right"></div>

      {/* grid and row labels */}
      {squares.map((square, index) => (
        <BoardSquare key={square} square={square} index={index} />
      ))}

      {/* bottom column labels */}
      <div className="empty" key="bottom-left"></div>
      {squares.slice(0, 8).map((square) => {
        const col = square.charAt(0);
        return (
          <div className="col bottom" key={`col-bottom-${col}`}>
            {col}
          </div>
        );
      })}
      <div className="empty" key="bottom-right"></div>
    </section>
  );
}
