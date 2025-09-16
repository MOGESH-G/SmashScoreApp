import { patchTournament } from "@/services/databaseService";
import {
  Bracket,
  MatchType,
  TeamType,
  TOURNAMENT_FORMATS,
  TournamentType,
} from "@/types.ts/common";

export const updateMatchData = async (
  tournamentData: TournamentType,
  matchId: string,
  key: keyof MatchType,
  value: any
): Promise<boolean> => {
  try {
    if (!tournamentData?.bracket) return false;

    const updatedBracket = { ...tournamentData.bracket };

    if (tournamentData.format === TOURNAMENT_FORMATS.ROUND_ROBIN) {
      for (const round in updatedBracket) {
        const matchIndex = updatedBracket[round].findIndex((m) => m.id === matchId);
        if (matchIndex !== -1) {
          const match = { ...updatedBracket[round][matchIndex], [key]: value };

          if ((key === "team1Score" || key === "team2Score") && tournamentData.pointsPerMatch) {
            if (match.team1Score >= tournamentData.pointsPerMatch) {
              match.winner = match.team1?.id ?? null;
            } else if (match.team2Score >= tournamentData.pointsPerMatch) {
              match.winner = match.team2?.id ?? null;
            } else {
              match.winner = null;
            }
          }

          updatedBracket[round][matchIndex] = match;
          break;
        }
      }
    } else if (tournamentData.format === TOURNAMENT_FORMATS.SINGLE_ELIM) {
      const advanceWinner = (
        rounds: Bracket,
        roundIndex: number,
        matchIndex: number,
        winnerId: string | null
      ) => {
        const nextRoundMatches = rounds[roundIndex + 1];
        if (!nextRoundMatches) return;

        const parentIdx = Math.floor(matchIndex / 2);
        const parentMatch = nextRoundMatches[parentIdx];
        if (!parentMatch) return;

        if (!winnerId) {
          // Clear parent match info if no winner
          parentMatch.team1Score = 0;
          parentMatch.team2Score = 0;
          parentMatch.winner = null;
          if (matchIndex % 2 === 0) {
            parentMatch.team1 = null;
          } else {
            parentMatch.team2 = null;
          }
          return;
        }

        const currentMatch = rounds[roundIndex][matchIndex];
        let winningTeamDetails = null;

        if (currentMatch.team1?.id === winnerId) {
          winningTeamDetails = { ...currentMatch.team1 };
        } else if (currentMatch.team2?.id === winnerId) {
          winningTeamDetails = { ...currentMatch.team2 };
        }

        if (!winningTeamDetails) {
          winningTeamDetails = {
            id: winnerId,
            name: "",
            players: [],
            wins: 0,
            losses: 0,
          };
        }

        if (matchIndex % 2 === 0) {
          parentMatch.team1 = winningTeamDetails as TeamType;
        } else {
          parentMatch.team2 = winningTeamDetails as TeamType;
        }
      };

      for (const roundKey in updatedBracket) {
        const roundIdx = Number(roundKey);
        const matches = updatedBracket[roundKey];
        const idx = matches.findIndex((m) => m.id === matchId);
        if (idx !== -1) {
          const match = matches[idx];

          match[key] = value as never;

          if ((key === "team1Score" || key === "team2Score") && tournamentData.pointsPerMatch) {
            const threshold = tournamentData.pointsPerMatch;
            const s1 = match.team1Score ?? -Infinity;
            const s2 = match.team2Score ?? -Infinity;

            if (s1 >= threshold && s1 > s2) {
              match.winner = match.team1?.id ?? null;
            } else if (s2 >= threshold && s2 > s1) {
              match.winner = match.team2?.id ?? null;
            } else {
              match.winner = null;
            }
          }

          advanceWinner(updatedBracket, roundIdx, idx, match.winner);

          break;
        }
      }
    }

    await patchTournament(tournamentData.id, "bracket", JSON.stringify(updatedBracket));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
