import { useState } from "react";

// entry form modal
function EntryModal({
    onSave,
    onClose,
}: {
    onSave: (entry: { date: string; description: string; debit: string; credit: string }) => void;
    onClose: () => void;
}) {
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [debit, setDebit] = useState("");
    const [credit, setCredit] = useState("");
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: "#1e1e1e",
                    padding: 20,
                    borderRadius: 6,
                    width: 350,
                }}
            >
                <h3>Add entry</h3>
                <input
                    className="input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                <input
                    className="input"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                <input
                    className="input"
                    placeholder="Debit"
                    value={debit}
                    onChange={(e) => setDebit(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                <input
                    className="input"
                    placeholder="Credit"
                    value={credit}
                    onChange={(e) => setCredit(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                        className="btn btnPrimary"
                        type="button"
                        onClick={() => {
                            onSave({ date, description, debit, credit });
                        }}
                    >
                        Save
                    </button>
                    <button className="btn" type="button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// modal used for both adding and renaming
function AccountModal({
    initialName = "",
    onSave,
    onClose,
}: {
    initialName?: string;
    onSave: (name: string) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(initialName);
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: "#1e1e1e",
                    padding: 20,
                    borderRadius: 6,
                    width: 300,
                }}
            >
                <h3>{initialName ? "Rename account" : "Add account"}</h3>
                <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Account name"
                    style={{ width: "100%" }}
                />
                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                        className="btn btnPrimary"
                        type="button"
                        onClick={() => {
                            const trimmed = name.trim();
                            if (trimmed) {
                                onSave(trimmed);
                            }
                        }}
                    >
                        Save
                    </button>
                    <button className="btn" type="button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Ledger() {
    const [accounts, setAccounts] = useState<string[]>([
        "Cash",
        "Accounts Receivable",
        "Inventory",
        "Accounts Payable",
        "Revenue",
        "Expenses",
    ]);
    const [entries, setEntries] = useState<Record<string, Array<{
        date: string;
        description: string;
        debit: string;
        credit: string;
    }>>>({});

    const [isAdding, setIsAdding] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    function addAccount(name: string) {
        setAccounts((prev) => [...prev, name]);
        setSelectedAccount(name);
    }

    function renameAccount(newName: string) {
        if (selectedAccount == null) return;
        setAccounts((prev) =>
            prev.map((a) => (a === selectedAccount ? newName : a))
        );
        // move entries to new key if any
        setEntries((prev) => {
            const newEntries = { ...prev };
            if (newEntries[selectedAccount]) {
                newEntries[newName] = newEntries[selectedAccount];
                delete newEntries[selectedAccount];
            }
            return newEntries;
        });
        setSelectedAccount(newName);
    }

    function deleteAccount() {
        if (selectedAccount == null) return;
        setAccounts((prev) => prev.filter((a) => a !== selectedAccount));
        setEntries((prev) => {
            const n = { ...prev };
            delete n[selectedAccount];
            return n;
        });
        setSelectedAccount(null);
    }

    function addEntry(entry: { date: string; description: string; debit: string; credit: string; }) {
        if (!selectedAccount) return;
        setEntries((prev) => {
            const accountEntries = prev[selectedAccount] || [];
            return { ...prev, [selectedAccount]: [...accountEntries, entry] };
        });
    }

    function exportCsv() {
        if (!selectedAccount) return;
        const accountEntries = entries[selectedAccount] || [];
        const header = ["Date", "Description", "Debit", "Credit"].join(",");
        const rows = accountEntries.map(e => [e.date, e.description, e.debit, e.credit].map(v => `"${v.replace(/"/g, '""')}"`).join(","));
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedAccount}-ledger.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

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
                    <button
                        className="btn btnPrimary"
                        type="button"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add account
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => {
                            if (selectedAccount) {
                                setIsRenaming(true);
                            }
                        }}
                        disabled={!selectedAccount}
                    >
                        Rename
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={deleteAccount}
                        disabled={!selectedAccount}
                    >
                        Delete
                    </button>
                </div>

                <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0" }} />

                <div style={{ display: "grid", gap: 8 }}>
                    {accounts.map((name) => (
                    <button
                        key={name}
                        className="btn"
                        type="button"
                        style={{ textAlign: "left" }}
                        onClick={() => setSelectedAccount(name)}
                    >
                        {name}
                    </button>
                    ))}
                </div>
                {isAdding && (
                    <AccountModal
                        onSave={(name) => {
                            addAccount(name);
                            setIsAdding(false);
                        }}
                        onClose={() => setIsAdding(false)}
                    />
                )}
                {isRenaming && selectedAccount && (
                    <AccountModal
                        initialName={selectedAccount}
                        onSave={(name) => {
                            renameAccount(name);
                            setIsRenaming(false);
                        }}
                        onClose={() => setIsRenaming(false)}
                    />
                )}
                {isAddingEntry && selectedAccount && (
                    <EntryModal
                        onSave={(entry) => {
                            addEntry(entry);
                            setIsAddingEntry(false);
                        }}
                        onClose={() => setIsAddingEntry(false)}
                    />
                )}

                <p className="muted" style={{ fontSize: 13, marginBottom: 0, marginTop: 14 }}>
                    Tip: selecting an account will filter the table on the right.
                </p>
                </div>

                <div className="card" style={{ gridColumn: "span 9" }}>
                <div className="row" style={{ marginBottom: 10 }}>
                    <div>
                    <h2 className="cardTitle" style={{ margin: 0 }}>
                        {selectedAccount ?? "Select an account"}
                    </h2>
                    <div className="muted" style={{ marginTop: 4 }}>
                        {selectedAccount ? `Showing entries for ${selectedAccount}` : "No account selected"}
                    </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <select className="input" defaultValue="" style={{ width: 220 }}>
                        <option value="" disabled>Filter…</option>
                        <option>Date (newest)</option>
                        <option>Date (oldest)</option>
                        <option>Amount (high→low)</option>
                    </select>
                    <button
                        className="btn btnPrimary"
                        type="button"
                        onClick={() => {
                            if (selectedAccount) setIsAddingEntry(true);
                        }}
                        disabled={!selectedAccount}
                    >
                        Add entry
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={exportCsv}
                        disabled={!selectedAccount}
                    >
                        Export CSV
                    </button>
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
                    {selectedAccount ? (
                        (entries[selectedAccount] || []).length ? (
                            (entries[selectedAccount] || []).map((e, idx) => (
                                <tr key={idx}>
                                    <td>{e.date}</td>
                                    <td>{e.description}</td>
                                    <td>{e.debit}</td>
                                    <td>{e.credit}</td>
                                    <td className="muted">—</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="muted" style={{ textAlign: "center" }}>
                                    No entries for {selectedAccount}
                                </td>
                            </tr>
                        )
                    ) : (
                        <tr>
                            <td className="muted">—</td>
                            <td className="muted">No account selected</td>
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