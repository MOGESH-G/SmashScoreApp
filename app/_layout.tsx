import { initDB } from "@/services/databaseService";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#eaeaea" }} edges={["top"]}>
        <SQLiteProvider databaseName="SmashScore.db" onInit={initDB}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />;
        </SQLiteProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

