import CustomBottomSheet from "@/components/CustomBottomSheet";
import CustomButton from "@/components/CustomButton";
import CustomCheckbox from "@/components/CustomCheckBox";
import CustomLoader from "@/components/CustomLoader";
import { getPlayers, getTournamentById, patchTournament } from "@/services/databaseService";
import { PlayerType, TeamType, TOURNAMENT_MODE, TournamentType } from "@/types.ts/common";
import { generateUUID } from "@/utils/helper";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

const initialTeamType: TeamType = {
  id: "",
  name: "",
  players: [],
};

const Teams = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [tournamentData, setTournamentData] = useState<TournamentType | null>(null);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [newTeam, setNewTeam] = useState<TeamType>(initialTeamType);
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [teamSheetOpen, setTeamSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const PLAYER_LIMIT = tournamentData?.mode === TOURNAMENT_MODE.SINGLES ? 1 : 2;

  const fetchPlayers = async () => {
    const data: PlayerType[] = await getPlayers();
    setPlayers(data);
    setLoading(false);
  };

  const fetchTournament = async () => {
    const data: TournamentType | null = await getTournamentById(id.toString());
    if (data) setTournamentData(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTournament();
      fetchPlayers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleAddNewTeam = (player: PlayerType) => {
    if (newTeam.players.find((val) => val === player)) {
      setNewTeam((prev) => ({
        ...prev,
        players: prev.players.filter((val) => val !== player),
      }));
    } else if (newTeam.players.length < PLAYER_LIMIT) {
      setNewTeam((prev) => ({
        ...prev,
        players: [...prev.players, player],
      }));
    }
  };

  const handleTeams = (currentTeam: TeamType) => {
    if (tournamentData?.teams.find((val) => val.id === currentTeam.id)) {
      setTournamentData({
        ...tournamentData,
        teams: tournamentData.teams.filter((val) => val.id !== currentTeam.id),
      });
    } else if (tournamentData) {
      setTournamentData({
        ...tournamentData,
        teams: [...tournamentData.teams, currentTeam],
      });
    }
  };

  const handleValueChange = (key: string, value: any) => {
    setNewTeam((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return <CustomLoader />;
  }

  const createNewTeam = async () => {
    const teamData: TeamType = {
      ...newTeam,
      id: generateUUID(),
    };
    // setTournamentData(t)
    // setTournamentData(t)
    // setTournamentData(t)
    setTeamSheetOpen(false);
  };

  const addTeamsToTournament = async () => {
    if (tournamentData?.id) {
      const result = await patchTournament(
        tournamentData?.id,
        "teams",
        JSON.stringify(tournamentData?.teams)
      );
      if (result?.changes) {
        router.push(`/tournaments/${id}/Matches`);
      }
    }
  };

  return (
    <View className="flex-1 w-full">
      <View className="w-full flex-row bg-secondary h-[5rem] items-center px-2 gap-3">
        <Pressable className="w-auto" onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable>
        <Text className="text-white">Your Teams</Text>
      </View>

      <View className="w-full h-full pb-20">
        {teams.length === 0 ? (
          <View className="flex-1 justify-center items-center h-full">
            <Pressable onPress={() => setTeamSheetOpen(true)}>
              <AntDesign name="pluscircle" color="black" size={40} />
            </Pressable>
            <Text>Add Teams to begin!</Text>
          </View>
        ) : (
          <View className="flex-1 w-full p-3">
            <View className="flex flex-row justify-between items-center">
              {tournamentData && tournamentData?.teams.length > 0 ? (
                <Text className="py-3 px-1 font-semibold">
                  Selected Teams {`(${tournamentData?.teams.length})`}
                </Text>
              ) : (
                <Text className="py-3 px-1 font-semibold">Select Teams</Text>
              )}
              <AntDesign
                name="pluscircle"
                color="black"
                size={30}
                onPress={() => setTeamSheetOpen(true)}
              />
            </View>
            {tournamentData && (
              <FlatList
                data={teams}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                className="w-full flex-1"
                ItemSeparatorComponent={() => <View className="h-2"></View>}
                renderItem={({ item }) => (
                  <TeamsList
                    item={item}
                    players={players}
                    setTeams={handleTeams}
                    tournamentData={tournamentData}
                  />
                )}
              />
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={tournamentData && tournamentData?.teams.length > 1 ? false : true}
              onPress={addTeamsToTournament}
              className="flex-row py-3 rounded-full justify-center items-center gap-3 bg-primary mt-3"
            >
              <Text className="font-semibold text-white">Next</Text>
              <AntDesign name="arrowright" color="white" size={28} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CustomBottomSheet open={teamSheetOpen} onClose={() => setTeamSheetOpen(false)}>
        <View className="flex-1 w-full gap-4">
          <View className="gap-1">
            <Text className="font-semibold text-lg">Team Name</Text>
            <TextInput
              value={newTeam.name}
              onChangeText={(text) => handleValueChange("name", text)}
              className="border rounded-lg p-2 bg-white h-14"
              placeholder={`Enter Team name `}
            />
          </View>
          <View className="flex-1 gap-1">
            <Text className="font-semibold text-lg">Players</Text>
            {players.length === 0 ? (
              <View className="flex-1 justify-center items-center h-full">
                <Pressable onPress={() => router.push("/Players?open=true")}>
                  <AntDesign name="pluscircle" color="black" size={40} />
                </Pressable>
                <Text>Oops! No players available</Text>
              </View>
            ) : (
              <FlatList
                data={
                  newTeam && newTeam.players?.length === PLAYER_LIMIT
                    ? players.filter((pl) => newTeam.players.includes(pl))
                    : players
                }
                keyExtractor={(item) => item.id}
                className="w-full flex-1"
                ItemSeparatorComponent={() => <View className="h-2"></View>}
                renderItem={({ item }) => (
                  <PlayersList item={item} newTeam={newTeam} setNewTeam={handleAddNewTeam} />
                )}
              />
            )}
            {newTeam.players?.length === 2 && (
              <CustomButton
                label="Create Team"
                className="rounded-full"
                textClass="text-white"
                onPress={createNewTeam}
              />
            )}
          </View>
        </View>
      </CustomBottomSheet>
    </View>
  );
};

const PlayersList = ({
  item,
  newTeam,
  setNewTeam,
}: {
  item: PlayerType;
  newTeam: TeamType;
  setNewTeam: (val: PlayerType) => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className={`bg-gray-200 w-full flex-row items-center gap-3 rounded-md py-4 px-2`}
      onPress={() => setNewTeam(item)}
    >
      <CustomCheckbox checked={!!newTeam.players.find((player) => player.id === item.id)} />
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
};

const TeamsList = ({
  item,
  players,
  setTeams,
  tournamentData,
}: {
  item: TeamType;
  players: PlayerType[];
  setTeams: (val: TeamType) => void;
  tournamentData: TournamentType;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className={`bg-gray-200 w-full rounded-md py-4 px-2`}
      onPress={() => setTeams(item)}
    >
      <View className="flex-row items-center gap-3">
        <CustomCheckbox checked={!!tournamentData.teams.find((team) => team.id === item.id)} />
        <Text>{item.name}</Text>
      </View>
      <View className="mt-6 px-4">
        {item.players.map((pl, index) => {
          const player = players.find((player) => player.id === pl.id);

          return player ? (
            <View key={player.id} className="flex-row justify-between">
              <View className="flex-row gap-1">
                <Text>{index + 1}.</Text>
                <Text>{player.name}</Text>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-row gap-1">
                  <Text className="font-semibold">Wins:</Text>
                  <Text>{player.wins}</Text>
                </View>
                <View className="flex-row gap-1">
                  <Text className="font-semibold">Losses:</Text>
                  <Text>{player.losses}</Text>
                </View>
              </View>
            </View>
          ) : (
            <></>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

export default Teams;
