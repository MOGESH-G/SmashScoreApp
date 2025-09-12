import CustomModal from "@/components/CustomModal";
import RoundRobin from "@/components/Matches/RoundRobin";
import SingleElimination from "@/components/Matches/SingleElimination";
import LeaderBoard from "@/components/Svg/LeaderBoard";
import {
  generateDoubleElimination,
  generateRoundRobin,
  generateSingleElimination,
  generateSwissTournament,
} from "@/functions/generateBracket";
import { getTournamentById, patchTournament } from "@/services/databaseService";
import { Bracket, MatchType, TOURNAMENT_FORMATS, TournamentType } from "@/types.ts/common";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

type LeaderBoardType = {
  sno: number;
  name: string;
  points: number;
  position: number;
};

const Matches = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [simpleMode, setSimpleMode] = useState<boolean>(true);
  const [leaderBoard, setLeaderBoard] = useState<LeaderBoardType[]>([]);
  const [leaderBoardOpen, setLeaderBoardOpen] = useState<boolean>(false);
  const [tournamentData, setTournamentData] = useState<TournamentType | null>(null);

  const fetchTournament = async () => {
    const data: TournamentType | null = await getTournamentById(id.toString());
    if (data) {
      setTournamentData(data);
    }
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

  const generateLeaderboard = (bracket: Bracket) => {
    const pointsMap: Record<string, number> = {};
    tournamentData?.teams.forEach((team) => {
      pointsMap[team.id] = 0;
    });

    Object.values(bracket).forEach((roundMatches) => {
      roundMatches.forEach((match) => {
        if (match.winner) {
          pointsMap[match.winner] = (pointsMap[match.winner] || 0) + 1;
        }
      });
    });

    console.log(tournamentData?.teams);

    let leaderboard: LeaderBoardType[] = Object.entries(pointsMap).map(([id, points], index) => {
      const team = tournamentData?.teams.find((t) => t.id === id);
      return {
        sno: index + 1,
        name: team?.name || "",
        points,
        position: 0,
      };
    });

    leaderboard = leaderboard.sort((a, b) => b.points - a.points);

    leaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));

    console.log(leaderboard);

    setLeaderBoard(leaderboard);
  };

  useEffect(() => {
    if (!tournamentData) return;
    if (!tournamentData.bracket || Object.keys(tournamentData.bracket).length === 0) {
      generateMatches();
    }
    if (tournamentData.bracket) generateLeaderboard(tournamentData.bracket);
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
        <TouchableOpacity activeOpacity={0.6} onPress={() => setLeaderBoardOpen(true)}>
          <LeaderBoard color="white" width={40} height={35} />
        </TouchableOpacity>
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

      {tournamentData?.format === TOURNAMENT_FORMATS.SINGLE_ELIM && (
        <SingleElimination
          data={tournamentData}
          updateMatchData={updateMatchData}
          simpleMode={simpleMode}
        />
      )}

      <CustomModal onClose={() => setLeaderBoardOpen(false)} visible={leaderBoardOpen}>
        <View className="fle1w-[90%] bg-white rounded-2xl">
          {/* Header */}
          <View className="w-full flex-row items-center justify-center relative mb-2">
            <Text className="text-lg font-bold text-center">LeaderBoard</Text>
            <TouchableOpacity
              className="absolute right-2"
              onPress={() => setLeaderBoardOpen(false)}
            >
              <AntDesign name="close" color="black" size={30} />
            </TouchableOpacity>
          </View>

          <View className="w-full border-gray-500 border-2">
            <View className="flex-row bg-secondary">
              <Text className="py-2 text-center text-white w-[12%]">S.no</Text>
              <Text className="py-2 text-center text-white w-[40%]">Team Name</Text>
              <Text className="py-2 text-center text-white w-[23%]">Points</Text>
              <Text className="py-2 text-center text-white w-[25%]">Position</Text>
            </View>
            {leaderBoard.map((record, index) => (
              <View
                key={index}
                className={`flex-row items-center border-gray-500 ${
                  index + 1 !== leaderBoard.length ? "border-b-2" : ""
                }`}
                style={{
                  backgroundColor:
                    record.points !== 0
                      ? record.position === 1
                        ? "#FFC30B"
                        : record.position === 2
                          ? "#D3D3D3"
                          : record.position === 3
                            ? "#CD7F32"
                            : "white"
                      : "white",
                }}
              >
                <Text className="py-2 text-center w-[12%]">{index + 1}</Text>
                <Text className="py-2 text-center w-[40%]">{record.name}</Text>
                <Text className="py-2 text-center w-[23%]">{record.points}</Text>
                <Text className="py-2 text-center w-[25%]">{record.position}</Text>
              </View>
            ))}
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default Matches;
