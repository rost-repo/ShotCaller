import { cookies } from "next/headers";
import { signSession, verifySession, type SessionPayload } from "./sessions";

const SESSION_COOKIE_PREFIX = "shotcaller_session_";

// A game keeps the same cookie after UTC midnight, even if its page remains open.
export function cookieForDay(day: string): string {
    return `${SESSION_COOKIE_PREFIX}${day}`;
}

export async function readSession(name: string): Promise<SessionPayload | null> {
    const store = await cookies()
    const token = store.get(name)?.value;
    if (!token) return null;

    return verifySession(token);
}

export async function writeSession(name: string, payload:SessionPayload): Promise<void> {
    const token = await signSession(payload);
    const store = await cookies();

    store.set(name, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 48,
    })
}
