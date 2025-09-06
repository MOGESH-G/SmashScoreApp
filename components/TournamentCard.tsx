import { TournamentType } from "@/types.ts/common";
import { useRouter } from "expo-router";
import React from "react";
import { ListRenderItemInfo, Text, TouchableOpacity, View } from "react-native";

const TournamentCard = ({ data }: { data: ListRenderItemInfo<TournamentType> }) => {
  const item: TournamentType = data.item;
  const router = useRouter();
  const handleTournament = () => {
    // if (item.teams?.length === 0) {
    router.push(`/tournaments/${item.id}/Teams`);
    // }
  };

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={handleTournament}>
      <View className="w-full h-[10rem] bg-green rounded-lg p-4">
        <Text className="text-2xl font-semibold text-white">{item.name}</Text>
        <Text className="py-2 px-4 rounded-full self-start" onPress={() => console.log("text")}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TournamentCard;
