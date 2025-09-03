import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const restoreNav = async () => {
      const savedState = await AsyncStorage.getItem("lastRoute");
      if (savedState) {
        router.replace(savedState);
      }
    };
    restoreNav();
  }, []);

  useEffect(() => {
    if (segments.length > 0) {
      AsyncStorage.setItem("lastRoute", "/" + segments.join("/"));
    }
  }, [segments]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#eaeaea" }} edges={["top"]}>
        {/* <SQLiteProvider databaseName="SmashScore.db" onInit={initDB}> */}
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
        {/* </SQLiteProvider> */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
