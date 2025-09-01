import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#eaeaea" }} edges={["top"]}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />;
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

