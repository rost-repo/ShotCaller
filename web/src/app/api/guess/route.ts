import { dayKey } from "@/lib/day";
import { addGuess, deriveGame, getTodaysPlayer, loadIndex } from "@/lib/secret";
import { readSession, writeSession } from "@/lib/sessionCookie";
import { toApiErrorResponse } from "@/lib/apiErrors";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name : null;

    if (!name){
        return NextResponse.json({ error: "invalid guess"}, { status: 400});
    }

    const index = await loadIndex();
    if (!index.players.some((p) => p.name === name)) {
        return NextResponse.json({ error: "Unknown Player" }, { status: 400 });
    }

    const player = await getTodaysPlayer();
    const today = dayKey();

    let session;

    try {
        session = await readSession();
    } catch (error) {
        const response = toApiErrorResponse(error);
        if (response) return response;

        throw error;
    }
    const previous = session?.day === today ? session.guesses : [];

    const guesses = addGuess(previous, name);
    const { status, hints } = deriveGame(player, guesses);

    try {
        await writeSession({ day: today, guesses });
    } catch (error) {
        const response = toApiErrorResponse(error);
        if (response) return response;

        throw error;
    }

    return NextResponse.json({
        guesses,
        status,
        hints,
        answer: status === "playing" ? null : player.name,
    });
}