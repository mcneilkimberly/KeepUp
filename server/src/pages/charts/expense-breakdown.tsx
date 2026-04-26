import { useEffect, useRef } from "react";
import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export interface ExpenseCategory {
    label: string;
    amount: number;
}

interface ExpenseBreakdownChartProps {
    data: ExpenseCategory[];
    resolvedTheme: "light" | "dark";
}

const COLORS = [
    "#378ADD",
    "#4ade80",
    "#f87171",
    "#EF9F27",
    "#534AB7",
    "#888780",
    "#5DCAA5",
    "#D4537E",
];

export default function ExpenseBreakdownChart({ data, resolvedTheme }: ExpenseBreakdownChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // If there's no data yet, don't render a broken chart
        if (data.length === 0) return;

        // Match your CSS variables — same logic as RevenueExpensesChart
        const isDark = resolvedTheme === "dark";
        const labelColor = isDark ? "rgba(255,255,255,0.68)" : "rgba(20,20,20,0.68)";

        const total = data.reduce((sum, d) => sum + d.amount, 0);

        chartRef.current = new Chart(canvasRef.current, {
            type: "doughnut",
            data: {
                labels: data.map((d) => d.label),
                datasets: [
                    {
                        data: data.map((d) => d.amount),
                        backgroundColor: COLORS.slice(0, data.length),
                        borderWidth: 0,
                        hoverOffset: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            color: labelColor,      // theme-aware
                            font: { size: 11 },
                            boxWidth: 10,
                            padding: 14,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const pct = total > 0
                                    ? ((ctx.parsed / total) * 100).toFixed(1)
                                    : "0.0";
                                return ` ${ctx.label}: $${ctx.parsed.toLocaleString()} (${pct}%)`;
                            },
                        },
                    },
                },
            },
        });

        return () => {
            chartRef.current?.destroy();
        };
    }, [data, resolvedTheme]); // redraw when theme or data changes

    // Show a friendly message instead of an empty canvas when there's no data
    if (data.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "240px" }}>
                <p className="muted">No expense accounts recorded this month.</p>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "240px" }}>
            <canvas
                ref={canvasRef}
                role="img"
                aria-label="Doughnut chart of expense breakdown by account for the current month"
            />
        </div>
    );
}