import Expandable from "@/components/CustomExpandable";
import CustomLoader from "@/components/CustomLoader";
import CustomSnackbar from "@/components/CustomSnackBar";
import PlayerModal from "@/components/PlayerModal";
import { deletePlayer, getPlayers } from "@/services/databaseService";
import { PlayerType } from "@/types.ts/common";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const Players = () => {
  const router = useRouter();
  const { open } = useLocalSearchParams();
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [playerModalOpen, setPlayerModalOpen] = useState(open === "true");
  const [loading, setLoading] = useState(true);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");

  const fetchPlayers = async () => {
    const data: PlayerType[] = await getPlayers();
    setPlayers(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlayers();
    }, [])
  );

  useEffect(() => {
    if (!playerModalOpen) fetchPlayers();
  }, [playerModalOpen]);

  const handleDelete = async (id: string) => {
    if (deleteId === id) {
      await deletePlayer(id);
      fetchPlayers();
      setDeleteId("");
    } else {
      setDeleteId(id);
      setSnackBarVisible(true);
    }
  };

  const PlayersList = ({ item }: { item: PlayerType }) => {
    return (
      <Expandable
        title={item.name}
        option={
          <View className="flex-row gap-3">
            <Pressable
              className="rounded-md px-2 py-2 bg-blue-300"
              onPress={() => {
                setPlayerId(item.id);
                setPlayerModalOpen(true);
              }}
            >
              <AntDesign name="edit" color="blue" size={24} />
            </Pressable>
            <Pressable
              className="rounded-md px-2 py-2 bg-red-200"
              onPress={() => handleDelete(item.id)}
            >
              <MaterialIcons name="delete-outline" size={24} color="red" />
            </Pressable>
          </View>
        }
      >
        <View className="px-3 py-2">
          <Text>Wins: {item.wins}</Text>
          <Text>Losses: {item.losses}</Text>
        </View>
      </Expandable>
    );
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <View className="flex-1 w-full">
      <View className="w-full flex-row bg-secondary h-[5rem] items-center justify-between pl-3 pr-8 gap-3">
        <Pressable className="w-auto" onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable>
        <Pressable className="w-auto" onPress={() => setPlayerModalOpen(true)}>
          <AntDesign name="pluscircleo" size={30} color="white" />
        </Pressable>
      </View>
      <View className="flex-1 gap-1 px-4 py-3">
        <Text className="font-semibold text-lg">Players</Text>
        {players.length === 0 ? (
          <View className="flex-1 justify-center  items-center">
            <Pressable onPress={() => setPlayerModalOpen(true)}>
              <AntDesign name="pluscircle" color="black" size={40} />
            </Pressable>
            <Text>Oops! No players available</Text>
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            className="w-full flex-1"
            ItemSeparatorComponent={() => <View className="h-1"></View>}
            renderItem={({ item }) => <PlayersList item={item} />}
          />
        )}
      </View>

      <View className="absolute bottom-0 w-full">
        <CustomSnackbar
          visible={snackBarVisible}
          onDismiss={() => setSnackBarVisible(false)}
          message={`Press again to delete (${players.find((pl) => pl.id === deleteId)?.name})`}
        />
        <PlayerModal openModal={playerModalOpen} setOpenModal={setPlayerModalOpen} id={playerId} />
      </View>
    </View>
  );
};

export default Players;
