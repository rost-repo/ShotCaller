import { afterEach, describe, expect, it } from "vitest";
import { signSession } from "./sessions";
import { cookieForDay } from "./sessionCookie";

const originalSessionSecret = process.env.SESSION_SECRET;

afterEach(() => {
    if (originalSessionSecret === undefined) {
        delete process.env.SESSION_SECRET;
    } else {
        process.env.SESSION_SECRET = originalSessionSecret;
    }
});

describe("session configuration", () => {
    it("reports a stable error when SESSION_SECRET is missing", async () => {
        delete process.env.SESSION_SECRET;

        await expect(
            signSession({
                day: "2026-08-17",
                guesses: [],
            }),
        ).rejects.toMatchObject({
            code: "SESSION_SECRET_MISSING",
        });
    });
});

describe("cookieForDay", () => {
    it("keeps sessions for different days separate", () => {
        expect(cookieForDay("2026-08-31")).toBe("shotcaller_session_2026-08-31");
        expect(cookieForDay("2026-09-01")).toBe("shotcaller_session_2026-09-01");
    });
});
