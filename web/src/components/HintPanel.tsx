"use client";

import { Lock } from "lucide-react";
import { HINTS } from "@/lib/game";

interface HintPanelProps {
    hints: string[];
}

export default function HintPanel({ hints }: HintPanelProps) {
    return (
        <div className="flex overflow-x-auto">
            {HINTS.map((hint, i) => (
                <div key={hint.label} className={`flex grow shrink-0 basis-auto items-center justify-center gap-1.25 px-1.5 h-10 sm:shrink sm:basis-0 
                    ${i === HINTS.length - 1 ? "" : "border-r-2 border-ink"}
                    ${i < hints.length ? "bg-primary" : "bg-paper"}`}
                >
                {i < hints.length ? (
                    <>
                        <span className="font-stat text-[18px] font-bold whitespace-nowrap text-ink animate-pop">
                            {hints[i]}
                        </span>
                    </>
                ) : (
                    <>
                        <Lock size={14} className="text-ink-muted" />
                        <span className="text-[12px] font-bold tracking-wider text-ink-muted uppercase">
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
