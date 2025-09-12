import IMAGES from "@/assets/images";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

const CustomLoader = () => {
  return (
    <View className="absolute w-full bg-white h-full justify-center items-center">
      <Image source={IMAGES.spinner} style={{ width: 130, height: 130, borderRadius: 100 }} />
    </View>
  );
};

export default CustomLoader;
