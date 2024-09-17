import { Piece, PieceType } from "chess.js";

export interface ChessPieceProps {
  piece: Piece;
}

// https://en.wikipedia.org/wiki/Chess_symbols_in_Unicode
const PIECES: Record<"b" | "w", Record<PieceType, string>> = {
  b: {
    b: "♝",
    k: "♚",
    n: "♞",
    p: "♟",
    q: "♛",
    r: "♜",
  },
  w: {
    b: "♗",
    k: "♔",
    n: "♘",
    p: "♙",
    q: "♕",
    r: "♖",
  },
};

/**
 * ChessPiece uses SVG for better scaling and vertical alignment.
 */
export function ChessPiece(props: ChessPieceProps) {
  return (
    <svg height="100%" viewBox="0 0 100 100" width="100%">
      <text
        alignmentBaseline="middle"
        fontSize="100"
        textAnchor="middle"
        x="50"
        y="55"
      >
        {PIECES[props.piece.color][props.piece.type]}
      </text>
    </svg>
  );
}
