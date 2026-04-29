import { useState, useEffect } from "react";
import { authFetch } from "../auth";

interface RatiosData {
    revenue: number;
    expenses: number;
    assets: number;
    liabilities: number;
    equity: number;
    netIncome: number;
}

interface RatioCardProps {
    title: string;
    value: string;
    description: string;
    benchmark: string;
    status: "good" | "warning" | "bad" | "neutral";
}

function RatioCard({ title, value, description, benchmark, status }: RatioCardProps) {
    const statusColor =
        status === "good"    ? "#4ade80" :
        status === "warning" ? "#EF9F27" :
        status === "bad"     ? "#f87171" :
        "var(--muted)";

    const statusDot = (
        <span style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: statusColor,
            marginRight: 6,
            flexShrink: 0,
        }} />
    );

    return (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {title}
            </div>
            <div className="kpiValue" style={{ fontSize: 28 }}>{value}</div>
            <div className="muted" style={{ fontSize: 12 }}>{description}</div>
            <div style={{
                marginTop: 6,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--btn-bg)",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
            }}>
                {statusDot}
                <span className="muted">{benchmark}</span>
            </div>
        </div>
    );
}

function pct(value: number): string {
    if (!isFinite(value)) return "N/A";
    return (value * 100).toFixed(1) + "%";
}

function ratio(value: number): string {
    if (!isFinite(value)) return "N/A";
    return value.toFixed(2);
}

function getMarginStatus(value: number): "good" | "warning" | "bad" | "neutral" {
    if (!isFinite(value)) return "neutral";
    if (value >= 0.2)  return "good";
    if (value >= 0.05) return "warning";
    return "bad";
}

function getDebtStatus(value: number): "good" | "warning" | "bad" | "neutral" {
    if (!isFinite(value)) return "neutral";
    if (value <= 0.4)  return "good";
    if (value <= 0.6)  return "warning";
    return "bad";
}

function getRoeStatus(value: number): "good" | "warning" | "bad" | "neutral" {
    if (!isFinite(value)) return "neutral";
    if (value >= 0.15) return "good";
    if (value >= 0.05) return "warning";
    return "bad";
}

function getEquityStatus(value: number): "good" | "warning" | "bad" | "neutral" {
    if (!isFinite(value)) return "neutral";
    if (value >= 0.5)  return "good";
    if (value >= 0.3)  return "warning";
    return "bad";
}

export default function BusinessRatios() {
    const [data, setData] = useState<RatiosData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRatios = async () => {
            try {
                setLoading(true);
                const res = await authFetch("/dashboard/ratios");
                if (!res.ok) throw new Error("Failed to fetch ratios");
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setTimeout(() => setLoading(false), 1200);
            }
        };
        fetchRatios();
    }, []);

    const netProfitMargin  = data ? data.netIncome / (data.revenue || 1)    : NaN;
    const grossProfitMargin = data ? (data.revenue - data.expenses) / (data.revenue || 1) : NaN;
    const debtRatio        = data ? data.liabilities / (data.assets || 1)   : NaN;
    const debtToEquity     = data ? data.liabilities / (data.equity || 1)   : NaN;
    const equityRatio      = data ? data.equity / (data.assets || 1)        : NaN;
    const roe              = data ? data.netIncome / (data.equity || 1)     : NaN;

    return (
        <div>
            <h1 className="pageTitle">Business Ratios</h1>
            <p className="muted" style={{ marginTop: 8, marginBottom: 24, maxWidth: 760 }}>
                Key financial ratios calculated from your ledger data.
            </p>

            {error ? (
                <p className="muted">Could not load ratio data.</p>
            ) : (
                <>
                    {/* Profitability */}
                    <div style={{ marginBottom: 8 }}>
                        <p style={{ fontWeight: 700, marginBottom: 12 }}>Profitability</p>
                    </div>
                    <div className="grid" style={{ marginBottom: 24 }}>
                        <div style={{ gridColumn: "span 4" }}>
                            {loading ? <div className="skeleton skeleton-button" style={{ height: 140 }} /> : (
                                <RatioCard
                                    title="Gross Profit Margin"
                                    value={pct(grossProfitMargin)}
                                    description="(Revenue − Expenses) ÷ Revenue"
                                    benchmark="Industry avg: ~40%"
                                    status={getMarginStatus(grossProfitMargin)}
                                />
                            )}
                        </div>
                        <div style={{ gridColumn: "span 4" }}>
                            {loading ? <div className="skeleton skeleton-button" style={{ height: 140 }} /> : (
                                <RatioCard
                                    title="Net Profit Margin"
                                    value={pct(netProfitMargin)}
                                    description="Net Income ÷ Revenue"
                                    benchmark="Industry avg: ~10%"
                                    status={getMarginStatus(netProfitMargin)}
                                />
                            )}
                        </div>
                        <div style={{ gridColumn: "span 4" }}>
                            {loading ? <div className="skeleton skeleton-button" style={{ height: 140 }} /> : (
                                <RatioCard
                                    title="Return on Equity"
                                    value={pct(roe)}
                                    description="Net Income ÷ Owner's Equity"
                                    benchmark="Industry avg: ~15%"
                                    status={getRoeStatus(roe)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Solvency */}
                    <div style={{ marginBottom: 8 }}>
                        <p style={{ fontWeight: 700, marginBottom: 12 }}>Solvency</p>
                    </div>
                    <div className="grid" style={{ marginBottom: 24 }}>
                        <div style={{ gridColumn: "span 4" }}>
                            {loading ? <div className="skeleton skeleton-button" style={{ height: 140 }} /> : (
                                <RatioCard
                                    title="Debt Ratio"
                                    value={pct(debtRatio)}
                                    description="Total Liabilities ÷ Total Assets"
                                    benchmark="Industry avg: ~45%"
                                    status={getDebtStatus(debtRatio)}
                                />
                            )}
                        </div>
                        <div style={{ gridColumn: "span 4" }}>
                            {loading ? <div className="skeleton skeleton-button" style={{ height: 140 }} /> : (
                                <RatioCard
                                    title="Debt-to-Equity"
                                    value={ratio(debtToEquity)}
                                    description="Total Liabilities ÷ Owner's Equity"
                                    benchmark="Industry avg: ~1.0"
                                    status={debtToEquity <= 1 ? "good" : debtToEquity <= 2 ? "warning" : "bad"}
                                />
                            )}
                        </div>
                        <div style={{ gridColumn: "span 4" }}>
                            {loading ? <div className="skeleton skeleton-button" style={{ height: 140 }} /> : (
                                <RatioCard
                                    title="Equity Ratio"
                                    value={pct(equityRatio)}
                                    description="Owner's Equity ÷ Total Assets"
                                    benchmark="Industry avg: ~55%"
                                    status={getEquityStatus(equityRatio)}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}