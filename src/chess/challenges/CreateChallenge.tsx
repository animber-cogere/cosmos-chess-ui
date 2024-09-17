import React, { useState } from "react";

import { CreateChallengeProps as CreateChallengeState } from "../CosmWasmChess";
import "./CreateChallenge.css";

export interface CreateChallengeProps {
  disabled?: boolean;
  onCreateChallenge: (challenge: CreateChallengeState) => void;
}

export function CreateChallenge(props: CreateChallengeProps) {
  const [state, setState] = useState<CreateChallengeState>({});

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setState((state) => {
      return { ...state, [e.target.name]: e.target.value };
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onCreateChallenge({
      block_limit: state.block_limit ? +state.block_limit : undefined,
      opponent: state.opponent || undefined,
      play_as: state.play_as || undefined,
    });
    setState((_state) => {
      return {};
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="create_challenge_play_as">Play As</label>
      <select
        id="create_challenge_play_as"
        name="play_as"
        onChange={onChange}
        value={state.play_as}
      >
        <option value="">Random</option>
        <option value="white">White</option>
        <option value="black">Black</option>
      </select>

      <label htmlFor="create_challenge_block_limit">
        Block Time Limit
        <br />
        <small>(entire game, per player, ~10 blocks/min)</small>
      </label>
      <input
        id="create_challenge_block_limit"
        min="200"
        name="block_limit"
        onChange={onChange}
        placeholder="optional"
        step="1"
        type="number"
        value={state.block_limit}
      />

      <button disabled={props.disabled}>Create Challenge</button>
    </form>
  );
}
