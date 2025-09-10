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
  wins: 0,
  losses: 0,
};

const Teams = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [tournamentData, setTournamentData] = useState<TournamentType | null>(null);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [newTeam, setNewTeam] = useState<TeamType>(initialTeamType);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teamId, setTeamId] = useState("");
  const [teamSheetOpen, setTeamSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const PLAYER_LIMIT = tournamentData?.mode === TOURNAMENT_MODE.SINGLES ? 1 : 2;

  const fetchPlayers = async () => {
    const data: PlayerType[] = await getPlayers();
    setPlayers(data);
  };

  const fetchTournament = async () => {
    const data: TournamentType | null = await getTournamentById(id.toString());
    if (data) setTournamentData(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchTournament(), fetchPlayers()]);
        setLoading(false);
      };
      fetchData();
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

  const createNewTeam = async () => {
    if (!tournamentData) return;
    try {
      if (tournamentData.mode === TOURNAMENT_MODE.SINGLES) {
        await patchTournament(tournamentData.id, "teams", JSON.stringify(tournamentData.teams));
        router.push(`/tournaments/${tournamentData?.id}/Matches`);
      } else {
        const teamData: TeamType = {
          ...newTeam,
          id: generateUUID(),
        };

        const updatedTeams = [...tournamentData?.teams, teamData];
        await patchTournament(tournamentData.id, "teams", JSON.stringify(updatedTeams));
        setNewTeam(initialTeamType);
        setTeamSheetOpen(false);
      }
    } catch (err) {
      alert(JSON.stringify(err));
    } finally {
      await fetchTournament();
    }
  };

  const handleSinglePlayerSelect = async (player: PlayerType) => {
    if (!tournamentData || tournamentData.mode !== TOURNAMENT_MODE.SINGLES) return;

    const existingTeamIndex = tournamentData.teams.findIndex((team) =>
      team.players.some((p) => p.id === player.id)
    );

    if (existingTeamIndex !== -1) {
      const updatedTeams = tournamentData.teams.filter((_, idx) => idx !== existingTeamIndex);

      setTournamentData({
        ...tournamentData,
        teams: updatedTeams,
      });
    } else {
      const newTeam: TeamType = {
        id: generateUUID(),
        name: player.name,
        players: [player],
        wins: 0,
        losses: 0,
      };

      setTournamentData({
        ...tournamentData,
        teams: [...tournamentData.teams, newTeam],
      });
    }
  };

  const renderSingles = () => {
    if (!tournamentData) return;

    if (players.length === 0)
      return (
        <View className="flex-1 justify-center items-center h-full">
          <Pressable onPress={() => router.push("/Players?open=true")}>
            <AntDesign name="pluscircle" color="black" size={40} />
          </Pressable>
          <Text>Oops! No players available</Text>
        </View>
      );

    return (
      <View className="flex-1 w-full p-3">
        <FlatList
          data={sortedPlayers}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          className="w-full flex-1"
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <SinlgePlayersList
              item={item}
              key={item.id}
              selectedTeams={tournamentData.teams}
              setSelectedTeams={handleSinglePlayerSelect}
            />
          )}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={tournamentData && tournamentData.teams.length === 0}
          onPress={createNewTeam}
          className="flex-row py-3 rounded-full justify-center items-center gap-3 bg-primary mt-3"
        >
          <Text className="font-semibold text-white">Next</Text>
          <AntDesign name="arrowright" color="white" size={28} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTeams = () => {
    if (!tournamentData?.teams || tournamentData.teams.length === 0)
      return (
        <View className="flex-1 justify-center items-center h-full">
          <Pressable onPress={() => setTeamSheetOpen(true)}>
            <AntDesign name="pluscircle" color="black" size={40} />
          </Pressable>
          <Text>Add Teams to begin!</Text>
        </View>
      );

    return (
      <View className="flex-1 w-full p-3">
        <View className="flex flex-row justify-between items-center">
          <Text className="py-3 px-1 font-semibold">
            Selected Teams ({tournamentData?.teams.length})
          </Text>
          <AntDesign
            name="pluscircle"
            color="black"
            size={30}
            onPress={() => setTeamSheetOpen(true)}
          />
        </View>
        <FlatList
          data={tournamentData.teams}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          className="w-full flex-1"
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <TeamsList
              item={item}
              key={item.id}
              players={players}
              setTeams={handleTeams}
              tournamentData={tournamentData}
            />
          )}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={tournamentData.teams.length < 2}
          onPress={() => router.push(`/tournaments/${tournamentData?.id}/Matches`)}
          className="flex-row py-3 rounded-full justify-center items-center gap-3 bg-primary mt-3"
        >
          <Text className="font-semibold text-white">Next</Text>
          <AntDesign name="arrowright" color="white" size={28} />
        </TouchableOpacity>
      </View>
    );
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const aInTeam = tournamentData?.teams.some((team) => team.players.some((p) => p.id === a.id));
    const bInTeam = tournamentData?.teams.some((team) => team.players.some((p) => p.id === b.id));

    if (aInTeam && !bInTeam) return -1;
    if (!aInTeam && bInTeam) return 1;
    return 0;
  });

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <View className="flex-1 w-full">
      <View className="w-full flex-row bg-secondary h-[5rem] items-center px-2 gap-3">
        <Pressable className="w-auto" onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable>
        <Text className="text-white">
          {tournamentData?.mode === TOURNAMENT_MODE.SINGLES ? "Select Players" : "Your Teams"}
        </Text>
      </View>

      {/* <View className="flex-1 w-full pb-2">
        {tournamentData?.mode === TOURNAMENT_MODE.SINGLES ? (
          players.length === 0 ? (
            <View className="flex-1 justify-center items-center h-full">
              <Pressable onPress={() => router.push("/Players?open=true")}>
                <AntDesign name="pluscircle" color="black" size={40} />
              </Pressable>
              <Text>Oops! No players available</Text>
            </View>
          ) : (
            <View className="flex-1 w-full p-3">
              <FlatList
                data={sortedPlayers}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                className="w-full flex-1"
                ItemSeparatorComponent={() => <View className="h-2"></View>}
                renderItem={({ item }) => (
                  <SinlgePlayersList
                    item={item}
                    key={item.id}
                    selectedTeams={tournamentData.teams}
                    setSelectedTeams={handleSinglePlayerSelect}
                  />
                )}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={tournamentData && tournamentData.teams.length === 0}
                onPress={createNewTeam}
                className="flex-row py-3 rounded-full justify-center items-center gap-3 bg-primary mt-3"
              >
                <Text className="font-semibold text-white">Next</Text>
                <AntDesign name="arrowright" color="white" size={28} />
              </TouchableOpacity>
            </View>
          )
        ) : tournamentData?.teams.length !== 0 ? (
          <View className="flex-1 w-full p-3">
            <View className="flex flex-row justify-between items-center">
              <Text className="py-3 px-1 font-semibold">
                Selected Teams {`(${tournamentData?.teams.length})`}
              </Text>
              <AntDesign
                name="pluscircle"
                color="black"
                size={30}
                onPress={() => setTeamSheetOpen(true)}
              />
            </View>
            {tournamentData?.teams && (
              <FlatList
                data={tournamentData.teams}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                className="w-full flex-1"
                ItemSeparatorComponent={() => <View className="h-2"></View>}
                renderItem={({ item }) => (
                  <TeamsList
                    item={item}
                    key={item.id}
                    players={players}
                    setTeams={handleTeams}
                    tournamentData={tournamentData}
                  />
                )}
              />
            )}
            {tournamentData && tournamentData.teams && (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={tournamentData.teams.length < 2}
                onPress={() => router.push(`/tournaments/${tournamentData?.id}/Matches`)}
                className="flex-row py-3 rounded-full justify-self-end justify-center items-center gap-3 bg-primary mt-3"
              >
                <Text className="font-semibold text-white">Next</Text>
                <AntDesign name="arrowright" color="white" size={28} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center h-full">
            <Pressable onPress={() => setTeamSheetOpen(true)}>
              <AntDesign name="pluscircle" color="black" size={40} />
            </Pressable>
            <Text>Add Teams to begin!</Text>
          </View>
        )}
      </View> */}
      <View className="flex-1 w-full pb-2">
        {tournamentData?.mode === TOURNAMENT_MODE.SINGLES ? renderSingles() : renderTeams()}
      </View>

      <View className="absolute w-full bottom-0">
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
              {players.filter(
                (pl) =>
                  !tournamentData?.teams.some((team) =>
                    team.players.some((member) => member.id === pl.id)
                  )
              ).length !== 0 ? (
                <FlatList
                  data={
                    newTeam && newTeam.players?.length === 2
                      ? players.filter((pl) => newTeam.players.includes(pl))
                      : players.filter(
                          (pl) =>
                            !tournamentData?.teams.some((team) =>
                              team.players.some((member) => member.id === pl.id)
                            )
                        )
                  }
                  keyExtractor={(item) => item.id}
                  className="w-full flex-1"
                  ItemSeparatorComponent={() => <View className="h-2"></View>}
                  renderItem={({ item }) => (
                    <PlayersList item={item} newTeam={newTeam} setNewTeam={handleAddNewTeam} />
                  )}
                />
              ) : (
                <View className="flex-1 justify-center items-center h-full">
                  <Pressable onPress={() => router.push("/Players?open=true")}>
                    <AntDesign name="pluscircle" color="black" size={40} />
                  </Pressable>
                  <Text>Oops! No players available</Text>
                </View>
              )}
              {newTeam.players?.length === PLAYER_LIMIT && (
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
    </View>
  );
};

