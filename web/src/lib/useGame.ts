"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameIndex, Hex, HexStats, ZoneTypes } from "@/lib/types";
import type { GameState } from "@/lib/game";
import { recordDayResult, recordResult } from "@/lib/storage";

interface GameResponse extends GameState {
    day: string;
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
    const [playedDay, setPlayedDay] = useState<string | null>(null);

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

                const { hexes, zoneTypes: zones, day: resolved, ...state }: GameResponse = await todayRes.json();
                setSecretHexes(hexes);
                setZoneTypes(zones);
                setPlayedDay(resolved);
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
        if (!game || game.status === "playing" || !playedDay) return;

        const won = game.status === "won";

        // Every finished game lands on the calendar; only the daily one moves streaks.
        recordDayResult(playedDay, won, game.guesses.length);
        if (!day) recordResult(won, game.guesses.length);
    }, [game, day, playedDay]);

    const guess = useCallback(async (name: string) => {
        if (!playedDay) {
            setError("Could not register guess.");
            return;
        }

        try {
            const res = await fetch("/api/guess", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name, day: playedDay }),
            });
            if (!res.ok) throw new Error("Guess Declined");

            setGame(await res.json());
            setError(null);
        } catch {
            setError("Could not register guess.");
        }
    }, [playedDay]);

    return { index, game, secretHexes, hexStats, zoneTypes, guess, error, playedDay };

}
