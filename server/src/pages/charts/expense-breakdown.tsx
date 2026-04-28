import { useEffect, useRef } from "react";
import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface ExpenseCategory {
    label: string;
    amount: number;
}

interface ExpenseBreakdownChartProps {
    data: ExpenseCategory[];
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

export default function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

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
                            color: "#9ca3af",
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
    }, [data]);

    return (
        <div style={{ position: "relative", width: "100%", height: "240px" }}>
            <canvas ref={canvasRef} role="img" aria-label="Doughnut chart of expense breakdown by category" />
        </div>
    );
}