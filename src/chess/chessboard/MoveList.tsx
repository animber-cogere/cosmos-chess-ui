import { Move } from "chess.js";
import { MouseEvent, useRef } from "react";
import "./MoveList.css";

export interface MoveListProps {
  moves: Move[];
}

export function MoveList(props: MoveListProps) {
  const { moves } = props;
  const el = useRef<HTMLDivElement | null>(null);

  const move_numbers = Array.from(Array(Math.ceil(moves.length / 2)).keys());
  const list = move_numbers.map((number) => {
    const white_index = number * 2;
    const black_index = white_index + 1;
    return {
      number: number + 1,
      white: moves[white_index],
      black: moves.length > black_index ? moves[black_index] : undefined,
    };
  });

  function onClick(e: MouseEvent<HTMLDivElement>) {
    const list = el.current;
    if (!list) {
      return;
    }
    e.preventDefault();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(list);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return (
    <div className="MoveList" onClick={onClick} ref={el}>
      {list.map(({ number, white, black }) => (
        <span key={number}>
          <span className="number">{number}.</span>{" "}
          <span className="white">{white.san} </span>{" "}
          {black ? <span className="black">{black.san} </span> : ""}
        </span>
      ))}
    </div>
  );
}
