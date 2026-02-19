export default function Journal() {
    return (
        <div>
            <h1 className="pageTitle">Journal</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                Record transactions here. 
            </p>

            <div className="grid">
                <div className="card" style={{ gridColumn: "span 5" }}>
                <h2 className="cardTitle">New entry</h2>

                <div style={{ display: "grid", gap: 10 }}>
                    <label>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Date</div>
                    <input className="input" type="date" />
                    </label>

                    <label>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Description</div>
                    <input className="input" placeholder="e.g., Office supplies" />
                    </label>

                    <label>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Account</div>
                    <select className="input" defaultValue="">
                        <option value="" disabled>Select an account…</option>
                        <option>Cash</option>
                        <option>Accounts Receivable</option>
                        <option>Accounts Payable</option>
                        <option>Revenue</option>
                        <option>Expenses</option>
                    </select>
                    </label>

                    <div className="grid" style={{ marginTop: 0 }}>
                    <label style={{ gridColumn: "span 6" }}>
                        <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Debit</div>
                        <input className="input" inputMode="decimal" placeholder="0.00" />
                    </label>
                    <label style={{ gridColumn: "span 6" }}>
                        <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Credit</div>
                        <input className="input" inputMode="decimal" placeholder="0.00" />
                    </label>
                    </div>

                    <button className="btn btnPrimary" type="button">
                    Add entry (placeholder)
                    </button>
                </div>
                </div>

                <div className="card" style={{ gridColumn: "span 7" }}>
                <div className="row" style={{ marginBottom: 10 }}>
                    <h2 className="cardTitle" style={{ margin: 0 }}>Recent entries</h2>
                    <span className="pill">No data yet</span>
                </div>

                <table className="table">
                    <thead>
                    <tr>
                        <th style={{ width: 140 }}>Date</th>
                        <th>Description</th>
                        <th style={{ width: 160 }}>Account</th>
                        <th style={{ width: 120 }}>Debit</th>
                        <th style={{ width: 120 }}>Credit</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="muted">—</td>
                        <td className="muted">No entries recorded</td>
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