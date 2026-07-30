"use client";

import { Trophy, CircleX, Share2, Check} from "lucide-react";
import { GuessResult } from "@/lib/game";
import { useState } from "react";

interface GameOverPanelProps {
    won: boolean;
    playerName: string;
    results: GuessResult[];
    total: number;
    shareText: string;
}

export default function GameOverPanel({ won, playerName, results, total, shareText }: GameOverPanelProps) {
    const Icon = won ? Trophy : CircleX;
    const [copied, setCopied] = useState(false);

    async function copy() {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex flex-col items-center justify-center gap-2.5 px-5 py-10 text-center">
            <div
                className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-ink shadow-sticker ${
                    won ? "bg-success" : "bg-danger"
                }`}
            >
                <Icon size={40} className="text-ink" />
            </div>

            <p
                className={`font-display mt-1 text-[26px] [-webkit-text-stroke:1.5px_var(--ink)] ${
                    won ? "text-success" : "text-danger"
                }`}
            >
                {won ? "YOU GOT IT!" : "OUT OF GUESSES"}
            </p>
            <p className="text-[15px] text-ink-muted">
                It was <strong className="text-ink">{playerName}</strong>
                {won && ` — ${results.length} of ${total} guesses`}
            </p>
            <div className="mt-2 flex gap-1.5">
                {Array.from({ length: total }).map((_, i) => {
                    const result = results[i];
                    return (
                        <div
                            key={i}
                            className={`h-[26px] w-[26px] rounded-md border-2 border-ink ${
                                result === undefined
                                    ? "bg-surface-2"
                                    : result.correct
                                        ? "bg-success"
                                        : "bg-danger"
                            }`}
                        />
                    );
                })}
            </div>
            <button
                onClick={copy}
                className="font-display mt-1.5 flex items-center gap-1.5 rounded-[10px] border-[3px] border-ink bg-primary px-5 py-[11px] text-[13px] text-ink shadow-sticker"
            >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? "Copied!" : "Copy results"}
            </button>
        </div>
        
    );
}