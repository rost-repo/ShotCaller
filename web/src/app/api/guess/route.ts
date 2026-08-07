import { dayKey } from "@/lib/day";
import { addGuess, deriveGame, getTodaysPlayer, loadIndex } from "@/lib/secret";
import { readSession, writeSession } from "@/lib/sessionCookie";
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

    const session = await readSession();
    const previous = session?.day === today ? session.guesses : [];

    if (deriveGame(player, previous).status !== "playing"){
        return NextResponse.json({ error: "game ended." }, { status: 409 });
    }

    const guesses = addGuess(previous, name);
    const { status, hints } = deriveGame(player, guesses);

    await writeSession({ day: today, guesses});
    
    return NextResponse.json({
        guesses,
        status,
        hints,
        answer: status === "playing" ? null : player.name,
    })

}