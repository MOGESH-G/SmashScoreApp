import TournamentCard from "@/components/TournamentCard";
import { getTournaments } from "@/services/databaseService";
import { TournamentType } from "@/types.ts/common";
import { FontAwesome6 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Button, FlatList, Pressable, Text, View } from "react-native";

const Home = () => {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentType[]>([]);

  const fetchTournaments = async () => {
    const data: TournamentType[] = await getTournaments();
    setTournaments(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTournaments();
    }, [])
  );

  return (
    <View className="flex-1 items-center p-4 bg-background">
      <View className="flex flex-row gap-2 bg-secondary overflow-hidden p-4 h-[20%] rounded-xl mb-8 w-full">
        <View className="bg-green w-20 h-full"></View>
        <View className="flex flex-1 justify-between ">
          <Text className="text-2xl font-bold text-inactive">Welcome to SmashScore!</Text>
          <View className="w-full flex items-end">
            <Pressable
              className="w-[5rem] h-10 flex flex-row items-center justify-center gap-3"
              onPress={() => router.push("/tournaments")}
            >
              <Text className="text-white text-xl">Start</Text>
              <FontAwesome6 name="angle-right" color="white" size={20} />
            </Pressable>
          </View>
        </View>
      </View>
      <Button title="playes" onPress={() => router.push("/Players")} />

      <View className="flex-1 w-full mb-8">
        <Text className="font-semibold text-lg">Recent Tournaments</Text>
        <FlatList
          data={tournaments}
          bounces={true}
          contentContainerStyle={{
            padding: 3,
          }}
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ height: 10 }}></View>}
          renderItem={(data) => <TournamentCard data={data} />}
        />
      </View>
    </View>
  );
};

export default Home;
