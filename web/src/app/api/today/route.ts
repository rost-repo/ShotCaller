import { dayKey } from "@/lib/day";
import { deriveGame, getTodaysPlayer, loadPlayer } from "@/lib/secret";
import { readSession } from "@/lib/sessionCookie";
import { toApiErrorResponse } from "@/lib/apiErrors";
import { NextResponse } from "next/server";

export async function GET() {
    const { player, season } = await getTodaysPlayer();
    const { hexes, zoneTypes } = await loadPlayer(season, player.id);

    let session;

    try {
        session = await readSession();
    } catch (error) {
        const response = toApiErrorResponse(error);
        if (response) return response;

        throw error;
    }

    const guesses = session?.day === dayKey() ? session.guesses : [];

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