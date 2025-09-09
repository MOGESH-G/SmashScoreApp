import { emptyPlayers, emptyTournaments, initDB, resetDB } from "@/services/databaseService";
import { useRouter } from "expo-router";
import { Button, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-10 bg-background">
      <Button title="Home" onPress={() => router.push("/(tabs)/home")} />
      <Button title="Reset" onPress={resetDB} />
      <Button title="Init" onPress={initDB} />
      <Button title="Delete Players" onPress={emptyPlayers} />
      <Button title="Delete Tournaments" onPress={emptyTournaments} />
    </View>
  );
}
