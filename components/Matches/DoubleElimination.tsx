import { Bracket, DoubleEliminationBracket, MatchType, TournamentType } from "@/types.ts/common";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { G, Line } from "react-native-svg";
import PanZoomView from "../PanView";

const cardWidth = 180;
const cardHeight = 100;
const xGap = 80;
const yGap = 80;

type DoubleEliminationType = {
  data: TournamentType;
  updateMatchData: (
    tournamentData: TournamentType,
    matchId: string,
    key: keyof MatchType,
    value: any
  ) => Promise<void>;
  simpleMode: boolean;
};

const DoubleElimination = ({ data, updateMatchData, simpleMode }: DoubleEliminationType) => {
  const { winners, losers, grandFinal } = data.bracket as DoubleEliminationBracket;

  const {
    layout: winnersLayout,
    totalWidth: winnersWidth,
    totalHeight: winnersHeight,
  } = useMemo(() => computeLayout(winners), [winners]);

  const {
    layout: losersLayout,
    totalWidth: losersWidth,
    totalHeight: losersHeight,
  } = useMemo(() => computeLayout(losers), [losers]);

  const grandFinalX = Math.max(winnersWidth, losersWidth) + cardHeight + xGap;
  const grandFinalY = Math.max(winnersHeight, losersHeight) / 2;

  const totalWidth = grandFinalX + cardWidth + 100;
  const totalHeight = winnersHeight + losersHeight + 200;

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  return (
    <View className="flex-1 bg-white">
      <View
        style={{ margin: 20, marginBottom: 90 }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ width, height });
        }}
        className="flex-1 border-dashed border-2 overflow-hidden bg-gray-200"
      >
        <PanZoomView width={totalWidth} height={totalHeight} containerSize={containerSize}>
          <View style={{ width: totalWidth, height: totalHeight }}>
            {/* WINNERS bracket */}
            {renderBracket(winnersLayout, updateMatchData, data)}

            {/* LOSERS bracket shifted down */}
            <View style={{ top: winnersHeight + 100, position: "absolute" }}>
              {renderBracket(
                losersLayout.map((m) => ({ ...m, y: m.y + winnersHeight + 100 })),
                updateMatchData,
                data
              )}
            </View>

            {/* GRAND FINAL */}
            <View
              style={{
                position: "absolute",
                left: grandFinalX,
                top: grandFinalY,
                width: cardWidth,
                height: cardHeight,
                transform: [{ translateY: -cardHeight / 2 }],
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
                {[grandFinal.team1, grandFinal.team2].map((team) => (
                  <TouchableOpacity
                    key={team?.id}
                    style={{
                      backgroundColor: grandFinal.winner === team?.id ? "#4ade80" : "#f3f4f6",
                      borderRadius: 6,
                      padding: 10,
                      marginBottom: 4,
                    }}
                    onPress={() => updateMatchData(data, grandFinal.id, "winner", team?.id)}
                  >
                    <Text numberOfLines={1} ellipsizeMode="tail">
                      {team?.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </PanZoomView>
      </View>
    </View>
  );
};

function renderBracket(
  layout: MatchLayout[],
  updateMatchData: (
    tournamentData: TournamentType,
    matchId: string,
    key: keyof MatchType,
    value: any
  ) => Promise<void>,
  data: TournamentType
) {
  return (
    <>
      <Svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
        {layout.map((match) => {
          const nextRound = match.round + 1;
          const parentIndex = Math.floor(match.matchIndex / 2);
          const parent = layout.find((m) => m.round === nextRound && m.matchIndex === parentIndex);
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

      <View style={{ width: "100%", height: "100%" }}>
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
              {[match.team1, match.team2].map((team) => (
                <TouchableOpacity
                  key={team?.id}
                  style={{
                    backgroundColor: match.winner === team?.id ? "#4ade80" : "#f3f4f6",
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 4,
                  }}
                  onPress={() => updateMatchData(data, match.id, "winner", team?.id)}
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
    </>
  );
}

export type LayoutMatch = MatchType & { round: number; x: number; y: number };

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
  const firstCount = data[rounds[0]]?.length || 0;
  const totalHeight = firstCount * yStep - yGap + h;

  const layout: MatchLayout[] = [];

  rounds.forEach((roundKey, roundIdx) => {
    const matches = data[roundKey];
    if (!matches) return;

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

export default DoubleElimination;
