"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameIndex, Hex, HexStats, ZoneTypes } from "@/lib/types";
import type { GameState } from "@/lib/game";
import { recordResult } from "@/lib/storage";

interface TodayResponse extends GameState {
    hexes: Hex[];
    zoneTypes: ZoneTypes;
}

export function useGame() {
    const [index, setIndex] = useState<GameIndex | null>(null);
    const [game, setGame] = useState<GameState | null>(null);
    const [secretHexes, setSecretHexes] = useState<Hex[] | null>(null);
    const [hexStats, setHexStats] = useState<HexStats | null>(null);
    const [zoneTypes, setZoneTypes] = useState<ZoneTypes | null>(null);

    useEffect(() => {
        fetch("/api/today")
            .then((r) => r.json())
            .then(({ hexes, zoneTypes: zones, ...state }: TodayResponse) => {
                setSecretHexes(hexes);
                setZoneTypes(zones);
                setGame(state);
            });

        fetch("/data/index.json").then((r) => r.json()).then(setIndex);
        fetch("/data/hex_stats.json").then((r) => r.json()).then(setHexStats);
    }, []);

    useEffect(() => {        
        if (game && game.status !== "playing") {
            recordResult(game.status === "won", game.guesses.length);
        }
    }, [game]);

    const guess = useCallback(async (name: string) => {
        const res = await fetch("/api/guess", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) return;

        setGame(await res.json());
    }, []);

    return { index, game, secretHexes, hexStats, zoneTypes, guess };

}