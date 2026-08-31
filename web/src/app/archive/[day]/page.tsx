import { notFound } from "next/navigation";
import { dayKey, isPlayableDay } from "@/lib/day";
import { seasonForDay } from "@/lib/secret";
import GameScreen from "@/components/GameScreen";

export default async function ArchiveDay({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const today = dayKey();

  // Today belongs to the daily route, which has its own cookie.
  if (!isPlayableDay(day, today) || day === today) {
    notFound();
  }

  const season = await seasonForDay(day);

  return <GameScreen season={season} day={day} />;
}
