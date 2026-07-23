"use client";

import type { PlayerSummary } from "@/lib/types";
import { HINT_PENALTY, HINTS, canUnlockHint } from "@/lib/game";

interface HintPanelProps {
    player: PlayerSummary;
    hintsUsed: number;
    wrongGuesses: number;
    onUseHint: ()=> void;
}

const HINT_LABES = ["Age", "Position", "Conference", "Height", "Rookie Year", "Jersey"];

export default function HintPanel({ player, hintsUsed, wrongGuesses, onUseHint}: HintPanelProps) {
    const canUnlock = canUnlockHint(wrongGuesses, hintsUsed);

    return(
        <div className="flex gap-3">
            {HINTS.map((hint, i) => (
                <div key={hint.label} className="flex-1 rounded-lg border p-3 text-center"> 
                    <p className="text-xs uppercase text-gray-400">{hint.label}</p>
                    {i < hintsUsed ? (
                        <p className="text-lg font-bold">{hint.getValue(player)}</p>
                    ) :  i === hintsUsed && canUnlock ? (
                        <button onClick={onUseHint} className="text-sm text-blue-600 underline">
                            Reveal Hint (-{HINT_PENALTY} pts)
                        </button>
                    ) : (
                        <p className="text-lg text-gray-300">🔒</p>
                    )
                    }
                </div>
            ))

            }
        </div>
    );

}
