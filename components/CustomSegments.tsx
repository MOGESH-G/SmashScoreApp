import React, { useState } from "react";
import { LayoutChangeEvent, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type CustomSegmentsProps = {
  options: string[] | number[];
  containerRadius?: number;
  sliderRadius?: number;
  activeColor?: string;
  inactiveColor?: string;
  onPress: (value: string | number) => void;
};

const CustomSegments = ({
  options,
  containerRadius = 999,
  sliderRadius = 999,
  activeColor = "#02111B",
  inactiveColor = "#666666",
  onPress,
}: CustomSegmentsProps) => {
  const [selected, setSelected] = useState(0);
  const translateX = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const segmentWidth = containerWidth / options.length || 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value, { duration: 250 }) }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={{ borderRadius: containerRadius }}
      className="flex-row bg-gray-200 overflow-hidden"
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            width: segmentWidth,
            height: "100%",
            backgroundColor: activeColor,
            borderRadius: sliderRadius,
          },
          animatedStyle,
        ]}
      />
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.9}
          style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10 }}
          onPress={() => {
            setSelected(index);
            translateX.value = segmentWidth * index;
            onPress(option);
          }}
        >
          <Text style={{ color: selected === index ? "#fff" : inactiveColor }}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CustomSegments;
