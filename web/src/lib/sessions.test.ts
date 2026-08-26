import { afterEach, describe, expect, it } from "vitest";
import { signSession } from "./sessions";

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