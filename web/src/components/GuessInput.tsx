"use client";

import { useMemo, useState } from "react";

interface GuessInputProps {
    playerNames: string[];
    disabledNames: string[];
    onGuess: (name: string) => void;
    disabled: boolean;
}

export default function GuessInput({ playerNames, disabledNames, onGuess, disabled} : GuessInputProps) {
    const [query, setQuery] = useState("");
    const [highlighted, setHighlighted] = useState(0);

    function submit(name: string) {
        onGuess(name);
        setQuery("");
        setHighlighted(0);
    }
    const suggestions = useMemo( () => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) return [];
        return playerNames
            .filter((n) => n.toLowerCase().includes(q))
            .filter((n) => !disabledNames.includes(n))
            .slice(0,8);
    }
    , [query, playerNames, disabledNames]);

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
        if (e.key === "ArrowUp") setHighlighted((h) => Math.max(h - 1, 0));
        if (e.key === "Enter" && suggestions[highlighted]) submit(suggestions[highlighted]);
        if (e.key === "Escape") setQuery("");
    }

    return(
        <div className="relative flex min-w-0 flex-1 gap-2.5">
            <input
            type="text"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="guess-suggestions"
            aria-autocomplete="list"
            aria-label="Type your guess..."
            className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-muted focus:outline-none disabled:opacity-50"
            placeholder={disabled ? "Game Over" : "Who is the secret player?"}
            value={query}
            disabled={disabled}
            onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
            onKeyDown={onKeyDown}
            />
            <button
                type="button"
                onClick={() => suggestions[highlighted] && submit(suggestions[highlighted])}
                disabled={disabled}
                className="font-display shrink-0 rounded-[10px] border-[3px] border-ink bg-primary px-5.5 py-2.5 text-[13px] text-ink shadow-sticker-sm disabled:bg-surface-2 disabled:text-fg-muted disabled:shadow-none"
            >
                Guess
            </button>
            {suggestions.length > 0 && (
            <ul id="guess-suggestions" role="listbox" className="absolute bottom-full z-10 mb-2 w-full overflow-hidden rounded-xl border-[3px] border-ink bg-paper shadow-sticker">
                {suggestions.map((name, i) => (
                <li
                    key={name}
                    role="option"
                    aria-selected={i === highlighted}
                    className={`cursor-pointer px-4 py-2 text-ink ${i === highlighted ? "bg-primary" : ""}`}
                    onMouseEnter={() => setHighlighted(i)}
                    onMouseDown={() => submit(name)}
                >
                    {name}
                </li>
                ))}
            </ul>
            )}
        </div>
    )
}