export default function Statements() {
    return (
        <div>
            <h1 className="pageTitle">Statements</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                High-level financial statements from ledger. Just UI placeholders for now, so the project feels like something real.
            </p>

            <div className="grid">
                <div className="card" style={{ gridColumn: "span 4" }}>
                <h2 className="cardTitle">Choose a statement</h2>
                <div style={{ display: "grid", gap: 10 }}>
                    <button className="btn btnPrimary" type="button">Balance Sheet</button>
                    <button className="btn" type="button">Income Statement</button>
                    <button className="btn" type="button">Cash Flow</button>
                    <button className="btn" type="button">Trial Balance</button>
                </div>

                <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0" }} />

                <h3 className="cardTitle" style={{ fontSize: 16 }}>Date range</h3>
                <div className="grid" style={{ marginTop: 0 }}>
                    <label style={{ gridColumn: "span 6" }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>From</div>
                    <input className="input" type="date" />
                    </label>
                    <label style={{ gridColumn: "span 6" }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>To</div>
                    <input className="input" type="date" />
                    </label>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button className="btn btnPrimary" type="button">Generate</button>
                    <button className="btn" type="button">Export PDF</button>
                </div>

                <p className="muted" style={{ marginBottom: 0, marginTop: 12, fontSize: 13 }}>
                    Next step: compute totals from the Ledger and render a real statement.
                </p>
                </div>

                <div className="card" style={{ gridColumn: "span 8" }}>
                <div className="row" style={{ marginBottom: 10 }}>
                    <h2 className="cardTitle" style={{ margin: 0 }}>Preview</h2>
                    <span className="pill">Balance Sheet (placeholder)</span>
                </div>

                <table className="table">
                    <thead>
                    <tr>
                        <th>Assets</th>
                        <th style={{ width: 160, textAlign: "right" }}>Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {["Cash","Accounts receivable","Inventory","Total assets"].map((row) => (
                        <tr key={row}>
                        <td>{row}</td>
                        <td style={{ textAlign: "right" }} className="muted">0.00</td>
                        </tr>
                    ))}
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
                    {["Accounts payable","Owner's equity","Total liabilities & equity"].map((row) => (
                        <tr key={row}>
                        <td>{row}</td>
                        <td style={{ textAlign: "right" }} className="muted">0.00</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}