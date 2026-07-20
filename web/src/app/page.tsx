"use client";

import { useEffect, useState } from "react";  
import type { GameIndex, PlayerSummary, Hex } from "@/types";
import { pickPlayerIndex, randomSeed } from "@/lib/random";

export default function Home() {
  const [index, setIndex] = useState<GameIndex | null>(null);
  const [secretPlayer, setSecretPlayer] = useState<PlayerSummary | null>(null);
  const [secretHexes, setSecretHexes] = useState<Hex[], null>(null);

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
      </p>
      <p className="mt-4 text-sm text-red-400">DEBUG: {secretPlayer.name}</p>
    </main>
    );

}