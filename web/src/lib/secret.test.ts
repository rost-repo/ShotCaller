import { describe, it, expect } from "vitest";
import { deriveGame, addGuess, poolForDay, idForDay, CYCLE_LENGTH, Pool } from "./secret";
import { MAX_GUESSES, MAX_HINTS } from "./game";
import type { PlayerSummary } from "./types";

const CORRECT = "Nikola Jokic";

const player: PlayerSummary = {
    id: 1, name: CORRECT, team: "DEN", position: "C", age: 30, conference: "West",
    rookieYear: 0, jersey: "1", height: "6-11", division: "Northwest",
    stats: { pts: 27, ast: 9, reb: 12 },
};

const wrongGuesses = (n: number) => Array.from({ length: n }, (_, i) => `Wrong ${i}`);

describe("deriveGame", () => {
    it("wins on the correct guess", () => {
        expect(deriveGame(player, [CORRECT]).status).toBe("won");
    });

    it("keeps playing after a wrong guess", () => {
        expect(deriveGame(player, ["Stephen Curry"]).status).toBe("playing");
    });

    it("loses when guesses run out", () => {
        expect(deriveGame(player, wrongGuesses(MAX_GUESSES)).status).toBe("lost");
    });

    it("treats a correct final guess as a win, not a loss", () => {
        const guesses = [...wrongGuesses(MAX_GUESSES - 1), CORRECT];
        expect(deriveGame(player, guesses).status).toBe("won");
    });

    it("reveals one hint per guess", () => {
        expect(deriveGame(player, []).hints).toHaveLength(0);
        expect(deriveGame(player, wrongGuesses(1)).hints).toHaveLength(1);
        expect(deriveGame(player, wrongGuesses(2)).hints).toHaveLength(2);
    });

    it("never reveals more hints than exist", () => {
        expect(deriveGame(player, wrongGuesses(MAX_GUESSES)).hints).toHaveLength(MAX_HINTS);
    });
});

describe("addGuess", () => {
    it("appends a new guess", () => {
        expect(addGuess(["Stephen Curry"], CORRECT)).toEqual(["Stephen Curry", CORRECT]);
    });

    it("ignores a repeated guess", () => {
        expect(addGuess(["Stephen Curry"], "Stephen Curry")).toEqual(["Stephen Curry"]);
    });

    it("does not mutate the original array", () => {
        const previous = ["Stephen Curry"];
        addGuess(previous, CORRECT);
        expect(previous).toEqual(["Stephen Curry"]);
    });
});

const pools: Pool[] = [
    { from: "2000-01-01", season: "2025-26", ids: [1, 2, 3] },
    { from: "2027-10-01", season: "2027-28", ids: [1, 2, 3, 4] },
];

describe("poolForDay", () => {
    it("ignores pools that start in the future", () => {
        expect(poolForDay(pools, "2026-08-09").from).toBe("2000-01-01");
    });

    it("picks the newest pool already in effect", () => {
        expect(poolForDay(pools, "2027-11-15").from).toBe("2027-10-01");
    });

    it("includes the day a pool starts", () => {
        expect(poolForDay(pools, "2027-10-01").from).toBe("2027-10-01");
    });

    it("keeps a past day on the pool it was played with", () => {
        expect(poolForDay(pools, "2026-08-09").ids).toHaveLength(3);
    });

    it("carries the season of the pool in effect", () => {
        expect(poolForDay(pools, "2027-11-15").season).toBe("2027-28");
    });

    it("throws when no pool applies", () => {
        expect(() => poolForDay([{ from: "2030-01-01", season: "2030-31", ids: [1] }], "2026-08-09")).toThrow();
    });
});

function addDays(day: string, n: number): string {
    const d = new Date(`${day}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

const cyclePool: Pool = { from: "2026-01-01", season: "2025-26", ids: [11, 22, 33, 44, 55] };

describe("idForDay", () => {
    it("uses every player before repeating one", () => {
        const drawn = cyclePool.ids.map((_, i) => idForDay(cyclePool, addDays(cyclePool.from, i)));
        expect(new Set(drawn).size).toBe(cyclePool.ids.length);
    });

    it("draws each player exactly once per cycle", () => {
        const len = cyclePool.ids.length;
        const drawn = Array.from({ length: len * 2 }, (_, i) => idForDay(cyclePool, addDays(cyclePool.from, i)));

        for (const id of cyclePool.ids) {
            expect(drawn.filter((d) => d === id)).toHaveLength(2);
        }
    });

    it("is deterministic for the same day", () => {
        expect(idForDay(cyclePool, "2026-03-05")).toBe(idForDay(cyclePool, "2026-03-05"));
    });

    it("uses only CYCLE_LENGTH players when the pool is bigger", () => {
        const big: Pool = { from: "2026-01-01", season: "2025-26", ids: Array.from({ length: 130 }, (_, i) => i + 1) };
        const drawn = Array.from({ length: CYCLE_LENGTH }, (_, i) => idForDay(big, addDays(big.from, i)));

        expect(new Set(drawn).size).toBe(CYCLE_LENGTH);
    });

    it("only draws ids that are in the pool", () => {
        const drawn = Array.from({ length: 40 }, (_, i) => idForDay(cyclePool, addDays(cyclePool.from, i)));
        expect(drawn.every((d) => cyclePool.ids.includes(d))).toBe(true);
    });
});
