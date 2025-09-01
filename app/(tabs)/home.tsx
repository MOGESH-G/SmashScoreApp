import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const Home = () => {
  const router = useRouter();
  return (
    <View className="flex-1 items-center p-4 bg-background">
      <View className="flex flex-row gap-2 bg-secondary overflow-hidden p-4 h-[20%] rounded-xl mb-8 w-full">
        <View className="bg-green w-20 h-full"></View>
        <View className="flex flex-1 justify-between ">
          <Text className="text-2xl font-bold text-inactive">Welcome to SmashScore!</Text>
          <View className="w-full flex items-end">
            <Pressable
              className="w-[5rem] h-10 flex flex-row items-center justify-center gap-3"
              onPress={() => router.push("/createTournament")}
            >
              <Text className="text-white text-xl">Start</Text>
              <FontAwesome6 name="angle-right" color="white" size={20} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Home;
