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
        <div className="relative w-full max-w-md">
            <input
            type="text"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="guess-suggestions"
            aria-autocomplete="list"
            aria-label="Type your guess..."
            className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder={disabled ? "Game Over" : "Who is the secret player?"}
            value={query}
            disabled={disabled}
            onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
            onKeyDown={onKeyDown}
            />
            {suggestions.length > 0 && (
            <ul id="guess-suggestions" role="listbox" className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg text-black">
                {suggestions.map((name, i) => (
                <li
                    key={name}
                    role="option"
                    aria-selected={i === highlighted}
                    className={`cursor-pointer px-4 py-2 ${i === highlighted ? "bg-blue-950 text-white" : ""}`}
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