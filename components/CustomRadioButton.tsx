import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type CustomRadioButtonPropsType = {
  label: string;
  checked: boolean;
  onPress: () => void;
  size?: number;
  labelClass?: string;
  activeColor?: string;
  inActiveColor?: string;
};

const CustomRadioButton = ({
  label,
  checked,
  onPress,
  size = 20,
  labelClass = "",
  activeColor = "#02111B",
  inActiveColor = "#666666",
}: CustomRadioButtonPropsType) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(checked ? 1 : 0, { damping: 12, stiffness: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-row items-center w-full gap-4">
        <View
          style={{
            width: size,
            height: size,
            borderColor: inActiveColor,
          }}
          className="border-2 rounded-full items-center justify-center"
        >
          <Animated.View
            style={[
              {
                width: size * 0.6,
                height: size * 0.6,
                backgroundColor: activeColor,
                borderRadius: size / 2,
              },
              animatedStyle,
            ]}
          />
        </View>
        <Text className={labelClass}>{label}</Text>
      </View>
    </Pressable>
  );
};

export default CustomRadioButton;
