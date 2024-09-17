import { useOutletContext } from "react-router";
import { Address } from "../../Address";
import { Challenge, CosmWasmChess } from "../CosmWasmChess";
import { formatBlockTime } from "../formatBlockTime";
import "./ChallengeSummary.css";

export interface ChallengeElProps {
  address?: string;
  challenge: Challenge;
  onAcceptChallenge: (id: number) => void;
  onCancelChallenge: (id: number) => void;
}

export function ChallengeSummary(props: ChallengeElProps) {
  const { challenge: c, onAcceptChallenge, onCancelChallenge } = props;
  const contract = useOutletContext<CosmWasmChess>();

  const address = contract.address;

  const player_color = c.play_as || "random color";
  const opponent_color =
    player_color === "white"
      ? "black"
      : player_color === "black"
      ? "white"
      : player_color;

  const enabled =
    address &&
    (c.created_by === address || c.opponent === address || !c.opponent);

  return (
    <section className={"challengeSummary" + (!enabled ? " disabled" : "")}>
      <div className="players">
        <p className="challenge_id">
          <strong>#{c.challenge_id}</strong>
        </p>
        <p className="created_by">
          <small>Created By ({player_color})</small>
          <br />
          <span className="player">
            {c.created_by === contract.address ? (
              "you"
            ) : (
              <Address address={c.created_by} />
            )}
          </span>
        </p>
        <p className="opponent">
          <small>Opponent ({opponent_color})</small>
          <br />
          <span className="player">
            {!c.opponent ? (
              "open"
            ) : c.opponent === contract.address ? (
              "you"
            ) : (
              <Address address={c.opponent} />
            )}
          </span>
        </p>
        {c.block_limit ? (
          <p className="block_limit">
            <small>Block Limit (entire game, per player)</small>
            <br />
            <span className="player">{formatBlockTime(c.block_limit)}</span>
          </p>
        ) : (
          ""
        )}
      </div>

      <div className="actions">
        {c.created_by === contract.address ? (
          <button onClick={() => onCancelChallenge(c.challenge_id)}>
            Cancel
          </button>
        ) : (
          <button
            disabled={!enabled}
            onClick={() => onAcceptChallenge(c.challenge_id)}
          >
            Accept
          </button>
        )}
      </div>
    </section>
  );
}
