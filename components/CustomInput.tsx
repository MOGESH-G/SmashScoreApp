import React from "react";
import { TextInput } from "react-native";

type customInputType = {
  value: string;
  onChange: () => void;
};

const CustomInput = ({ value, onChange }: customInputType) => {
  return <TextInput value={value} onChangeText={onChange} className="border" />;
};

export default CustomInput;
