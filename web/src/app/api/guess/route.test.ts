import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlayerSummary } from "@/lib/types";

const DAY = "2026-08-31";
const PLAYER: PlayerSummary = {
    id: 1,
    name: "Nikola Jokic",
    team: "DEN",
    position: "C",
    age: 30,
    conference: "West",
    division: "Northwest",
    rookieYear: 2014,
    jersey: "15",
    height: "6-11",
    stats: { pts: 27, ast: 9, reb: 12 },
};

vi.mock("@/lib/day", () => ({
    dayKey: () => DAY,
    isPlayableDay: () => true,
}));

vi.mock("@/lib/secret", () => ({
    addGuess: vi.fn(),
    deriveGame: vi.fn(),
    getPlayerForDay: vi.fn(),
    loadIndex: vi.fn(),
}));

vi.mock("@/lib/sessionCookie", () => ({
    cookieForDay: vi.fn(() => "session"),
    readSession: vi.fn(),
    writeSession: vi.fn(),
}));

vi.mock("@/lib/apiErrors", () => ({ toApiErrorResponse: vi.fn() }));

import { POST } from "./route";
import { addGuess, deriveGame, getPlayerForDay, loadIndex } from "@/lib/secret";
import { readSession, writeSession } from "@/lib/sessionCookie";

const mockAddGuess = vi.mocked(addGuess);
const mockDeriveGame = vi.mocked(deriveGame);
const mockGetPlayerForDay = vi.mocked(getPlayerForDay);
const mockLoadIndex = vi.mocked(loadIndex);
const mockReadSession = vi.mocked(readSession);
const mockWriteSession = vi.mocked(writeSession);

describe("POST /api/guess", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetPlayerForDay.mockResolvedValue({ player: PLAYER, season: "2025-26" });
        mockLoadIndex.mockResolvedValue({
            season: "2025-26",
            players: [PLAYER],
            leagueAverages: {},
            leagueOverallFg: 0,
        });
        mockReadSession.mockResolvedValue({ day: DAY, guesses: ["Stephen Curry"] });
    });

    it.each(["won", "lost"] as const)("rejects guesses after a %s game", async (status) => {
        mockDeriveGame.mockReturnValue({ status, hints: [] });

        const response = await POST(new Request("http://localhost/api/guess", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: PLAYER.name }),
        }));

        expect(response.status).toBe(409);
        await expect(response.json()).resolves.toEqual({ error: "game already finished" });
        expect(mockAddGuess).not.toHaveBeenCalled();
        expect(mockWriteSession).not.toHaveBeenCalled();
    });
});
