"use client";

import { Target, X } from "lucide-react";
import { useState } from "react";  
import { MAX_GUESSES, getWrongGuesses, getPips, buildShareText } from "@/lib/game";
import ShotChart, {type ZoneInfo } from "@/components/ShotChart";
import GuessInput from "@/components/GuessInput";
import ZonePanel from "@/components/ZonePanel";
import HintPanel from "@/components/HintPanel";
import ThemeToggle from "@/components/ThemeToggle";
import GuessPips from "@/components/GuessPips";
import GameOverPanel from "@/components/GameOverPanel";
import HelpDialog from "@/components/HelpDialog";
import StatsDialog from "@/components/StatsDialog";
import ArchiveDialog from "@/components/ArchiveDialog";
import SiteFooter from "@/components/SiteFooter";
import { useGame } from "@/lib/useGame";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface GameScreenProps {
    season: string;
    day?: string;
}

function formatDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function GameScreen({ season, day }: GameScreenProps) {
const { index, game, secretHexes, hexStats, zoneTypes, guess, error, playedDay } = useGame(season, day);
const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  if (error && !game) {
    return (
      <main className="mx-auto flex w-full max-w-230 flex-col items-center px-5 pt-7">
        <div className="flex w-full flex-col items-center gap-3 rounded-3xl border-[3px] border-ink bg-paper px-5 py-16 text-center shadow-sticker-lg">
          <p className="font-display text-[22px] text-danger [-webkit-text-stroke:1.5px_var(--ink)]">
            SOMETHING WENT WRONG
          </p>
          <p className="text-[15px] text-ink-muted">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-display mt-2 rounded-[10px] border-[3px] border-ink bg-primary px-5 py-2.75 text-[13px] text-ink shadow-sticker"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }
  if (!index || !game || !secretHexes || !hexStats || !zoneTypes || !playedDay) {
    return (
      <main className="mx-auto flex w-full max-w-230 flex-col items-center px-5 pt-7">
        <div className="h-96 w-full animate-pulse rounded-3xl border-[3px] border-ink bg-surface-2 shadow-sticker-lg" />
      </main>
    );
  }
  const statusText =
    game.status === "playing"
      ? `Guess ${game.guesses.length + 1} of ${MAX_GUESSES}`
      : game.status === "won"
        ? "Solved"
        : "Out of guesses";

  const wrongGuesses = getWrongGuesses(game);

  return (
    <main className="mx-auto flex w-full max-w-230 flex-col gap-4 px-5 pt-7 pb-20">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div className="flex -rotate-2 items-center gap-1.5 rounded-xl border-[3px] border-ink bg-primary py-1.25 pr-2.5 pl-1 shadow-sticker sm:gap-2.25 sm:pr-3.5 sm:pl-1.25">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-ink sm:h-7.5 sm:w-7.5">
            <Target className="h-3.5 w-3.5 text-primary sm:h-4.5 sm:w-4.5" />
          </div>
          <span className="font-display text-[15px] tracking-[-0.01em] text-ink sm:text-[19px]">
            SHOTCALLER
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <HelpDialog />
          <ArchiveDialog />
          <ThemeToggle />
          <StatsDialog autoOpen={!day && game.status !== "playing"}/>
        </div>
      </header>

      {day && (
        <div className="-mt-1 mb-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border-[3px] border-ink bg-primary-tint px-4 py-2 shadow-sticker">
          <span className="text-[13px] font-semibold text-ink">
            Archive · {formatDay(day)}
          </span>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border-2 border-ink bg-paper px-2.5 py-1 text-[12px] font-semibold text-ink"
          >
            <ArrowLeft size={13} className="shrink-0" />
            Today
          </Link>
        </div>
      )}

      <div className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-paper shadow-sticker-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink bg-surface-2 px-4 py-2.5">
          <h1 className="font-display text-[15px] tracking-[-0.01em] text-fg">
            GUESS THE PLAYER
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-fg-muted">{statusText}</span>
            <GuessPips pips={getPips(game)} />
          </div>
        </div>
        <div className="relative flex min-h-60 flex-col justify-center p-4">
          {game.status === "playing" ? (
            <>
              <ShotChart
                hexes={secretHexes}
                leagueAverages={index.leagueAverages}
                leagueOverallFg={index.leagueOverallFg}
                hexStats={hexStats}
                onZoneHover={setZoneInfo}
              />
              {zoneInfo && <ZonePanel info={zoneInfo} types={zoneTypes[zoneInfo.zone] ?? {}} />}
            </>
          ) : (
            <GameOverPanel
              won={game.status === "won"}
              playerName={game.answer ?? ""}
              guessCount={game.guesses.length}
              pips={getPips(game)}
              shareText={buildShareText(game, playedDay)}
            />
          )}
        </div>
        <div className="border-t-[3px] border-ink">
          <HintPanel hints={game.hints} />
        </div>
        {wrongGuesses.length > 0 && (
          <div className="border-t-[3px] border-ink px-4 py-3">
            <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
              Already ruled out
            </span>
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {wrongGuesses.map((name) => (
                <span
                    key={name}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-ink bg-danger-tint px-2.5 py-1 text-[13px] whitespace-nowrap text-ink line-through"
                >
                    <X size={12} className="shrink-0" />
                    {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="rounded-xl border-2 border-ink bg-danger-tint px-3 py-2 text-center text-[13px] text-ink">
          {error}
        </div>
      )}
      <div className="sticky bottom-4 flex gap-2.5 rounded-2xl border-[3px] border-ink bg-paper py-2 pr-2 pl-4.5 shadow-sticker-md">
        <GuessInput
          playerNames={index.players.map((p) => p.name)}
          disabledNames={game.guesses}
          onGuess={guess}
          disabled={game.status !== "playing"}
        />
      </div>
      <SiteFooter />
    </main>
    );

}
