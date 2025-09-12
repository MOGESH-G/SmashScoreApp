import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.max(min, Math.min(value, max));
};

const PanZoomView = ({
  children,
  minWidth,
  minHeight,
}: {
  children: React.ReactNode;
  minWidth: number;
  minHeight: number;
}) => {
  const [container, setContainer] = useState({ width: 0, height: 0 });

  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainer({ width, height });
  };

  const panGesture = Gesture.Pan().onUpdate((event) => {
    const scaledWidth = minWidth * scale.value;
    const scaledHeight = minHeight * scale.value;

    const maxX = Math.max(0, (scaledWidth - container.width) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2);

    offsetX.value = clamp(event.translationX, -maxX, maxX);
    offsetY.value = clamp(event.translationY, -maxY, maxY);
  });

  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    scale.value = Math.max(event.scale, 1); // Prevent zooming below 1
  });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    width: minWidth,
    height: minHeight,
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, overflow: "hidden" }} onLayout={onLayout}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.pannable, animatedStyle]}>{children}</Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  pannable: {
    overflow: "hidden",
  },
});

export default PanZoomView;
