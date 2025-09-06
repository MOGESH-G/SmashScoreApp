import { initDB } from "@/services/databaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const restoreNav = async () => {
      const savedState: any = await AsyncStorage.getItem("lastRoute");
      if (savedState) {
        router.replace(savedState);
      }
    };
    // restoreNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (segments.length > 0) {
      AsyncStorage.setItem("lastRoute", "/" + segments.join("/"));
    }
  }, [segments]);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#eaeaea" }} edges={["top", "bottom"]}>
          <SQLiteProvider databaseName="SmashScore.db" onInit={initDB}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </SQLiteProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
