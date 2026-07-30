"use client";

import { Lock } from "lucide-react";
import type { PlayerSummary } from "@/lib/types";
import { HINTS } from "@/lib/game";

interface HintPanelProps {
    player: PlayerSummary;
    hintsUsed: number;
}

export default function HintPanel({ player, hintsUsed}: HintPanelProps) {
    return (
        <div className="flex">
            {HINTS.map((hint, i) => (
                <div key={hint.label} className={`flex flex-1 items-center justify-center gap-1.25 px-1.5 h-10 
                    ${i === HINTS.length - 1 ? "" : "border-r-2 border-ink"}
                    ${i < hintsUsed ? "bg-primary" : "bg-paper"}`}
                >
                {i < hintsUsed ? (
                    <>
                        <span className="font-stat text-[18px] font-bold text-ink animate-pop">
                            {hint.getValue(player)}
                        </span>
                    </>
                ) : (
                    <>
                        <Lock size={14} className="text-ink-muted" />
                        <span className="text-[12px] font-bold tracking-[0.05em] text-ink-muted uppercase">
                            <span className="sm:hidden">{hint.shortLabel}</span>
                            <span className="hidden sm:inline">{hint.label}</span>
                        </span>
                    </>
                )}
                </div>
            ))}
        </div>
    );
}
