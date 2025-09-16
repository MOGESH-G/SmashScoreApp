import { deleteTournament } from "@/services/databaseService";
import { TournamentType } from "@/types.ts/common";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ListRenderItemInfo, Text, TouchableOpacity, View } from "react-native";

const TournamentCard = ({
  data,
  fetchTournaments,
}: {
  data: ListRenderItemInfo<TournamentType>;
  fetchTournaments: () => void;
}) => {
  const item: TournamentType = data.item;
  const router = useRouter();
  const handleTournament = () => {
    router.push(`/tournaments/${item.id}/Matches`);
  };

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={handleTournament}>
      <View className="w-full h-[10rem] bg-purple-600 rounded-lg overflow-hidden p-4">
        <View className="flex-row justify-between items-start">
          <Text className="text-2xl font-semibold text-white">{item.name}</Text>
          <MaterialIcons
            name="delete"
            size={30}
            color="red"
            onPress={() => {
              deleteTournament(item.id);
              fetchTournaments();
            }}
          />
        </View>
        <Text className="py-2 px-4 rounded-full self-start" onPress={() => console.log("text")}>
          {item.status}
        </Text>
        <AntDesign
          name="edit"
          size={24}
          onPress={() => router.push(`/tournaments?id=${item.id}`)}
        />
      </View>
    </TouchableOpacity>
  );
};

export default TournamentCard;
