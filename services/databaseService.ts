// import { PlayerType, TournamentType } from "@/types.ts/common";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const getTournaments = async () => {
//   try {
//     const data = await AsyncStorage.getItem("tournaments");
//     const tournaments: TournamentType[] = data ? JSON.parse(data) : [];
//     console.log(tournaments);
//     return tournaments;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getTournamentById = async (id: string) => {
//   try {
//     const data = await AsyncStorage.getItem("tournaments");
//     const tournaments: TournamentType[] = data ? JSON.parse(data) : [];
//     const tournament = tournaments.find((t) => t.id === id);
//     if (!tournament) {
//       throw new Error("Tournament not found");
//     }
//     return tournament;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const updateTournament = async (id: string, tournamentData: TournamentType) => {
//   try {
//     const data = await AsyncStorage.getItem("tournaments");
//     const tournaments: TournamentType[] = data ? JSON.parse(data) : [];
//     const updatedTournaments = tournaments.map((t) => (t.id === id ? tournamentData : t));
//     await AsyncStorage.setItem("tournaments", JSON.stringify(updatedTournaments));
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const deleteTournament = async (id: string) => {
//   try {
//     const data = await AsyncStorage.getItem("tournaments");
//     const tournaments: TournamentType[] = data ? JSON.parse(data) : [];
//     const newTournaments = tournaments.filter((t) => t.id !== id);
//     await AsyncStorage.setItem("tournaments", JSON.stringify(newTournaments));
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getPlayers = async () => {
//   try {
//     const data = await AsyncStorage.getItem("players");
//     const players = data ? JSON.parse(data) : [];
//     return players;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getPlayerById = async (id: string) => {
//   try {
//     const data = await AsyncStorage.getItem("players");
//     const players: PlayerType[] = data ? JSON.parse(data) : [];
//     const player = players.find((p) => p.id === id);
//     if (!player) {
//       throw new Error("Player not found");
//     }
//     return player;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const createPlayer = async (id: string, playerData: PlayerType) => {
//   try {
//     const data = await AsyncStorage.getItem("players");
//     const players: PlayerType[] = data ? JSON.parse(data) : [];
//     players.push(playerData);
//     await AsyncStorage.setItem("players", JSON.stringify(players));
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const updatePlayer = async (id: string, playerData: PlayerType) => {
//   try {
//     const data = await AsyncStorage.getItem("players");
//     const players: PlayerType[] = data ? JSON.parse(data) : [];
//     const updatedPlayers = players.map((p) => (p.id === id ? playerData : p));
//     await AsyncStorage.setItem("players", JSON.stringify(updatedPlayers));
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const deletePlayer = async (id: string) => {
//   try {
//     const data = await AsyncStorage.getItem("players");
//     const players: PlayerType[] = data ? JSON.parse(data) : [];
//     const newPlayers = players.filter((p) => p.id !== id);
//     await AsyncStorage.setItem("players", JSON.stringify(newPlayers));
//   } catch (error) {
//     console.error(error);
//   }
// };

import { MatchType, PlayerType, TeamType, TournamentType } from "@/types.ts/common";
import * as SQLite from "expo-sqlite";

const db = await SQLite.openDatabaseAsync("smashScore");

export const initDB = async () => {
  const DATABASE_VERSION = 1;
  const dbVersionResult = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let currentDbVersion = dbVersionResult ? dbVersionResult.user_version : 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        format TEXT NOT NULL,
        matchFormat TEXT,
        status TEXT NOT NULL,
        currentRound INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        completedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        tournamentId TEXT NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        players TEXT NOT NULL,
        createdAt TEXT NOT NULL,    
        FOREIGN KEY (tournamentId) REFERENCES tournaments(id) ON DELETE NO ACTION
    );
    CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY NOT NULL,
        tournamentId TEXT NOT NULL,
        team1 TEXT,
        team2 TEXT,
        team1Score INTEGER DEFAULT 0,
        team2Score INTEGER DEFAULT 0,
        winner TEXT,
        status TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (tournamentId) REFERENCES tournaments(id) ON DELETE NO ACTION
    );
    CREATE INDEX IF NOT EXISTS idx_matches_tournamentId ON matches (tournamentId);
    CREATE INDEX IF NOT EXISTS idx_teams_tournamentId ON teams (tournamentId);
    PRAGMA user_version = ${DATABASE_VERSION};`);
    currentDbVersion = 1;
  }
};

export const getPlayers = async () => {
  try {
    const data = await db.getAllAsync("SELECT * FROM players;");
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getPlayerById = async (id: string) => {
  try {
    const player = await db.getFirstAsync("SELECT * FROM players WHERE id = ?;", [id]);
    if (!player) {
      throw new Error("Player not found");
    } else {
      return player;
    }
  } catch (err) {
    console.error(err);
  }
};

export const createPlayer = async (playerData: PlayerType) => {
  try {
    const { id, name, wins, losses, createdAt } = playerData;
    return await db.runAsync(
      `INSERT INTO players (id, name, wins, losses, createdAt) VALUES (?, ?, ?, ?, ?);`,
      [id, name, wins, losses, createdAt]
    );
  } catch (err) {
    console.error(err);
  }
};

export const updatePlayer = async (id: string, key: string, value: string | number) => {
  try {
    return await db.runAsync(`UPDATE players SET ${key} = ? WHERE id = ?;`, [value, id]);
  } catch (err) {
    console.error(err);
  }
};

export const deletePlayer = async (id: string) => {
  try {
    return await db.runAsync(`DELETE FROM players WHERE id = ?;`, [id]);
  } catch (err) {
    console.error(err);
  }
};

export const getTeams = async () => {
  try {
    const data = await db.getAllAsync("SELECT * FROM teams;");
    const formattedData = data.map((team: { players: string }) => {
      if (team && team.players) {
        return {
          ...team,
          players: JSON.parse(team.players),
        };
      }
    });
    return formattedData;
  } catch (err) {
    console.error(err);
  }
};

export const getTeamById = async (id: string) => {
  try {
    const team: Partial<TeamType> | null = await db.getFirstAsync(
      "SELECT * FROM teams WHERE id = ?;",
      [id]
    );
    if (!team) {
      throw new Error("Team not found");
    } else {
      if (team && team.players) {
        const updatedTeam = {
          ...team,
          players: JSON.parse(team.players) || [],
        };
        return updatedTeam;
      }
      return {};
    }
  } catch (err) {
    console.error(err);
  }
};

export const createTeam = async (teamData: TeamType) => {
  try {
    const { id, name, tournamentId, wins, losses, players, createdAt } = teamData;
    return await db.runAsync(
      `INSERT INTO teams (id, name, tournamentId, wins, losses, players, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, name, tournamentId, wins, losses, JSON.stringify(players), createdAt]
    );
  } catch (err) {
    console.error(err);
  }
};

