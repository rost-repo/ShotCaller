"use client";

import { Target, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";  
import type { GameIndex, Hex, HexStats } from "@/lib/types";
import { pickPlayerIndex, randomSeed, dailySeed } from "@/lib/random";
import { applyGuess, MAX_GUESSES, getWrongGuesses, getGuessResults, buildShareText, type GameState } from "@/lib/game";
import ShotChart, {type ZoneInfo } from "@/components/ShotChart";
import GuessInput from "@/components/GuessInput";
import ZonePanel from "@/components/ZonePanel";
import HintPanel from "@/components/HintPanel";
import ThemeToggle from "@/components/ThemeToggle";
import GuessPips from "@/components/GuessPips";
import GameOverPanel from "@/components/GameOverPanel";
import HelpDialog from "@/components/HelpDialog";

export default function Home() {
  const [index, setIndex] = useState<GameIndex | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [secretHexes, setSecretHexes] = useState<Hex[] | null>(null);
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  const [hexStats, setHexStats] = useState<HexStats | null>(null);

  const startNewGame = useCallback( async (idx: GameIndex) => {
    setSecretHexes(null);
    const seed = dailySeed();
    const secret = idx.players[pickPlayerIndex(idx.players.length, seed)]
    setGame({ secretPlayer: secret, guesses: [], hintsUsed: 0, status: "playing"});

    const hexRes = await fetch(`/data/players/${secret.id}.json`);
    const hexData = await hexRes.json()
    setSecretHexes(hexData.hexes as Hex[]);
  }, []);

  useEffect( () => {
    fetch("/data/index.json")
      .then((r) => r.json())
      .then((idx: GameIndex) => {
        setIndex(idx);
        startNewGame(idx);
      });
    
    fetch("/data/hex_stats.json")
      .then((r) => r.json())
      .then((stats: HexStats) => setHexStats(stats))

  }, [startNewGame]);

  if (!index || !game || !secretHexes || !hexStats) {
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
      <header className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex -rotate-2 items-center gap-2.25 rounded-xl border-[3px] border-ink bg-primary py-1.25 pr-3.5 pl-1.25 shadow-sticker">
          <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-ink">
            <Target size={18} className="text-primary" />
          </div>
          <span className="font-display text-[19px] tracking-[-0.01em] text-ink">
            SHOTCALLER
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HelpDialog />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-paper shadow-sticker-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink bg-surface-2 px-4 py-2.5">
          <h1 className="font-display text-[15px] tracking-[-0.01em] text-fg">
            GUESS THE PLAYER
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-fg-muted">{statusText}</span>
            <GuessPips results={getGuessResults(game)} total={MAX_GUESSES} />
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
              {zoneInfo && <ZonePanel  info = {zoneInfo} />}
            </>
          ) : (
            <GameOverPanel
              won={game.status === "won"}
              playerName={game.secretPlayer.name}
              results={getGuessResults(game)}
              total={MAX_GUESSES}
              shareText={buildShareText(game)}
            />
          )}
        </div>
        <div className="border-t-[3px] border-ink">
          <HintPanel player={game.secretPlayer} hintsUsed={game.hintsUsed} />
        </div>
        {wrongGuesses.length > 0 && (
          <div className="border-t-[3px] border-ink px-4 py-3">
            <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
              Already ruled out
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {wrongGuesses.map((name) => (
                <span
                    key={name}
                    className="flex items-center gap-1.5 rounded-lg border-2 border-ink bg-danger-tint px-2.5 py-1 text-[13px] text-ink line-through"
                >
                    <X size={12} className="shrink-0" />
                    {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="sticky bottom-4 flex gap-2.5 rounded-2xl border-[3px] border-ink bg-paper py-2 pr-2 pl-[18px] shadow-sticker-md">
        <GuessInput
          playerNames={index.players.map((p) => p.name)}
          disabledNames={game.guesses}
          onGuess={(name) => setGame((g) => g && applyGuess(g, name))}
          disabled={game.status !== "playing"}
        />
      </div>
    </main>
    );

}