import CustomRadioButton from "@/components/CustomRadioButton";
import CustomSegments from "@/components/CustomSegments";
import { createTournament } from "@/services/databaseService";
import { MATCH_STATUS, TOURNAMENT_FORMATS, TournamentType } from "@/types.ts/common";
import { generateUUID } from "@/utils/helper";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

const initialTournamentData: TournamentType = {
  id: generateUUID(),
  name: "",
  format: TOURNAMENT_FORMATS.SINGLE_ELIM,
  sets: 0,
  teams: [],
  pointsPerMatch: 21,
  tieBreakerPoints: 0,
  bracket: [],
  createdAt: "",
  currentRound: 0,
  completedAt: "",
  status: MATCH_STATUS.PENDING,
};

const Index = () => {
  const router = useRouter();
  const [tournamentData, setTournamentData] = useState<TournamentType>(initialTournamentData);
  const Formats = Object.values(TOURNAMENT_FORMATS);
  const [disabled, setDisabled] = useState(true);

  const handleValueChange = (key: string, value: any) => {
    setTournamentData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (tournamentData) {
      if (!tournamentData.name) {
        setDisabled(true);
      } else if (!tournamentData.format) {
        setDisabled(true);
      } else if (!tournamentData.pointsPerMatch) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    } else {
      setDisabled(true);
    }
  }, [tournamentData]);

  const createNewTournament = async () => {
    console.log(tournamentData);
    const result = await createTournament(tournamentData);
    if (result?.lastInsertRowId) {
      console.log("first");
      router.push(`/tournaments/${result.lastInsertRowId}/Teams`);
    }
  };

  return (
    <View className="w-full h-full">
      <View className="w-full bg-secondary h-[5rem] justify-center px-2">
        <Pressable className="w-auto" onPress={() => router.push("/(tabs)/home")}>
          <AntDesign name="arrowleft" size={24} color="white" />
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
              justifyContent: "space-between",
            }}
            className="px-5 py-4 pb-8"
          >
            <View className="gap-3">
              <View className="gap-1">
                <Text className="font-semibold text-lg">Tournament Name</Text>
                <TextInput
                  value={tournamentData?.name}
                  onChangeText={(text) => handleValueChange("name", text)}
                  className="border rounded-lg p-2 bg-white h-14"
                  placeholder={`Enter tournament name `}
                />
              </View>

              <View className="gap-1">
                <Text className="font-semibold text-lg">League Type</Text>
                <View className="gap-2">
                  {Formats.map((format) => (
                    <CustomRadioButton
                      key={format}
                      label={format}
                      size={23}
                      labelClass="text-lg"
                      checked={tournamentData?.format === format || false}
                      onPress={() => {
                        handleValueChange("format", format);
                      }}
                    />
                  ))}
                </View>
              </View>

              {tournamentData?.format === TOURNAMENT_FORMATS.ROUND_ROBIN && (
                <View className="gap-1">
                  <Text className="font-semibold text-lg">Select Sets</Text>
                  <CustomSegments
                    options={[1, 2, 3, 5]}
                    containerRadius={50}
                    sliderRadius={0}
                    onPress={(value) => handleValueChange("match_format", value)}
                  />
                </View>
              )}

              <View className="gap-1">
                <Text className="font-semibold text-lg">Points per Match</Text>
                <TextInput
                  value={tournamentData?.pointsPerMatch?.toString() || ""}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "");
                    handleValueChange(
                      "pointsPerMatch",
                      numericText === "" ? "" : Number(numericText)
                    );
                  }}
                  keyboardType="numeric"
                  className="border rounded-lg p-2 bg-white h-14"
                  placeholder="Enter points per match"
                />
              </View>

              {/* <View className="gap-1">
                <Text className="font-semibold text-lg">Tie Breaker Point</Text>
                <TextInput
                  value={tournamentData?.tieBreakerPoints?.toString() || ""}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "");
                    handleValueChange(
                      "tieBreakerPoints",
                      numericText === "" ? "" : Number(numericText)
                    );
                  }}
                  keyboardType="numeric"
                  className="border rounded-lg p-2 bg-white h-14"
                  placeholder="Enter points per match"
                />
              </View> */}
            </View>

            <Pressable
              // disabled={disabled}
              onPress={() => (disabled ? alert("Please fill all details") : createNewTournament())}
              className={`w-full rounded-full ${disabled ? "bg-inactive" : "bg-primary"} h-auto py-4 justify-center flex-row gap-3`}
            >
              <Text className="text-white font-semibold">Select Teams</Text>
              <AntDesign name="arrowright" size={24} color="white" />
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Index;
