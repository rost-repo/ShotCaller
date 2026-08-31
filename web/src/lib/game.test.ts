import { describe, it, expect } from "vitest";
import { getPips, getWrongGuesses, buildShareText, MAX_GUESSES, type GameState } from "./game";

const CORRECT = "Nikola Jokic";

const state = (over: Partial<GameState> = {}): GameState => ({
    guesses: [],
    status: "playing",
    hints: [],
    answer: null,
    ...over,
});

const won = (guesses: string[]): GameState => state({ guesses, status: "won", answer: CORRECT });
const lost = (guesses: string[]): GameState => state({ guesses, status: "lost", answer: CORRECT });
const allWrong = Array.from({ length: MAX_GUESSES }, (_, i) => `Wrong ${i}`);

describe("getPips", () => {
    it("leaves unplayed slots empty", () => {
        expect(getPips(state({ guesses: ["Stephen Curry"] })))
            .toEqual(["wrong", "empty", "empty", "empty", "empty", "empty"]);
    });

    it("marks only the final guess as correct on a win", () => {
        expect(getPips(won(["Stephen Curry", CORRECT])))
            .toEqual(["wrong", "correct", "empty", "empty", "empty", "empty"]);
    });

    it("marks every guess wrong on a loss", () => {
        expect(getPips(lost(allWrong)))
            .toEqual(Array.from({ length: MAX_GUESSES }, () => "wrong"));
    });
});

describe("getWrongGuesses", () => {
    it("excludes the correct guess", () => {
        expect(getWrongGuesses(won(["Stephen Curry", CORRECT]))).toEqual(["Stephen Curry"]);
    });

    it("keeps every guess on a loss", () => {
        expect(getWrongGuesses(lost(["Stephen Curry", "LeBron James"])))
            .toEqual(["Stephen Curry", "LeBron James"]);
    });
});

describe("buildShareText", () => {
    const FIXED = "2026-07-29";

    it("marks the win and leaves unused slots blank", () => {
        expect(buildShareText(won(["Stephen Curry", CORRECT]), FIXED))
            .toBe("Shotcaller 2026-07-29 2/6\n🟥🟩⬜⬜⬜⬜");
    });

    it("uses X on a loss", () => {
        expect(buildShareText(lost(allWrong), FIXED))
            .toBe("Shotcaller 2026-07-29 X/6\n🟥🟥🟥🟥🟥🟥");
    });

    it("never leaks the player name", () => {
        expect(buildShareText(won([CORRECT]), FIXED)).not.toContain(CORRECT);
    });
});