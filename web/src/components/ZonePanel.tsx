import type { ZoneInfo } from "./ShotChart";

interface ZonePanelProps {
    info: ZoneInfo;
}

export default function ZonePanel( { info } : ZonePanelProps ) {
    const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
    const diff = info.playerFg - info.leagueFg;

    return (
        <div className= "rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-xl">
            <p className="dont-bold">{info.zone}</p>
            <p> Shots: {info.made}/{info.att}</p>
            <p> FG%: {pct(info.playerFg)}</p>
            <p>
                {info.isFallback ? "Referência (FG% geral da liga)" : "Média da liga na zona"}:{" "}
                {pct(info.leagueFg)}
                <span className={diff >= 0 ? "text-red-400" : "text-blue-400"}>
                {" "}({diff >= 0 ? "+" : ""}{pct(diff)})
                </span>
            </p>
            {info.isFallback && (
                <p className="mt-1 text-xs text-gray-400">
                Esta zona não tem referência própria na liga — usando a média geral.
                </p>
            )}
        </div>
    );
}