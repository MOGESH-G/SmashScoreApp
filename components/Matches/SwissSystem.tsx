import { Bracket, MatchType, TournamentType } from "@/types.ts/common";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CustomCarousel from "../CustomCarousel";
import ThunderSvg from "../Svg/Thunder";

type SwissSystemType = {
  data: TournamentType;
  updateMatchData: (
    tournamentData: TournamentType,
    matchId: string,
    key: keyof MatchType,
    value: any
  ) => Promise<void>;
  simpleMode: boolean;
};

const normalColor = "#F4FAFF";
const winnerColor = "#4CAF50";
const loserColor = "#FF4C4C";

const SwissSystem = ({ data, updateMatchData, simpleMode }: SwissSystemType) => {
  const matches: Bracket = data.bracket || [];
  const router = useRouter();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(
      360,
      {
        duration: 700,
        easing: Easing.inOut(Easing.ease),
      },
      () => {
        rotation.value = withTiming(0, { duration: 0 });
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simpleMode]);

  const thunderAnimationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="flex-1 ">
      <View className="flex-1 p-2">
        <CustomCarousel style={{ flexGrow: 1, width: "100%", height: "100%" }}>
          {Object.entries(matches).map(([round, matchesInRound]) => (
            <View
              key={round}
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 5,
              }}
              className="flex-1 bg-white rounded-lg overflow-hidden"
            >
              <View style={{ height: 70 }} className=" bg-primary justify-center items-center">
                <Text className="text-lg font-bold text-white text-center">ROUND {round}</Text>
              </View>
              <View className="p-3">
                {matchesInRound.map((match) => (
                  <TouchableOpacity
                    activeOpacity={simpleMode ? 1 : 0.6}
                    key={match.id}
                    style={{
                      backgroundColor: "#fff",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 5,
                      borderRadius: 10,
                      marginHorizontal: 8,
                    }}
                    onPress={() => {
                      if (!simpleMode)
                        router.push(`/tournaments/${data.id}/${match.id}/MatchView?set=${round}`);
                      // updateMatchData(match.id, "team1Score", 0);
                      // updateMatchData(match.id, "team2Score", 0);
                      //   Vibration.vibrate([500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000])
                    }}
                    className="h-[140px] mb-4 flex-row items-center rounded-md overflow-hidden"
                  >
                    {/* LEFT */}
                    <View
                      style={{
                        backgroundColor: match.winner
                          ? match.winner === match.team1?.id
                            ? winnerColor
                            : loserColor
                          : normalColor,
                      }}
                      className="flex-1 h-full justify-between items-start p-3"
                    >
                      <Text
                        style={{ color: match.winner ? "white" : "black" }}
                        className="text-xl font-semibold"
                      >
                        {match.team1?.name || "TBD"}
                      </Text>

                      <View
                        style={{
                          justifyContent:
                            !match.winner && simpleMode ? "space-between" : "flex-end",
                        }}
                        className="w-full flex-row items-center flex-1"
                      >
                        {simpleMode && !match.winner && (
                          <View className="gap-3">
                            <TouchableOpacity
                              activeOpacity={0.6}
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 5, height: 5 },
                                shadowRadius: 1,
                                elevation: 4,
                              }}
                              onPress={() =>
                                updateMatchData(data, match.id, "team1Score", match.team1Score + 1)
                              }
                              className="bg-green justify-center items-center px-10 py-2 rounded-md"
                            >
                              <Text>+ 1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              activeOpacity={0.6}
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 5, height: 5 },
                                shadowRadius: 1,
                                elevation: 4,
                                justifyContent: match.winner ? "flex-end" : "space-between",
                              }}
                              onPress={() =>
                                updateMatchData(data, match.id, "team1Score", data.pointsPerMatch)
                              }
                              className="bg-green items-center px-10 py-2 rounded-md"
                            >
                              <Text>+{data.pointsPerMatch - match.team1Score}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <Text
                          style={{ color: match.winner ? "white" : "black" }}
                          className="text-2xl font-bold text-center"
                        >
                          {match.team1Score}
                        </Text>
                      </View>
                    </View>

                    <View className="w-[63px] h-[140px] relative overflow-hidden">
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 0,
                          height: 0,
                          borderRightWidth: 60,
                          borderTopWidth: 150,
                          borderRightColor: "transparent",
                          borderTopColor: match.winner
                            ? match.winner === match.team1?.id
                              ? winnerColor
                              : loserColor
                            : normalColor,
                        }}
                      />

                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 0,
                          height: 0,
                          borderLeftWidth: 60,
                          borderBottomWidth: 150,
                          borderLeftColor: "transparent",
                          borderBottomColor: match.winner
                            ? match.winner === match.team2?.id
                              ? winnerColor
                              : loserColor
                            : normalColor,
                        }}
                      />

                      <View className="absolute inset-0 items-center justify-center">
                        <Animated.View style={match.winner ? {} : thunderAnimationStyle}>
                          <ThunderSvg
                            color="#000"
                            style={{ transform: [{ rotate: "-5deg" }] }}
                            height={50}
                          />
                        </Animated.View>
                      </View>
                    </View>

                    {/* RIGHT */}
                    <View
                      style={{
                        backgroundColor: match.winner
                          ? match.winner === match.team2?.id
                            ? winnerColor
                            : loserColor
                          : normalColor,
                      }}
                      className="flex-1 h-full items-end p-3"
                    >
                      <Text
                        style={{ color: match.winner ? "white" : "black" }}
                        className="text-xl font-semibold"
                      >
                        {match.team2?.name || "TBD"}
                      </Text>

                      <View
                        style={{
                          justifyContent:
                            !match.winner && simpleMode ? "space-between" : "flex-start",
                        }}
                        className=" w-full flex-row items-center flex-1"
                      >
                        <Text
                          style={{ color: match.winner ? "white" : "black" }}
                          className="text-2xl font-bold text-center"
                        >
                          {match.team2Score}
                        </Text>
                        {!match.winner && simpleMode && (
                          <View className="gap-3">
                            <TouchableOpacity
                              activeOpacity={0.6}
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 5, height: 5 },
                                shadowRadius: 1,
                                elevation: 4,
                              }}
                              onPress={() =>
                                updateMatchData(data, match.id, "team2Score", match.team2Score + 1)
                              }
                              className="bg-green justify-center items-center px-10 py-2 rounded-md"
                            >
                              <Text>+ 1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              activeOpacity={0.6}
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 5, height: 5 },
                                shadowRadius: 1,
                                elevation: 4,
                              }}
                              onPress={() =>
                                updateMatchData(data, match.id, "team2Score", data.pointsPerMatch)
                              }
                              className="bg-green justify-center items-center px-10 py-2 rounded-md"
                            >
                              <Text>+{data.pointsPerMatch - match.team2Score}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </CustomCarousel>
      </View>
    </View>
  );
};

export default SwissSystem;
