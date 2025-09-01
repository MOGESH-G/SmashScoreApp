export const PlayerModel = {
  id: "",
  name: "",
  tag: "",
  wins: 0,
  losses: 0,
  tournaments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const TournamentModel = {
  id: "",
  name: "",
  format: "single_elim",
  matchFormat: "bo3",
  players: [],
  matches: [],
  bracket: {},
  status: "setup",
  currentRound: 1,
  createdAt: new Date(),
  completedAt: null,
};

export const MatchModel = {
  id: "",
  tournamentId: "",
  player1: "",
  player2: "",
  player1Score: 0,
  player2Score: 0,
  games: [],
  status: "pending",
  round: 1,
  bracket: "winners",
  position: "",
};
