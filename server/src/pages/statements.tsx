import { useState } from "react";

type StatementType = "balance-sheet" | "income-statement" | "cash-flow" | "trial-balance";

export default function Statements() {
    const [selectedStatement, setSelectedStatement] = useState<StatementType>("balance-sheet");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [generated, setGenerated] = useState(false);

    const handleGenerate = () => {
        setGenerated(true);
    };

    const handleExportPDF = () => {
        alert("PDF export functionality would be implemented here");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);
    };

    const getStatementContent = () => {
        if (!generated) return null;

        switch (selectedStatement) {
            case "balance-sheet":
                return (
                    <>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Assets</th>
                                    <th style={{ width: 160, textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Cash</td>
                                    <td style={{ textAlign: "right" }}>$50,000.00</td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Accounts Receivable</td>
                                    <td style={{ textAlign: "right" }}>$32,500.00</td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Inventory</td>
                                    <td style={{ textAlign: "right" }}>$45,200.00</td>
                                </tr>
                                <tr style={{ fontWeight: "bold" }}>
                                    <td>Total Current Assets</td>
                                    <td style={{ textAlign: "right" }}>$127,700.00</td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Property, Plant & Equipment</td>
                                    <td style={{ textAlign: "right" }}>$250,000.00</td>
                                </tr>
                                <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                                    <td>Total Assets</td>
                                    <td style={{ textAlign: "right" }}>$377,700.00</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ height: 14 }} />

                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Liabilities &amp; Equity</th>
                                    <th style={{ width: 160, textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Accounts Payable</td>
                                    <td style={{ textAlign: "right" }}>$28,300.00</td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Short-term Debt</td>
                                    <td style={{ textAlign: "right" }}>$15,000.00</td>
                                </tr>
                                <tr style={{ fontWeight: "bold" }}>
                                    <td>Total Current Liabilities</td>
                                    <td style={{ textAlign: "right" }}>$43,300.00</td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Long-term Debt</td>
                                    <td style={{ textAlign: "right" }}>$100,000.00</td>
                                </tr>
                                <tr style={{ fontWeight: "bold" }}>
                                    <td>Total Liabilities</td>
                                    <td style={{ textAlign: "right" }}>$143,300.00</td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: 24 }}>Owner's Equity</td>
                                    <td style={{ textAlign: "right" }}>$234,400.00</td>
                                </tr>
                                <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                                    <td>Total Liabilities &amp; Equity</td>
                                    <td style={{ textAlign: "right" }}>$377,700.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                );

            case "income-statement":
                return (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Income Statement</th>
                                <th style={{ width: 160, textAlign: "right" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Revenue</td>
                                <td style={{ textAlign: "right" }}>$500,000.00</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Cost of Goods Sold</td>
                                <td style={{ textAlign: "right" }}>($250,000.00)</td>
                            </tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Gross Profit</td>
                                <td style={{ textAlign: "right" }}>$250,000.00</td>
                            </tr>
                            <tr style={{ height: 8 }}></tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Operating Expenses</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 48 }}>Salaries & Wages</td>
                                <td style={{ textAlign: "right" }}>($80,000.00)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 48 }}>Rent</td>
                                <td style={{ textAlign: "right" }}>($24,000.00)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 48 }}>Utilities</td>
                                <td style={{ textAlign: "right" }}>($12,000.00)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 48 }}>Depreciation</td>
                                <td style={{ textAlign: "right" }}>($10,000.00)</td>
                            </tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Total Operating Expenses</td>
                                <td style={{ textAlign: "right" }}>($126,000.00)</td>
                            </tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Operating Income (EBIT)</td>
                                <td style={{ textAlign: "right" }}>$124,000.00</td>
                            </tr>
                            <tr style={{ height: 8 }}></tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Interest Expense</td>
                                <td style={{ textAlign: "right" }}>($8,000.00)</td>
                            </tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Income Before Taxes</td>
                                <td style={{ textAlign: "right" }}>$116,000.00</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Income Taxes</td>
                                <td style={{ textAlign: "right" }}>($27,840.00)</td>
                            </tr>
                            <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                                <td>Net Income</td>
                                <td style={{ textAlign: "right", color: "#4ade80" }}>$88,160.00</td>
                            </tr>
                        </tbody>
                    </table>
                );

            case "cash-flow":
                return (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Cash Flow Statement</th>
                                <th style={{ width: 160, textAlign: "right" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Operating Activities</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Net Income</td>
                                <td style={{ textAlign: "right" }}>$88,160.00</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Depreciation</td>
                                <td style={{ textAlign: "right" }}>$10,000.00</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Decrease in Accounts Receivable</td>
                                <td style={{ textAlign: "right" }}>$5,000.00</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Increase in Inventory</td>
                                <td style={{ textAlign: "right" }}>($8,000.00)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Increase in Accounts Payable</td>
                                <td style={{ textAlign: "right" }}>$12,000.00</td>
                            </tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Net Cash from Operating Activities</td>
                                <td style={{ textAlign: "right" }}>$107,160.00</td>
                            </tr>
                            <tr style={{ height: 8 }}></tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Investing Activities</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Purchase of Equipment</td>
                                <td style={{ textAlign: "right" }}>($25,000.00)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Sale of Assets</td>
                                <td style={{ textAlign: "right" }}>$5,000.00</td>
                            </tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Net Cash from Investing Activities</td>
                                <td style={{ textAlign: "right" }}>($20,000.00)</td>
                            </tr>
                            <tr style={{ height: 8 }}></tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Financing Activities</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Loan Repayment</td>
                                <td style={{ textAlign: "right" }}>($15,000.00)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 24 }}>Dividend Payments</td>
                                <td style={{ textAlign: "right" }}>($20,000.00)</td>
                            </tr>
                            <tr style={{ fontWeight: "bold" }}>
                                <td>Net Cash from Financing Activities</td>
                                <td style={{ textAlign: "right" }}>($35,000.00)</td>
                            </tr>
                            <tr style={{ height: 8, borderBottom: "2px solid rgba(255,255,255,0.2)" }}></tr>
                            <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                                <td>Net Change in Cash</td>
                                <td style={{ textAlign: "right", color: "#4ade80" }}>$52,160.00</td>
                            </tr>
                        </tbody>
                    </table>
                );

            case "trial-balance":
                return (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th style={{ width: 140, textAlign: "right" }}>Debit</th>
                                <th style={{ width: 140, textAlign: "right" }}>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Cash</td>
                                <td style={{ textAlign: "right" }}>$50,000.00</td>
                                <td style={{ textAlign: "right" }}>—</td>
                            </tr>
                            <tr>
                                <td>Accounts Receivable</td>
                                <td style={{ textAlign: "right" }}>$32,500.00</td>
                                <td style={{ textAlign: "right" }}>—</td>
                            </tr>
                            <tr>
                                <td>Inventory</td>
                                <td style={{ textAlign: "right" }}>$45,200.00</td>
                                <td style={{ textAlign: "right" }}>—</td>
                            </tr>
                            <tr>
                                <td>Equipment</td>
                                <td style={{ textAlign: "right" }}>$250,000.00</td>
                                <td style={{ textAlign: "right" }}>—</td>
                            </tr>
                            <tr>
                                <td>Accounts Payable</td>
                                <td style={{ textAlign: "right" }}>—</td>
                                <td style={{ textAlign: "right" }}>$28,300.00</td>
                            </tr>
                            <tr>
                                <td>Short-term Debt</td>
                                <td style={{ textAlign: "right" }}>—</td>
                                <td style={{ textAlign: "right" }}>$15,000.00</td>
                            </tr>
                            <tr>
                                <td>Long-term Debt</td>
                                <td style={{ textAlign: "right" }}>—</td>
                                <td style={{ textAlign: "right" }}>$100,000.00</td>
                            </tr>
                            <tr>
                                <td>Owner's Equity</td>
                                <td style={{ textAlign: "right" }}>—</td>
                                <td style={{ textAlign: "right" }}>$234,400.00</td>
                            </tr>
                            <tr style={{ fontWeight: "bold", borderTop: "2px solid rgba(255,255,255,0.2)", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                                <td>Totals</td>
                                <td style={{ textAlign: "right" }}>$377,700.00</td>
                                <td style={{ textAlign: "right" }}>$377,700.00</td>
                            </tr>
                        </tbody>
                    </table>
                );
        }
    };

    const getStatementTitle = () => {
        switch (selectedStatement) {
            case "balance-sheet":
                return "Balance Sheet";
            case "income-statement":
                return "Income Statement";
            case "cash-flow":
                return "Cash Flow Statement";
            case "trial-balance":
                return "Trial Balance";
        }
    };

    return (
        <div>
            <h1 className="pageTitle">Statements</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                High-level financial statements from ledger. Eventually connected to real transaction data.
            </p>

            <div className="grid">
                <div className="card" style={{ gridColumn: "span 4" }}>
                    <h2 className="cardTitle">Choose a statement</h2>
                    <div style={{ display: "grid", gap: 10 }}>
                        <button
                            className={`btn ${selectedStatement === "balance-sheet" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("balance-sheet")}
                        >
                            Balance Sheet
                        </button>
                        <button
                            className={`btn ${selectedStatement === "income-statement" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("income-statement")}
                        >
                            Income Statement
                        </button>
                        <button
                            className={`btn ${selectedStatement === "cash-flow" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("cash-flow")}
                        >
                            Cash Flow
                        </button>
                        <button
                            className={`btn ${selectedStatement === "trial-balance" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("trial-balance")}
                        >
                            Trial Balance
                        </button>
                    </div>

                    <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0" }} />

                    <h3 className="cardTitle" style={{ fontSize: 16 }}>Date range</h3>
                    <div className="grid" style={{ marginTop: 0 }}>
                        <label style={{ gridColumn: "span 6" }}>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>From</div>
                            <input className="input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </label>
                        <label style={{ gridColumn: "span 6" }}>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>To</div>
                            <input className="input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </label>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button className="btn btnPrimary" type="button" onClick={handleGenerate}>
                            Generate
                        </button>
                        <button className="btn" type="button" onClick={handleExportPDF} disabled={!generated}>
                            Export PDF
                        </button>
                    </div>

                    <p className="muted" style={{ marginBottom: 0, marginTop: 12, fontSize: 13 }}>
                        Click "Generate" to view the selected statement for the date range.
                    </p>
                </div>

                <div className="card" style={{ gridColumn: "span 8" }}>
                    <div className="row" style={{ marginBottom: 10 }}>
                        <h2 className="cardTitle" style={{ margin: 0 }}>
                            {generated ? getStatementTitle() : "Preview"}
                        </h2>
                        {generated && (
                            <span className="pill">
                                {fromDate && toDate
                                    ? `${fromDate} to ${toDate}`
                                    : "Current Period"}
                            </span>
                        )}
                    </div>

                    {generated ? (
                        getStatementContent()
                    ) : (
                        <p className="muted">Select a statement and click "Generate" to view it here.</p>
                    )}
                </div>
            </div>
        </div>
    );
}