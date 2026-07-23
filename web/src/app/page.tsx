"use client";

import { useEffect, useState, useCallback } from "react";  
import type { GameIndex, PlayerSummary, Hex } from "@/lib/types";
import { pickPlayerIndex, randomSeed } from "@/lib/random";
import { applyGuess, calculateScore, MAX_GUESSES, type GameState } from "@/lib/game";
import ShotChart, {type ZoneInfo } from "@/components/ShotChart";
import GuessInput from "@/components/GuessInput";
import ZonePanel from "@/components/ZonePanel";
import HintPanel from "@/components/HintPanel";

export default function Home() {
  const [index, setIndex] = useState<GameIndex | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [secretHexes, setSecretHexes] = useState<Hex[] | null>(null);
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);

  const startNewGame = useCallback( async (idx: GameIndex) => {
    setSecretHexes(null);
    const seed = randomSeed();
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
  }, [startNewGame]);

  if (!index || !game || !secretHexes) {
    return <p className="p-8 text-gray-500">Loading game files...</p>;
  }

  const wrongGuesses = game.guesses.filter((g) => g !== game.secretPlayer.name).length;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-extrabold">Shotcaller 🏀</h1>
        <p className="text-lg">
          Pontos: <span className="font-bold">{calculateScore(game)}</span> ·
          Palpites: {game.guesses.length}/{MAX_GUESSES}
        </p>
      </header>
      <ShotChart
        hexes={secretHexes}
        leagueAverages={index.leagueAverages}
        leagueOverallFg={index.leagueOverallFg}
        onZoneHover={setZoneInfo}
      />
      {zoneInfo && <ZonePanel  info = {zoneInfo} />}
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
            wrongGuesses={wrongGuesses}
            onUseHint={() => setGame((g) => g && { ...g, hintsUsed: g.hintsUsed + 1 })}
          />
          <ul className="space-y-1">
            {game.guesses.map((name) => (
              <li key={name} className="rounded bg-red-50 px-3 py-2 text-red-700">✗ {name}</li>
            ))}
          </ul>
        </>
      ) : (
        <div className="rounded-xl border p-6 text-center">
          <p className="text-2xl font-bold">
            {game.status === "won" ? `🎉 Acertou! ${calculateScore(game)} pontos.` : "😔 Fim de jogo."}
          </p>
          <p className="mt-2 text-gray-600">Era <strong>{game.secretPlayer.name}</strong>.</p>
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