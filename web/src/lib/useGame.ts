"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameIndex, Hex, HexStats, ZoneTypes } from "@/lib/types";
import type { GameState } from "@/lib/game";
import { recordArchiveResult, recordResult } from "@/lib/storage";

interface TodayResponse extends GameState {
    hexes: Hex[];
    zoneTypes: ZoneTypes;
}

export function useGame(season: string, day?: string) {
    const [index, setIndex] = useState<GameIndex | null>(null);
    const [game, setGame] = useState<GameState | null>(null);
    const [secretHexes, setSecretHexes] = useState<Hex[] | null>(null);
    const [hexStats, setHexStats] = useState<HexStats | null>(null);
    const [zoneTypes, setZoneTypes] = useState<ZoneTypes | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [todayRes, indexRes, hexStatsRes] = await Promise.all([
                    fetch(day ? `/api/game?day=${encodeURIComponent(day)}` : "/api/game"),
                    fetch(`/data/seasons/${season}/index.json`),
                    fetch(`/data/seasons/${season}/hex_stats.json`),
                ]);

                if (!todayRes.ok || !indexRes.ok || !hexStatsRes.ok) {
                    throw new Error("unexpected response");
                }

                const { hexes, zoneTypes: zones, ...state }: TodayResponse = await todayRes.json();
                setSecretHexes(hexes);
                setZoneTypes(zones);
                setGame(state);
                setIndex(await indexRes.json());
                setHexStats(await hexStatsRes.json());
            } catch {
                setError("Couldnt load game.");
            }
        }

        load();
    }, [season, day]);

    useEffect(() => {
        if (!game || game.status === "playing") return;

        const won = game.status === "won";

        // Archive keeps its own record; it never touches streaks or distribution.
        if (day) recordArchiveResult(day, won, game.guesses.length);
        else recordResult(won, game.guesses.length);
    }, [game, day]);

    const guess = useCallback(async (name: string) => {
        try {
            const res = await fetch("/api/guess", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(day ? { name, day } : { name }),
            });
            if (!res.ok) throw new Error("Guess Declined");

            setGame(await res.json());
            setError(null);
        } catch {
            setError("Could not register guess.");
        }
    }, [day]);

    return { index, game, secretHexes, hexStats, zoneTypes, guess, error };

}