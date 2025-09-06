// hooks/useNavigationPersistence.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const PERSISTENCE_KEY = "NAVIGATION_STATE";

export async function loadNavigationState() {
  try {
    const savedState = await AsyncStorage.getItem(PERSISTENCE_KEY);
    if (savedState) return JSON.parse(savedState);
    return {
      index: 0,
      routes: [
        {
          name: "/",
        },
      ],
    };
  } catch (e) {
    console.log("Failed to load navigation state", e);
    return undefined;
  }
}

export async function saveNavigationState(state: string) {
  try {
    await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  } catch (e) {
    console.log("Failed to save navigation state", e);
  }
}
