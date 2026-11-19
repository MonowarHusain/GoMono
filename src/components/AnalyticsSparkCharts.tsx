"use client";

import { useState } from "react";
import { TrendingUp, Clock, Zap } from "lucide-react";
import { type DailySparklinePoint, type HourlyClickBucket } from "@/lib/analytics-aggregator";

interface AnalyticsSparkChartsProps {
    dailyTrend: DailySparklinePoint[];
    hourlyDistribution: HourlyClickBucket[];
    peakHour?: { hour: number; label: string; count: number };
}

export default function AnalyticsSparkCharts({
    dailyTrend,
    hourlyDistribution,
    peakHour,
}: AnalyticsSparkChartsProps) {
    const [hoveredPoint, setHoveredPoint] = useState<DailySparklinePoint | null>(null);
    const [hoveredHour, setHoveredHour] = useState<HourlyClickBucket | null>(null);

    // Calculate sparkline points for SVG
    const maxDailyClicks = Math.max(1, ...dailyTrend.map((p) => p.count));
    const totalWeekClicks = dailyTrend.reduce((sum, p) => sum + p.count, 0);

    const svgWidth = 360;
    const svgHeight = 90;
    const padding = 16;
    const innerWidth = svgWidth - padding * 2;
    const innerHeight = svgHeight - padding * 2;

    const points = dailyTrend.map((p, idx) => {
        const x = padding + (idx / Math.max(1, dailyTrend.length - 1)) * innerWidth;
        const y = padding + innerHeight - (p.count / maxDailyClicks) * innerHeight;
        return { x, y, ...p };
    });

    const pathD = points.length > 0
        ? points.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`, "")
        : "";

    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`
        : "";

    const maxHourlyClicks = Math.max(1, ...hourlyDistribution.map((h) => h.count));

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 7-Day Trend Sparkline Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-950/60 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">7-Day Trailing Trend</h4>
                            <p className="text-[10px] text-zinc-500 font-mono">
                                {totalWeekClicks} visit{totalWeekClicks === 1 ? "" : "s"} this week
                            </p>
                        </div>
                    </div>

                    {hoveredPoint ? (
                        <div className="text-right">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {hoveredPoint.count} visits
                            </span>
                            <p className="text-[10px] text-zinc-400 font-mono">{hoveredPoint.label} ({hoveredPoint.date})</p>
                        </div>
                    ) : (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            Peak: {maxDailyClicks}/day
                        </span>
                    )}
                </div>

                {/* SVG Sparkline Area & Line */}
                <div className="relative w-full overflow-hidden">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-24 overflow-visible"
                    >
                        <defs>
                            <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Subtle Horizontal Reference Grid */}
                        <line
                            x1={padding}
                            y1={padding + innerHeight / 2}
                            x2={svgWidth - padding}
                            y2={padding + innerHeight / 2}
                            stroke="currentColor"
                            className="text-zinc-200 dark:text-zinc-800"
                            strokeDasharray="2,2"
                        />

                        {/* Filled Gradient Area */}
                        {areaD && (
                            <path d={areaD} fill="url(#sparkline-grad)" />
                        )}

                        {/* Sparkline Stroke */}
                        {pathD && (
                            <path
                                d={pathD}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Data Points */}
                        {points.map((pt) => (
                            <circle
                                key={pt.date}
                                cx={pt.x}
                                cy={pt.y}
                                r={hoveredPoint?.date === pt.date ? "5" : "3"}
                                className={`cursor-pointer transition-all ${
                                    hoveredPoint?.date === pt.date
                                        ? "fill-indigo-600 stroke-white dark:stroke-zinc-950 stroke-2"
                                        : "fill-indigo-500"
                                }`}
                                onMouseEnter={() => setHoveredPoint(pt)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        ))}
                    </svg>

                    {/* Bottom Day Labels */}
                    <div className="flex justify-between px-2 pt-1 text-[10px] font-mono text-zinc-400">
                        {dailyTrend.map((p) => (
                            <span key={p.date}>{p.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 24-Hour Hourly Distribution Bar Chart */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-950/60 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">24-Hour Peak Activity</h4>
                            <p className="text-[10px] text-zinc-500 font-mono">
                                Hourly visitor distribution
                            </p>
                        </div>
                    </div>

                    {hoveredHour ? (
                        <div className="text-right">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                {hoveredHour.count} visits
                            </span>
                            <p className="text-[10px] text-zinc-400 font-mono">{hoveredHour.label}</p>
                        </div>
                    ) : peakHour && peakHour.count > 0 ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            <Zap className="h-3 w-3" />
                            <span>Peak: {peakHour.label} ({peakHour.count})</span>
                        </div>
                    ) : (
                        <span className="text-[10px] text-zinc-400 font-mono">24h Timeline</span>
                    )}
                </div>

                {/* 24 Vertical Bars */}
                <div className="flex items-end justify-between gap-1 h-24 pt-2">
                    {hourlyDistribution.map((h) => {
                        const barHeightPct = maxHourlyClicks > 0
                            ? Math.max(8, Math.round((h.count / maxHourlyClicks) * 100))
                            : 8;
                        const isPeak = peakHour && peakHour.count > 0 && peakHour.hour === h.hour;
                        const isHovered = hoveredHour?.hour === h.hour;

                        return (
                            <div
                                key={h.hour}
                                className="group/bar relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
                                onMouseEnter={() => setHoveredHour(h)}
                                onMouseLeave={() => setHoveredHour(null)}
                            >
                                <div
                                    className={`w-full rounded-t transition-all ${
                                        isPeak
                                            ? "bg-amber-500 shadow-xs shadow-amber-500/50"
                                            : isHovered
                                            ? "bg-indigo-600"
                                            : h.count > 0
                                            ? "bg-indigo-400 dark:bg-indigo-500/80"
                                            : "bg-zinc-200 dark:bg-zinc-800"
                                    }`}
                                    style={{ height: `${barHeightPct}%` }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* 4 Reference Hour Labels */}
                <div className="flex justify-between pt-2 text-[10px] font-mono text-zinc-400">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>11 PM</span>
                </div>
            </div>
        </div>
    );
}
