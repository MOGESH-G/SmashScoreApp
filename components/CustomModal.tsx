import React, { ReactNode } from "react";
import { Dimensions, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

const CustomModal = ({ visible, onClose, children }: CustomModalProps) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible ? "auto" : "none",
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null; // Don't render when completely hidden

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        },
        backdropStyle,
      ]}
    >
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
        }}
        onPress={onClose}
      />
      <Animated.View
        style={[
          {
            width: width * 0.9,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
          },
          modalStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};

export default CustomModal;
