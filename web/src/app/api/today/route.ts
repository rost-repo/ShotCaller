import { dayKey } from "@/lib/day";
import { deriveGame, getTodaysPlayer, loadPlayer } from "@/lib/secret";
import { readSession } from "@/lib/sessionCookie";
import { NextResponse } from "next/server";


export async function GET() {
    const player = await getTodaysPlayer();
    const { hexes, zoneTypes } = await loadPlayer(player.id);

    const session = await readSession();
    const guesses = session?.day === dayKey() ? session.guesses : [];

    const { status, hints } = deriveGame(player, guesses);

    return NextResponse.json({
        hexes,
        zoneTypes,
        guesses,
        status,
        hints,
        answer: status === "playing" ? null : player.name,
    })
    
}