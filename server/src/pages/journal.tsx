import { useState, useEffect } from "react";
import Papa from "papaparse";
import { authFetch } from "../auth";

// const API = (path: string) => `${import.meta.env.VITE_API_URL}${path}`;

/**
 * Formats a date string from "YYYY-MM-DD" to "Month Day, Year" format
 * @param dateString Date in "YYYY-MM-DD" format
 * @returns Formatted date string (e.g., "March 19, 2026")
 */
const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const formatCurrency = (val: string): string => {
    const num = parseFloat(val);
    if (!num) return "—";
    return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

interface Account {
    id: string;
    name: string;
}

interface Entry {
    date: string;
    description: string;
    debit: string;
    credit: string;
    accountName?: string;
}

interface EntryLine {
    accountId: string;
    debit: string;
    credit: string;
}

export default function Journal() {
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [lines, setLines] = useState<EntryLine[]>([
        { accountId: "", debit: "", credit: "" },
        { accountId: "", debit: "", credit: "" },
    ]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [balanceError, setBalanceError] = useState("");

    function fetchRecentEntries() {
        authFetch("/entries")
            .then((r) => r.json())
            .then((data: Entry[]) => setEntries(data))
            .catch(console.error);
    }

    useEffect(() => {
        authFetch("/account")
            .then((r) => r.json())
            .then((data: Account[]) => setAccounts(data))
            .catch(console.error);
        fetchRecentEntries();
    }, []);

    // ── Line helpers ──────────────────────────────────────────────
    function updateLine(index: number, field: keyof EntryLine, value: string) {
        setLines((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
        setBalanceError("");
    }

    function addLine() {
        setLines((prev) => [...prev, { accountId: "", debit: "", credit: "" }]);
    }

    function removeLine(index: number) {
        if (lines.length <= 2) return;
        setLines((prev) => prev.filter((_, i) => i !== index));
    }

    // ── Balance check ─────────────────────────────────────────────
    const totalDebits = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredits = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;
    const hasRequiredFields =
        date &&
        description &&
        lines.every((l) => l.accountId) &&
        lines.some((l) => parseFloat(l.debit) > 0) &&
        lines.some((l) => parseFloat(l.credit) > 0);

    // ── CSV import ────────────────────────────────────────────────
    function cleanCsvData(rows: string[][]): Entry[] {
        let currentDate = "";
        const cleanEntries: Entry[] = [];
        for (const [date, account, debit, credit] of rows.slice(4)) {
            if (!date && !account) continue;
            let formattedDate = currentDate;
            const rawDate = typeof date === "string" ? date.trim() : date;
            if (rawDate) {
                const parts = String(rawDate).split(/[-./]/);
                if (parts.length === 3) {
                    const [month, day, year] = parts;
                    formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                } else {
                    formattedDate = String(rawDate);
                }
                currentDate = formattedDate;
            }
            if (account && String(account).trim()) {
                cleanEntries.push({
                    date: formattedDate,
                    accountName: String(account).trim(),
                    description: "CSV Import",
                    debit: String(debit || "0.00").replace(/[,"]/g, ""),
                    credit: String(credit || "0.00").replace(/[,"]/g, ""),
                });
            }
        }
        return cleanEntries;
    }

    async function createMissingAccounts(csvEntries: Entry[], currentAccounts: Account[]) {
        const updatedAccounts = [...currentAccounts];
        const uniqueNames = Array.from(new Set(csvEntries.map((e) => e.accountName || "")));
        for (const name of uniqueNames) {
            if (!name) continue;
            const exists = updatedAccounts.find((a) => a.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                try {
                    const response = await authFetch("/account", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name }),
                    });
                    const newAccount = await response.json();
                    updatedAccounts.push(newAccount);
                } catch (error) {
                    console.error("Error creating account:", error);
                }
            }
        }
        return updatedAccounts;
    }

    function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: async function (result: Papa.ParseResult<string[]>) {
                const cleanEntries = cleanCsvData(result.data as string[][]);
                const updatedAccounts = await createMissingAccounts(cleanEntries, accounts);
                setAccounts(updatedAccounts);
                for (const row of cleanEntries) {
                    const matched = updatedAccounts.find(
                        (a) => a.name.toLowerCase() === row.accountName?.toLowerCase()
                    );
                    if (matched) {
                        try {
                            await authFetch(`/account/${matched.id}/entries`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    date: row.date,
                                    description: row.description,
                                    debit: row.debit,
                                    credit: row.credit,
                                }),
                            });
                        } catch (err) {
                            console.error("Failed to add CSV entry:", err);
                        }
                    }
                }
                fetchRecentEntries();
            },
        });
        e.target.value = "";
    }

    // ── Submit ────────────────────────────────────────────────────
    async function handleAddEntry() {
        if (!hasRequiredFields) return;
        if (!isBalanced) {
            setBalanceError(
                `Debits ($${totalDebits.toFixed(2)}) must equal credits ($${totalCredits.toFixed(2)}).`
            );
            return;
        }

        for (const line of lines) {
            try {
                await authFetch(`/account/${line.accountId}/entries`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date,
                        description,
                        debit: line.debit || "0.00",
                        credit: line.credit || "0.00",
                    }),
                });
            } catch (err) {
                console.error("Failed to post entry line:", err);
            }
        }

        fetchRecentEntries();
        setDate("");
        setDescription("");
        setLines([
            { accountId: "", debit: "", credit: "" },
            { accountId: "", debit: "", credit: "" },
        ]);
        setBalanceError("");
    }

    // ============== RENDER ==============
    return (
        <div>
            <h1 className="pageTitle">Journal</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                Record transactions here. Every transaction must balance — total debits must equal total credits.
            </p>

            <div className="grid">
                {/* LEFT: Entry form */}
                <div className="card" style={{ gridColumn: "span 5" }}>
                    <h2 className="cardTitle">New entry</h2>

                    <div style={{ display: "grid", gap: 10 }}>
                        <label>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Date</div>
                            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </label>

                        <label>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Description</div>
                            <input className="input" placeholder="e.g., Office supplies" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </label>

                        {/* Column headers for lines */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 28px", gap: 6, alignItems: "center" }}>
                            <div className="muted" style={{ fontSize: 11 }}>Account</div>
                            <div className="muted" style={{ fontSize: 11 }}>Debit</div>
                            <div className="muted" style={{ fontSize: 11 }}>Credit</div>
                            <div />
                        </div>

                        {/* Entry lines */}
                        {lines.map((line, idx) => (
                            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 28px", gap: 6, alignItems: "center" }}>
                                <select
                                    className="input"
                                    style={{ fontSize: 13 }}
                                    value={line.accountId}
                                    onChange={(e) => updateLine(idx, "accountId", e.target.value)}
                                >
                                    <option value="" disabled>Account…</option>
                                    {accounts.map((acct) => (
                                        <option key={acct.id} value={acct.id}>{acct.name}</option>
                                    ))}
                                </select>
                                <input
                                    className="input"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    style={{ fontSize: 13 }}
                                    value={line.debit}
                                    onChange={(e) => updateLine(idx, "debit", e.target.value)}
                                />
                                <input
                                    className="input"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    style={{ fontSize: 13 }}
                                    value={line.credit}
                                    onChange={(e) => updateLine(idx, "credit", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLine(idx)}
                                    disabled={lines.length <= 2}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: lines.length <= 2 ? "not-allowed" : "pointer",
                                        color: lines.length <= 2 ? "var(--text-muted)" : "var(--text-secondary)",
                                        fontSize: 16,
                                        padding: 0,
                                        lineHeight: 1,
                                    }}
                                    title="Remove line"
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {/* Totals row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 28px", gap: 6, borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 2 }}>
                            <div className="muted" style={{ fontSize: 12, display: "flex", alignItems: "center" }}>Totals</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isBalanced ? "var(--text-primary)" : "var(--color-warning, #f59e0b)" }}>
                                ${totalDebits.toFixed(2)}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isBalanced ? "var(--text-primary)" : "var(--color-warning, #f59e0b)" }}>
                                ${totalCredits.toFixed(2)}
                            </div>
                            <div />
                        </div>

                        {/* Balance status */}
                        {totalDebits > 0 || totalCredits > 0 ? (
                            <div style={{ fontSize: 12, color: isBalanced ? "var(--color-success, #10b981)" : "var(--color-warning, #f59e0b)", marginTop: -4 }}>
                                {isBalanced ? "✓ Balanced" : `Out of balance by $${Math.abs(totalDebits - totalCredits).toFixed(2)}`}
                            </div>
                        ) : null}

                        {balanceError && (
                            <div style={{ fontSize: 12, color: "var(--color-error, #ef4444)", padding: "6px 10px", background: "var(--color-error-bg, #fef2f2)", borderRadius: 6 }}>
                                {balanceError}
                            </div>
                        )}

                        <button type="button" className="btn" onClick={addLine} style={{ fontSize: 13 }}>
                            + Add line
                        </button>

                        <button
                            className="btn btnPrimary"
                            type="button"
                            onClick={handleAddEntry}
                            disabled={!hasRequiredFields || !isBalanced}
                        >
                            Post transaction
                        </button>

                        <label className="btn" style={{ cursor: "pointer", textAlign: "center" }}>
                            Import CSV
                            <input type="file" accept=".csv" style={{ display: "none" }} onChange={importCSV} />
                        </label>
                    </div>
                </div>

                {/* RIGHT: Recent entries */}
                <div className="card" style={{ gridColumn: "span 7" }}>
                    <div className="row" style={{ marginBottom: 10 }}>
                        <h2 className="cardTitle" style={{ margin: 0 }}>Recent entries</h2>
                        <span className="pill">{entries.length ? `${entries.length} entries` : "No data yet"}</span>
                    </div>

                    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                        <table className="table">
                            <thead style={{ position: "sticky", top: 0, backgroundColor: "var(--table-head-bg)", zIndex: 1 }}>
                                <tr>
                                    <th style={{ width: 140 }}>Date</th>
                                    <th>Description</th>
                                    <th>Account</th>
                                    <th style={{ width: 100 }}>Debit</th>
                                    <th style={{ width: 100 }}>Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length ? (
                                    entries.map((entry, idx) => (
                                        <tr key={idx}>
                                            <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{formatDate(entry.date)}</td>
                                            <td style={{ fontSize: 13 }}>{entry.description}</td>
                                            <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{entry.accountName ?? "—"}</td>
                                            <td style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                                                {parseFloat(entry.debit) ? formatCurrency(entry.debit) : <span className="muted">—</span>}
                                            </td>
                                            <td style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                                                {parseFloat(entry.credit) ? formatCurrency(entry.credit) : <span className="muted">—</span>}
                                            </td>
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
        </div>
    );
}