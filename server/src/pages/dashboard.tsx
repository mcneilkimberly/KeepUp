import { useState, useEffect } from "react";
import ExpenseBreakdownChart from "./charts/expense-breakdown";
import RevenueExpensesChart from "./charts/revenue-expenses-chart";
import { authFetch } from "../auth";
import type { ResolvedTheme } from "../theme";

/**
 * Formats a date string from "YYYY-MM-DD" to "Month Day, Year" format
 * @param dateString Date in "YYYY-MM-DD" format
 * @returns Formatted date string (e.g., "March 19, 2026")
 */
const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    // Parse YYYY-MM-DD format safely without timezone issues
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString; // Fallback if format is unexpected
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

interface DashboardData {
    totalIncome: number;
    totalSpending: number;
    accountCount: number;
    recentEntries: Array<{
        date: string;
        description: string;
        account: string;
        debit: number;
        credit: number;
    }>;
}

interface MonthlyDataPoint {
    month: string;       // "Apr 2025"
    month_sort: string;  // "2025-04" — not rendered, just used for ordering
    revenue: number;
    expenses: number;
}

interface ExpenseCategory {
    label: string;
    amount: number;
}

export default function Dashboard({ resolvedTheme }: { resolvedTheme: ResolvedTheme }) {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
    const [expenseData, setExpenseData] = useState<ExpenseCategory[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await authFetch("/dashboard/summary");
                const monthlyRes = await authFetch("/dashboard/monthly");
                const expenseRes = await authFetch("/dashboard/expenses");
                if (expenseRes.ok) {
                    const expenseJson = await expenseRes.json();
                    setExpenseData(expenseJson);
                }
                if (monthlyRes.ok) {
                    const monthlyJson = await monthlyRes.json();
                    setMonthlyData(monthlyJson);
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }
                const data = await response.json();
                setDashboardData(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching dashboard:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
                setDashboardData(null);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 1200);
            }
            
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatLargeCurrency = (value: number) => {
        if (value === 0) return "$0.00";
        
        const absValue = Math.abs(value);
        const sign = value < 0 ? "-" : "";
        
        if (absValue >= 1_000_000_000) {
            return sign + "$" + (absValue / 1_000_000_000).toFixed(1) + "B";
        } else if (absValue >= 1_000_000) {
            return sign + "$" + (absValue / 1_000_000).toFixed(1) + "M";
        } else if (absValue >= 1_000) {
            return sign + "$" + (absValue / 1_000).toFixed(1) + "K";
        } else {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }).format(value);
        }
    };

    return (
        <div>
            <h1 className="pageTitle">Dashboard</h1>
            <p className="muted">Welcome back! Here's your financial overview.</p>

            {/* KPI Cards Section */}
            <div className="grid" style={{ marginBottom: 24 }}>
                <div className="card" style={{ gridColumn: "span 3" }}>
                    <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Total Revenue</div>
                    <div className="kpiValue">
                        {loading ? <div className="skeleton skeleton-value" /> : formatLargeCurrency(dashboardData?.totalIncome || 0)}
                    </div>
                </div>

                <div className="card" style={{ gridColumn: "span 3" }}>
                    <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Net Income</div>
                    <div className="kpiValue">
                        {loading ? (
                            <div className="skeleton skeleton-value" />
                        ) : (
                            formatLargeCurrency((dashboardData?.totalIncome || 0) - (dashboardData?.totalSpending || 0))
                        )}
                    </div>
                </div>

                <div className="card" style={{ gridColumn: "span 3" }}>
                    <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Total Expenses</div>
                    <div className="kpiValue">
                        {loading ? <div className="skeleton skeleton-value" /> : formatLargeCurrency(dashboardData?.totalSpending || 0)}
                    </div>
                </div>

                <div className="card" style={{ gridColumn: "span 3" }}>
                    <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Cash Flow</div>
                    <div className="kpiValue">
                        {loading ? <div className="skeleton skeleton-value" /> : formatLargeCurrency((dashboardData?.totalIncome || 0) * 0.25)}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid" style={{ marginBottom: 24 }}>
                <div className="card" style={{ gridColumn: "span 6", minHeight: loading ? 300 : "auto" }}>
                    <h2 className="cardTitle">Revenue vs Expenses</h2>
                    {loading ? (
                    <div className="skeleton skeleton-chart" />
                    ) : monthlyData.length > 0 ? (
                    <RevenueExpensesChart data={monthlyData} resolvedTheme={resolvedTheme} />
                    ) : (
                    <p className="muted">No revenue or expense data yet.</p>
                    )}
                </div>

                <div className="card" style={{ gridColumn: "span 6", minHeight: loading ? 300 : "auto" }}>
                    <h2 className="cardTitle">Expense Breakdown — {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
                    {loading ? (
                        <div className="skeleton skeleton-chart" />
                    ) : (
                        <ExpenseBreakdownChart
                            data={expenseData}
                            resolvedTheme={resolvedTheme}
                        />
                    )}
                </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="card">
                <h2 className="cardTitle">Recent Transactions</h2>
                
                {error ? (
                    <p className="muted">Dashboard data is not available yet.</p>
                ) : loading ? (
                <div style={{ display: "grid", gap: 12 }}>
                    <div className="skeleton skeleton-table-row" />
                    <div className="skeleton skeleton-table-row" />
                    <div className="skeleton skeleton-table-row" />
                    <div className="skeleton skeleton-table-row" />
                    <div className="skeleton skeleton-table-row" />
                </div>
                ) : dashboardData?.recentEntries && dashboardData.recentEntries.length > 0 ? (
                    <div style={{ display: "grid", gap: 12 }}>
                        {dashboardData.recentEntries.slice(0, 5).map((entry, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 0",
                                    borderBottom: idx < Math.min(4, dashboardData.recentEntries.length - 1) ? "1px solid rgba(255,255,255,0.08)" : "none",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500 }}>{entry.description}</div>
                                    <div className="muted" style={{ fontSize: 13 }}>
                                        {formatDate(entry.date)} • {entry.account}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    {entry.debit > 0 && (
                                        <div>Debit {formatCurrency(entry.debit)}</div>
                                    )}
                                    {entry.credit > 0 && (
                                        <div>Credit {formatCurrency(entry.credit)}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="muted">No entries yet</p>
                )}
            </div>
        </div>
    );
}
