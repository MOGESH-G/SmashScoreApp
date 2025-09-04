import { initDB, resetDB } from "@/services/databaseService";
import { useRouter } from "expo-router";
import { Button, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-background">
      <Button title="Home" onPress={() => router.push("/(tabs)/home")} />
      <Button title="Reset" onPress={resetDB} />
      <Button title="Init" onPress={initDB} />
    </View>
  );
}
