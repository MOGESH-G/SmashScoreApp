import { useRouter } from "expo-router";
import { Button, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Button title="Home" onPress={() => router.push("/(tabs)/home")} />
    </View>
  );
}

