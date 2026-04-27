import { useEffect, useRef } from "react";
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Tooltip,
    Legend
);

interface MonthlyDataPoint {
    month: string;
    month_sort: string;
    revenue: number;
    expenses: number;
}

interface RevenueExpensesChartProps {
    data: MonthlyDataPoint[];
    resolvedTheme: "light" | "dark";
}

export default function RevenueExpensesChart({ data, resolvedTheme }: RevenueExpensesChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;
        if (chartRef.current) chartRef.current.destroy();

        // Swap label/grid colors based on theme. Light mode uses dark ink,
        // dark mode uses the muted white your CSS variables already define.
        const isDark = resolvedTheme === "dark";
        const labelColor   = isDark ? "rgba(255,255,255,0.68)" : "rgba(20,20,20,0.68)";
        const gridColor    = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
        const currentColor = isDark ? "#ffffff" : "#141414";

        const currentMonthLabel = new Date().toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });

        const makePointRadius  = (d: MonthlyDataPoint) => d.month === currentMonthLabel ? 6 : 3;
        const makePointBgRev   = (d: MonthlyDataPoint) => d.month === currentMonthLabel ? "#ffffff" : "#4ade80";
        const makePointBgExp   = (d: MonthlyDataPoint) => d.month === currentMonthLabel ? "#ffffff" : "#f87171";
        const makePointBorder  = (d: MonthlyDataPoint) => d.month === currentMonthLabel ? 2 : 0;

        chartRef.current = new Chart(canvasRef.current, {
            type: "line",
            data: {
                labels: data.map((d) => d.month),
                datasets: [
                    {
                        label: "Revenue",
                        data: data.map((d) => d.revenue),
                        borderColor: "#4ade80",
                        backgroundColor: "rgba(74, 222, 128, 0.08)",
                        borderWidth: 2,
                        pointRadius: data.map(makePointRadius),
                        pointBackgroundColor: data.map(makePointBgRev),
                        pointBorderColor: "#4ade80",
                        pointBorderWidth: data.map(makePointBorder),
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: "Expenses",
                        data: data.map((d) => d.expenses),
                        borderColor: "#f87171",
                        backgroundColor: "rgba(248, 113, 113, 0.06)",
                        borderWidth: 2,
                        pointRadius: data.map(makePointRadius),
                        pointBackgroundColor: data.map(makePointBgExp),
                        pointBorderColor: "#f87171",
                        pointBorderWidth: data.map(makePointBorder),
                        fill: true,
                        tension: 0.3,
                        borderDash: [5, 4],
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            color: labelColor,   // theme-aware
                            font: { size: 12 },
                            boxWidth: 12,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const label = items[0].label;
                                return label === currentMonthLabel
                                    ? `${label} (current)`
                                    : label;
                            },
                            label: (ctx) => {
                                if (ctx.parsed.y === null) return "";
                                return ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: (ctx) => {
                                const label = data[ctx.index]?.month;
                                return label === currentMonthLabel ? currentColor : labelColor; // theme-aware
                            },
                            font: (ctx) => {
                                const label = data[ctx.index]?.month;
                                return label === currentMonthLabel
                                    ? { size: 11, weight: "bold" as const }
                                    : { size: 11 };
                            },
                        },
                    },
                    y: {
                        grid: { color: gridColor },     // theme-aware
                        ticks: {
                            color: labelColor,          // theme-aware
                            font: { size: 11 },
                            callback: (v) => "$" + (Number(v) / 1000).toFixed(0) + "k",
                        },
                    },
                },
            },
        });

        return () => {
            chartRef.current?.destroy();
        };
    }, [data, resolvedTheme]);

    return (
        <div style={{ position: "relative", width: "100%", height: "240px" }}>
            <canvas
                ref={canvasRef}
                role="img"
                aria-label="Line chart of monthly revenue vs expenses over the last 12 months"
            />
        </div>
    );
}