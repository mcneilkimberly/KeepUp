import { NavLink } from "react-router-dom";

export default function Home() {
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
                <span className="pill"><i>Prototype mode</i></span>
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
                    <div className="kpiValue">—</div>
                    </div>
                    <div className="kpi">
                    <div className="kpiLabel">Entries (monthly)</div>
                    <div className="kpiValue">—</div>
                    </div>
                    <div className="kpi">
                    <div className="kpiLabel">Last updated</div>
                    <div className="kpiValue">—</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ gridColumn: "span 12" }}>
            <div className="row" style={{ marginBottom: 10 }}>
                <h2 className="cardTitle" style={{ margin: 0 }}>Recent activity</h2>
                <span className="pill">Placeholder list</span>
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
                <tr>
                    <td className="muted">—</td>
                    <td className="muted">No entries yet</td>
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