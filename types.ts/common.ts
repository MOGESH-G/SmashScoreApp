export type PlayerType = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  createdAt: string;
  //   updatedAt: string,
};

export type TeamType = {
  id: string;
  name: string;
  tournamentId: string;
  wins: number;
  losses: number;
  players: string[];
  createdAt: string;
};

export type TournamentType = {
  id: string;
  name: string;
  format: TOURNAMENT_FORMATS;
  matchFormat?: string;
  teams: string[];
  // matches: string[];
  bracket: Bracket;
  status: MATCH_STATUS;
  currentRound: number;
  createdAt: string;
  completedAt: string | null;
};

export type MatchType = {
  id: string;
  tournamentId: string;
  team1: string | null;
  team2: string | null;
  team1Score: 0;
  team2Score: 0;
  winner: string | null;
  status: MATCH_STATUS;
  position: number;
};

export type Bracket = {
  [round: number]: MatchType[];
};

export enum TOURNAMENT_FORMATS {
  SINGLE_ELIM = "single_elim",
  DOUBLE_ELIM = "double_elim",
  ROUND_ROBIN = "round_robin",
  SWISS = "swiss",
}

export enum MATCH_STATUS {
  PENDING = "pending",
  ONGOING = "ongoing",
  COMPLETED = "completed",
}
