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

import { PlayerType } from "@/types.ts/common";
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
    const data = db.getAllAsync("SELECT * FROM players;");
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const createPlayer = async (playerData: PlayerType) => {
  try {
    const { id, name, wins, losses, createdAt } = playerData;
    return db.runAsync(
      `INSERT INTO players (id, name, wins, losses, createdAt) VALUES (?, ?, ?, ?, ?);`,
      [id, name, wins, losses, createdAt]
    );
  } catch (err) {
    console.error(err);
  }
};

// const createTeam = (teamData: TeamType)=>{
//     const { name, tournamentId, wins, losses, players, createdAt} = teamData;
//     return db.execAsync(
//         `INSERT INTO teams (id, name, tournamentId, wins, losses, players, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?);`,
//         [id, name, tournamentId, wins, losses, JSON.stringify(players), createdAt]
//     );
// }
