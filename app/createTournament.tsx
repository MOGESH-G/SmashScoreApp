import { TournamentType } from "@/types.ts/common";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const CreateTournament = () => {
  const router = useRouter();
  const [tournamentData, setTournamentData] = useState<Partial<TournamentType> | null>(null);
  const Formats = ["Single Elimination", "Double Elimination", "Round Robin", "Swiss System"];

  const handleValueChange = (key: string, value: any) => {
    if (tournamentData) {
      setTournamentData((prev) => ({
        ...prev,
        [key]: value,
      }));
    } else {
      setTournamentData({
        [key]: value,
      });
    }
  };

  return (
    <View className="w-full h-full">
      <StatusBar style="light" />
      <View className="w-full bg-secondary h-[5rem] justify-center px-2">
        <Pressable className="w-20 bg-white" onPress={() => router.push("/(tabs)/home")}>
          <Text>back</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              padding: 20,
            }}
            className="gap-3 px-5 py-4 bg-red-200"
          >
            <View>
              <Text className="font-semibold">Tournament Name</Text>
              <TextInput
                value={tournamentData?.name}
                onChangeText={(text) => handleValueChange("name", text)}
                className="border rounded-lg p-2 bg-white h-14"
                placeholder={`Enter tournament name `}
              />
            </View>
            <View>
              <Text className="font-semibold">Type</Text>
              {Formats.map((format) => (
                <View></View>
              ))}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreateTournament;
