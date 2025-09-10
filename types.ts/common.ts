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
  players: PlayerType[];
  wins: 0;
  losses: 0;
};

export type Bracket = {
  [roundOrSet: number]: MatchType[];
};

export type TournamentType = {
  id: string;
  name: string;
  format: TOURNAMENT_FORMATS;
  sets?: number;
  mode: TOURNAMENT_MODE;
  teams: TeamType[];
  bracket: Bracket;
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
  team1: TeamType | null;
  team2: TeamType | null;
  team1Score: number;
  team2Score: number;
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

export enum TOURNAMENT_MODE {
  SINGLES = "Singles",
  DOUBLES = "Doubles",
}
