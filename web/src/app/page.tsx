"use client";

import { Target } from "lucide-react";
import { useEffect, useState, useCallback } from "react";  
import type { GameIndex, PlayerSummary, Hex, HexStats } from "@/lib/types";
import { pickPlayerIndex, randomSeed, dailySeed } from "@/lib/random";
import { applyGuess, MAX_GUESSES, getWrongGuesses, getGuessResults, type GameState } from "@/lib/game";
import ShotChart, {type ZoneInfo } from "@/components/ShotChart";
import GuessInput from "@/components/GuessInput";
import ZonePanel from "@/components/ZonePanel";
import HintPanel from "@/components/HintPanel";
import ThemeToggle from "@/components/ThemeToggle";
import GuessPips from "@/components/GuessPips";

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
    return <p className="p-8 text-gray-500">Loading game files...</p>;
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
        <div className="flex -rotate-2 items-center gap-[9px] rounded-xl border-[3px] border-ink bg-primary py-[5px] pr-[14px] pl-[5px] shadow-sticker">
          <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-ink">
            <Target size={18} className="text-primary" />
          </div>
          <span className="font-display text-[19px] tracking-[-0.01em] text-ink">
            SHOTCALLER
          </span>
        </div>
        <div>
          <h1 className="font-display mb-1.5 text-[19px] tracking-[-0.01em]">
            GUESS THE PLAYER
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-fg-muted">{statusText}</span>
            <GuessPips results={getGuessResults(game)} total={MAX_GUESSES} />
          </div>
        </div>
        <ThemeToggle></ThemeToggle>
      </header>

      <div className="flex flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-paper shadow-sticker-lg">
        <div className="relative flex min-h-60 flex-col justify-center p-4">
        <ShotChart
          hexes={secretHexes}
          leagueAverages={index.leagueAverages}
          leagueOverallFg={index.leagueOverallFg}
          hexStats={hexStats}
          onZoneHover={setZoneInfo}
        />
        {zoneInfo && <ZonePanel  info = {zoneInfo} />}
        </div>
      </div>
      {game.status === "playing" ? (
        <>
          <GuessInput
            playerNames={index.players.map((p) => p.name)}
            disabledNames={game.guesses}
            onGuess={(name) => setGame((g) => g && applyGuess(g, name))}
            disabled={game.status !== "playing"}
          />
          <HintPanel
            player={game.secretPlayer}
            hintsUsed={game.hintsUsed}
          />
          <ul className="space-y-1">
            {wrongGuesses.map((name) => (
              <li key={name} className="rounded bg-red-50 px-3 py-2 text-red-700">✗ {name}</li>
            ))}
          </ul>
        </>
      ) : (
        <div className="rounded-xl border p-6 text-center">
          <p className="text-2xl font-bold">
            {game.status === "won" ? `🎉 Congratulations! You guessed the player in ${game.guesses.length} guesses!.` : "😔 Game Over."}
          </p>
          <p className="mt-2 text-gray-600">It was <strong>{game.secretPlayer.name}</strong>.</p>
          <button
            onClick={() => startNewGame(index)}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Jogar de novo
          </button>
        </div>
      )}
    </main>
    );

}