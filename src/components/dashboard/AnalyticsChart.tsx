"use client";

import { useTheme } from "next-themes";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type ChartData = {
    date: string;
    clicks: number;
};

export default function AnalyticsChart({ data }: { data: ChartData[] }) {
    const { theme } = useTheme();

    // Adapt colors based on your Next-Themes toggle
    const isDark = theme === "dark";
    const gridColor = isDark ? "#262626" : "#e5e5e5"; // neutral-800 : neutral-200
    const textColor = isDark ? "#a3a3a3" : "#737373"; // neutral-400 : neutral-500
    const strokeColor = "#3b82f6"; // blue-500
    const fillColor = isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)";

    return (
        <div className="h-[300px] w-full">
            {/* The 99% width is a specific hack to silence Recharts hydration warnings */}
            <ResponsiveContainer width="99%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: textColor, fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: textColor, fontSize: 12 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? "#171717" : "#ffffff",
                            borderColor: gridColor,
                            borderRadius: "12px",
                            color: isDark ? "#ffffff" : "#000000"
                        }}
                        itemStyle={{ color: strokeColor, fontWeight: "bold" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke={strokeColor}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorClicks)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}