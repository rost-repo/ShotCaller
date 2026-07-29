import type { GuessResult } from "@/lib/game";

interface GuessPipsProps {
    results: GuessResult[];
    total: number;
}

export default function GuessPips({ results, total }: GuessPipsProps) {
    return (
        <div className="flex gap-[3px]">
            {Array.from({ length: total }).map((_, i) => {
                const result = results[i];
                const fill = result === undefined 
                    ? "var(--surface-2)"  
                    : result.correct 
                        ? "var(--success)"  
                        : "var(--danger)";
                return (
                    <svg key={i} width={14} height={14} viewBox="0 0 24 24" aria-hidden="true">
                        <polygon
                            points="12,1 22,7 22,17 12,23 2,17 2,7"
                            fill={fill}
                            stroke="var(--ink)"
                            strokeWidth={2}
                        />
                    </svg>
                );
            })}
        </div>
    );
}