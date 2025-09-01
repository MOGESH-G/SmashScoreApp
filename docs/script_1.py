# Create example code files for key components
import os

# Create example React Native component files
component_examples = {
    "PlayerManagement.js": '''// screens/PlayerManagementScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { generateUUID } from '../utils/helpers';
import BannerAdComponent from '../components/common/BannerAdComponent';

const PlayerManagementScreen = () => {
  const { players, addPlayer, updatePlayer } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerTag, setPlayerTag] = useState('');

  const handleSavePlayer = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Player name is required');
      return;
    }

    const playerData = {
      id: editingPlayer?.id || generateUUID(),
      name: playerName.trim(),
      tag: playerTag.trim(),
      wins: editingPlayer?.wins || 0,
      losses: editingPlayer?.losses || 0,
      tournaments: editingPlayer?.tournaments || [],
      createdAt: editingPlayer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingPlayer) {
      await updatePlayer(playerData);
    } else {
      await addPlayer(playerData);
    }

    setModalVisible(false);
    setPlayerName('');
    setPlayerTag('');
    setEditingPlayer(null);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setPlayerTag(player.tag || '');
    setModalVisible(true);
  };

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playerCard}
      onPress={() => handleEditPlayer(item)}
    >
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        {item.tag && <Text style={styles.playerTag}>#{item.tag}</Text>}
      </View>
      <View style={styles.playerStats}>
        <Text style={styles.statText}>W: {item.wins}</Text>
        <Text style={styles.statText}>L: {item.losses}</Text>
        <Text style={styles.winRate}>
          {item.wins + item.losses > 0 
            ? `${Math.round((item.wins / (item.wins + item.losses)) * 100)}%`
            : '0%'
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BannerAdComponent />
      
      <View style={styles.header}>
        <Text style={styles.title}>Players ({players.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Player</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={players}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Player Name"
              value={playerName}
              onChangeText={setPlayerName}
              maxLength={50}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Gamer Tag (optional)"
              value={playerTag}
              onChangeText={setPlayerTag}
              maxLength={20}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setPlayerName('');
                  setPlayerTag('');
                  setEditingPlayer(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePlayer}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  playerCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  playerTag: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  winRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#1976D2',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PlayerManagementScreen;''',

    "TournamentCreation.js": '''// screens/TournamentCreationScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { generateUUID } from '../utils/helpers';
import { BracketGenerator } from '../utils/BracketGenerator';
import AdService from '../services/AdService';

const TournamentCreationScreen = ({ navigation }) => {
  const { players, createTournament } = useApp();
  const [tournamentName, setTournamentName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('single_elim');
  const [selectedMatchFormat, setSelectedMatchFormat] = useState('bo3');
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const tournamentFormats = [
    {
      id: 'single_elim',
      name: 'Single Elimination',
      description: 'Players are eliminated after one loss. Quick and decisive.',
      minPlayers: 4
    },
    {
      id: 'double_elim',
      name: 'Double Elimination',
      description: 'Players get a second chance in the losers bracket.',
      minPlayers: 4
    },
    {
      id: 'round_robin',
      name: 'Round Robin',
      description: 'Every player plays every other player.',
      minPlayers: 3
    },
    {
      id: 'swiss',
      name: 'Swiss System',
      description: 'Players are matched based on performance.',
      minPlayers: 6
    }
  ];

  const matchFormats = [
    { id: 'bo3', name: 'Best of 3', description: 'First to 2 wins' },
    { id: 'bo5', name: 'Best of 5', description: 'First to 3 wins' }
  ];

  const togglePlayerSelection = (player) => {
    setSelectedPlayers(prev => 
      prev.find(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    );
  };

  const handleCreateTournament = async () => {
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Tournament name is required');
      return;
    }

    const selectedFormat = tournamentFormats.find(f => f.id === selectedFormat);
    if (selectedPlayers.length < selectedFormat?.minPlayers) {
      Alert.alert(
        'Error', 
        `${selectedFormat.name} requires at least ${selectedFormat.minPlayers} players`
      );
      return;
    }

    const tournament = {
      id: generateUUID(),
      name: tournamentName.trim(),
      format: selectedFormat,
      matchFormat: selectedMatchFormat,
      players: selectedPlayers,
      matches: [],
      bracket: {},
      status: 'setup',
      currentRound: 1,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    // Generate bracket based on format
    switch (selectedFormat) {
      case 'single_elim':
        tournament.bracket = BracketGenerator.generateSingleElimination(selectedPlayers);
        break;
      case 'double_elim':
        tournament.bracket = BracketGenerator.generateDoubleElimination(selectedPlayers);
        break;
      case 'round_robin':
        tournament.bracket = BracketGenerator.generateRoundRobin(selectedPlayers);
        break;
      case 'swiss':
        tournament.bracket = BracketGenerator.generateSwiss(selectedPlayers);
        break;
    }

    tournament.status = 'active';

    await createTournament(tournament);
    
    // Show interstitial ad
    AdService.showInterstitialAd();
    
    Alert.alert(
      'Success',
      'Tournament created successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('TournamentBracket')
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tournament Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter tournament name"
          value={tournamentName}
          onChangeText={setTournamentName}
          maxLength={50}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tournament Format</Text>
        {tournamentFormats.map(format => (
          <TouchableOpacity
            key={format.id}
            style={[
              styles.optionCard,
              selectedFormat === format.id && styles.selectedOption
            ]}
            onPress={() => setSelectedFormat(format.id)}
          >
            <Text style={[
              styles.optionTitle,
              selectedFormat === format.id && styles.selectedOptionText
            ]}>
              {format.name}
            </Text>
            <Text style={[
              styles.optionDescription,
              selectedFormat === format.id && styles.selectedOptionDescription
            ]}>
              {format.description}
            </Text>
            <Text style={[
              styles.minPlayers,
              selectedFormat === format.id && styles.selectedOptionDescription
            ]}>
              Min. {format.minPlayers} players
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Format</Text>
        <View style={styles.matchFormatContainer}>
          {matchFormats.map(format => (
            <TouchableOpacity
              key={format.id}
              style={[
                styles.matchFormatButton,
                selectedMatchFormat === format.id && styles.selectedMatchFormat
              ]}
              onPress={() => setSelectedMatchFormat(format.id)}
            >
              <Text style={[
                styles.matchFormatText,
                selectedMatchFormat === format.id && styles.selectedMatchFormatText
              ]}>
                {format.name}
              </Text>
              <Text style={[
                styles.matchFormatDesc,
                selectedMatchFormat === format.id && styles.selectedMatchFormatDesc
              ]}>
                {format.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Select Players ({selectedPlayers.length}/{players.length})
        </Text>
        {players.map(player => (
          <TouchableOpacity
            key={player.id}
            style={[
              styles.playerCard,
              selectedPlayers.find(p => p.id === player.id) && styles.selectedPlayer
            ]}
            onPress={() => togglePlayerSelection(player)}
          >
            <View style={styles.playerInfo}>
              <Text style={[
                styles.playerName,
                selectedPlayers.find(p => p.id === player.id) && styles.selectedPlayerText
              ]}>
                {player.name}
              </Text>
              {player.tag && (
                <Text style={[
                  styles.playerTag,
                  selectedPlayers.find(p => p.id === player.id) && styles.selectedPlayerTag
                ]}>
                  #{player.tag}
                </Text>
              )}
            </View>
            <View style={styles.playerStats}>
              <Text style={[
                styles.statText,
                selectedPlayers.find(p => p.id === player.id) && styles.selectedPlayerText
              ]}>
                {player.wins}W - {player.losses}L
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.createButton,
          (!tournamentName.trim() || selectedPlayers.length < 2) && styles.disabledButton
        ]}
        onPress={handleCreateTournament}
        disabled={!tournamentName.trim() || selectedPlayers.length < 2}
      >
        <Text style={styles.createButtonText}>Create Tournament</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  optionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedOptionText: {
    color: '#1976D2',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  selectedOptionDescription: {
    color: '#1976D2',
  },
  minPlayers: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  matchFormatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchFormatButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedMatchFormat: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  matchFormatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedMatchFormatText: {
    color: '#1976D2',
  },
  matchFormatDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  selectedMatchFormatDesc: {
    color: '#1976D2',
  },
  playerCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlayer: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedPlayerText: {
    color: '#4CAF50',
  },
  playerTag: {
    fontSize: 14,
    color: '#666',
  },
  selectedPlayerTag: {
    color: '#4CAF50',
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#1976D2',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TournamentCreationScreen;''',

    "BracketGenerator.js": '''// utils/BracketGenerator.js
import { generateUUID } from './helpers';

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
      const match = {
        id: generateUUID(),
        player1: shuffledPlayers[i],
        player2: shuffledPlayers[i + 1],
        player1Score: 0,
        player2Score: 0,
        winner: null,
        round: 1,
        status: 'pending',
        position: Math.floor(i / 2) + 1
      };
      
      // Handle byes
      if (match.player2 === null) {
        match.winner = match.player1;
        match.status = 'completed';
      }
      
      bracket[1].push(match);
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
          player1Score: 0,
          player2Score: 0,
          winner: null,
          round: round,
          status: 'pending',
          position: Math.floor(i / 2) + 1,
          prevMatch1: prevRoundMatches[i].id,
          prevMatch2: prevRoundMatches[i + 1] ? prevRoundMatches[i + 1].id : null
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
      grandFinal: {
        id: generateUUID(),
        player1: null,
        player2: null,
        status: 'pending',
        resetMatch: null // In case winners bracket winner loses
      }
    };
  }
  
  static generateLosersBracket(playerCount) {
    // Complex losers bracket generation
    const rounds = Math.ceil(Math.log2(playerCount));
    const bracket = {};
    
    // First round of losers bracket gets losers from first round of winners
    bracket[1] = [];
    const firstRoundLosers = Math.floor(playerCount / 2);
    
    for (let i = 0; i < firstRoundLosers; i += 2) {
      bracket[1].push({
        id: generateUUID(),
        player1: null,
        player2: null,
        round: 1,
        status: 'pending',
        position: Math.floor(i / 2) + 1
      });
    }
    
    return bracket;
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
          winner: null,
          status: 'pending'
        });
      }
    }
    
    return { matches };
  }
  
  static generateSwiss(players, rounds = null) {
    if (!rounds) {
      rounds = Math.ceil(Math.log2(players.length));
    }
    
    return {
      rounds: rounds,
      currentRound: 1,
      players: players.map(player => ({
        ...player,
        points: 0,
        opponents: [],
        byes: 0
      })),
      matches: [],
      pairings: []
    };
  }
}''',

    "helpers.js": '''// utils/helpers.js
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => {
  return uuidv4();
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateWinRate = (wins, losses) => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const validateTournamentName = (name) => {
  return name && name.trim().length >= 3 && name.trim().length <= 50;
};

export const validatePlayerName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 30;
};'''
}

# Save all component examples
for filename, content in component_examples.items():
    with open(filename, 'w') as f:
        f.write(content)

print("Created example React Native components:")
for filename in component_examples.keys():
    print(f"  • {filename}")

print("\nFiles created successfully for SmashScore Tournament App!")