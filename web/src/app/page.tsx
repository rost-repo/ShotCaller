"use client";

import { useEffect, useState } from "react";  
import type { GameIndex, PlayerSummary, Hex } from "@/lib/types";
import { pickPlayerIndex, randomSeed } from "@/lib/random";
import ShotChart, {type ZoneInfo } from "@/components/ShotChart";
import GuessInput from "@/components/GuessInput";
import { hexPath } from "@/lib/hexPath";

export default function Home() {
  const [index, setIndex] = useState<GameIndex | null>(null);
  const [secretPlayer, setSecretPlayer] = useState<PlayerSummary | null>(null);
  const [secretHexes, setSecretHexes] = useState<Hex[] | null>(null);
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);

  useEffect( () => {
    async function boot() {
      const res = await fetch("/data/index.json");
      const idx = (await res.json()) as GameIndex;
      setIndex(idx);

      const seed = randomSeed(); //seed for casual mode
      const secret = idx.players[pickPlayerIndex(idx.players.length, seed)];
      setSecretPlayer(secret);

      const hexRes = await fetch(`/data/players/${secret.id}.json`);
      const hexData = await hexRes.json()
      setSecretHexes(hexData.hexes as Hex[]);

    }
    boot();
  }, []);

  if (!index || !secretPlayer || !secretHexes) {
    return <p className="p-8 text-gray-500">Loading game files...</p>;
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-4xl font-extrabold">Shotcaller 🏀</h1>
      <p className="mt-2 text-gray-600">
        {index.players.length} jogadores no pool {" "}
        {secretHexes.length} hexagonos para o jogador secreto.
        {secretPlayer.name} é o jgoador.
      </p>
      <ShotChart
        hexes={secretHexes}
        leagueAverages={index.leagueAverages}
        leagueOverallFg={index.leagueOverallFg}
        onZoneHover={setZoneInfo}
      />
      <GuessInput players={index.players} onGuess={(name) => console.log("Palpite:", name)} />
    </main>
    );

}