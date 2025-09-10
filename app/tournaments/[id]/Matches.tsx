import RoundRobin from "@/components/Matches/RoundRobin";
import {
  generateDoubleElimination,
  generateRoundRobin,
  generateSingleElimination,
  generateSwissTournament,
} from "@/functions/generateBracket";
import { getTournamentById, patchTournament } from "@/services/databaseService";
import { MatchType, TOURNAMENT_FORMATS, TournamentType } from "@/types.ts/common";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const Matches = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [simpleMode, setSimpleMode] = useState<boolean>(true);
  const [tournamentData, setTournamentData] = useState<TournamentType | null>(null);

  const fetchTournament = async () => {
    const data: TournamentType | null = await getTournamentById(id.toString());
    if (data) setTournamentData(data);
  };

  const generateMatches = async () => {
    if (!tournamentData) return;

    let matches: any = null;

    switch (tournamentData.format) {
      case TOURNAMENT_FORMATS.SINGLE_ELIM:
        matches = generateSingleElimination(tournamentData.teams, tournamentData.id);
        break;

      case TOURNAMENT_FORMATS.DOUBLE_ELIM:
        matches = generateDoubleElimination(tournamentData.teams, tournamentData.id);
        break;

      case TOURNAMENT_FORMATS.ROUND_ROBIN:
        matches = generateRoundRobin(
          tournamentData.teams,
          tournamentData.id,
          tournamentData.sets ?? 1
        );
        break;

      case TOURNAMENT_FORMATS.SWISS:
        matches = generateSwissTournament(
          tournamentData.teams,
          tournamentData.id,
          tournamentData.sets ?? 1
        );
        break;

      default:
        console.warn(`Unknown tournament format: ${tournamentData.format}`);
        return;
    }

    if (matches) {
      await patchTournament(tournamentData.id, "bracket", JSON.stringify(matches));
      const updatedData = await getTournamentById(tournamentData.id);
      if (updatedData) setTournamentData(updatedData);
    }
  };

  const updateMatchData = async (matchId: string, key: keyof MatchType, value: any) => {
    if (!tournamentData?.bracket) return;

    const updatedBracket = { ...tournamentData.bracket };

    for (const round in updatedBracket) {
      const matchIndex = updatedBracket[round].findIndex((m) => m.id === matchId);
      if (matchIndex !== -1) {
        const match = { ...updatedBracket[round][matchIndex], [key]: value };

        if ((key === "team1Score" || key === "team2Score") && tournamentData.pointsPerMatch) {
          if (match.team1Score >= tournamentData.pointsPerMatch) {
            match.winner = match.team1?.id ?? null;
          } else if (match.team2Score >= tournamentData.pointsPerMatch) {
            match.winner = match.team2?.id ?? null;
          } else {
            match.winner = null;
          }
        }

        updatedBracket[round][matchIndex] = match;
        break;
      }
    }

    await patchTournament(tournamentData.id, "bracket", JSON.stringify(updatedBracket));
    fetchTournament();
  };

  useEffect(() => {
    if (!tournamentData) return;
    if (!tournamentData.bracket || Object.keys(tournamentData.bracket).length === 0) {
      generateMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Pressable onPress={() => setSimpleMode((prev) => !prev)}>
          <Entypo name={simpleMode ? "text" : "sweden"} size={30} color="white" />
        </Pressable>
      </View>
      {tournamentData?.format === TOURNAMENT_FORMATS.ROUND_ROBIN && (
        <RoundRobin
          data={tournamentData}
          updateMatchData={updateMatchData}
          simpleMode={simpleMode}
        />
      )}
    </View>
  );
};

export default Matches;
