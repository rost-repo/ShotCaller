import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GameIndex, PlayerHexes, PlayerSummary } from "./types";
import { shuffled } from "./random";
import { dayKey, daysBetween, seedForDay } from "./day";
import { GameStatus, HINTS, MAX_GUESSES, MAX_HINTS } from "./game";

const indexCache = new Map<string, GameIndex>();

export async function loadIndex(season: string): Promise<GameIndex> {
    const cached = indexCache.get(season);
    if (cached) return cached;

    const file = path.join(process.cwd(), "public", "data", "seasons", season, "index.json");
    const parsed = JSON.parse(await readFile(file, "utf-8")) as GameIndex;

    indexCache.set(season, parsed);
    return parsed;
}

const playerCache = new Map<string, PlayerHexes>();

export async function loadPlayer(season: string, id: number): Promise<PlayerHexes> {
    const key = `${season}/${id}`;
    const cached = playerCache.get(key)
    if (cached) return cached;

    const file = path.join(process.cwd(), "data", "seasons", season, "players", `${id}.json`);
    const parsed = JSON.parse(await readFile(file, "utf-8")) as PlayerHexes;

    playerCache.set(key, parsed);
    return parsed;
}

export interface Pool {
    from: string;
    season: string;
    ids: number[];
}

let poolsCache: Pool[] | null = null;

export async function loadPools(): Promise<Pool[]> {
    if (poolsCache) return poolsCache;

    const file = path.join(process.cwd(), "data", "pools.json");
    const parsed = JSON.parse(await readFile(file, "utf-8")) as Pool[];

    poolsCache = parsed;
    return parsed;
}

export function poolForDay(pools: Pool[], day: string): Pool {
    let chosen: Pool | null = null;

    for (const pool of pools) {
        if (pool.from <= day) chosen = pool;
        else break;
    }

    if (!chosen) throw new Error(`nenhum pool vigente em ${day}`);
    return chosen;
}

export async function seasonForDay(day: string): Promise<string> {
    const pools = await loadPools();
    return poolForDay(pools, day).season;
}

export interface DayPlayer {
    player: PlayerSummary;
    season: string;
}

// Days per shuffle. Shorter than the pool, so a cycle never consumes every player.
export const CYCLE_LENGTH = 65;

// Walks a shuffled pool in order, so no player repeats within a cycle.
export function idForDay(pool: Pool, day: string): number {
    const length = Math.min(CYCLE_LENGTH, pool.ids.length);

    const elapsed = daysBetween(pool.from, day);
    const cycle = Math.floor(elapsed / length);
    const position = elapsed % length;

    return shuffled(pool.ids, seedForDay(pool.from) + cycle)[position];
}

export async function getPlayerForDay(day: string): Promise<DayPlayer> {
    const pools = await loadPools();
    const pool = poolForDay(pools, day);

    const id = idForDay(pool, day);
    const index = await loadIndex(pool.season);

    const player = index.players.find((p) => p.id === id);
    if (!player) throw new Error(`player ${id} from pool is not on index`);

    return { player, season: pool.season };
}

export async function getTodaysPlayer(): Promise<DayPlayer> {
    return getPlayerForDay(dayKey());
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