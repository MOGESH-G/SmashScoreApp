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

let db: SQLite.SQLiteDatabase | null = null;

export const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("smashScore");
    console.log("Database opened!");
  }
  const DATABASE_VERSION = 1;
  const dbVersionResult = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let currentDbVersion = dbVersionResult ? dbVersionResult.user_version : 0;
  if (currentDbVersion >= DATABASE_VERSION) return;

  if (currentDbVersion === 0) {
    console.log("DB initialized");
    await db.execAsync(`
          PRAGMA foreign_keys = ON;
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
            sets INTEGER DEFAULT 0,
            teams TEXT DEFAULT NULL,
            bracket TEXT NOT NULL,
            status TEXT NOT NULL,
            pointsPerMatch INTEGER NOT NULL,
            tieBreakerPoints INTEGER DEFAULT 0,
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

          PRAGMA user_version = ${DATABASE_VERSION};
          `);
  }
};

const getDB = (): SQLite.SQLiteDatabase => {
  if (!db) db = SQLite.openDatabaseSync("mydb.db");
  return db;
};

export const resetDB = async () => {
  const db = getDB();
  await db.runAsync("DROP TABLE IF EXISTS players;");
  await db.runAsync("DROP TABLE IF EXISTS teams;");
  await db.runAsync("DROP TABLE IF EXISTS tournaments;");
  await db.runAsync("DROP TABLE IF EXISTS matches;");
  await db.runAsync("PRAGMA user_version = 0;");
  console.log("db cleared");
};

const queryAll = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  const database = await getDB();
  try {
    const results = await database.getAllAsync(sql, params);
    return results as T[];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const queryOne = async <T>(sql: string, params: any[] = []): Promise<T | null> => {
  const database = getDB();
  try {
    const result = await database.getFirstAsync(sql, params);
    return result ? (result as T) : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const runQuery = async (sql: string, params: any[] = []) => {
  const database = getDB();
  try {
    return await database.runAsync(sql, params);
  } catch (err) {
    console.error(err);
  }
};

/** PLAYER OPERATIONS **/
export const getPlayers = async () => queryAll<PlayerType>("SELECT * FROM players;");
export const getPlayerById = async (id: string) =>
  queryOne<PlayerType>("SELECT * FROM players WHERE id = ?;", [id]);
export const createPlayer = async (p: PlayerType) =>
  runQuery(`INSERT INTO players (id, name, wins, losses, createdAt) VALUES (?, ?, ?, ?, ?);`, [
    p.id,
    p.name,
    p.wins,
    p.losses,
    p.createdAt,
  ]);
export const updatePlayer = async (id: string, key: string, value: string | number) =>
  runQuery(`UPDATE players SET ${key} = ? WHERE id = ?;`, [value, id]);
export const deletePlayer = async (id: string) =>
  runQuery(`DELETE FROM players WHERE id = ?;`, [id]);

/** TEAM OPERATIONS **/
export const getTeams = async () => {
  const data = await queryAll<TeamType>("SELECT * FROM teams;");
  return data.map((t) => ({ ...t, players: JSON.parse(t.players as any) || [] }));
};
export const getTeamById = async (id: string) => {
  const team = await queryOne<TeamType>("SELECT * FROM teams WHERE id = ?;", [id]);
  if (team && team.players) team.players = JSON.parse(team.players as any) || [];
  return team;
};
export const createTeam = async (team: TeamType) =>
  runQuery(
    `INSERT INTO teams (id, name, tournamentId, wins, losses, players, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      team.id,
      team.name,
      team.tournamentId,
      team.wins,
      team.losses,
      JSON.stringify(team.players),
      team.createdAt,
    ]
  );
export const updateTeam = async (id: string, key: string, value: string | number) =>
  runQuery(`UPDATE teams SET ${key} = ? WHERE id = ?;`, [value, id]);
export const deleteTeam = async (id: string) => runQuery(`DELETE FROM teams WHERE id = ?;`, [id]);

/** MATCH OPERATIONS **/
export const getMatches = async () => queryAll<MatchType>("SELECT * FROM matches;");
export const getMatchById = async (id: string) =>
  queryOne<MatchType>("SELECT * FROM matches WHERE id = ?;", [id]);
export const createMatch = async (m: MatchType) =>
  runQuery(
    `INSERT INTO matches (id, tournamentId, team1, team2, team1Score, team2Score, winner, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [m.id, m.tournamentId, m.team1, m.team2, m.team1Score, m.team2Score, m.winner, m.status]
  );

/** TOURNAMENT OPERATIONS **/
export const getTournaments = async () => {
  const tournaments = await queryAll<TournamentType>("SELECT * FROM tournaments;");
  return tournaments.map((t) => ({
    ...t,
    teams: JSON.parse(t.teams as any) || [],
    bracket: JSON.parse(t.bracket as any) || [],
  }));
};
export const getTournamentById = async (id: string) => {
  const tournament = await queryOne<TournamentType>("SELECT * FROM tournaments WHERE id = ?;", [
    id,
  ]);
  if (tournament && tournament.bracket)
    tournament.bracket = JSON.parse(tournament.bracket as any) || [];
  if (tournament && tournament.teams) tournament.teams = JSON.parse(tournament.teams as any) || [];

  return tournament;
};
export const createTournament = async (t: TournamentType) =>
  runQuery(
    `INSERT INTO tournaments (id, name, format, sets, teams, bracket, status, pointsPerMatch, tieBreakerPoints, currentRound, createdAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      t.id,
      t.name,
      t.format,
      t.sets || 0,
      JSON.stringify(t.teams),
      JSON.stringify(t.bracket),
      t.status,
      t.pointsPerMatch,
      t.tieBreakerPoints || 0,
      t.currentRound,
      t.createdAt,
      t.completedAt,
    ]
  );
export const updateTournament = async (id: string, key: string, value: string | number) =>
  runQuery(`UPDATE tournaments SET ${key} = ? WHERE id = ?;`, [value, id]);
export const deleteTournament = async (id: string) =>
  runQuery(`DELETE FROM tournaments WHERE id = ?;`, [id]);
