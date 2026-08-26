import { SignJWT, jwtVerify } from "jose";

export class SessionConfigurationError extends Error {
    readonly code = "SESSION_SECRET_MISSING";

    constructor() {
        super("SESSION_SECRET is not configured");
        this.name = "SessionConfigurationError";
    }
}

export interface SessionPayload {
    day: string;
    guesses: string[];
}

function getSecret(): Uint8Array {
    const raw = process.env.SESSION_SECRET;
    if (!raw) throw new SessionConfigurationError();
    return new TextEncoder().encode(raw);
}

export async function signSession( payload: SessionPayload ): Promise<string> {
    return new SignJWT({...payload})
        .setProtectedHeader({ alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("2d")
        .sign(getSecret());
}

function isSessionPayload( value: unknown ): value is SessionPayload {
    if (typeof value !== "object" || value === null) return false;
    const { day, guesses } = value as Record<string, unknown>;
    
    return typeof day === "string"
        && Array.isArray(guesses)
        && guesses.every((g) => typeof g === "string");
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    const secret = getSecret()
    try {
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ["HS256"],
        });
        return isSessionPayload(payload) ? payload : null;
    } catch {
        return null;
    }
}