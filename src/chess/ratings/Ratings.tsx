import { ReactNode, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import { ChessRatingSummary, CosmWasmChess } from "../CosmWasmChess";
import "./Ratings.css";
import { RatingSummary } from "./RatingSummary";

export function Ratings() {
  const contract = useOutletContext<CosmWasmChess>();
  const [state, setState] = useState<{
    ratings?: ChessRatingSummary[];
    // whether loading
    loading?: boolean;
    status?: ReactNode;
    error?: unknown;
  }>({});

  useEffect(() => {
    loadRatings();
  }, [contract.address]);

  // sort player games first when connected
  useEffect(() => {
    updateRatings();
  }, [contract.address]);

  async function loadRatings(): Promise<void> {
    setState({ ...state, loading: true, status: "Loading ratings" });
    return contract
      .getRatings()
      .then((ratings: ChessRatingSummary[]) => {
        setState((state) => {
          let status: ReactNode | undefined = undefined;
          if (ratings.length === 0) {
            status = (
              <>
                No ratings yet,{" "}
                <Link to="/challenges">find or create a challenge</Link>
              </>
            );
          }
          return { ...state, ratings, loading: undefined, status };
        });
      })
      .catch((error: any) => {
        setState((state) => {
          return { ...state, error, loading: undefined, status: undefined };
        });
      })
      .then(updateRatings);
  }

  async function updateRatings(): Promise<void> {
    setState((state) => {
      if (!state.ratings) {
        return state;
      }

      const ratings = state.ratings.slice();
      return { ...state, ratings };
    });
  }

  return (
    <div className="ratings-wrapper">
      <div className="ratings">
        <h2>Ratings</h2>
        {state.error ? <p className="error">{`${state.error}`}</p> : <></>}
        {state.status ? <p className="status">{state.status}</p> : <></>}
        {state.ratings && state.ratings.length > 0 ? (
          <>
            {state.ratings.map((rating) => (
              <RatingSummary rating={rating} />
            ))}
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
