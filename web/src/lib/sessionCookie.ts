import { cookies } from "next/headers";
import { signSession, verifySession, type SessionPayload } from "./sessions";

const COOKIE_NAME = "shotcaller_session"

export async function readSession(): Promise<SessionPayload | null> {
    const store = await cookies()
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;

    return verifySession(token);
}

export async function writeSession(payload:SessionPayload): Promise<void> {
    const token = await signSession(payload);
    const store = await cookies();

    store.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 48,
    })
}