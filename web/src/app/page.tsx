import { dayKey } from "@/lib/day";
import { seasonForDay } from "@/lib/secret";
import GameScreen from "@/components/GameScreen";

// Server component: resolves the season without ever touching the day's answer.
export default async function Home() {
  const season = await seasonForDay(dayKey());

  return <GameScreen season={season} />;
}
