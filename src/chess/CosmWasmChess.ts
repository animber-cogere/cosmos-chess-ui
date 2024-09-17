import { StdFee } from "@cosmjs/amino";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { CosmWasm } from "./useCosmWasm";

export interface Challenge {
  block_created: number;
  block_limit?: number;
  challenge_id: number;
  created_by: string;
  opponent?: string;
  play_as?: "white" | "black";
}

export interface CreateChallengeProps {
  block_limit?: number;
  opponent?: string;
  play_as?: "white" | "black";
}

export interface MakeMove {
  move: string;
}

export interface OfferDraw {
  offer_draw: string;
}

export function isMakeMove(value: MoveAction): value is MakeMove {
  return value.hasOwnProperty("move");
}

export function isOfferDraw(value: MoveAction): value is OfferDraw {
  return value.hasOwnProperty("offer_draw");
}

export type MoveAction = "accept_draw" | MakeMove | OfferDraw | "resign";

export type Move = [number, MoveAction];

export interface ChessGame {
  block_limit?: number;
  block_start: number;
  fen: string;
  game_id: number;
  moves: Move[];
  player1: string;
  player2: string;
  status?: string;
}

export interface ChessGameSummary {
  block_limit?: number;
  block_start: number;
  game_id: number;
  player1: string;
  player2: string;
  status?: string;
  turn_color?: "white" | "black";
}

export function formatGameSummaryStatus(
  status?: string,
  turn_color: "white" | "black" = "white"
) {
  if (status) {
    status = status.replace("_", " ");
  } else {
    status = `${turn_color} to play`;
  }
  status = status.charAt(0).toUpperCase() + status.slice(1);
  return status;
}

export interface ChessRatingSummary {
  player: string;
  rating: number;
}

export function formatRatingSummaryStatus(
  status?: string,
) {
}

export class CosmWasmChess {
  constructor(public client: CosmWasm, public readonly contract: string) {}

  async acceptChallenge(
    challenge_id: number,
    fee?: number | StdFee | "auto"
  ): Promise<ExecuteResult> {
    return this.client.execute(
      this.contract,
      {
        accept_challenge: { challenge_id },
      },
      fee
    );
  }

  async acceptDraw(
    game_id: number,
    fee?: number | StdFee | "auto"
  ): Promise<ExecuteResult> {
    return this.client.execute(
      this.contract,
      {
        turn: { game_id, action: "accept_draw" },
      },
      fee
    );
  }

  get address() {
    return this.client.address;
  }

  async cancelChallenge(challenge_id: number): Promise<ExecuteResult> {
    return this.client.execute(this.contract, {
      cancel_challenge: { challenge_id },
    });
  }

  async createChallenge(data: CreateChallengeProps): Promise<ExecuteResult> {
    return this.client.execute(this.contract, { create_challenge: data });
  }

  async declareTimeout(
    game_id: number,
    fee?: number | StdFee | "auto"
  ): Promise<ExecuteResult> {
    return this.client.execute(
      this.contract,
      {
        turn: { game_id, action: { move: "timeout" } },
      },
      fee
    );
  }

  async getChallenges({
    after,
    player,
  }: {
    after?: number;
    player?: string;
  }): Promise<Challenge[]> {
    return this.client.queryContractSmart(this.contract, {
      get_challenges: { after, player: player },
    });
  }

  async getGame(game_id: number): Promise<ChessGame> {
    return this.client.queryContractSmart(this.contract, {
      get_game: { game_id },
    });
  }

  async getGames({
    after,
    game_over,
    player,
  }: {
    after?: number;
    game_over?: boolean;
    player?: string;
  }): Promise<ChessGameSummary[]> {
    return this.client.queryContractSmart(this.contract, {
      get_games: { after, game_over: game_over ?? !!player, player },
    });
  }

  async getTurn(
    game_id: number,
    player: string,
  ): Promise<boolean> {
    return this.client.queryContractSmart(
      this.contract,
      {
        get_turn: { game_id, player },
      }
    )
  }

  async validMove(
    game_id: number,
    player: string,
    move: string,
  ): Promise<boolean> {
    return this.client.queryContractSmart(
      this.contract,
      {
        valid_move: { game_id, player, move },
      }
    )
  }

  async makeMove(
    game_id: number,
    move: string,
    fee?: number | StdFee | "auto"
  ): Promise<ExecuteResult> {
    return this.client.execute(
      this.contract,
      {
        turn: { game_id, action: { move } },
      },
      fee
    );
  }

  async offerDraw(
    game_id: number,
    offer_draw: string,
    fee?: number | StdFee | "auto"
  ): Promise<ExecuteResult> {
    return this.client.execute(
      this.contract,
      {
        turn: { game_id, action: { offer_draw } },
      },
      fee
    );
  }

  async resign(
    game_id: number,
    fee?: number | StdFee | "auto"
  ): Promise<ExecuteResult> {
    return this.client.execute(
      this.contract,
      {
        turn: { game_id, action: "resign" },
      },
      fee
    );
  }

  async getRatings(): Promise<ChessRatingSummary[]> {
    return this.client.queryContractSmart(this.contract, {
      get_ratings: { },
    });
  }
}
