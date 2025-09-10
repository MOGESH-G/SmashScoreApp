import CustomLoader from "@/components/CustomLoader";
import { getTournamentById, patchTournament } from "@/services/databaseService";
import { MatchType, PlayerType, TournamentType } from "@/types.ts/common";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, Text, TouchableOpacity, Vibration, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const { width, height } = Dimensions.get("window");

const MatchView = () => {
  const { matchId, id, set } = useLocalSearchParams();
  const [tournamentData, setTournamentData] = useState<TournamentType>();
  const [matchData, setMatchData] = useState<MatchType>();
  const [team1, setTeam1] = useState<PlayerType[]>([]);
  const [team2, setTeam2] = useState<PlayerType[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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

      if (currentMatch.winner) {
        setModalOpen(true);
      }

      setTournamentData(data);
      setMatchData(currentMatch);
      setTeam1(team1);
      setTeam2(team2);
    } catch (error) {
      console.error("Error fetching tournament:", error);
    }
  };

  const updateMatchData = async (key: keyof MatchType, value: any) => {
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

  const handlePointChange = (team: number, point: number) => {
    // const
    Vibration.vibrate(100);
    if (!matchData) return;

    if (team === 1) {
      const newPoint = matchData.team1Score + point > 0 ? matchData.team1Score + point : 0;
      // setMatchData({
      //   ...matchData,
      //   team1Score: newPoint,
      // });
      updateMatchData("team1Score", newPoint);
    } else if (team === 2) {
      const newPoint = matchData.team2Score + point > 0 ? matchData.team2Score + point : 0;
      // setMatchData({
      //   ...matchData,
      //   team2Score: newPoint,
      // });
      updateMatchData("team2Score", newPoint);
    }
  };

  if (!matchData) {
    return <CustomLoader />;
  }

  return (
    <View className="flex-1 bg-primary">
      <StatusBar hidden />
      <View className="flex-1 relative justify-center items-center bg-[#a94007]">
        <View className="flex-1 relative bg-[#009A17] my-10 w-[90%] border-4 border-white justify-center items-center">
          <View className="flex-1 flex-row w-full my-10">
            <View className="w-[10%] h-full border-y-4 border-r-4 border-white gap-4 flex py-6 justify-between items-center">
              <Pressable
                className="bg-white w-16 h-16 rounded-full flex justify-center items-center"
                disabled={matchData.team1Score === 0}
                onPress={() => handlePointChange(1, -1)}
              >
                <Text className="font-semibold">- 1</Text>
              </Pressable>
              <Pressable
                disabled={matchData.team2Score === tournamentData?.pointsPerMatch}
                className="bg-white w-16 h-16 rounded-full flex  justify-center items-center"
                onPress={() => handlePointChange(1, 1)}
              >
                <Text className="font-semibold">+ 1</Text>
              </Pressable>
            </View>

            <View className="flex-1 w-[80%] flex-row">
              {/* Left */}
              <View className="border-y-4 border-white w-[50%] flex-1">
                <View className="h-[50%] w-full justify-center items-center">
                  <Text
                    className="text-xl font-semibold"
                    style={{
                      color:
                        matchData.winner && matchData.winner !== matchData.team1?.id
                          ? "red"
                          : "white",
                    }}
                  >
                    {team1[0] ? team1[0].name : ""}
                  </Text>
                </View>
                <View className="h-[50%] w-full justify-center items-center border-t-4 border-white">
                  <Text
                    className="text-xl font-semibold"
                    style={{
                      color:
                        matchData.winner && matchData.winner !== matchData.team1?.id
                          ? "red"
                          : "white",
                    }}
                  >
                    {team1[1] ? team1[1].name : ""}
                  </Text>
                </View>
              </View>

              {/* Right */}
              <View className="border-y-4 border-white w-[50%] flex-1">
                <View className="h-[50%] w-full justify-center items-center">
                  <Text
                    className="text-xl font-semibold"
                    style={{
                      color:
                        matchData.winner && matchData.winner !== matchData.team2?.id
                          ? "red"
                          : "white",
                    }}
                  >
                    {team2[0] ? team2[0].name : ""}
                  </Text>
                </View>
                <View className="h-[50%] w-full justify-center items-center border-t-4 border-white">
                  <Text
                    className="text-xl font-semibold"
                    style={{
                      color:
                        matchData.winner && matchData.winner !== matchData.team2?.id
                          ? "red"
                          : "white",
                    }}
                  >
                    {team2[1] ? team2[1].name : ""}
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-[10%] h-full border-y-4 border-l-4 border-white gap-4 flex py-6 justify-between items-center">
              <Pressable
                disabled={matchData.team2Score === 0}
                className="bg-white w-16 h-16 rounded-full flex justify-center items-center"
                onPress={() => handlePointChange(2, -1)}
              >
                <Text className="font-semibold">- 1</Text>
              </Pressable>
              <Pressable
                disabled={matchData.team2Score === tournamentData?.pointsPerMatch}
                className="bg-white w-16 h-16 rounded-full flex  justify-center items-center"
                onPress={() => handlePointChange(2, 1)}
              >
                <Text className="font-semibold">+ 1</Text>
              </Pressable>
            </View>
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

        {/* Score Card */}
        <View
          className="absolute w-[20%] h-[20%] bg-white
        gap-1 top-2 border-white border-4 flex flex-row"
        >
          <View className="flex-1 h-full bg-black justify-center items-center">
            <Text className="text-3xl text-white">{matchData?.team1Score}</Text>
          </View>
          <View className="flex-1 h-full bg-black justify-center items-center">
            <Text className="text-3xl text-white">{matchData?.team2Score}</Text>
          </View>
        </View>
      </View>

      {matchData.winner && modalOpen && (
        <>
          <View
            style={{
              shadowOffset: { width: -10, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 30,
              shadowColor: "#000",
              elevation: 30,
            }}
            className="bg-white w-[21rem] h-[15rem] rounded-md absolute top-[30%] left-[35%] p-3 items-center overflow-hidden"
          >
            <View className="w-full justify-center flex-row">
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#C98910",
                  textAlign: "center",
                  letterSpacing: 2,
                  textShadowColor: "rgba(212, 175, 55, 0.7)",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 12,
                }}
              >
                WINNER
              </Text>
              <TouchableOpacity
                activeOpacity={0.5}
                className="absolute top-2 right-2"
                onPress={() => setModalOpen(false)}
              >
                <AntDesign name="close" size={30} />
              </TouchableOpacity>
            </View>

            <Image
              source={require("../../../../assets/images/trophy.png")}
              style={{ width: 200, height: 110, resizeMode: "contain" }}
            />

            <Text className="w-full text-center font-bold text-2xl">
              {matchData.team1?.id === matchData.winner
                ? matchData.team1.name
                : matchData.team2?.name}
            </Text>

            {/* Confetti inside the card */}
            <View className="absolute inset-0">
              <ConfettiCannon
                count={100}
                origin={{ x: 20, y: 0 }}
                fadeOut
                autoStart
                fallSpeed={3000}
              />
              <ConfettiCannon
                count={100}
                origin={{ x: 300, y: 0 }}
                fadeOut
                autoStart
                fallSpeed={3000}
              />
            </View>
          </View>
        </>
      )}
      {/*
       */}
    </View>
  );
};

export default MatchView;
