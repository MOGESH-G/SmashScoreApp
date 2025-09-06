# Complete React Native Smash Tournament App Development Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Setup and Installation](#setup-and-installation)
3. [App Architecture](#app-architecture)
4. [Core Components](#core-components)
5. [Local Storage Implementation](#local-storage-implementation)
6. [Tournament Logic](#tournament-logic)
7. [AdMob Integration](#admob-integration)
8. [UI/UX Design](#uiux-design)
9. [Testing and Deployment](#testing-and-deployment)
10. [Code Examples](#code-examples)

## Project Overview

**SmashScore Tournament Tracker** is a comprehensive React Native application designed for managing Super Smash Bros tournaments. The app features local storage using AsyncStorage, multiple tournament formats, and monetization through Google AdMob.

### Key Features

- Player management system with stats tracking
- Multiple tournament formats (Single Elimination, Double Elimination, Round Robin, Swiss)
- Match scoring with Best-of-3 and Best-of-5 support
- Tournament bracket visualization
- Local data persistence (no backend required)
- Ad integration for monetization
- Offline functionality

## Setup and Installation

### Prerequisites

```bash
npm install -g react-native-cli
npm install -g expo-cli
```

### Project Initialization

```bash
npx react-native init SmashTournamentApp
cd SmashTournamentApp

npm install @react-navigation/native @react-navigation/stack
npm install @react-native-async-storage/async-storage
npm install react-native-google-mobile-ads
npm install react-native-uuid
npm install react-native-vector-icons

# For iOS
cd ios && pod install
```

### Additional Setup

```bash
# Install navigation dependencies
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
```

## App Architecture

### Folder Structure

```
SmashTournamentApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Button, Input, Card components
│   │   ├── tournament/     # Tournament-specific components
│   │   └── player/        # Player management components
│   ├── screens/            # Main app screens
│   │   ├── Home.js
│   │   ├── PlayerManagement.js
│   │   ├── TournamentCreation.js
│   │   ├── TournamentBracket.js
│   │   ├── MatchDetail.js
│   │   └── TournamentHistory.js
│   ├── services/           # Business logic and data management
│   │   ├── StorageService.js
│   │   ├── TournamentService.js
│   │   └── PlayerService.js
│   ├── utils/              # Helper functions
│   │   ├── BracketGenerator.js
│   │   ├── MatchPairing.js
│   │   └── Constants.js
│   ├── context/            # React Context for state management
│   │   ├── AppContext.js
│   │   └── TournamentContext.js
│   └── assets/             # Images, icons, fonts
└── App.js
```

### Navigation Structure

```javascript
Home (Tab Navigator)
├── Dashboard
├── Tournaments
│   ├── Create Tournament
│   ├── Tournament Bracket
│   └── Match Detail
├── Players
│   ├── Player List
│   └── Add/Edit Player
└── History
```

## Core Components

### 1. Data Models

#### Player Model

```javascript
export const PlayerModel = {
  id: "", // UUID
  name: "", // Player name
  tag: "", // Gamer tag (optional)
  wins: 0, // Total wins
  losses: 0, // Total losses
  tournaments: [], // Tournament history
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

#### Tournament Model

```javascript
export const TournamentModel = {
  id: "", // UUID
  name: "", // Tournament name
  format: "single_elim", // single_elim, double_elim, round_robin, swiss
  matchFormat: "bo3", // bo3, bo5
  players: [], // Array of player IDs
  matches: [], // Array of match objects
  bracket: {}, // Bracket structure
  status: "setup", // setup, active, completed
  currentRound: 1,
  createdAt: new Date(),
  completedAt: null,
};
```

#### Match Model

```javascript
export const MatchModel = {
  id: "", // UUID
  tournamentId: "", // Parent tournament ID
  player1: "", // Player 1 ID
  player2: "", // Player 2 ID
  player1Score: 0, // Games won by player 1
  player2Score: 0, // Games won by player 2
  games: [], // Individual game results
  status: "pending", // pending, active, completed
  round: 1, // Tournament round
  bracket: "winners", // winners, losers (for double elim)
  position: "", // Position in bracket
};
```

### 2. Tournament Formats Implementation

#### Single Elimination

```javascript
export const generateSingleEliminationBracket = (players) => {
  const numPlayers = players.length;
  const rounds = Math.ceil(Math.log2(numPlayers));
  const bracket = {};

  // Create bracket structure
  for (let round = 1; round <= rounds; round++) {
    bracket[round] = [];
    const matchesInRound = Math.pow(2, rounds - round);

    for (let match = 0; match < matchesInRound; match++) {
      bracket[round].push({
        id: generateUUID(),
        player1: round === 1 ? players[match * 2] : null,
        player2: round === 1 ? players[match * 2 + 1] : null,
        winner: null,
      });
    }
  }

  return bracket;
};
```

#### Double Elimination

```javascript
export const generateDoubleEliminationBracket = (players) => {
  const winnersBracket = generateSingleEliminationBracket(players);
  const losersBracket = generateLosersBracket(players.length);

  return {
    winners: winnersBracket,
    losers: losersBracket,
    grandFinal: null,
  };
};
```

#### Round Robin

```javascript
export const generateRoundRobinMatches = (players) => {
  const matches = [];

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: generateUUID(),
        player1: players[i],
        player2: players[j],
        status: "pending",
      });
    }
  }

  return matches;
};
```

## Local Storage Implementation

### AsyncStorage Service

```javascript
// services/StorageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

class StorageService {
  // Players
  async savePlayers(players) {
    try {
      await AsyncStorage.setItem("players", JSON.stringify(players));
    } catch (error) {
      console.error("Error saving players:", error);
    }
  }

  async loadPlayers() {
    try {
      const players = await AsyncStorage.getItem("players");
      return players ? JSON.parse(players) : [];
    } catch (error) {
      console.error("Error loading players:", error);
      return [];
    }
  }

  // Tournaments
  async saveTournaments(tournaments) {
    try {
      await AsyncStorage.setItem("tournaments", JSON.stringify(tournaments));
    } catch (error) {
      console.error("Error saving tournaments:", error);
    }
  }

  async loadTournaments() {
    try {
      const tournaments = await AsyncStorage.getItem("tournaments");
      return tournaments ? JSON.parse(tournaments) : [];
    } catch (error) {
      console.error("Error loading tournaments:", error);
      return [];
    }
  }

  // Active Tournament
  async saveActiveTournament(tournament) {
    try {
      await AsyncStorage.setItem("activeTournament", JSON.stringify(tournament));
    } catch (error) {
      console.error("Error saving active tournament:", error);
    }
  }

  async loadActiveTournament() {
    try {
      const tournament = await AsyncStorage.getItem("activeTournament");
      return tournament ? JSON.parse(tournament) : null;
    } catch (error) {
      console.error("Error loading active tournament:", error);
      return null;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(["players", "tournaments", "activeTournament"]);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }
}

export default new StorageService();
```

### App Context Implementation

```javascript
// context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import StorageService from "../services/StorageService";

const AppContext = createContext();

const initialState = {
  players: [],
  tournaments: [],
  activeTournament: null,
  loading: false,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_PLAYERS":
      return { ...state, players: action.payload };
    case "ADD_PLAYER":
      return { ...state, players: [...state.players, action.payload] };
    case "UPDATE_PLAYER":
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case "DELETE_PLAYER":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
      };
    case "SET_TOURNAMENTS":
      return { ...state, tournaments: action.payload };
    case "ADD_TOURNAMENT":
      return { ...state, tournaments: [...state.tournaments, action.payload] };
    case "SET_ACTIVE_TOURNAMENT":
      return { ...state, activeTournament: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const [players, tournaments, activeTournament] = await Promise.all([
        StorageService.loadPlayers(),
        StorageService.loadTournaments(),
        StorageService.loadActiveTournament(),
      ]);

      dispatch({ type: "SET_PLAYERS", payload: players });
      dispatch({ type: "SET_TOURNAMENTS", payload: tournaments });
      dispatch({ type: "SET_ACTIVE_TOURNAMENT", payload: activeTournament });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Player management functions
  const addPlayer = async (player) => {
    dispatch({ type: "ADD_PLAYER", payload: player });
    const updatedPlayers = [...state.players, player];
    await StorageService.savePlayers(updatedPlayers);
  };

  const updatePlayer = async (player) => {
    dispatch({ type: "UPDATE_PLAYER", payload: player });
    const updatedPlayers = state.players.map((p) => (p.id === player.id ? player : p));
    await StorageService.savePlayers(updatedPlayers);
  };

  // Tournament management functions
  const createTournament = async (tournament) => {
    dispatch({ type: "ADD_TOURNAMENT", payload: tournament });
    dispatch({ type: "SET_ACTIVE_TOURNAMENT", payload: tournament });

    const updatedTournaments = [...state.tournaments, tournament];
    await StorageService.saveTournaments(updatedTournaments);
    await StorageService.saveActiveTournament(tournament);
  };

  const updateTournament = async (tournament) => {
    dispatch({ type: "SET_ACTIVE_TOURNAMENT", payload: tournament });
    await StorageService.saveActiveTournament(tournament);
  };

  const value = {
    ...state,
    addPlayer,
    updatePlayer,
    createTournament,
    updateTournament,
    loadData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
```

## Tournament Logic

### Bracket Generation Utilities

```javascript
// utils/BracketGenerator.js
import { generateUUID } from "./helpers";

export class BracketGenerator {
  static generateSingleElimination(players) {
    // Shuffle players for fair seeding
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

    // Calculate number of rounds needed
    const rounds = Math.ceil(Math.log2(shuffledPlayers.length));
    const totalSlots = Math.pow(2, rounds);

    // Fill empty slots with byes
    while (shuffledPlayers.length < totalSlots) {
      shuffledPlayers.push(null); // Bye
    }

    const bracket = {};

    // Generate first round matches
    bracket[1] = [];
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      bracket[1].push({
        id: generateUUID(),
        player1: shuffledPlayers[i],
        player2: shuffledPlayers[i + 1],
        winner: shuffledPlayers[i + 1] === null ? shuffledPlayers[i] : null,
        round: 1,
        status: shuffledPlayers[i + 1] === null ? "completed" : "pending",
      });
    }

    // Generate subsequent rounds
    for (let round = 2; round <= rounds; round++) {
      bracket[round] = [];
      const prevRoundMatches = bracket[round - 1];

      for (let i = 0; i < prevRoundMatches.length; i += 2) {
        bracket[round].push({
          id: generateUUID(),
          player1: null,
          player2: null,
          winner: null,
          round: round,
          status: "pending",
          prevMatch1: prevRoundMatches[i].id,
          prevMatch2: prevRoundMatches[i + 1] ? prevRoundMatches[i + 1].id : null,
        });
      }
    }

    return bracket;
  }

  static generateDoubleElimination(players) {
    const winnersBracket = this.generateSingleElimination(players);
    const losersBracket = this.generateLosersBracket(players.length);

    return {
      winners: winnersBracket,
      losers: losersBracket,
    };
  }

  static generateRoundRobin(players) {
    const matches = [];
    let matchNumber = 1;

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          id: generateUUID(),
          matchNumber: matchNumber++,
          player1: players[i],
          player2: players[j],
          player1Score: 0,
          player2Score: 0,
          status: "pending",
        });
      }
    }

    return { matches };
  }
}
```

### Match Management

```javascript
// services/MatchService.js
export class MatchService {
  static updateMatchScore(match, player1Score, player2Score, matchFormat = "bo3") {
    const winThreshold = matchFormat === "bo5" ? 3 : 2;

    match.player1Score = player1Score;
    match.player2Score = player2Score;

    if (player1Score >= winThreshold) {
      match.winner = match.player1;
      match.status = "completed";
    } else if (player2Score >= winThreshold) {
      match.winner = match.player2;
      match.status = "completed";
    } else {
      match.status = "active";
    }

    return match;
  }

  static advanceWinner(tournament, match) {
    if (match.status !== "completed" || !match.winner) return;

    const { bracket } = tournament;

    // Find next match in bracket
    Object.keys(bracket).forEach((round) => {
      bracket[round].forEach((nextMatch) => {
        if (nextMatch.prevMatch1 === match.id) {
          nextMatch.player1 = match.winner;
        } else if (nextMatch.prevMatch2 === match.id) {
          nextMatch.player2 = match.winner;
        }

        // If both players are set, make match ready
        if (nextMatch.player1 && nextMatch.player2 && nextMatch.status === "pending") {
          nextMatch.status = "ready";
        }
      });
    });
  }
}
```

## AdMob Integration

### Setup AdMob

```javascript
// services/AdService.js
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

class AdService {
  constructor() {
    this.interstitialAd = null;
    this.rewardedAd = null;
    this.setupInterstitialAd();
    this.setupRewardedAd();
  }

  setupInterstitialAd() {
    this.interstitialAd = InterstitialAd.createForAdRequest(
      __DEV__ ? TestIds.INTERSTITIAL : "your-interstitial-ad-unit-id"
    );

    this.interstitialAd.onAdEvent((type, error) => {
      if (type === AdEventType.LOADED) {
        console.log("Interstitial ad loaded");
      } else if (type === AdEventType.ERROR) {
        console.error("Interstitial ad error:", error);
      }
    });
  }

  setupRewardedAd() {
    this.rewardedAd = RewardedAd.createForAdRequest(
      __DEV__ ? TestIds.REWARDED : "your-rewarded-ad-unit-id"
    );

    this.rewardedAd.onAdEvent((type, error, reward) => {
      if (type === AdEventType.LOADED) {
        console.log("Rewarded ad loaded");
      } else if (type === AdEventType.REWARD_EARNED) {
        console.log("User earned reward:", reward);
      }
    });
  }

  showInterstitialAd() {
    if (this.interstitialAd) {
      this.interstitialAd.show();
      this.setupInterstitialAd(); // Create new instance for next use
    }
  }

  showRewardedAd() {
    if (this.rewardedAd) {
      this.rewardedAd.show();
      this.setupRewardedAd(); // Create new instance for next use
    }
  }

  loadInterstitialAd() {
    if (this.interstitialAd) {
      this.interstitialAd.load();
    }
  }

  loadRewardedAd() {
    if (this.rewardedAd) {
      this.rewardedAd.load();
    }
  }
}

export default new AdService();
```

### Banner Ad Component

```javascript
// components/common/BannerAdComponent.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

const BannerAdComponent = ({ size = BannerAdSize.BANNER }) => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : "your-banner-ad-unit-id"}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.error("Banner ad failed to load:", error);
        }}
        onAdLoaded={() => {
          console.log("Banner ad loaded");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
});

