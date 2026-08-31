"use client";

import { useRef, useState, useEffect } from "react";
import { BarChart3, X } from "lucide-react";
import type { Stats } from "@/lib/types";
import { loadStats } from "@/lib/storage";

export default function StatsDialog( {autoOpen}: { autoOpen: boolean}) {
    const ref = useRef<HTMLDialogElement>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const maxCount = Math.max(...(stats?.distribution ?? [0]), 1);
    const wins = stats?.distribution.reduce((a, b) => a + b, 0) ?? 0;
    function open() {
        setStats(loadStats());
        ref.current?.showModal();
    }
    const sawPlaying = useRef(false);

    useEffect(() => {
        // Only fire on the transition to finished, not on every reload of a finished game.
        if (!autoOpen) {
            sawPlaying.current = true;
            return;
        }

        if (!sawPlaying.current) return;

        const timer = setTimeout(() => {
            setStats(loadStats());
            ref.current?.showModal();
        }, 1200);

        return () => clearTimeout(timer);
    }, [autoOpen]);
    return (
        <>
            <button
                onClick={open}
                aria-label="Statistics"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-hairline bg-surface text-fg"
            >
                <BarChart3 size={18} />
            </button>

            <dialog
                ref={ref}
                className="m-auto w-[min(92vw,420px)] rounded-2xl border-[3px] border-ink bg-paper p-6 text-ink shadow-sticker-lg backdrop:bg-ink/60"
            >
                <button onClick={() => ref.current?.close()} aria-label="Close" className="absolute top-4 right-4">
                    <X size={20} />
                </button>

                <h2 className="font-display text-xl">STATISTICS</h2>

                {stats && (
                    <>
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                        {[
                            { value: stats.played, label: "Played" },
                            { value: stats.played === 0 ? 0 : Math.round((wins / stats.played) * 100), label: "Win %" },
                            { value: stats.currentStreak, label: "Current streak" },
                            { value: stats.maxStreak, label: "Max streak" },
                        ].map((m) => (
                            <div key={m.label}>
                                <p className="font-stat text-2xl font-bold">{m.value}</p>
                                <p className="text-[10px] leading-tight text-ink-muted uppercase">{m.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5">
                            <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
                                Guess distribution
                            </p>
                            <div className="mt-2 space-y-1">
                                {stats.distribution.map((count, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="font-stat w-3 text-[13px] text-ink-muted">{i + 1}</span>
                                        <div
                                            className="flex justify-end rounded-sm bg-primary px-1.5 py-0.5"
                                            style={{ width: `${Math.max((count / maxCount) * 100, 8)}%` }}
                                        >
                                            <span className="font-stat text-[12px] text-on-primary">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </dialog>
        </>
    );
}