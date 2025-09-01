import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, View } from "react-native";

const TabBar = (props: BottomTabBarProps) => {
  console.log(props);
  return (
    <View>
      <Text>TabBar</Text>
    </View>
  );
};

export default TabBar;
