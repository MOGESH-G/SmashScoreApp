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

// export const generateSwissTournament = (
//   teams: TeamType[],
//   tournamentId: string,
//   rounds?: number
// ): Record<number, MatchType[]> => {
//   const numTeams = teams.length;
//   if (!rounds) rounds = Math.ceil(Math.log2(numTeams));

//   const swissTeams = teams.map((team) => ({
//     team,
//     points: 0,
//     opponents: new Set<string>(),
//     byes: 0,
//   }));

//   let matchNumber = 1;
//   const schedule: Record<number, MatchType[]> = {};

//   const generateRound = (roundIndex: number) => {
//     swissTeams.sort((a, b) => b.points - a.points);

//     const roundMatches: MatchType[] = [];
//     const used = new Set<string>();

//     for (let i = 0; i < swissTeams.length; i++) {
//       const team1 = swissTeams[i];
//       if (used.has(team1.team.id)) continue;

//       let team2: typeof team1 | null = null;
//       for (let j = i + 1; j < swissTeams.length; j++) {
//         if (!used.has(swissTeams[j].team.id) && !team1.opponents.has(swissTeams[j].team.id)) {
//           team2 = swissTeams[j];
//           break;
//         }
//       }

//       if (!team2) {
//         // bye
//         roundMatches.push({
//           id: generateUUID(),
//           tournamentId,
//           position: matchNumber++,
//           team1: team1.team,
//           team2: null,
//           team1Score: 0,
//           team2Score: 0,
//           winner: null,
//           status: MATCH_STATUS.PENDING,
//         });
//         team1.byes++;
//         used.add(team1.team.id);
//       } else {
//         roundMatches.push({
//           id: generateUUID(),
//           tournamentId,
//           position: matchNumber++,
//           team1: team1.team,
//           team2: team2.team,
//           team1Score: 0,
//           team2Score: 0,
//           winner: null,
//           status: MATCH_STATUS.PENDING,
//         });

//         team1.opponents.add(team2.team.id);
//         team2.opponents.add(team1.team.id);

//         used.add(team1.team.id);
//         used.add(team2.team.id);
//       }
//     }

//     schedule[roundIndex + 1] = roundMatches;
//   };

//   for (let r = 0; r < rounds; r++) {
//     generateRound(r);
//   }

//   return schedule;
// };

export const generateSwissTournament = (
  teams: TeamType[], // must include currentScore property
  tournamentId: string,
  roundCount: number
) => {
  const rounds: Record<number, MatchType[]> = {};
  // Track matches played per team for rematch avoidance
  const matchesPlayed: Record<string, Set<string>> = {};
  let matchNumber = 1;

  for (const team of teams) {
    matchesPlayed[team.id] = new Set();
  }

  for (let round = 1; round <= roundCount; round++) {
    const sortedTeams = [...teams].sort((a, b) => b.wins - a.wins || a.id.localeCompare(b.id));

    const used = new Set<string>();
    const matches: MatchType[] = [];

    let i = 0;

    while (i < sortedTeams.length) {
      const team1 = sortedTeams[i];
      let found = false;
      for (let j = i + 1; j < sortedTeams.length; j++) {
        const team2 = sortedTeams[j];
        if (!used.has(team2.id) && !matchesPlayed[team1.id].has(team2.id)) {
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
          matches.push(match);
          matchesPlayed[team1.id].add(team2.id);
          matchesPlayed[team2.id].add(team1.id);
          used.add(team1.id);
          used.add(team2.id);
          found = true;
          break;
        }
      }
      if (!found && !used.has(team1.id)) {
        const match: MatchType = {
          id: generateUUID(),
          tournamentId,
          position: matchNumber++,
          team1,
          team2: null,
          team1Score: 0,
          team2Score: 0,
          winner: team1.id,
          status: MATCH_STATUS.PENDING,
        };
        matches.push(match);
        used.add(team1.id);
      }
      i++;
      while (i < sortedTeams.length && used.has(sortedTeams[i].id)) {
        i++;
      }
    }
    rounds[round] = matches;
  }
  return rounds;
};

// export function generateHybridTournament(
//   teams: TeamType[],
//   groupCount: number,
//   playoffQualifiers: number // total teams for knockout from all groups
// ) {
//   // 1. Divide teams into groups
//   const groups: TeamType[][] = Array.from({ length: groupCount }, () => []);
//   teams.forEach((t, i) => groups[i % groupCount].push(t));

//   // 2. Generate round robin matches for each group
//   const groupMatches: MatchType[] = [];
//   let matchNumber = 1;
//   for (let g = 0; g < groupCount; g++) {
//     const groupTeams = groups[g];
//     for (let i = 0; i < groupTeams.length; i++) {
//       for (let j = i + 1; j < groupTeams.length; j++) {
//         groupMatches.push({
//           id: generateUUID(),
//           stage: "group",
//           group: g + 1,
//           team1: groupTeams[i],
//           team2: groupTeams[j],
//           team1Score: 0,
//           team2Score: 0,
//           winner: null,
//           status: MATCH_STATUS.PENDING,
//         });
//       }
//     }
//   }

//   // --- Group results must be processed here after matches are played ---
//   // Simulate/assume group results and select top teams, simplified here:
//   // For example: select first playoffQualifiers teams (customize logic for ranking)
//   const playoffTeams = teams.slice(0, playoffQualifiers);

//   // 3. Generate knockout bracket (single elimination for semifinals and final)
//   // Example with 4 playoff teams (semifinals, final, 3rd place)
//   const knockoutMatches: MatchType[] = [];
//   // Semifinals
//   knockoutMatches.push({
//     id: generateUUID(),
//     stage: "knockout",
//     team1: playoffTeams[0],
//     team2: playoffTeams[3],
//     team1Score: 0,
//     team2Score: 0,
//     winner: null,
//     status: MATCH_STATUS.PENDING,
//     tournamentId: "",
//     position: 0
//   });
//   knockoutMatches.push({
//     id: generateUUID(),
//     round: 1,
//     stage: "knockout",
//     team1: playoffTeams[1],
//     team2: playoffTeams[2],
//     team1Score: 0,
//     team2Score: 0,
//     winner: null,
//     status: "Pending",
//   });
//   // Final
//   knockoutMatches.push({
//     id: generateUUID(),
//     round: 2,
//     stage: "knockout",
//     team1: null, // To be filled after semifinal winners
//     team2: null,
//     team1Score: 0,
//     team2Score: 0,
//     winner: null,
//     status: MATCH_STATUS.PENDING,
//   });
//   // 3rd place (optional)
//   knockoutMatches.push({
//     id: generateUUID(),
//     round: 2,
//     stage: "knockout",
//     team1: null,
//     team2: null,
//     team1Score: 0,
//     team2Score: 0,
//     winner: null,
//     status: MATCH_STATUS.PENDING,
//   });

//   return {
//     groups,
//     groupMatches,
//     playoffTeams,
//     knockoutMatches,
//   };
// }