const SinlgePlayersList = ({
  item,
  selectedTeams,
  setSelectedTeams,
}: {
  item: PlayerType;
  selectedTeams: TeamType[];
  setSelectedTeams: (val: PlayerType) => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className={`bg-gray-200 w-full flex-row items-center gap-3 rounded-md py-4 px-2`}
      onPress={() => setSelectedTeams(item)}
    >
      <CustomCheckbox checked={!!selectedTeams.find((team) => team.players[0].id === item.id)} />
      <Text>{item.name}</Text>
    </TouchableOpacity>
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
      // onPress={() => setTeams(item)}
    >
      <View className="flex-row items-center px-4 gap-3">
        {/* <CustomCheckbox checked={!!tournamentData.teams.find((team) => team.id === item.id)} /> */}
        <Text className="font-bold text-xl">{item.name}</Text>
      </View>
      <View className="mt-6 px-4">
        {item.players.map((pl, index) => {
          return pl ? (
            <View key={pl.id} className="flex-row justify-between">
              <View className="flex-row gap-1">
                <Text>{index + 1}.</Text>
                <Text>{pl.name}</Text>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-row gap-1">
                  <Text className="font-semibold">Wins:</Text>
                  <Text>{pl.wins}</Text>
                </View>
                <View className="flex-row gap-1">
                  <Text className="font-semibold">Losses:</Text>
                  <Text>{pl.losses}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View key={Math.abs(Math.random() * 10)}></View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

export default Teams;
