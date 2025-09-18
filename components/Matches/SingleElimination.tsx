import { Bracket, MatchType, TournamentType } from "@/types.ts/common";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { G, Line } from "react-native-svg";
import PanZoomView from "../PanView";

const cardWidth = 180;
const cardHeight = 100;
const xGap = 80;
const yGap = 80;

type SingleEliminationType = {
  data: TournamentType;
  updateMatchData: (
    tournamentData: TournamentType,
    matchId: string,
    key: keyof MatchType,
    value: any
  ) => Promise<void>;
  simpleMode: boolean;
};

const SingleElimination = ({ data, updateMatchData, simpleMode }: SingleEliminationType) => {
  const matches: Bracket = data.bracket;
  const rounds = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b);
  const totalRounds = rounds.length;
  const { layout, totalWidth, totalHeight } = useMemo(() => computeLayout(matches), [matches]);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  return (
    <View className="flex-1 bg-white">
      <View
        style={{
          margin: 20,
          marginBottom: 90,
        }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({
            width,
            height,
          });
        }}
        className="flex-1 border-dashed border-2 overflow-hidden bg-gray-200"
      >
        <PanZoomView width={totalWidth} height={totalHeight} containerSize={containerSize}>
          <View
            className="overflow-visible"
            style={{
              width: totalWidth,
              height: totalHeight,
            }}
          >
            <Svg
              width={totalWidth}
              height={totalHeight}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {layout
                .filter((m) => m.round < totalRounds - 1)
                .map((match) => {
                  const nextRound = match.round + 1;
                  const parentIndex = Math.floor(match.matchIndex / 2);
                  const parent = layout.find(
                    (m) => m.round === nextRound && m.matchIndex === parentIndex
                  );
                  if (!parent) return null;

                  const childX = match.x + cardHeight / 3;
                  const childY = match.y;
                  const parentX = parent.x + cardHeight / 2;
                  const parentY = parent.y;
                  const junctionX = (childX + parentX) / 2;

                  return (
                    <G key={`${match.id}-${parent.id}`}>
                      <Line
                        x1={childX}
                        y1={childY}
                        x2={junctionX}
                        y2={childY}
                        stroke="black"
                        strokeWidth="2"
                      />
                      <Line
                        x1={junctionX}
                        y1={parentY}
                        x2={parentX}
                        y2={parentY}
                        stroke="black"
                        strokeWidth="2"
                      />
                      <Line
                        x1={junctionX}
                        y1={childY}
                        x2={junctionX}
                        y2={parentY}
                        stroke="black"
                        strokeWidth="2"
                      />
                    </G>
                  );
                })}
            </Svg>

            <View style={{ width: totalWidth, height: totalHeight }}>
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
                      { translateY: -match.height / 2 },
                      { translateX: -match.width / 3 },
                      { rotate: "90deg" },
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
                    {[match.team1, match.team2].map((team, index) => (
                      <TouchableOpacity
                        key={team?.id}
                        style={{
                          backgroundColor: match.winner === team?.id ? "#4ade80" : "#f3f4f6",
                          borderRadius: 6,
                          padding: 10,
                          marginBottom: 4,
                        }}
                        onPress={() => {
                          updateMatchData(data, match.id, "winner", team?.id);
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
          </View>
        </PanZoomView>
      </View>
    </View>
  );
};

export type LayoutMatch = MatchType & {
  round: number;
  x: number;
  y: number;
};

type MatchLayout = MatchType & {
  round: number;
  matchIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function computeLayout(data: Bracket): {
  layout: MatchLayout[];
  totalWidth: number;
  totalHeight: number;
} {
  const rounds = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b);
  const totalRounds = rounds.length;

  const w = cardHeight;
  const h = cardWidth;

  const xStep = w + xGap;
  const yStep = h + yGap;

  const totalWidth = totalRounds * xStep - xGap + w;
  const firstCount = data[rounds[0]].length;
  const totalHeight = firstCount * yStep - yGap + h;

  const layout: MatchLayout[] = [];

  rounds.forEach((roundKey, roundIdx) => {
    const matches = data[roundKey];
    const count = matches.length;

    const x = roundIdx * xStep + w / 2;

    const slotHeight = totalHeight / count;
    const baseY = slotHeight / 2;

    matches.forEach((match, matchIdx) => {
      const y = baseY + matchIdx * slotHeight;

      layout.push({
        ...match,
        round: roundIdx,
        matchIndex: matchIdx,
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