export const updateTeam = async (id: string, key: string, value: string | number) => {
  try {
    return await db.runAsync(`UPDATE teams SET ${key} = ? WHERE id = ?;`, [value, id]);
  } catch (err) {
    console.error(err);
  }
};

export const deleteTeam = async (id: string) => {
  try {
    return await db.runAsync(`DELETE FROM teams WHERE id = ?;`, [id]);
  } catch (err) {
    console.error(err);
  }
};

export const getMatches = async () => {
  try {
    const data = await db.getAllAsync("SELECT * FROM matches;");
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getMatchById = async (id: string) => {
  try {
    const match = await db.getFirstAsync("SELECT * FROM matches WHERE id = ?;", [id]);
    if (!match) {
      throw new Error("Match not found");
    } else {
      return match;
    }
  } catch (err) {
    console.error(err);
  }
};

export const createMatch = async (matchData: MatchType) => {
  try {
    const { id, tournamentId, team1, team2, team1Score, team2Score, winner, status } = matchData;
    return await db.runAsync(
      `INSERT INTO matches (id, tournamentId, team1, team2, team1Score, team2Score, winner, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [id, tournamentId, team1, team2, team1Score, team2Score, winner, status]
    );
  } catch (err) {
    console.error(err);
  }
};

export const createMatches = async (matchData: MatchType[]) => {
  try {
    const keys: string[] = [];
    const values: SQLite.SQLiteBindParams = [];
    matchData.forEach((match) => {
      keys.push("(?, ?, ?, ?, ?, ?, ?, ?)");
      values.push(
        match.id,
        match.tournamentId,
        match.team1,
        match.team2,
        match.team1Score,
        match.team2Score,
        match.winner,
        match.status
      );
    });
    return await db.runAsync(
      `INSERT INTO matches (id, tournamentId, team1, team2, team1Score, team2Score, winner, status) VALUES ${keys.join(", ")};`,
      values
    );
  } catch (err) {
    console.error(err);
  }
};

export const updateMatch = async (id: string, key: string, value: string | number) => {
  try {
    return await db.runAsync(`UPDATE matches SET ${key} = ? WHERE id = ?;`, [value, id]);
  } catch (err) {
    console.error(err);
  }
};

export const deleteMatch = async (id: string) => {
  try {
    return await db.runAsync(`DELETE FROM matches WHERE id = ?;`, [id]);
  } catch (err) {
    console.error(err);
  }
};

export const getTournaments = async () => {
  try {
    const data = await db.getAllAsync("SELECT * FROM tournaments;");
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getTournamentById = async (id: string) => {
  try {
    const tournament = await db.getFirstAsync("SELECT * FROM tournaments WHERE id = ?;", [id]);
    if (!tournament) {
      throw new Error("Tournament not found");
    } else {
      return tournament;
    }
  } catch (err) {
    console.error(err);
  }
};

export const createTournament = async (tournamentData: TournamentType) => {
  try {
    const { id, name, format, matchFormat, status, currentRound, createdAt, completedAt } =
      tournamentData;
    return await db.runAsync(
      `INSERT INTO matches (id, name, format, matchFormat, status, currentRound, createdAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [id, name, format, matchFormat || "", status, currentRound, createdAt, completedAt]
    );
  } catch (err) {
    console.error(err);
  }
};

export const updateTournament = async (id: string, key: string, value: string | number) => {
  try {
    return await db.runAsync(`UPDATE tournaments SET ${key} = ? WHERE id = ?;`, [value, id]);
  } catch (err) {
    console.error(err);
  }
};

export const deleteTournament = async (id: string) => {
  try {
    return await db.runAsync(`DELETE FROM tournaments WHERE id = ?;`, [id]);
  } catch (err) {
    console.error(err);
  }
};
