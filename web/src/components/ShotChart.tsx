"use client";

import { useMemo, useState } from "react";
import { scaleQuantile, scaleQuantize } from "d3-scale";
import { hexPath } from "../lib/hexPath";
import type { Hex } from "@/lib/types";

const COURT_W = 500;
const COURT_H = 470;
const RADIUS_STEPS = [1.5, 2.5, 4, 5.5, 7.2];
const PALETTE = ["#5458A2", "#6689BB", "#FADC97", "#F08460", "#B02B48"];

const THREE_PT_HALF_ANGLE = Math.atan(220 / 89.5);

function threePointArcPath(radius: number, halfAngle: number): string {
    const points = 30;
    const coords = Array.from({ length: points }, (_, i) => {
        const angle = -halfAngle + (2 * halfAngle * i) / (points - 1);
        const x = radius * Math.sin(angle);
        const y = radius * Math.cos(angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return `M${coords.join("L")}`;
}

interface ShotChartProps {
    hexes : Hex[];
    leagueAverages : Record<string,number>;
    leagueOverallFg: number;
    onZoneHover: (info: ZoneInfo | null) => void
}

export interface ZoneInfo {
    zone: string;
    att: number;
    made: number;
    playerFg: number;
    leagueFg: number;
    isFallback: boolean;
}

export default function ShotChart ( { hexes, leagueAverages, leagueOverallFg, onZoneHover }: ShotChartProps) {

    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    const radiusScale = useMemo(() => {
    const attsOverOne = hexes.filter((h) => h.att > 1).map((h) => h.att);

    const quantile = scaleQuantile<number, number>()
        .domain(attsOverOne)
        .range(RADIUS_STEPS.slice(1));

    return (att: number): number => {
        if (att <= 1) return RADIUS_STEPS[0];
        return quantile(att);
    };
    }, [hexes]);
    
    const color = useMemo(
        () => scaleQuantize<string>().domain([-0.15, 0.15]).range(PALETTE),[]
    );

    const zoneGroups = useMemo(
        () => {
            const groups = new Map<string, Hex[]>()
            for (const h of hexes) {
                const list = groups.get(h.zone) ?? [];
                list.push(h);
                groups.set(h.zone, list);
            }
            return groups;
        }, [hexes]);
    
    const drawn = useMemo(
        () =>
            hexes.map((h) => {
                const playerFg = h.att === 0 ? 0 : h.made / h.att;
                const zoneAvg = leagueAverages[h.zone];
                const isFallback = zoneAvg === undefined;
                const leagueFg = isFallback ? leagueOverallFg : zoneAvg;
                return {
                    key: `${h.cx},${h.cy}`,
                    zone: h.zone,
                    path: hexPath(radiusScale(h.att)),
                    cx: h.cx,
                    cy: h.cy,
                    fill: color(playerFg - leagueFg)
                };
            }), [hexes, leagueAverages, leagueOverallFg, radiusScale, color]);
    
    function handleHover(zone: string | null) {
        setHoveredZone(zone);

        if(zone === null) {
            onZoneHover(null);
            return;
        }

        const group = zoneGroups.get(zone) ?? [];
        const att = group.reduce((s, h) => s + h.att, 0);
        const made = group.reduce((s, h) => s + h.made, 0);
        const zoneAvg = leagueAverages[zone];
        const isFallback = zoneAvg === undefined;
        const leagueFg = isFallback ? leagueOverallFg : zoneAvg;

        onZoneHover({
                zone,
                att,
                made,
                playerFg: att === 0 ? 0 : made / att,
                leagueFg,
                isFallback,
        });
    }

    return (
        <svg viewBox={`0 0 ${COURT_W} ${COURT_H}`} className="w-full max-w-xl">
            <CourtLines />
            <g transform={`translate(${COURT_W / 2}, ${COURT_H - 52.5}) scale(1, -1)`}>

            {/* Camada de hit-test: invisível, tamanho fixo da grade real (7.5), sem vãos */}
            {drawn.map((h) => (
                <path
                key={`hit-${h.key}`}
                d={hexPath(7.5)}
                transform={`translate(${h.cx}, ${h.cy})`}
                fill="transparent"
                onMouseEnter={() => handleHover(h.zone)}
                onMouseLeave={() => handleHover(null)}
                />
            ))}

            {/* Camada visual: hexágonos coloridos, SEM eventos de mouse próprios */}
            {drawn.map((h) => (
                <path
                key={h.key}
                d={h.path}
                transform={`translate(${h.cx}, ${h.cy})`}
                fill={h.fill}
                stroke="#fff"
                strokeWidth={0.5}
                opacity={hoveredZone && h.zone !== hoveredZone ? 0.35 : 1}
                pointerEvents="none"
                />
            ))}

            {/* Camada de destaque (igual já tínhamos) */}
            {hoveredZone && drawn.filter((h) => h.zone === hoveredZone).map((h) => (
                <path
                key={`hl-${h.key}`}
                d={h.path}
                transform={`translate(${h.cx}, ${h.cy})`}
                fill="none"
                stroke="#111827"
                strokeWidth={1.5}
                pointerEvents="none"
                />
            ))}
            </g>
        </svg>
    );
}

function CourtLines() {
    return (
        <g stroke="#94a3b8" strokeWidth={2} fill="none"
            transform={`translate(250, 417.5) scale(1, -1)`}>
            <circle cx={0} cy={0} r={7.5} />                      {/* aro */}
            <line x1={-30} y1={-7.5} x2={30} y2={-7.5} />          {/* tabela */}
            <rect x={-80} y={-52.5} width={160} height={190} />    {/* garrafão */}
            <circle cx={0} cy={137.5} r={60} />                    {/* lance livre (semi) */}
            {[70, 90, 110, 140].map((y) => (
                <g key={y}>
                    <line x1={-80} y1={y - 47.5} x2={-75} y2={y - 47.5} />
                    <line x1={80} y1={y - 47.5} x2={75} y2={y - 47.5} />
                </g>
            ))}
            <line x1={-220} y1={-52.5} x2={-220} y2={89.5} />
            <line x1={220} y1={-52.5} x2={220} y2={89.5} />
            <path d={threePointArcPath(237.5, THREE_PT_HALF_ANGLE)} />
        </g>
    );
}