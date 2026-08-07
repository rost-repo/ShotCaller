import type { Pip } from "@/lib/game";

interface GuessPipsProps {
    pips: Pip[];
}

export default function GuessPips({ pips }: GuessPipsProps) {
    return (
        <div className="flex gap-0.75">
            {pips.map((pip, i) => {
                const fill = pip === "empty" 
                    ? "var(--surface-2)"  
                    : pip === "correct" 
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