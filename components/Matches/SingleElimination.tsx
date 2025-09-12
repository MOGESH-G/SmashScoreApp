import { Bracket, MatchType, TournamentType } from "@/types.ts/common";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import PanZoomView from "../PanView";

type SingleEliminationType = {
  data: TournamentType;
  updateMatchData: (matchId: string, key: keyof MatchType, value: any) => void;
  simpleMode: boolean;
};

const SingleElimination = ({ data, updateMatchData, simpleMode }: SingleEliminationType) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const matches: Bracket = data.bracket || [];
  //   const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { layout, totalWidth, totalHeight } = useMemo(
    () => computeLayout(matches, 120, 60, 40, 80),
    [matches]
  );

  return (
    <View className="m-10 flex-1 border-dashed bottom-2 bg-red-300">
      <PanZoomView minWidth={totalWidth} minHeight={totalHeight}>
        <View
          style={{
            width: totalWidth,
            height: totalHeight,
            backgroundColor: "white",
            position: "relative",
          }}
        >
          {/* <View
        style={{
          flexDirection: "row",
          flexGrow: 1,
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 10,
          justifyContent: "center",
          position: "relative",
        }}
        className="flex-1 w-full h-full"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ width, height });
        }}
      > */}
          <Svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {layout.map((match) => {
              if (match.winner) {
                const nextMatch = layout.find(
                  (m) =>
                    m.round === match.round + 1 &&
                    (m.team1?.id === match.winner || m.team2?.id === match.winner)
                );
                if (nextMatch) {
                  return (
                    <Line
                      key={`line-${match.id}-${nextMatch.id}`}
                      x1={match.x + match.width}
                      y1={match.y + match.height / 2}
                      x2={nextMatch.x}
                      y2={nextMatch.y + nextMatch.height / 2}
                      stroke="black"
                      strokeWidth="2"
                    />
                  );
                }
              }
              return null;
            })}
          </Svg>

          {layout.map((match) => (
            <View
              key={match.id}
              style={{
                position: "absolute",
                left: match.x,
                top: match.y,
                width: match.width,
                height: match.height,
                transform: [
                  { translateX: -match.width / 2 },
                  { translateY: -match.height / 2 },
                  { rotate: "-90deg" },
                  { translateX: match.width / 2 },
                  { translateY: match.height / 2 },
                ],
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 6,
                  flex: 1,
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 3,
                }}
              >
                {[match.team1, match.team2].map((team) => (
                  <TouchableOpacity
                    key={team?.id}
                    style={{
                      backgroundColor: match.winner === team?.id ? "#4ade80" : "#f3f4f6",
                      borderRadius: 6,
                      padding: 4,
                      marginBottom: 4,
                    }}
                  >
                    <Text numberOfLines={1} ellipsizeMode="tail">
                      {team?.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </PanZoomView>
    </View>
  );
};

export type LayoutMatch = MatchType & {
  round: number;
  x: number;
  y: number;
};

export type MatchLayout = MatchType & {
  round: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function computeLayout(
  data: Bracket,
  cardWidth = 120,
  cardHeight = 60,
  xGap = 40,
  yGap = 80
): { layout: MatchLayout[]; totalWidth: number; totalHeight: number } {
  const rounds = Object.keys(data);
  const layout: MatchLayout[] = [];

  const totalRounds = rounds.length;
  const maxMatches = Math.max(...rounds.map((r) => data[parseInt(r)].length));
  const totalWidth = maxMatches * (cardHeight + xGap) + xGap;
  const totalHeight = totalRounds * (cardWidth + yGap) + yGap;

  //   const cardWidth = (containerHeight / totalRounds) * 0.6;
  //   const cardHeight = (containerWidth / maxMatches) * 0.6;

  rounds.forEach((roundKey, roundIndex) => {
    const matches = data[Number(roundKey)];

    // const totalWidth = matches.length * cardHeight;
    // const totalHeight = rounds.length * cardWidth;

    // const remainingWidth = containerWidth - totalWidth;
    // const remainingHeight = containerHeight - totalHeight;

    // const xGap = remainingWidth / (matches.length + 1);
    // const yGap = remainingHeight / totalRounds + 1;

    matches.forEach((match, matchIndex) => {
      const x = matchIndex * (cardHeight + xGap) + xGap;
      const y = (totalRounds - roundIndex) * (cardWidth + yGap) - cardWidth + yGap;

      layout.push({
        ...match,
        round: roundIndex,
        x,
        y,
        width: cardWidth,
        height: cardHeight,
      });
    });
  });

  return { layout, totalWidth, totalHeight };
}

export default SingleElimination;
