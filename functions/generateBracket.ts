import { Bracket, MATCH_STATUS, MatchType } from "@/types.ts/common";
import { generateUUID } from "../utils/helper";

export const generateLosersBracket = (teamCount: number, tournamentId: string) => {
  const rounds = Math.ceil(Math.log2(teamCount));
  const bracket: Bracket = {};

  bracket[1] = [];
  const firstRoundLosers = Math.floor(teamCount / 2);

  for (let i = 0; i < firstRoundLosers; i += 2) {
    bracket[1].push({
      id: generateUUID(),
      tournamentId: tournamentId,
      team1: null,
      team2: null,
      team1Score: 0,
      team2Score: 0,
      winner: null,
      status: MATCH_STATUS.PENDING,
      position: Math.floor(i / 2) + 1,
    });
  }

  return bracket;
};

export const generateSingleElimination = (teams: string[], tournamentId: string) => {
  const numTeams = teams.length;
  const rounds = Math.ceil(Math.log2(numTeams));
  const bracket: Bracket = {};

  for (let round = 1; round <= rounds; round++) {
    bracket[round] = [];
    const matchesInRound = Math.pow(2, rounds - round);

    for (let match = 0; match < matchesInRound; match++) {
      bracket[round].push({
        id: generateUUID(),
        tournamentId: tournamentId,
        team1: round === 1 ? teams[match * 2] : null,
        team2: round === 1 ? teams[match * 2 + 1] : null,
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: MATCH_STATUS.PENDING,
        position: match + 1,
      });
    }
  }

  return bracket;
};

export const generateDoubleElimination = (teams: string[], tournamentId: string) => {
  const winnersBracket = generateSingleElimination(teams, tournamentId);
  const losersBracket = generateLosersBracket(teams.length, tournamentId);

  return {
    winners: winnersBracket,
    losers: losersBracket,
    grandFinal: {
      id: generateUUID(),
      tournamentId: tournamentId,
      team1: null,
      team2: null,
      team1Score: 0,
      team2Score: 0,
      winner: null,
      status: MATCH_STATUS.PENDING,
      resetMatch: null,
    },
  };
};

export const generateRoundRobin = (teams: string[], tournamentId: string) => {
  const matches: MatchType[] = [];
  let matchNumber = 1;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: generateUUID(),
        tournamentId: tournamentId,
        position: matchNumber++,
        team1: teams[i],
        team2: teams[j],
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: MATCH_STATUS.PENDING,
      });
    }
  }

  return { matches };
};

export const generateSwissTournament = (
  teams: string[],
  tournamentId: string,
  rounds?: number
): { matches: MatchType[]; rounds: number } => {
  const numTeams = teams.length;
  if (!rounds) rounds = Math.ceil(Math.log2(numTeams));

  const matches: MatchType[] = [];
  let matchNumber = 1;

  const swissTeams = teams.map((team) => ({
    team,
    points: 0,
    opponents: new Set<string>(),
    byes: 0,
  }));

  for (let i = 0; i < swissTeams.length; i += 2) {
    const team1 = swissTeams[i];
    const team2 = swissTeams[i + 1] || null;

    matches.push({
      id: generateUUID(),
      tournamentId,
      position: matchNumber++,
      team1: team1.team,
      team2: team2 ? team2.team : null,
      team1Score: 0,
      team2Score: 0,
      winner: null,
      status: MATCH_STATUS.PENDING,
    });

    if (team2) {
      team1.opponents.add(team2.team);
      team2.opponents.add(team1.team);
    }
  }

  return { matches, rounds };
};
