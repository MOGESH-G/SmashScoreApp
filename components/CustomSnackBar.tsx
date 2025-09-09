import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  className?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export default function CustomSnackbar({
  visible,
  message,
  onDismiss,
  className = "",
  duration = 3000,
  actionLabel,
  onAction,
}: Props) {
  const translateY = useRef(new Animated.Value(100)).current;
  const [mounted, setMounted] = useState(visible);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);

      animationRef.current = Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      });
      animationRef.current.start();

      if (duration > 0) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
          onDismiss?.();
        }, duration);
      }
      return;
    }

    if (!visible && mounted) {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      animationRef.current = Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      });
      animationRef.current.start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      animationRef.current?.stop();
    };
  }, [visible, duration, onDismiss, mounted, translateY]);

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.snackbar, { transform: [{ translateY }] }]}>
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel ? (
        <TouchableOpacity
          onPress={() => {
            onAction?.();
            onDismiss?.();
          }}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.action}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  text: {
    color: "#fff",
    flex: 1,
    marginRight: 10,
  },
  action: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
