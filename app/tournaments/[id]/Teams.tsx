import PlalyerModal from "@/components/PlalyerModal";
import { getPlayers, getTournamentById } from "@/services/databaseService";
import { PlayerType, TournamentType } from "@/types.ts/common";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";

const Teams = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [playerId, setPlayerId] = useState("");
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [tournamentData, setTournamentData] = useState<TournamentType | null>(null);

  const fetchPlayers = async () => {
    const data: PlayerType[] = await getPlayers();
    setPlayers(data);
  };

  const fetchTournament = async () => {
    const data: TournamentType = await getTournamentById(id.toString());
    setTournamentData(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTournament();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );
  useFocusEffect(
    useCallback(() => {
      if (!playerModalOpen) fetchPlayers();
    }, [playerModalOpen])
  );

  return (
    <View className="flex-1 bg-red-500 w-full h-full">
      <View className="w-full bg-secondary h-[5rem] justify-center px-2">
        <Pressable className="w-auto" onPress={() => router.push("/(tabs)/home")}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable>
      </View>
      <View className="flex-1">
        <Button title="add player" onPress={() => setPlayerModalOpen(true)} />
        <View style={{ flex: 1, backgroundColor: "green" }}>
          {players.map((player) => (
            <Text key={player.id}>{player.name}</Text>
          ))}
        </View>
      </View>
      <PlalyerModal openModal={playerModalOpen} setOpenModal={setPlayerModalOpen} id={playerId} />
    </View>
  );
};

export default Teams;
