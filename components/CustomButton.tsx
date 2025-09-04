import React from "react";
import { Pressable, Text } from "react-native";

type CustomButtonPropsType = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  textClass?: string;
};
const CustomButton = ({
  label,
  onPress,
  disabled = false,
  className = "",
  textClass = "",
}: CustomButtonPropsType) => {
  return (
    <Pressable
      disabled={disabled}
      className={`${className} px-3 py-2 items-center justify-center bg-green`}
      onPress={onPress}
    >
      <Text className={`${textClass} font-semibold`}>{label}</Text>
    </Pressable>
  );
};

export default CustomButton;
