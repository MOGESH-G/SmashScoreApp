import { deleteTournament } from "@/services/databaseService";
import { TournamentType } from "@/types.ts/common";
import { AntDesign } from "@expo/vector-icons";
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
      <View className="w-full h-[10rem] bg-green rounded-lg p-4">
        <Text className="text-2xl font-semibold text-white">{item.name}</Text>
        <Text className="py-2 px-4 rounded-full self-start" onPress={() => console.log("text")}>
          {item.status}
        </Text>
        <AntDesign
          name="edit"
          size={24}
          onPress={() => router.push(`/tournaments?id=${item.id}`)}
        />
        <AntDesign
          name="delete"
          size={24}
          onPress={() => {
            deleteTournament(item.id);
            fetchTournaments();
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default TournamentCard;
