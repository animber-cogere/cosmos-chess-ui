import { useOutletContext } from "react-router";
import { Link } from "react-router-dom";
import {
  ChessRatingSummary,
  CosmWasmChess,
} from "../CosmWasmChess";
import "./RatingSummary.css";

export interface RatingSummaryProps {
  rating: ChessRatingSummary;
}

export function RatingSummary(props: RatingSummaryProps) {
  const { rating: r } = props;
  const contract = useOutletContext<CosmWasmChess>();
  const address = contract.address;

  return (
    <Link
      className={
        "ratingSummary turn"
      }
      to={`/rating`}
    >
      <div className="players">
        <p className="player">
          <strong>{r.player}</strong>
        </p>
        <p className="player">
          <small>Rating: {r.rating}</small>
        </p>
      </div>
    </Link>
  );
}