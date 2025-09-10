import { getTournamentById, patchTournament } from "@/services/databaseService";
import { MatchType, PlayerType, TournamentType } from "@/types.ts/common";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

const MatchView = () => {
  const { matchId, id, set } = useLocalSearchParams();
  const [tournamentData, setTournamentData] = useState<TournamentType>();
  const [matchData, setMatchData] = useState<MatchType>();
  const [team1, setTeam1] = useState<PlayerType[]>([]);
  const [team2, setTeam2] = useState<PlayerType[]>([]);

  const fetchTournament = async () => {
    try {
      const data: TournamentType | null = await getTournamentById(id.toString());

      if (!data) {
        console.warn("Tournament not found");
        return;
      }

      const matches = data.bracket;
      const matchSet = matches?.[Number(set)] ?? [];

      const currentMatch = matchSet.find((match) => match.id === matchId);

      if (!currentMatch) {
        console.warn(`Match with id ${matchId} not found`);
        return;
      }

      const team1 = currentMatch.team1?.players || [];
      const team2 = currentMatch.team2?.players || [];

      setTournamentData(data);
      setMatchData(currentMatch);
      setTeam1(team1);
      setTeam2(team2);
    } catch (error) {
      console.error("Error fetching tournament:", error);
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

  useFocusEffect(
    useCallback(() => {
      fetchTournament();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  return (
    <View className="flex-1 bg-primary">
      <StatusBar hidden />
      <View className="flex-1 justify-center items-center bg-[#a94007]">
        <View className="flex-1 relative bg-[#009A17] my-10 w-[90%] border-4 border-white justify-center items-center">
          <View className="flex-1 flex-row w-full my-10">
            <View className="w-[10%] h-full border-y-4 border-r-4 border-white"></View>
            <View className="flex-1 w-[80%]">
              {/* Left */}
              <View className="border-t-4 border-white h-[50%] flex-1 flex-row">
                <View className="w-[50%] h-full justify-center items-center">
                  <Text className="text-xl font-white">{team1[0] ? team1[0].name : ""}</Text>
                </View>
                <View className="w-[50%] h-full justify-center items-center">
                  <Text className="text-xl font-white">{team1[1] ? team1[1].name : ""}</Text>
                </View>
              </View>

              {/* Right */}
              <View className="border-y-4 border-white h-[50%] flex-1 flex-row">
                <View className="w-[50%] h-full justify-center items-center">{}</View>
                <View className="w-[50%] h-full justify-center items-center">{}</View>
              </View>
            </View>
            <View className="w-[10%] h-full border-y-4 border-l-4 border-white"></View>
          </View>

          <View
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: -10, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 20,
            }}
            className="absolute border-white border-x-4 h-full"
          />
        </View>
      </View>
    </View>
  );
};

export default MatchView;
