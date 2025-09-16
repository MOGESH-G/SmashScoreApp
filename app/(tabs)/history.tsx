import TournamentCard from "@/components/TournamentCard";
import { getTournaments } from "@/services/databaseService";
import { TournamentType } from "@/types.ts/common";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const History = () => {
  const [tournaments, setTournaments] = useState<TournamentType[]>([]);

  const fetchTournaments = async () => {
    const data: TournamentType[] = await getTournaments();
    const sortedTournaments = data.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setTournaments(sortedTournaments);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTournaments();
    }, [])
  );

  return (
    <View className="flex-1 w-full">
      <View className="w-full flex-row bg-secondary h-[5rem] items-center justify-between pl-3 pr-8 gap-3">
        {/* <Pressable className="w-auto" onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable> */}
        <Text className="font-semibold text-2xl text-white">Past Tournaments</Text>
        <Pressable className="w-auto">
          <AntDesign name="pluscircleo" size={30} color="white" />
        </Pressable>
      </View>
      <View className="flex-1 p-4">
        <FlatList
          data={tournaments}
          bounces={true}
          contentContainerStyle={{
            padding: 3,
          }}
          className="mb-[60px]"
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ height: 10 }}></View>}
          renderItem={(data) => <TournamentCard data={data} fetchTournaments={fetchTournaments} />}
        />
      </View>
    </View>
  );
};

export default History;
