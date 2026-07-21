import type { PlayerSummary } from "@/lib/types";

interface GuessInputProps {
    players: PlayerSummary[]
    onGuess: (name : string) => void;
    disabled?: boolean;
}

export default function GuessInput({ players, onGuess, disabled} : GuessInputProps) {
    return (
        <input
            type="text"
            placeholder="Nome do jogador..."
            disabled={disabled}
            className="w-full rounded border px-3 py-2"
            onKeyDown={(e) => {
                if (e.key === "Enter") onGuess(e.currentTarget.value);
            }}
        />
    )
}