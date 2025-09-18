import { patchTournament, updatePlayer } from "@/services/databaseService";
import {
  Bracket,
  DoubleEliminationBracket,
  MATCH_STATUS,
  MatchType,
  TeamType,
  TOURNAMENT_FORMATS,
  TournamentType,
} from "@/types.ts/common";
import { generateUUID } from "@/utils/helper";

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
            const threshold = tournamentData.pointsPerMatch;
            match.team1Score = Math.min(match.team1Score, threshold);
            match.team2Score = Math.min(match.team2Score, threshold);
            const s1 = match.team1Score ?? -Infinity;
            const s2 = match.team2Score ?? -Infinity;

            const prevWinner = match.winner;
            let newWinner: string | null = null;

            if (s1 >= threshold && s1 > s2) {
              newWinner = match.team1?.id ?? null;
            } else if (s2 >= threshold && s2 > s1) {
              newWinner = match.team2?.id ?? null;
            }

            if (prevWinner && prevWinner !== newWinner) {
              const prevTeam = match.team1?.id === prevWinner ? match.team1 : match.team2;

              if (prevTeam) {
                prevTeam.wins = Math.max(0, prevTeam.wins - 1);
                for (let i = 0; i < prevTeam.players.length; i++) {
                  const p = prevTeam.players[i];
                  p.wins = Math.max(0, p.wins - 1);
                  await updatePlayer(p.id, "wins", p.wins);
                }
              }

              const prevLoser = match.team1?.id !== prevWinner ? match.team1 : match.team2;
              if (prevLoser) {
                prevLoser.losses = Math.max(0, prevLoser.losses - 1);
                for (let i = 0; i < prevLoser.players.length; i++) {
                  const p = prevLoser.players[i];
                  p.losses = Math.max(0, p.losses - 1);
                  await updatePlayer(p.id, "losses", p.losses);
                }
              }
            }

            match.winner = newWinner;

            if (newWinner) {
              const winTeam = match.team1?.id === newWinner ? match.team1 : match.team2;
              const loseTeam = match.team1?.id !== newWinner ? match.team1 : match.team2;

              if (winTeam) {
                winTeam.wins += 1;
                for (let i = 0; i < winTeam.players.length; i++) {
                  const p = winTeam.players[i];
                  p.wins += 1;
                  await updatePlayer(p.id, "wins", p.wins);
                }
              }

              if (loseTeam) {
                loseTeam.losses += 1;
                for (let i = 0; i < loseTeam.players.length; i++) {
                  const p = loseTeam.players[i];
                  p.losses += 1;
                  await updatePlayer(p.id, "losses", p.losses);
                }
              }
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
          if (matchIndex % 2 === 0) {
            parentMatch.team1 = null;
          } else {
            parentMatch.team2 = null;
          }
          parentMatch.team1Score = 0;
          parentMatch.team2Score = 0;
          parentMatch.winner = null;

          advanceWinner(rounds, roundIndex + 1, parentIdx, null);
          return;
        }

        const currentMatch = rounds[roundIndex][matchIndex];
        let winningTeamDetails: TeamType | null = null;

        if (currentMatch.team1?.id === winnerId) {
          winningTeamDetails = { ...currentMatch.team1 };
        } else if (currentMatch.team2?.id === winnerId) {
          winningTeamDetails = { ...currentMatch.team2 };
        } else {
          winningTeamDetails = {
            id: winnerId,
            name: "",
            players: [],
            wins: 0,
            losses: 0,
          };
        }

        if (matchIndex % 2 === 0) {
          parentMatch.team1 = winningTeamDetails;
        } else {
          parentMatch.team2 = winningTeamDetails;
        }

        parentMatch.team1Score = 0;
        parentMatch.team2Score = 0;
        parentMatch.winner = null;

        if (parentMatch.winner) advanceWinner(rounds, roundIndex + 1, parentIdx, winnerId);
      };

      for (const roundKey in updatedBracket) {
        const roundIdx = Number(roundKey);
        const matches = updatedBracket[roundKey];
        const idx = matches.findIndex((m) => m.id === matchId);

        if (idx !== -1) {
          const match = matches[idx];
          // match[key] = value as never;

          if ((key === "team1Score" || key === "team2Score") && tournamentData.pointsPerMatch) {
            const threshold = tournamentData.pointsPerMatch;
            const s1 = match.team1Score ?? -Infinity;
            const s2 = match.team2Score ?? -Infinity;
            const prevWinner = match.winner;
            let newWinner: string | null = null;
            if (s1 >= threshold && s1 > s2) {
              newWinner = match.team1?.id ?? null;
            } else if (s2 >= threshold && s2 > s1) {
              newWinner = match.team2?.id ?? null;
            }
            if (prevWinner && prevWinner !== newWinner) {
              const prevTeam = match.team1?.id === prevWinner ? match.team1 : match.team2;
              if (prevTeam) {
                prevTeam.wins = Math.max(0, prevTeam.wins - 1);
                for (let i = 0; i < prevTeam.players.length; i++) {
                  const p = prevTeam.players[i];
                  p.wins = Math.max(0, p.wins - 1);
                  await updatePlayer(p.id, "wins", p.wins);
                }
              }
              const prevLoser = match.team1?.id !== prevWinner ? match.team1 : match.team2;
              if (prevLoser) {
                prevLoser.losses = Math.max(0, prevLoser.losses - 1);
                for (let i = 0; i < prevLoser.players.length; i++) {
                  const p = prevLoser.players[i];
                  p.losses = Math.max(0, p.losses - 1);
                  await updatePlayer(p.id, "losses", p.losses);
                }
              }
            }

            match.winner = newWinner;

            if (newWinner) {
              const winTeam = match.team1?.id === newWinner ? match.team1 : match.team2;
              const loseTeam = match.team1?.id !== newWinner ? match.team1 : match.team2;
              if (winTeam) {
                winTeam.wins += 1;
                for (let i = 0; i < winTeam.players.length; i++) {
                  const p = winTeam.players[i];
                  p.wins += 1;
                  await updatePlayer(p.id, "wins", p.wins);
                }
              }
              if (loseTeam) {
                loseTeam.losses += 1;
                for (let i = 0; i < loseTeam.players.length; i++) {
                  const p = loseTeam.players[i];
                  p.losses += 1;
                  await updatePlayer(p.id, "losses", p.losses);
                }
              }
            }
          } else if (key === "winner") {
            const prevWinner = match.winner;
            const newWinner = value as string | null;
            if (prevWinner && prevWinner !== newWinner) {
              const prevTeam = match.team1?.id === prevWinner ? match.team1 : match.team2;
              if (prevTeam) {
                prevTeam.wins = Math.max(0, prevTeam.wins - 1);
                for (let i = 0; i < prevTeam.players.length; i++) {
                  const p = prevTeam.players[i];
                  p.wins = Math.max(0, p.wins - 1);
                  await updatePlayer(p.id, "wins", p.wins);
                }
              }
              const prevLoser = match.team1?.id !== prevWinner ? match.team1 : match.team2;
              if (prevLoser) {
                prevLoser.losses = Math.max(0, prevLoser.losses - 1);
                for (let i = 0; i < prevLoser.players.length; i++) {
                  const p = prevLoser.players[i];
                  p.losses = Math.max(0, p.losses - 1);
                  await updatePlayer(p.id, "losses", p.losses);
                }
              }
            } else if (prevWinner && prevWinner === newWinner) {
              const nextRoundMatches = updatedBracket[roundIdx + 1];
              const parentIdx = Math.floor(idx / 2);
              const parentMatch = nextRoundMatches ? nextRoundMatches[parentIdx] : null;

              if (parentMatch?.winner) {
                return false;
              }
              match.winner = null;
              const winTeam = match.team1?.id === prevWinner ? match.team1 : match.team2;
              const loseTeam = match.team1?.id !== prevWinner ? match.team1 : match.team2;
              if (winTeam) {
                winTeam.wins = Math.max(0, winTeam.wins - 1);
                for (let i = 0; i < winTeam.players.length; i++) {
                  const p = winTeam.players[i];
                  p.wins = Math.max(0, p.wins - 1);
                  await updatePlayer(p.id, "wins", p.wins);
                }
              }
              if (loseTeam) {
                loseTeam.losses = Math.max(0, loseTeam.losses - 1);
                for (let i = 0; i < loseTeam.players.length; i++) {
                  const p = loseTeam.players[i];
                  p.losses = Math.max(0, p.losses - 1);
                  await updatePlayer(p.id, "losses", p.losses);
                }
              }
              advanceWinner(updatedBracket, roundIdx, idx, null);
            } else {
              match.winner = newWinner;
              if (newWinner) {
                const winTeam = match.team1?.id === newWinner ? match.team1 : match.team2;
                const loseTeam = match.team1?.id !== newWinner ? match.team1 : match.team2;
                if (winTeam) {
                  winTeam.wins += 1;
                  for (let i = 0; i < winTeam.players.length; i++) {
                    const p = winTeam.players[i];
                    p.wins += 1;
                    await updatePlayer(p.id, "wins", p.wins);
                  }
                }
                if (loseTeam) {
                  loseTeam.losses += 1;
                  for (let i = 0; i < loseTeam.players.length; i++) {
                    const p = loseTeam.players[i];
                    p.losses += 1;
                    await updatePlayer(p.id, "losses", p.losses);
                  }
                }
              }
            }
          }
          advanceWinner(updatedBracket, roundIdx, idx, match.winner);
        }
      }
    } else if (tournamentData.format === TOURNAMENT_FORMATS.SWISS) {
      const MAX_ROUNDS = Math.ceil(Math.log2(tournamentData.teams?.length || 2));

      for (const roundKey in updatedBracket) {
        const matches = updatedBracket[roundKey];
        const idx = matches.findIndex((m) => m.id === matchId);

        if (idx !== -1) {
          const match = matches[idx];
          match[key] = value as never;
          const threshold = tournamentData.pointsPerMatch ?? 21;

          const s1 = match.team1Score ?? 0;
          const s2 = match.team2Score ?? 0;

          const prevWinner = match.winner;
          let newWinner: string | null = null;

          if (s1 >= threshold && s1 > s2) {
            newWinner = match.team1?.id ?? null;
          } else if (s2 >= threshold && s2 > s1) {
            newWinner = match.team2?.id ?? null;
          }

          if (prevWinner && prevWinner !== newWinner) {
            const prevTeam = match.team1?.id === prevWinner ? match.team1 : match.team2;
            const prevLoser = match.team1?.id !== prevWinner ? match.team1 : match.team2;

            if (prevTeam) prevTeam.wins = Math.max(0, prevTeam.wins - 1);
            if (prevLoser) prevLoser.losses = Math.max(0, prevLoser.losses - 1);
          }

          match.winner = newWinner;
          if (newWinner) {
            const winTeam = match.team1?.id === newWinner ? match.team1 : match.team2;
            const loseTeam = match.team1?.id !== newWinner ? match.team1 : match.team2;

            if (winTeam) winTeam.wins += 1;
            if (loseTeam) loseTeam.losses += 1;
          }

          updatedBracket[roundKey][idx] = match;

          const allMatchesDone = matches.every((m) => m.winner !== null);
          if (allMatchesDone) {
            const roundIndex = parseInt(roundKey, 10);
            const nextRoundIndex = roundIndex + 1;

            if (roundIndex >= MAX_ROUNDS) {
              console.log("Swiss tournament completed.");
              break;
            }

            if (!updatedBracket[nextRoundIndex]) {
              const swissTeams = Object.values(updatedBracket)
                .flat()
                .reduce<Map<string, TeamType>>((map, m) => {
                  if (m.team1) map.set(m.team1.id, m.team1);
                  if (m.team2) map.set(m.team2.id, m.team2);
                  return map;
                }, new Map());

              const teams = [...swissTeams.values()];

              const playedPairs = new Set(
                Object.values(updatedBracket)
                  .flat()
                  .map((m) => [m.team1?.id, m.team2?.id].filter(Boolean).sort().join("-"))
              );
              const maxPossiblePairs = (teams.length * (teams.length - 1)) / 2;

              if (playedPairs.size >= maxPossiblePairs) {
                console.log("No more unique pairings possible.");
                break;
              }

              const ranked = [...teams].sort((a, b) => b.wins - a.wins);

              const newMatches: MatchType[] = [];
              for (let i = 0; i < ranked.length; i += 2) {
                const team1 = ranked[i];
                const team2 = ranked[i + 1] || null;

                if (!team2) {
                  newMatches.push({
                    id: generateUUID(),
                    tournamentId: tournamentData.id,
                    position: i + 1,
                    team1,
                    team2: null,
                    team1Score: 0,
                    team2Score: 0,
                    winner: team1.id,
                    status: MATCH_STATUS.COMPLETED,
                  });
                  team1.wins += 1;
                  continue;
                }

                newMatches.push({
                  id: generateUUID(),
                  tournamentId: tournamentData.id,
                  position: i + 1,
                  team1,
                  team2,
                  team1Score: 0,
                  team2Score: 0,
                  winner: null,
                  status: MATCH_STATUS.PENDING,
                });
              }

              updatedBracket[nextRoundIndex] = newMatches;
            }
          }

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

export const updateDoubleElimMatch = async (
  updatedBracket: DoubleEliminationBracket,
  matchId: string,
  key: string,
  value: any,
  tournamentData: TournamentType
) => {
  const advanceWinner = (
    rounds: DoubleEliminationBracket,
    bracketType: "winners" | "losers",
    roundIndex: number,
    matchIndex: number,
    winnerId: string | null,
    loserId: string | null
  ) => {
    const nextRoundMatches = rounds[bracketType][roundIndex + 1];
    if (!nextRoundMatches) return;

    const parentIdx = Math.floor(matchIndex / 2);
    const parentMatch = nextRoundMatches[parentIdx];
    if (!parentMatch) return;

    if (winnerId) {
      const currentMatch = rounds[bracketType][roundIndex][matchIndex];
      let winningTeamDetails: TeamType | null = null;

      if (currentMatch.team1?.id === winnerId) {
        winningTeamDetails = { ...currentMatch.team1 };
      } else if (currentMatch.team2?.id === winnerId) {
        winningTeamDetails = { ...currentMatch.team2 };
      }

      if (matchIndex % 2 === 0) {
        parentMatch.team1 = winningTeamDetails;
      } else {
        parentMatch.team2 = winningTeamDetails;
      }

      parentMatch.team1Score = 0;
      parentMatch.team2Score = 0;
      parentMatch.winner = null;
    }

    if (bracketType === "winners" && loserId) {
      const loserRound = rounds["losers"][roundIndex];
      if (loserRound) {
        const loserMatchIdx = Math.floor(matchIndex / 2);
        const loserMatch = loserRound[loserMatchIdx];
        if (loserMatch) {
          if (matchIndex % 2 === 0) {
            loserMatch.team1 = {
              id: loserId,
              name: "",
              players: [],
              wins: 0,
              losses: 0,
            };
          } else {
            loserMatch.team2 = {
              id: loserId,
              name: "",
              players: [],
              wins: 0,
              losses: 0,
            };
          }
        }
      }
    }

    if (parentMatch?.winner) {
      advanceWinner(rounds, bracketType, roundIndex + 1, parentIdx, parentMatch.winner, null);
    }
  };

  for (const bracketKey of ["winners", "losers"] as const) {
    for (const roundKey in updatedBracket[bracketKey]) {
      const roundIdx = Number(roundKey);
      const matches = updatedBracket[bracketKey][roundKey];
      const idx = matches.findIndex((m) => m.id === matchId);

      if (idx !== -1) {
        const match = matches[idx];
        const prevWinner = match.winner;
        let newWinner: string | null = null;

        if ((key === "team1Score" || key === "team2Score") && tournamentData.pointsPerMatch) {
          const threshold = tournamentData.pointsPerMatch;
          const s1 = match.team1Score ?? -Infinity;
          const s2 = match.team2Score ?? -Infinity;

          if (s1 >= threshold && s1 > s2) newWinner = match.team1?.id ?? null;
          else if (s2 >= threshold && s2 > s1) newWinner = match.team2?.id ?? null;
        } else if (key === "winner") {
          newWinner = value as string | null;
        }

        if (prevWinner && prevWinner !== newWinner) {
          const prevTeam = match.team1?.id === prevWinner ? match.team1 : match.team2;
          if (prevTeam) {
            prevTeam.wins = Math.max(0, prevTeam.wins - 1);
            for (const p of prevTeam.players) {
              p.wins = Math.max(0, p.wins - 1);
              await updatePlayer(p.id, "wins", p.wins);
            }
          }
          const prevLoser = match.team1?.id !== prevWinner ? match.team1 : match.team2;
          if (prevLoser) {
            prevLoser.losses = Math.max(0, prevLoser.losses - 1);
            for (const p of prevLoser.players) {
              p.losses = Math.max(0, p.losses - 1);
              await updatePlayer(p.id, "losses", p.losses);
            }
          }
        }

        match.winner = newWinner;

        if (newWinner) {
          const winTeam = match.team1?.id === newWinner ? match.team1 : match.team2;
          const loseTeam = match.team1?.id !== newWinner ? match.team1 : match.team2;

          if (winTeam) {
            winTeam.wins += 1;
            for (const p of winTeam.players) {
              p.wins += 1;
              await updatePlayer(p.id, "wins", p.wins);
            }
          }
          if (loseTeam) {
            loseTeam.losses += 1;
            for (const p of loseTeam.players) {
              p.losses += 1;
              await updatePlayer(p.id, "losses", p.losses);
            }
          }

          advanceWinner(updatedBracket, bracketKey, roundIdx, idx, newWinner, loseTeam?.id ?? null);
        }

        return true;
      }
    }
  }

  return false;
};
