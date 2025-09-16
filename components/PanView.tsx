import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  width?: number;
  height?: number;
  minScale?: number;
  maxScale?: number;
};

export default function PanZoomView({
  children,
  width,
  height,
  minScale = 0.5,
  maxScale = 3,
}: Props) {
  const [contentSize, setContentSize] = useState({ width: width ?? 0, height: height ?? 0 });

  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const clampBoundary = (offset: number, scaledContentSize: number, type: "width" | "height") => {
    "worklet";
    const maxPositive = type === "width" ? scaledContentSize / 4 : scaledContentSize;
    const maxNegative = type === "width" ? -scaledContentSize / 2 : -scaledContentSize / 2;
    return clamp(offset, maxNegative, maxPositive);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    })
    .onUpdate((e) => {
      const scaledW = contentSize.width * scale.value;
      const scaledH = contentSize.height * scale.value;

      offsetX.value = clampBoundary(startX.value + e.translationX, scaledW, "width");
      offsetY.value = clampBoundary(startY.value + e.translationY, scaledH, "height");
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    })
    .onUpdate((e) => {
      const newScale = Math.max(minScale, Math.min(maxScale, startScale.value * e.scale));
      scale.value = newScale;

      const scaledW = contentSize.width * newScale;
      const scaledH = contentSize.height * newScale;

      offsetX.value = clampBoundary(startX.value, scaledW, "width");
      offsetY.value = clampBoundary(startY.value, scaledH, "height");
    })
    .onEnd(() => {
      scale.value = withSpring(scale.value);
      offsetX.value = withSpring(offsetX.value);
      offsetY.value = withSpring(offsetY.value);
    });

  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.flex}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[{ width: width, height: height, overflow: "hidden" }, animatedStyle]}
          onLayout={(e) => {
            if (!width || !height) {
              const { width: w, height: h } = e.nativeEvent.layout;
              setContentSize({ width: w, height: h });
            }
          }}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1, overflow: "hidden" },
});
