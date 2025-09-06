import uuid from "react-native-uuid";

export const generateUUID = () => {
  return uuid.v4().toString();
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const calculateWinRate = ({ wins, losses }: { wins: number; losses: number }) => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

export const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const validateTournamentName = (name: string) => {
  return name && name.trim().length >= 3 && name.trim().length <= 50;
};

export const validatePlayerName = (name: string) => {
  return name && name.trim().length >= 2 && name.trim().length <= 30;
};

export const createTeams = (playerIds: string[], mode = "singles") => {
  if (!Array.isArray(playerIds)) {
    throw new Error("playerIds must be an array");
  }

  const shuffled = [...playerIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  if (mode === "singles") {
    return shuffled.map((id) => [id]);
  }

  if (mode === "doubles") {
    const teams = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      const team = [shuffled[i]];
      if (i + 1 < shuffled.length) {
        team.push(shuffled[i + 1]);
      }
      teams.push(team);
    }
    return teams;
  }

  throw new Error("Invalid mode. Choose 'singles' or 'doubles'.");
};
