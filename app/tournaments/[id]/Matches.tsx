import {
  generateDoubleElimination,
  generateRoundRobin,
  generateSingleElimination,
  generateSwissTournament,
} from "@/functions/generateBracket";
import { getTournamentById } from "@/services/databaseService";
import { TOURNAMENT_FORMATS, TournamentType } from "@/types.ts/common";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const Matches = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [tournamentData, setTournamentData] = useState<TournamentType | null>(null);
  const [matches, setMatches] = useState([]);

  const fetchTournament = async () => {
    const data: TournamentType | null = await getTournamentById(id.toString());
    if (data) setTournamentData(data);
  };

  const generateMatches = () => {
    if (!tournamentData) return null;

    console.log(tournamentData.teams);
    switch (tournamentData.format) {
      case TOURNAMENT_FORMATS.SINGLE_ELIM: {
        return generateSingleElimination(tournamentData.teams, tournamentData.id);
      }

      case TOURNAMENT_FORMATS.DOUBLE_ELIM: {
        return generateDoubleElimination(tournamentData.teams, tournamentData.id);
      }

      case TOURNAMENT_FORMATS.ROUND_ROBIN: {
        return generateRoundRobin(
          tournamentData.teams,
          tournamentData.id,
          tournamentData.sets ?? 1
        );
      }

      case TOURNAMENT_FORMATS.SWISS: {
        return generateSwissTournament(
          tournamentData.teams,
          tournamentData.id,
          tournamentData.sets ?? 1
        );
      }

      default:
        console.warn(`Unknown tournament format: ${tournamentData.format}`);
        return null;
    }
  };

  useEffect(() => {
    if (!tournamentData) return;

    const mt = generateMatches();
    if (mt) {
      console.log("Generated matches:", mt);
      // setMatches(mt); // store it in state for rendering later
    }
  }, [tournamentData]);

  useFocusEffect(
    useCallback(() => {
      fetchTournament();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View className="flex-1 w-full overflow-hidden">
      <View className="w-full flex-row bg-secondary h-[5rem] items-center px-2 gap-4">
        <Pressable className="w-auto" onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable>

        <Text className="flex-1 text-white text-xl text-center">{tournamentData?.format}</Text>
      </View>
    </View>
  );
};

export default Matches;
