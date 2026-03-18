import { useState } from "react";

export default function Journal() {
    // State for form fields
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [account, setAccount] = useState("");
    const [debit, setDebit] = useState("");
    const [credit, setCredit] = useState("");
    const [entries, setEntries] = useState<Array<{ date: string; description: string; account: string; debit: string; credit: string }>>([]);

    function handleAddEntry() {
        if (!date || !description || !account) return;
        setEntries([
            ...entries,
            {
                date,
                description,
                account,
                debit: debit || "0.00",
                credit: credit || "0.00",
            },
        ]);
        // Reset form
        setDate("");
        setDescription("");
        setAccount("");
        setDebit("");
        setCredit("");
    }

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
                            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </label>

                        <label>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Description</div>
                            <input className="input" placeholder="e.g., Office supplies" value={description} onChange={e => setDescription(e.target.value)} />
                        </label>

                        <label>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Account</div>
                            <select className="input" value={account} onChange={e => setAccount(e.target.value)}>
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
                                <input className="input" inputMode="decimal" placeholder="0.00" value={debit} onChange={e => setDebit(e.target.value)} />
                            </label>
                            <label style={{ gridColumn: "span 6" }}>
                                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Credit</div>
                                <input className="input" inputMode="decimal" placeholder="0.00" value={credit} onChange={e => setCredit(e.target.value)} />
                            </label>
                        </div>

                        <button className="btn btnPrimary" type="button" onClick={handleAddEntry} disabled={!date || !description || !account}>
                            Add entry
                        </button>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: "span 7" }}>
                    <div className="row" style={{ marginBottom: 10 }}>
                        <h2 className="cardTitle" style={{ margin: 0 }}>Recent entries</h2>
                        <span className="pill">{entries.length ? `${entries.length} entries` : "No data yet"}</span>
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
                            {entries.length ? (
                                entries.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td>{entry.date}</td>
                                        <td>{entry.description}</td>
                                        <td>{entry.account}</td>
                                        <td>{entry.debit}</td>
                                        <td>{entry.credit}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="muted">—</td>
                                    <td className="muted">No entries recorded</td>
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