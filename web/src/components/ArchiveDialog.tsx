"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ArchiveResults } from "@/lib/types";
import { loadArchiveResults } from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/game";
import { FIRST_DAY, dayKey, daysInMonth, firstWeekday, monthOf, shiftMonth } from "@/lib/day";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function monthLabel(month: string): string {
    return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

export default function ArchiveDialog() {
    const ref = useRef<HTMLDialogElement>(null);
    const [results, setResults] = useState<ArchiveResults>({});
    const [lastDay, setLastDay] = useState<string | null>(null);
    const [month, setMonth] = useState<string | null>(null);

    // Clock and storage are read on open, never during render, so hydration stays stable.
    function open() {
        const last = dayKey(new Date(Date.now() - 86_400_000));

        setResults(loadArchiveResults());
        setLastDay(last);
        setMonth(monthOf(last));
        ref.current?.showModal();
    }

    return (
        <>
            <button
                onClick={open}
                aria-label="Archive"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-hairline bg-surface text-fg"
            >
                <CalendarDays size={18} />
            </button>

            <dialog
                ref={ref}
                className="m-auto w-[min(92vw,380px)] rounded-2xl border-[3px] border-ink bg-paper p-6 text-ink shadow-sticker-lg backdrop:bg-ink/60"
            >
                <button onClick={() => ref.current?.close()} aria-label="Close" className="absolute top-4 right-4">
                    <X size={20} />
                </button>

                <h2 className="font-display text-xl">ARCHIVE</h2>

                {month && lastDay && (
                    <>
                        <div className="mt-4 flex items-center justify-between">
                            <button
                                onClick={() => setMonth(shiftMonth(month, -1))}
                                disabled={month <= monthOf(FIRST_DAY)}
                                aria-label="Previous month"
                                className="disabled:opacity-25"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <span className="text-[15px] font-semibold">{monthLabel(month)}</span>

                            <button
                                onClick={() => setMonth(shiftMonth(month, 1))}
                                disabled={month >= monthOf(lastDay)}
                                aria-label="Next month"
                                className="disabled:opacity-25"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-ink-muted">
                            {WEEKDAYS.map((initial, i) => (
                                <span key={i}>{initial}</span>
                            ))}
                        </div>

                        <div className="mt-1 grid grid-cols-7 gap-1">
                            {Array.from({ length: firstWeekday(month) }, (_, i) => (
                                <span key={`blank-${i}`} />
                            ))}

                            {daysInMonth(month).map((day) => {
                                const date = Number(day.slice(8));
                                const score = results[day];

                                if (day < FIRST_DAY || day > lastDay) {
                                    return (
                                        <span
                                            key={day}
                                            className="flex aspect-square items-center justify-center text-[13px] text-ink-muted opacity-35"
                                        >
                                            {date}
                                        </span>
                                    );
                                }

                                return (
                                    <Link
                                        key={day}
                                        href={`/archive/${day}`}
                                        onClick={() => ref.current?.close()}
                                        className={`flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-ink text-[13px] leading-none ${
                                            score === undefined
                                                ? "bg-surface-2 text-ink"
                                                : score === "X"
                                                  ? "bg-danger text-on-primary"
                                                  : "bg-success text-on-primary"
                                        }`}
                                    >
                                        <span>{date}</span>
                                        {score !== undefined && (
                                            <span className="mt-0.5 text-[9px]">
                                                {score === "X" ? "X" : `${score}/${MAX_GUESSES}`}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-ink-muted">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-success" /> won
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-danger" /> lost
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-surface-2" /> not played
                            </span>
                        </div>
                    </>
                )}
            </dialog>
        </>
    );
}
