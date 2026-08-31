import { dayKey, isPlayableDay } from "@/lib/day";
import { deriveGame, getPlayerForDay, loadPlayer } from "@/lib/secret";
import { cookieForDay, readSession } from "@/lib/sessionCookie";
import { toApiErrorResponse } from "@/lib/apiErrors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const today = dayKey();
    const day = new URL(request.url).searchParams.get("day") ?? today;

    if (!isPlayableDay(day, today)) {
        return NextResponse.json({ error: "unplayable day" }, { status: 400 });
    }

    const { player, season } = await getPlayerForDay(day);
    const { hexes, zoneTypes } = await loadPlayer(season, player.id);

    let session;

    try {
        session = await readSession(cookieForDay(day, today));
    } catch (error) {
        const response = toApiErrorResponse(error);
        if (response) return response;

        throw error;
    }

    const guesses = session?.day === day ? session.guesses : [];

    const { status, hints } = deriveGame(player, guesses);

    return NextResponse.json({
        hexes,
        zoneTypes,
        guesses,
        status,
        hints,
        answer: status === "playing" ? null : player.name,
    });
}
