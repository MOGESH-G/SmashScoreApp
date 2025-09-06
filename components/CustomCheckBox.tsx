import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CustomCheckboxProps = {
  checked: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  activeColor?: string;
  inActiveColor?: string;
};

const CustomCheckbox = ({
  checked,
  onChange = () => {},
  label,
  activeColor = "#02111B",
  inActiveColor = "#666666",
}: CustomCheckboxProps) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      activeOpacity={0.8}
      className="flex-row items-center"
    >
      <View
        style={{
          backgroundColor: checked ? activeColor : "transparent",
          borderColor: checked ? activeColor : inActiveColor,
        }}
        className="w-7 h-7 border-2 rounded flex items-center justify-center "
      >
        <Text className={`text-white font-bold ${checked ? "opacity-1" : "opacity-0"}`}>✓</Text>
      </View>

      {label && <Text className="ml-2 text-base">{label}</Text>}
    </TouchableOpacity>
  );
};

export default CustomCheckbox;
