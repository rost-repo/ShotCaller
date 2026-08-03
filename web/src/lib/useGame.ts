"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameIndex, Hex, HexStats, PlayerHexes, ZoneTypes } from "@/lib/types";
import { pickPlayerIndex, dailySeed } from "@/lib/random";
import { applyGuess, type GameState } from "@/lib/game";
import { loadTodayGuesses, saveTodayGuesses, recordResult } from "@/lib/storage";

export function useGame() {
    const [index, setIndex] = useState<GameIndex | null>(null);
    const [game, setGame] = useState<GameState | null>(null);
    const [secretHexes, setSecretHexes] = useState<Hex[] | null>(null);
    const [hexStats, setHexStats] = useState<HexStats | null>(null);
    const [zoneTypes, setZoneTypes] = useState<ZoneTypes | null>(null);

    const startNewGame = useCallback(async (idx: GameIndex) => {
        setSecretHexes(null);
        setZoneTypes(null);

        const secret = idx.players[pickPlayerIndex(idx.players.length, dailySeed())];
        const fresh: GameState = { secretPlayer: secret, guesses: [], hintsUsed: 0, status: "playing" };
        setGame(loadTodayGuesses().reduce(applyGuess, fresh));

        const res = await fetch(`/data/players/${secret.id}.json`);
        const data: PlayerHexes = await res.json();
        setSecretHexes(data.hexes);
        setZoneTypes(data.zoneTypes);
    }, []);

    useEffect(() => {
        fetch("/data/index.json")
            .then((r) => r.json())
            .then((idx: GameIndex) => {
                setIndex(idx);
                startNewGame(idx);
            });

        fetch("/data/hex_stats.json")
            .then((r) => r.json())
            .then(setHexStats);
    }, [startNewGame]);

    useEffect(() => {
        if (!game) return;
        saveTodayGuesses(game.guesses);
        
        if (game.status !== "playing") {
            recordResult(game.status === "won", game.guesses.length);
        }
    }, [game]);

    const guess = useCallback((name: string) => {
        setGame((g) => (g ? applyGuess(g, name) : g));
    }, []);

    return { index, game, secretHexes, hexStats, zoneTypes, guess };
}