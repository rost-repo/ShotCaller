import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GameIndex, PlayerHexes, PlayerSummary } from "./types";
import { pickPlayerIndex } from "./random";
import { dailySeed } from "./day";
import { GameStatus, HINTS, MAX_GUESSES, MAX_HINTS } from "./game";

let indexCache: GameIndex | null = null;

export async function loadIndex(): Promise<GameIndex> {
    if (indexCache) return indexCache;

    const file = path.join(process.cwd(), "public", "data", "index.json");
    const parsed = JSON.parse(await readFile(file, "utf-8")) as GameIndex;

    indexCache = parsed;
    return parsed;
}

const playerCache = new Map<number, PlayerHexes>();

export async function loadPlayer(id:number): Promise<PlayerHexes> {
    const cached = playerCache.get(id)
    if (cached) return cached;

    const file = path.join(process.cwd(), "data", "players", `${id}.json`);
    const parsed = JSON.parse(await readFile(file, "utf-8")) as PlayerHexes;

    playerCache.set(id, parsed);
    return parsed;
}

export async function getTodaysPlayer(): Promise<PlayerSummary> {
    const index = await loadIndex();
    return index.players[pickPlayerIndex(index.players.length, dailySeed())]
}

export interface DerivedGame {
    status: GameStatus;
    hints: string[];
}

export function deriveGame(player: PlayerSummary, guesses: string[]): DerivedGame {
    const won = guesses.includes(player.name);
    const status: GameStatus = won
        ? "won"
        : guesses.length >= MAX_GUESSES
            ? "lost"
            : "playing";

    const revealed = Math.min(guesses.length, MAX_HINTS);
    const hints = HINTS.slice(0, revealed).map((h) => h.getValue(player));

    return { status, hints};
}

export function addGuess(previous: string[], name: string): string[] {
    return previous.includes(name) ? previous : [...previous, name];
}