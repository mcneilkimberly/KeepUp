import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

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

export default function Home() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:3001/dashboard/summary");
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
                setLoading(false);
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
        <h1 className="pageTitle">Home</h1>
        <p className="muted" style={{ maxWidth: 720, marginTop: 12 }}>
            Welcome to <a href="/" className="link"><strong>KeepUp</strong></a>, a lightweight bookkeeping software. [more info?]
        </p>

        <div className="grid">
            <div className="card" style={{ gridColumn: "span 8" }}>
            <div className="row" style={{ marginBottom: 10 }}>
                <h2 className="cardTitle" style={{ margin: 0 }}>Quick actions</h2>
                <span className="pill"><i>Prototype</i></span>
            </div>

            <div className="grid" style={{ marginTop: 0 }}>
                <div className="card" style={{ gridColumn: "span 4" }}>
                <div className="cardTitle">Enter a transaction</div>
                <p className="muted" style={{ marginTop: 0 }}>
                    Add a journal entry (date, description, debit/credit).
                </p>
                <NavLink className="btn btnPrimary" to="/journal">Go to Journal</NavLink>
                </div>

                <div className="card" style={{ gridColumn: "span 4" }}>
                <div className="cardTitle">Review an account</div>
                <p className="muted" style={{ marginTop: 0 }}>
                    Browse balances and recent activity by account.
                </p>
                <NavLink className="btn btnPrimary" to="/ledger">Go to Ledger</NavLink>
                </div>

                <div className="card" style={{ gridColumn: "span 4" }}>
                <div className="cardTitle">Generate statements</div>
                <p className="muted" style={{ marginTop: 0 }}>
                    Balance sheet, income statement, and more.
                </p>
                <NavLink className="btn btnPrimary" to="/statements">Go to Statements</NavLink>
                </div>
            </div>
            </div>

            <div className="card" style={{ gridColumn: "span 4" }}>
                <h2 className="cardTitle">Snapshot</h2>
                <div className="kpis">
                    <div className="kpi">
                    <div className="kpiLabel">Accounts</div>
                    <div className="kpiValue">{loading ? "—" : dashboardData?.accountCount || 0}</div>
                    </div>
                    <div className="kpi">
                    <div className="kpiLabel">Total Debit</div>
                    <div className="kpiValue">{loading ? "—" : formatLargeCurrency(dashboardData?.totalIncome || 0)}</div>
                    </div>
                    <div className="kpi">
                    <div className="kpiLabel">Total Credit</div>
                    <div className="kpiValue">{loading ? "—" : formatLargeCurrency(dashboardData?.totalSpending || 0)}</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ gridColumn: "span 12" }}>
            <div className="row" style={{ marginBottom: 10 }}>
                <h2 className="cardTitle" style={{ margin: 0 }}>Recent activity</h2>
                <span className="pill">{loading ? "Loading..." : `${dashboardData?.recentEntries.length || 0} entries`}</span>
            </div>

            <table className="table">
                <thead>
                <tr>
                    <th style={{ width: 140 }}>Date</th>
                    <th>Description</th>
                    <th style={{ width: 160 }}>Account</th>
                    <th style={{ width: 140 }}>Debit</th>
                    <th style={{ width: 140 }}>Credit</th>
                </tr>
                </thead>
                <tbody>
                {error ? (
                    <tr>
                        <td colSpan={5} className="muted">Error loading entries: {error}</td>
                    </tr>
                ) : loading ? (
                    <tr>
                        <td colSpan={5} className="muted">Loading entries...</td>
                    </tr>
                ) : dashboardData?.recentEntries && dashboardData.recentEntries.length > 0 ? (
                    dashboardData.recentEntries.map((entry, idx) => (
                        <tr key={idx}>
                            <td>{entry.date}</td>
                            <td>{entry.description}</td>
                            <td>{entry.account}</td>
                            <td>{entry.debit > 0 ? formatCurrency(entry.debit) : "—"}</td>
                            <td>{entry.credit > 0 ? formatCurrency(entry.credit) : "—"}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td className="muted">—</td>
                        <td className="muted">No entries yet</td>
                        <td className="muted">—</td>
                        <td className="muted">—</td>
                        <td className="muted">—</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
}