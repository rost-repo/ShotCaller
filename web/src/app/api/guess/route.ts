import { dayKey, isPlayableDay } from "@/lib/day";
import { addGuess, deriveGame, getPlayerForDay, loadIndex } from "@/lib/secret";
import { cookieForDay, readSession, writeSession } from "@/lib/sessionCookie";
import { toApiErrorResponse } from "@/lib/apiErrors";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name : null;

    if (!name){
        return NextResponse.json({ error: "invalid guess"}, { status: 400});
    }

    const today = dayKey();
    const day: string = typeof body?.day === "string" ? body.day : today;

    if (!isPlayableDay(day, today)) {
        return NextResponse.json({ error: "unplayable day" }, { status: 400 });
    }

    const { player, season } = await getPlayerForDay(day);

    const index = await loadIndex(season);
    if (!index.players.some((p) => p.name === name)) {
        return NextResponse.json({ error: "Unknown Player" }, { status: 400 });
    }

    const cookie = cookieForDay(day);
    let session;

    try {
        session = await readSession(cookie);
    } catch (error) {
        const response = toApiErrorResponse(error);
        if (response) return response;

        throw error;
    }

    const previous = session?.day === day ? session.guesses : [];
    const current = deriveGame(player, previous);

    // The client disables its input after the game ends, but the API must
    // enforce that invariant too: callers can submit requests directly.
    if (current.status !== "playing") {
        return NextResponse.json({ error: "game already finished" }, { status: 409 });
    }

    const guesses = addGuess(previous, name);
    const { status, hints } = deriveGame(player, guesses);

    try {
        await writeSession(cookie, { day, guesses });
    } catch (error) {
        const response = toApiErrorResponse(error);
        if (response) return response;

        throw error;
    }

    console.info("guess submitted", {
        day,
        guess: name,
        attempt: guesses.length,
    });

    if (status !== "playing") {
        console.info("game finished", {
            day,
            result: status,
            attempts: guesses.length,
        });
    }

    return NextResponse.json({
        guesses,
        status,
        hints,
        answer: status === "playing" ? null : player.name,
    });
}
