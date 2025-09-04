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
  sets?: number;
  teams: string[];
  bracket: MatchType[];
  status: MATCH_STATUS;
  pointsPerMatch: number;
  tieBreakerPoints?: number;
  currentRound: number;
  createdAt: string;
  completedAt: string;
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

export enum TOURNAMENT_FORMATS {
  SINGLE_ELIM = "Single Elimination",
  DOUBLE_ELIM = "Double Elimination",
  ROUND_ROBIN = "Round Robin",
  SWISS = "Swiss System",
}

export enum MATCH_STATUS {
  PENDING = "Pending",
  ONGOING = "Ongoing",
  COMPLETED = "Completed",
}
