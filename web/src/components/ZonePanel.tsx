import type { ZoneInfo } from "./ShotChart";

interface ZonePanelProps {
    info: ZoneInfo;
    types: Record<string, number>;
}

export default function ZonePanel( { info, types } : ZonePanelProps ) {
    const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
    const diff = info.playerFg - info.leagueFg;
    const topTypes = Object.entries(types)
    .sort((a, b) => b[1] - a[1])

    return (
        <div className="pointer-events-none absolute top-4 right-4 min-w-42.5 rounded-xl border-[3px] border-ink bg-surface-2 px-3.5 py-3 text-sm shadow-sticker">
            <p className="mb-1 text-[11px] font-semibold tracking-[0.05em] text-fg-muted uppercase">{info.zone}</p>
            <p> Shots: {info.made}/{info.att}</p>
            <p> FG%: {pct(info.playerFg)}</p>
            <p>
                League Average:{" "}
                {pct(info.leagueFg)}
                <span className={diff >= 0 ? "text-chart-hot" : "text-chart-cold"}>
                {" "}({diff >= 0 ? "+" : ""}{pct(diff)})
                </span>
            </p>
            {topTypes.length > 0 && (
                <div className="mt-2 border-t border-fg-muted/30 pt-2">
                    {topTypes.map(([type, count]) => (
                        <p key={type} className="flex justify-between text-[13px]">
                            <span className="text-fg-muted">{type}</span>
                            <span className="font-stat">{Math.round((count / info.att) * 100)}%</span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}