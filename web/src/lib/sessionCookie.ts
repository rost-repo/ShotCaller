import { cookies } from "next/headers";
import { signSession, verifySession, type SessionPayload } from "./sessions";

const DAILY_COOKIE = "shotcaller_session"
const ARCHIVE_COOKIE = "shotcaller_archive"

// Separate jars: playing an old day must not touch the daily game in progress.
export function cookieForDay(day: string, today: string): string {
    return day === today ? DAILY_COOKIE : ARCHIVE_COOKIE;
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
