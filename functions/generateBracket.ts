import { MATCH_STATUS, MatchType, TeamType } from "@/types.ts/common";
import { generateUUID } from "../utils/helper";

// export const generateLosersBracket = (teamCount: number, tournamentId: string) => {
//   const rounds = Math.ceil(Math.log2(teamCount));
//   const bracket: Bracket = {};

//   bracket[1] = [];
//   const firstRoundLosers = Math.floor(teamCount / 2);

//   for (let i = 0; i < firstRoundLosers; i += 2) {
//     bracket[1].push({
//       id: generateUUID(),
//       tournamentId: tournamentId,
//       team1: null,
//       team2: null,
//       team1Score: 0,
//       team2Score: 0,
//       winner: null,
//       status: MATCH_STATUS.PENDING,
//       position: Math.floor(i / 2) + 1,
//     });
//   }

//   return bracket;
// };

// export const generateSingleElimination = (teams: TeamType[], tournamentId: string) => {
//   const numTeams = teams.length;
//   const rounds = Math.ceil(Math.log2(numTeams));
//   const bracket: Bracket = {};

//   for (let round = 1; round <= rounds; round++) {
//     bracket[round] = [];
//     const matchesInRound = Math.pow(2, rounds - round);

//     for (let match = 0; match < matchesInRound; match++) {
//       bracket[round].push({
//         id: generateUUID(),
//         tournamentId: tournamentId,
//         team1: round === 1 ? teams[match * 2] : null,
//         team2: round === 1 ? teams[match * 2 + 1] : null,
//         team1Score: 0,
//         team2Score: 0,
//         winner: null,
//         status: MATCH_STATUS.PENDING,
//         position: match + 1,
//       });
//     }
//   }

//   return bracket;
// };

// export const generateDoubleElimination = (teams: TeamType[], tournamentId: string) => {
//   const winnersBracket = generateSingleElimination(teams, tournamentId);
//   const losersBracket = generateLosersBracket(teams.length, tournamentId);

//   return {
//     winners: winnersBracket,
//     losers: losersBracket,
//     grandFinal: {
//       id: generateUUID(),
//       tournamentId: tournamentId,
//       team1: null,
//       team2: null,
//       team1Score: 0,
//       team2Score: 0,
//       winner: null,
//       status: MATCH_STATUS.PENDING,
//       resetMatch: null,
//     },
//   };
// };

// export const generateRoundRobin = (teams: TeamType[], tournamentId: string, setCount = 1) => {
//   const matches: MatchType[] = [];
//   let matchNumber = 1;

//   for (let i = 0; i < teams.length; i++) {
//     for (let j = i + 1; j < teams.length; j++) {
//       for (let set = 1; set <= setCount; set++) {
//         matches.push({
//           id: generateUUID(),
//           tournamentId: tournamentId,
//           position: matchNumber++,
//           team1: teams[i],
//           team2: teams[j],
//           team1Score: 0,
//           team2Score: 0,
//           winner: null,
//           status: MATCH_STATUS.PENDING,
//         });
//       }
//     }
//   }

//   return { matches };
// };

// export const generateSwissTournament = (
//   teams: TeamType[],
//   tournamentId: string,
//   rounds?: number
// ): { matches: MatchType[]; rounds: number } => {
//   const numTeams = teams.length;
//   if (!rounds) rounds = Math.ceil(Math.log2(numTeams));

//   const matches: MatchType[] = [];
//   let matchNumber = 1;

//   const swissTeams = teams.map((team) => ({
//     team,
//     points: 0,
//     opponents: new Set<TeamType>(),
//     byes: 0,
//   }));

//   for (let i = 0; i < swissTeams.length; i += 2) {
//     const team1 = swissTeams[i];
//     const team2 = swissTeams[i + 1] || null;

//     matches.push({
//       id: generateUUID(),
//       tournamentId,
//       position: matchNumber++,
//       team1: team1.team,
//       team2: team2 ? team2.team : null,
//       team1Score: 0,
//       team2Score: 0,
//       winner: null,
//       status: MATCH_STATUS.PENDING,
//     });

