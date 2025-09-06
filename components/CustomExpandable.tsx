import { AntDesign } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, View } from "react-native";

type ExpandableProps = {
  title: string;
  option?: React.ReactNode;
  children: React.ReactNode;
};

const Expandable: React.FC<ExpandableProps> = ({ title, option, children }) => {
  const [expanded, setExpanded] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : measuredHeight,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const rotate = animation.interpolate({
    inputRange: [0, measuredHeight || 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View className="rounded-lg border border-gray-300 overflow-hidden my-2">
      <Pressable
        onPress={toggleExpand}
        className="flex-row items-center justify-between px-4 py-3 bg-gray-200"
      >
        <View className="flex-row items-center space-x-4">
          <Animated.View style={{ transform: [{ rotate }] }}>
            <AntDesign name="right" size={16} color="black" />
          </Animated.View>
          <Animated.Text className="text-lg font-semibold">{title}</Animated.Text>
        </View>

        {option && <View>{option}</View>}
      </Pressable>

      <Animated.View style={{ height: animation }} className="overflow-hidden bg-white">
        <View
          style={{ position: "absolute", opacity: 0 }}
          onLayout={(e: LayoutChangeEvent) => setMeasuredHeight(e.nativeEvent.layout.height)}
        >
          {children}
        </View>

        <View>{children}</View>
      </Animated.View>
    </View>
  );
};

export default Expandable;
