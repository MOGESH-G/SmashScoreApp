import { patchTournament } from "@/services/databaseService";
import { MatchType, TOURNAMENT_FORMATS, TournamentType } from "@/types.ts/common";

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
    }

    await patchTournament(tournamentData.id, "bracket", JSON.stringify(updatedBracket));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