//     if (team2) {
//       team1.opponents.add(team2.team);
//       team2.opponents.add(team1.team);
//     }
//   }

//   return { matches, rounds };
// };

export type Bracket = {
  [round: number]: MatchType[];
};

export const generateLosersBracket = (teamCount: number, tournamentId: string): Bracket => {
  const bracket: Bracket = {};

  bracket[1] = [];
  const firstRoundLosers = Math.floor(teamCount / 2);

  for (let i = 0; i < firstRoundLosers; i += 2) {
    bracket[1].push({
      id: generateUUID(),
      tournamentId,
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

export const generateSingleElimination = (teams: TeamType[], tournamentId: string): Bracket => {
  const numTeams = teams.length;
  console.log("team length", numTeams);
  const rounds = Math.ceil(Math.log2(numTeams));
  const bracket: Bracket = {};

  for (let round = 1; round <= rounds; round++) {
    bracket[round] = [];
    const matchesInRound = Math.pow(2, rounds - round);

    for (let match = 0; match < matchesInRound; match++) {
      let team1: TeamType | null = null;
      let team2: TeamType | null = null;

      if (round === 1) {
        // Assign actual teams for the first round if they exist
        team1 = teams[match * 2] ?? null;
        team2 = teams[match * 2 + 1] ?? null;

        // Skip match if both teams are null
        if (!team1 && !team2) continue;
      }

      bracket[round].push({
        id: generateUUID(),
        tournamentId,
        team1,
        team2,
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

export const generateDoubleElimination = (teams: TeamType[], tournamentId: string) => {
  const winnersBracket = generateSingleElimination(teams, tournamentId);
  const losersBracket = generateLosersBracket(teams.length, tournamentId);

  return {
    winners: winnersBracket,
    losers: losersBracket,
    grandFinal: {
      id: generateUUID(),
      tournamentId,
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

export const generateRoundRobin = (teams: TeamType[], tournamentId: string, setCount = 1) => {
  const sets: Record<number, MatchType[]> = {};
  let matchNumber = 1;

  for (let set = 1; set <= setCount; set++) {
    sets[set] = [];
  }

  const totalMatches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      totalMatches.push([teams[i], teams[j]]);
    }
  }

  const setTeamTracker: Record<number, Set<string>> = {};
  for (let s = 1; s <= setCount; s++) setTeamTracker[s] = new Set();

  let currentSet = 1;
  for (const [team1, team2] of totalMatches) {
    let placed = false;
    for (let attempt = 0; attempt < setCount; attempt++) {
      const setIndex = ((currentSet + attempt - 1) % setCount) + 1;
      const usedTeams = setTeamTracker[setIndex];
      if (!usedTeams.has(team1.id) && !usedTeams.has(team2.id)) {
        const match: MatchType = {
          id: generateUUID(),
          tournamentId,
          position: matchNumber++,
          team1,
          team2,
          team1Score: 0,
          team2Score: 0,
          winner: null,
          status: MATCH_STATUS.PENDING,
        };
        sets[setIndex].push(match);
        usedTeams.add(team1.id);
        usedTeams.add(team2.id);
        currentSet = (setIndex % setCount) + 1;
        placed = true;
        break;
      }
    }
    if (!placed) {
      const match: MatchType = {
        id: generateUUID(),
        tournamentId,
        position: matchNumber++,
        team1,
        team2,
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: MATCH_STATUS.PENDING,
      };
      sets[currentSet].push(match);
      setTeamTracker[currentSet].add(team1.id);
      setTeamTracker[currentSet].add(team2.id);
      currentSet = (currentSet % setCount) + 1;
    }
  }

  return sets;
};

export const generateSwissTournament = (
  teams: TeamType[],
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
      team1.opponents.add(team2.team.id);
      team2.opponents.add(team1.team.id);
    }
  }

  return { matches, rounds };
};
