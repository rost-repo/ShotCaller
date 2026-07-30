"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function HelpDialog() {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!localStorage.getItem("seenHelp")) {
            ref.current?.showModal();
            localStorage.setItem("seenHelp", "1");
        }
    }, []);

    return (
        <>
            <button
                onClick={() => ref.current?.showModal()}
                aria-label="How to play"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-hairline bg-surface text-fg"
            >
                ?
            </button>

            <dialog
                ref={ref}
                className="m-auto w-[min(92vw,480px)] rounded-2xl border-[3px] border-ink bg-paper p-6 text-ink shadow-sticker-lg backdrop:bg-ink/60"
            >
                <button
                    onClick={() => ref.current?.close()}
                    aria-label="Close"
                    className="absolute top-4 right-4"
                >
                    <X size={20} />
                </button>

                <h2 className="font-display text-xl">HOW TO PLAY</h2>
                <div className="mt-4 space-y-4 text-[15px] leading-relaxed">
                    <p>
                        Every hexagon is a spot on the court where the mystery player
                        has taken shots this season.<br></br>Read the map, then name the player
                        in six guesses.
                    </p>

                    <div>
                        <p className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
                            Size = Volume of shots from that spot
                        </p>
                        <div className="flex items-end gap-2">
                            {[3, 5, 7, 9, 11].map((r) => (
                                <svg key={r} width={r * 2} height={r * 2.2} viewBox="0 0 24 26">
                                    <polygon points="12,1 23,7.5 23,19.5 12,25 1,19.5 1,7.5"
                                            fill="var(--surface-2)" stroke="var(--ink)" strokeWidth={2} />
                                </svg>
                            ))}
                            <span className="ml-1 text-[13px] text-ink-muted">Few → More Shots</span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
                            Color = accuracy vs. the league average at that exact spot
                        </p>
                        <div className="flex h-7 overflow-hidden rounded-md border-2 border-ink">
                            {["#5458A2", "#6689BB", "#FADC97", "#F08460", "#B02B48"].map((c) => (
                                <div key={c} className="flex-1" style={{ background: c }} />
                            ))}
                        </div>
                        <div className="mt-1 flex justify-between text-[13px] text-ink-muted">
                            <span>colder than average</span>
                            <span>hotter</span>
                        </div>
                    </div>

                    <p>
                        Hover any hexagon to see the exact numbers for that area.
                        Each guess unlocks a new clue.
                    </p>
                </div>
            </dialog>
        </>
    );
}