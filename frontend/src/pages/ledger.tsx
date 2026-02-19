export default function Ledger() {
    return (
        <div>
            <h1 className="pageTitle">Ledger</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                View accounts and their transactions. Eventually, this page can pull account totals and entries and whatnot from the backend, and support things like filtering.
            </p>

            <div className="grid">
                <div className="card" style={{ gridColumn: "span 3" }}>
                <div className="row" style={{ marginBottom: 10 }}>
                    <h2 className="cardTitle" style={{ margin: 0 }}>Accounts</h2>
                    <span className="pill">Prototype</span>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                    <button className="btn btnPrimary" type="button">+ Add account</button>
                    <button className="btn" type="button">Rename</button>
                    <button className="btn" type="button">Delete</button>
                </div>

                <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0" }} />

                <div style={{ display: "grid", gap: 8 }}>
                    {["Cash","Accounts Receivable","Inventory","Accounts Payable","Revenue","Expenses"].map((name) => (
                    <button key={name} className="btn" type="button" style={{ textAlign: "left" }}>
                        {name}
                    </button>
                    ))}
                </div>

                <p className="muted" style={{ fontSize: 13, marginBottom: 0, marginTop: 14 }}>
                    Tip: selecting an account will filter the table on the right.
                </p>
                </div>

                <div className="card" style={{ gridColumn: "span 9" }}>
                <div className="row" style={{ marginBottom: 10 }}>
                    <div>
                    <h2 className="cardTitle" style={{ margin: 0 }}>Select an account</h2>
                    <div className="muted" style={{ marginTop: 4 }}>No account selected</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <select className="input" defaultValue="" style={{ width: 220 }}>
                        <option value="" disabled>Filter…</option>
                        <option>Date (newest)</option>
                        <option>Date (oldest)</option>
                        <option>Amount (high→low)</option>
                    </select>
                    <button className="btn btnPrimary" type="button">Add entry</button>
                    <button className="btn" type="button">Export CSV</button>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr> 
                            <th style={{ width: 140 }}>Date</th>
                            <th>Description</th>
                            <th style={{ width: 140 }}>Debit</th>
                            <th style={{ width: 140 }}>Credit</th>
                            <th style={{ width: 140 }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="muted">—</td>
                        <td className="muted">No account selected</td>
                        <td className="muted">—</td>
                        <td className="muted">—</td>
                        <td className="muted">—</td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}