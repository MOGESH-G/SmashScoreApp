import React, { useEffect } from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type CustomBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const CustomBottomSheet = ({ open, onClose, children }: CustomBottomSheetProps) => {
  const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
  const translateY = useSharedValue(SHEET_HEIGHT); // fully hidden initially
  const backdropOpacity = useSharedValue(0);
  const startY = useSharedValue(0); // store starting Y when gesture begins

  useEffect(() => {
    translateY.value = open
      ? withSpring(0, { damping: 20 }) // slide in
      : withSpring(SHEET_HEIGHT, { damping: 20 }); // slide out
    backdropOpacity.value = open ? withSpring(1) : withSpring(0);
  }, [open]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startY.value = translateY.value; // save where we started
    })
    .onUpdate((event) => {
      const nextPosition = startY.value + event.translationY; // relative movement
      translateY.value = Math.min(Math.max(nextPosition, 0), SHEET_HEIGHT);
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        // close if dragged enough or flung down fast
        backdropOpacity.value = withSpring(0);
        translateY.value = withSpring(SHEET_HEIGHT, { damping: 20 }, () => {
          runOnJS(onClose)();
        });
      } else {
        // restore to open state
        translateY.value = withSpring(0, { damping: 20 });
        backdropOpacity.value = withSpring(1);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <View className="absolute inset-0 justify-end" pointerEvents={open ? "auto" : "none"}>
      {/* Backdrop */}
      <Animated.View
        className="absolute inset-0 bg-black/50"
        style={backdropStyle}
        onTouchEnd={() => {
          backdropOpacity.value = withSpring(0);
          translateY.value = withSpring(SHEET_HEIGHT, { damping: 20 }, () => {
            runOnJS(onClose)();
          });
        }}
      />

      <Animated.View
        className="bg-white rounded-t-3xl p-4"
        style={[sheetStyle, { height: SHEET_HEIGHT }]}
      >
        <GestureDetector gesture={pan}>
          <View className="w-full border-b border-gray-300 mb-1 h-8">
            <View className="w-10 h-1.5 bg-gray-300 self-center rounded-full mb-3" />
          </View>
        </GestureDetector>
        {children}
      </Animated.View>
    </View>
  );
};

export default CustomBottomSheet;
