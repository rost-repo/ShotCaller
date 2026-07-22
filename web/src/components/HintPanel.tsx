"use client";

import type { PlayerSummary } from "@/lib/types";
import { HINT_PENALTY } from "@/lib/game";

interface HintPanelProps {
    player: PlayerSummary;
    hintsUsed: number;
    wrongGuesses: number;
    onUseHint: ()=> void;
}

