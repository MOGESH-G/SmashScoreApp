import { createPlayer, getPlayerById } from "@/services/databaseService";
import { PlayerType } from "@/types.ts/common";
import { generateUUID } from "@/utils/helper";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import CustomButton from "./CustomButton";

type playerModalType = {
  id?: string;
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
};

const initialPlayerData: PlayerType = {
  id: "",
  name: "",
  wins: 0,
  losses: 0,
  createdAt: "",
};

const PlalyerModal = ({ id, openModal, setOpenModal }: playerModalType) => {
  const [player, setPlayer] = useState<PlayerType>(initialPlayerData);

  const fetchPlayer = async (id: string) => {
    const data = await getPlayerById(id);
    if (data) {
      setPlayer(data);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlayer(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValueChange = (key: string, value: any) => {
    setPlayer((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const createNewPlayer = async () => {
    try {
      const data = player;
      data.id = generateUUID();
      await createPlayer(data);
    } catch (error) {
      console.log(error);
    } finally {
      setOpenModal(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      {/* Modal */}
      <Modal visible={openModal} animationType="fade" transparent={true}>
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setOpenModal(false)}
        >
          <View className="bg-white w-4/5 p-5 gap-3 rounded-2xl">
            {/* <View className="w-full">
              <Text>Add Player</Text>
            </View> */}
            <View className="gap-1">
              <Text className="font-semibold text-lg">Player Name</Text>
              <TextInput
                value={player.name}
                onChangeText={(text) => handleValueChange("name", text)}
                className="border rounded-lg p-2 bg-white h-14"
                placeholder={`Enter Player name `}
              />
            </View>

            <CustomButton
              disabled={player.name === ""}
              className="bg-green py-2 rounded-xl px-2 "
              onPress={createNewPlayer}
              label="Create"
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PlalyerModal;
