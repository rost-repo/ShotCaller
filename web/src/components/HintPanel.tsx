"use client";

import type { PlayerSummary } from "@/lib/types";
import { HINTS } from "@/lib/game";

interface HintPanelProps {
    player: PlayerSummary;
    hintsUsed: number;
}

export default function HintPanel({ player, hintsUsed}: HintPanelProps) {
    return (
        <div className="flex gap-3">
            {HINTS.map((hint, i) => (
                <div key={hint.label} className="flex-1 rounded-lg border p-3 text-center">
                    <p className="text-xs uppercase text-gray-400">{hint.label}</p>
                    {i < hintsUsed ? (
                        <p className="text-lg font-bold">{hint.getValue(player)}</p>
                    ) : (
                        <p className="text-lg text-gray-300">🔒</p>
                    )}
                </div>
            ))}
        </div>
    );
}