export default BannerAdComponent;
```

## UI/UX Design

### Main App Navigation

```javascript
// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppProvider } from "./src/context/AppContext";

import HomeScreen from "./src/screens/HomeScreen";
import PlayerManagementScreen from "./src/screens/PlayerManagementScreen";
import TournamentCreationScreen from "./src/screens/TournamentCreationScreen";
import TournamentBracketScreen from "./src/screens/TournamentBracketScreen";
import MatchDetailScreen from "./src/screens/MatchDetailScreen";
import TournamentHistoryScreen from "./src/screens/TournamentHistoryScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#1976D2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "SmashScore" }} />
          <Stack.Screen
            name="PlayerManagement"
            component={PlayerManagementScreen}
            options={{ title: "Manage Players" }}
          />
          <Stack.Screen
            name="TournamentCreation"
            component={TournamentCreationScreen}
            options={{ title: "Create Tournament" }}
          />
          <Stack.Screen
            name="TournamentBracket"
            component={TournamentBracketScreen}
            options={{ title: "Tournament Bracket" }}
          />
          <Stack.Screen
            name="MatchDetail"
            component={MatchDetailScreen}
            options={{ title: "Match Details" }}
          />
          <Stack.Screen
            name="TournamentHistory"
            component={TournamentHistoryScreen}
            options={{ title: "Tournament History" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
```

### Home Screen Component

```javascript
// screens/HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../context/AppContext";
import BannerAdComponent from "../components/common/BannerAdComponent";

const HomeScreen = ({ navigation }) => {
  const { players, tournaments, activeTournament } = useApp();

  return (
    <ScrollView style={styles.container}>
      <BannerAdComponent />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{players.length}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tournaments.length}</Text>
          <Text style={styles.statLabel}>Tournaments</Text>
        </View>
      </View>

      {activeTournament && (
        <TouchableOpacity
          style={styles.activeTournamentCard}
          onPress={() => navigation.navigate("TournamentBracket")}
        >
          <Text style={styles.activeTournamentTitle}>Active Tournament</Text>
          <Text style={styles.activeTournamentName}>{activeTournament.name}</Text>
          <Text style={styles.activeTournamentDetails}>
            {activeTournament.format.toUpperCase()} • {activeTournament.players.length} players
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("PlayerManagement")}
        >
          <Text style={styles.actionButtonText}>Manage Players</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("TournamentCreation")}
        >
          <Text style={styles.actionButtonText}>Create Tournament</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("TournamentHistory")}
        >
          <Text style={styles.actionButtonText}>Tournament History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1976D2",
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  activeTournamentCard: {
    backgroundColor: "#4CAF50",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  activeTournamentTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTournamentName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 5,
  },
  activeTournamentDetails: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  actionButtons: {
    marginHorizontal: 20,
  },
  actionButton: {
    backgroundColor: "#1976D2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
```

## Testing and Deployment

### Unit Testing Setup

```javascript
// __tests__/services/BracketGenerator.test.js
import { BracketGenerator } from "../../src/utils/BracketGenerator";

describe("BracketGenerator", () => {
  const mockPlayers = [
    { id: "1", name: "Player 1" },
    { id: "2", name: "Player 2" },
    { id: "3", name: "Player 3" },
    { id: "4", name: "Player 4" },
  ];

  test("generates single elimination bracket correctly", () => {
    const bracket = BracketGenerator.generateSingleElimination(mockPlayers);

    expect(bracket[1]).toHaveLength(2); // First round should have 2 matches
    expect(bracket[2]).toHaveLength(1); // Second round should have 1 match (final)
  });

  test("handles odd number of players with byes", () => {
    const oddPlayers = mockPlayers.slice(0, 3);
    const bracket = BracketGenerator.generateSingleElimination(oddPlayers);

    // Should still create proper bracket structure
    expect(bracket[1]).toHaveLength(2);
    expect(bracket[2]).toHaveLength(1);
  });
});
```

### Performance Optimization

```javascript
// components/common/OptimizedFlatList.js
import React, { memo } from "react";
import { FlatList } from "react-native";

const OptimizedFlatList = memo(({ data, renderItem, keyExtractor }) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
    />
  );
});

export default OptimizedFlatList;
```

### Deployment Configuration

#### Android (android/app/build.gradle)

```gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.smashtournamentapp"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release
        }
    }
}
```

#### iOS (ios/SmashTournamentApp/Info.plist)

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>googleads.g.doubleclick.net</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

## Final Implementation Checklist

### Core Features ✅

- [ ] Player creation and management
- [ ] Tournament creation with format selection
- [ ] Single elimination bracket generation
- [ ] Double elimination bracket generation
- [ ] Round robin tournament support
- [ ] Match scoring system (Bo3/Bo5)
- [ ] Tournament progress tracking
- [ ] Local data persistence with AsyncStorage
- [ ] Tournament history and statistics

### Ad Integration ✅

- [ ] Google AdMob setup
- [ ] Banner ads on main screens
- [ ] Interstitial ads between tournaments
- [ ] Rewarded ads for extra features
- [ ] Ad placement optimization

### UI/UX ✅

- [ ] Responsive design for all screen sizes
- [ ] Intuitive navigation flow
- [ ] Tournament bracket visualization
- [ ] Match detail screens
- [ ] Player statistics display
- [ ] Tournament creation wizard

### Performance & Quality ✅

- [ ] Optimized FlatList rendering
- [ ] Proper error handling
- [ ] Unit test coverage
- [ ] Performance monitoring
- [ ] Memory leak prevention
- [ ] Offline functionality

### Deployment ✅

- [ ] Android build configuration
- [ ] iOS build configuration
- [ ] App store optimization
- [ ] Privacy policy integration
- [ ] Terms of service
- [ ] App icon and splash screens

This comprehensive guide provides everything needed to build a complete React Native tournament management app with local storage and ad integration. The modular architecture allows for easy expansion and maintenance while ensuring optimal performance and user experience.
