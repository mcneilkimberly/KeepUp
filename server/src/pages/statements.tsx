/**
 * Statements Page Component
 * 
 * Generates financial statements (Balance Sheet, Income Statement, Cash Flow, Trial Balance)
 * by fetching real transaction data from the backend and performing calculations.
 * 
 * Features:
 * - Generates statements for a specific date range
 * - Calculates account balances from journal entries
 * - Supports multiple statement types
 * - Export to PDF (future implementation)
 */

import { useState } from "react";

// API helper function that constructs full API URLs
const API = (path: string) => `http://localhost:3001${path}`;

// ============== TYPES & INTERFACES ==============

type StatementType = "balance-sheet" | "income-statement" | "cash-flow" | "trial-balance";

/**
 * Account interface
 * Represents an account from the chart of accounts
 * - id: unique identifier (UUID)
 * - name: account name
 * - type: account type (asset, liability, equity, revenue, expense)
 * - business_id: associated business
 */
interface Account {
    id: string;
    name: string;
    type: string;
    business_id: string;
}

/**
 * Entry interface
 * Represents a single journal entry transaction
 * - date: transaction date
 * - description: transaction description
 * - debit: debit amount
 * - credit: credit amount
 */
interface Entry {
    date: string;
    description: string;
    debit: string;
    credit: string;
}

/**
 * AccountBalance interface
 * Represents a calculated account balance with its entries
 * - account: the Account object
 * - entries: all entries for this account
 * - balance: calculated balance (considering account type)
 */
interface AccountBalance {
    account: Account;
    entries: Entry[];
    balance: number;
}

export default function Statements() {
    // ============== STATE ==============
    
    const [selectedStatement, setSelectedStatement] = useState<StatementType>("balance-sheet");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [generated, setGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);

    // ============== HELPER FUNCTIONS ==============

    /**
     * calculateBalance(account: Account, entries: Entry[]): number
     * 
     * Calculates the balance for an account based on its type and transactions.
     * 
     * In double-entry bookkeeping:
     * - Asset accounts: debit increases, credit decreases → balance = sum(debits) - sum(credits)
     * - Liability accounts: credit increases, debit decreases → balance = sum(credits) - sum(debits)
     * - Equity accounts: credit increases, debit decreases → balance = sum(credits) - sum(debits)
     * - Revenue accounts: credit increases, debit decreases → balance = sum(credits) - sum(debits)
     * - Expense accounts: debit increases, credit decreases → balance = sum(debits) - sum(credits)
     * 
     * Steps:
     * 1. Sum all debits and credits from entries
     * 2. Calculate balance based on account type
     * 3. Return the final balance
     */
    function calculateBalance(account: Account, entries: Entry[]): number {
        const totalDebits = entries.reduce((sum, e) => sum + parseFloat(e.debit || "0"), 0);
        const totalCredits = entries.reduce((sum, e) => sum + parseFloat(e.credit || "0"), 0);

        // Balance calculation depends on account type
        if (account.type === "asset") {
            return totalDebits - totalCredits; // Normal debit balance
        } else if (account.type === "liability" || account.type === "equity") {
            return totalCredits - totalDebits; // Normal credit balance
        } else if (account.type === "revenue") {
            return totalCredits - totalDebits; // Normal credit balance
        } else if (account.type === "expense") {
            return totalDebits - totalCredits; // Normal debit balance
        }
        return 0;
    }

    /**
     * filterEntriesByDateRange(entries: Entry[], fromDate: string, toDate: string): Entry[]
     * 
     * Filters entries to only include those within the specified date range.
     * 
     * Steps:
     * 1. If no dates specified, return all entries
     * 2. Parse from and to dates
     * 3. Filter entries where entry.date is between from and to (inclusive)
     * 4. Return filtered entries
     */
    function filterEntriesByDateRange(entries: Entry[], fromDate: string, toDate: string): Entry[] {
        if (!fromDate && !toDate) return entries;

        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            const matchesFrom = !fromDate || entryDate >= new Date(fromDate);
            const matchesTo = !toDate || entryDate <= new Date(toDate);
            return matchesFrom && matchesTo;
        });
    }

    /**
     * handleGenerate()
     * 
     * Fetches all accounts and their entries, calculates balances, and prepares data for statements.
     * Called when user clicks "Generate" button.
     * 
     * Steps:
     * 1. Set loading state to true
     * 2. Fetch all accounts from backend (GET /account)
     * 3. For each account, fetch its entries (GET /account/{id}/entries)
     * 4. Filter entries by date range
     * 5. Calculate balance for each account
     * 6. Store account balances in state
     * 7. Set generated state to true
     * 8. Set loading to false
     * 9. Handle any errors
     */
    const handleGenerate = async () => {
        setLoading(true);
        try {
            // 1. Fetch all accounts
            const accountsResponse = await fetch(API("/account"));
            const accounts: Account[] = await accountsResponse.json();

            // 2. Fetch entries for each account
            const accountBalancesData: AccountBalance[] = [];
            for (const account of accounts) {
                const entriesResponse = await fetch(API(`/account/${account.id}/entries`));
                const entries: Entry[] = await entriesResponse.json();

                // 3. Filter by date range
                const filteredEntries = filterEntriesByDateRange(entries, fromDate, toDate);

                // 4. Calculate balance
                const balance = calculateBalance(account, filteredEntries);

                // 5. Store account balance
                accountBalancesData.push({
                    account,
                    entries: filteredEntries,
                    balance,
                });
            }

            // 6. Update state
            setAccountBalances(accountBalancesData);
            setGenerated(true);
        } catch (error) {
            console.error("Error generating statement:", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * handleExportPDF()
     * 
     * Placeholder for PDF export functionality.
     * Currently shows an alert prompting implementation.
     */
    const handleExportPDF = () => {
        alert("PDF export functionality would be implemented here");
    };

    /**
     * getStatementContent()
     * 
     * Generates and returns the appropriate statement JSX based on selectedStatement type.
     * Uses calculated accountBalances data instead of hardcoded values.
     * 
     * Returns:
     * - ReactNode with appropriate statement table/layout
     * - null if no statement is generated
     */
    const getStatementContent = () => {
        if (!generated || accountBalances.length === 0) return null;

        switch (selectedStatement) {
            case "balance-sheet":
                return renderBalanceSheet();
            case "income-statement":
                return renderIncomeStatement();
            case "cash-flow":
                return renderCashFlowStatement();
            case "trial-balance":
                return renderTrialBalance();
        }
    };

    /**
     * renderBalanceSheet()
     * 
     * Renders the Balance Sheet statement.
     * Groups accounts by type and calculates totals.
     * 
     * Structure:
     * Assets
     *   - Asset accounts (grouped by type)
     *   - Total Assets
     * Liabilities & Equity
     *   - Liability accounts
     *   - Total Liabilities
     *   - Equity accounts
     *   - Total Liabilities & Equity
     */
    const renderBalanceSheet = () => {
        const assets = accountBalances.filter(ab => ab.account.type === "asset");
        const liabilities = accountBalances.filter(ab => ab.account.type === "liability");
        const equity = accountBalances.filter(ab => ab.account.type === "equity");

        const totalAssets = assets.reduce((sum, ab) => sum + ab.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, ab) => sum + ab.balance, 0);
        const totalEquity = equity.reduce((sum, ab) => sum + ab.balance, 0);

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
                        {assets.map((ab) => (
                            <tr key={ab.account.id}>
                                <td style={{ paddingLeft: 24 }}>{ab.account.name}</td>
                                <td style={{ textAlign: "right" }}>${ab.balance.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                            <td>Total Assets</td>
                            <td style={{ textAlign: "right" }}>${totalAssets.toFixed(2)}</td>
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
                        {liabilities.map((ab) => (
                            <tr key={ab.account.id}>
                                <td style={{ paddingLeft: 24 }}>{ab.account.name}</td>
                                <td style={{ textAlign: "right" }}>${ab.balance.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold" }}>
                            <td>Total Liabilities</td>
                            <td style={{ textAlign: "right" }}>${totalLiabilities.toFixed(2)}</td>
                        </tr>
                        {equity.map((ab) => (
                            <tr key={ab.account.id}>
                                <td style={{ paddingLeft: 24 }}>{ab.account.name}</td>
                                <td style={{ textAlign: "right" }}>${ab.balance.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                            <td>Total Liabilities &amp; Equity</td>
                            <td style={{ textAlign: "right" }}>${(totalLiabilities + totalEquity).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    };

    /**
     * renderIncomeStatement()
     * 
     * Renders the Income Statement.
     * Shows revenue minus expenses to calculate net income.
     */
    const renderIncomeStatement = () => {
        const revenues = accountBalances.filter(ab => ab.account.type === "revenue");
        const expenses = accountBalances.filter(ab => ab.account.type === "expense");

        const totalRevenue = revenues.reduce((sum, ab) => sum + ab.balance, 0);
        const totalExpenses = expenses.reduce((sum, ab) => sum + ab.balance, 0);
        const netIncome = totalRevenue - totalExpenses;

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
                        <td style={{ textAlign: "right" }}>${totalRevenue.toFixed(2)}</td>
                    </tr>
                    {revenues.map((ab) => (
                        <tr key={ab.account.id}>
                            <td style={{ paddingLeft: 24 }}>{ab.account.name}</td>
                            <td style={{ textAlign: "right" }}>${ab.balance.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr style={{ height: 8 }}></tr>
                    <tr style={{ fontWeight: "bold" }}>
                        <td>Expenses</td>
                        <td></td>
                    </tr>
                    {expenses.map((ab) => (
                        <tr key={ab.account.id}>
                            <td style={{ paddingLeft: 24 }}>{ab.account.name}</td>
                            <td style={{ textAlign: "right" }}>({ab.balance.toFixed(2)})</td>
                        </tr>
                    ))}
                    <tr style={{ fontWeight: "bold" }}>
                        <td>Total Expenses</td>
                        <td style={{ textAlign: "right" }}>({totalExpenses.toFixed(2)})</td>
                    </tr>
                    <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                        <td>Net Income</td>
                        <td style={{ textAlign: "right", color: netIncome >= 0 ? "#4ade80" : "#f87171" }}>
                            ${netIncome.toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    /**
     * renderCashFlowStatement()
     * 
     * Renders the Cash Flow Statement.
     * Note: This is a simplified version. A full cash flow statement would require
     * categorizing accounts/transactions into Operating, Investing, and Financing activities.
     * Current implementation shows accounts grouped by type.
     */
    const renderCashFlowStatement = () => {
        const assets = accountBalances.filter(ab => ab.account.type === "asset");

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
                        <td>Asset Changes</td>
                        <td></td>
                    </tr>
                    {assets.map((ab) => (
                        <tr key={ab.account.id}>
                            <td style={{ paddingLeft: 24 }}>{ab.account.name}</td>
                            <td style={{ textAlign: "right" }}>${ab.balance.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr style={{ fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                        <td>Net Change in Cash</td>
                        <td style={{ textAlign: "right", color: "#4ade80" }}>
                            ${assets.reduce((sum, ab) => sum + ab.balance, 0).toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    /**
     * renderTrialBalance()
     * 
     * Renders the Trial Balance.
     * Lists all accounts with their debit and credit balances.
     * The sum of debits should equal the sum of credits (verifying double-entry bookkeeping).
     */
    const renderTrialBalance = () => {
        // For trial balance, we need to show debit and credit sides separately
        // Assets and Expenses appear on debit side
        // Liabilities, Equity, and Revenue appear on credit side
        const debitAccounts = accountBalances.filter(ab =>
            ab.account.type === "asset" || ab.account.type === "expense"
        );
        const creditAccounts = accountBalances.filter(ab =>
            ab.account.type === "liability" || ab.account.type === "equity" || ab.account.type === "revenue"
        );

        const totalDebits = debitAccounts.reduce((sum, ab) => sum + ab.balance, 0);
        const totalCredits = creditAccounts.reduce((sum, ab) => sum + ab.balance, 0);

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
                    {accountBalances.map((ab) => (
                        <tr key={ab.account.id}>
                            <td>{ab.account.name}</td>
                            <td style={{ textAlign: "right" }}>
                                {(ab.account.type === "asset" || ab.account.type === "expense") && ab.balance > 0
                                    ? `$${ab.balance.toFixed(2)}`
                                    : "—"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                                {(ab.account.type === "liability" || ab.account.type === "equity" || ab.account.type === "revenue") && ab.balance > 0
                                    ? `$${ab.balance.toFixed(2)}`
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                    <tr style={{ fontWeight: "bold", borderTop: "2px solid rgba(255,255,255,0.2)", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                        <td>Totals</td>
                        <td style={{ textAlign: "right" }}>${totalDebits.toFixed(2)}</td>
                        <td style={{ textAlign: "right" }}>${totalCredits.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        );
    };

    /**
     * getStatementTitle()
     * 
     * Returns the display title for the currently selected statement type.
     */
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

    // ============== RENDER ==============
    return (
        <div>
            <h1 className="pageTitle">Statements</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                Financial statements generated from ledger data. Select a statement type and date range, then click "Generate" to view.
            </p>

            <div className="grid">
                {/* LEFT SIDEBAR: Statement selection and date range */}
                <div className="card" style={{ gridColumn: "span 4" }}>
                    <h2 className="cardTitle">Choose a statement</h2>
                    
                    {/* Statement type buttons */}
                    <div style={{ display: "grid", gap: 10 }}>
                        {/* Balance Sheet button - shows active state when selected */}
                        <button
                            className={`btn ${selectedStatement === "balance-sheet" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("balance-sheet")}
                        >
                            Balance Sheet
                        </button>
                        
                        {/* Income Statement button */}
                        <button
                            className={`btn ${selectedStatement === "income-statement" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("income-statement")}
                        >
                            Income Statement
                        </button>
                        
                        {/* Cash Flow Statement button */}
                        <button
                            className={`btn ${selectedStatement === "cash-flow" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("cash-flow")}
                        >
                            Cash Flow
                        </button>
                        
                        {/* Trial Balance button */}
                        <button
                            className={`btn ${selectedStatement === "trial-balance" ? "btnPrimary" : ""}`}
                            type="button"
                            onClick={() => setSelectedStatement("trial-balance")}
                        >
                            Trial Balance
                        </button>
                    </div>

                    <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0" }} />

                    {/* Date range inputs */}
                    <h3 className="cardTitle" style={{ fontSize: 16 }}>Date range</h3>
                    <div className="grid" style={{ marginTop: 0 }}>
                        {/* From date input - controlled by 'fromDate' state */}
                        <label style={{ gridColumn: "span 6" }}>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>From</div>
                            <input className="input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </label>
                        
                        {/* To date input - controlled by 'toDate' state */}
                        <label style={{ gridColumn: "span 6" }}>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>To</div>
                            <input className="input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </label>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        {/* Generate button - fetches data and calculates statement */}
                        <button 
                            className="btn btnPrimary" 
                            type="button" 
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? "Generating..." : "Generate"}
                        </button>
                        
                        {/* Export PDF button - disabled until statement is generated */}
                        <button className="btn" type="button" onClick={handleExportPDF} disabled={!generated || loading}>
                            Export PDF
                        </button>
                    </div>

                    <p className="muted" style={{ marginBottom: 0, marginTop: 12, fontSize: 13 }}>
                        Click "Generate" to fetch transaction data and generate the selected statement for the date range.
                    </p>
                </div>

                {/* RIGHT PANEL: Statement display */}
                <div className="card" style={{ gridColumn: "span 8" }}>
                    {/* Header with title and date range info */}
                    <div className="row" style={{ marginBottom: 10 }}>
                        <h2 className="cardTitle" style={{ margin: 0 }}>
                            {generated ? getStatementTitle() : "Preview"}
                        </h2>
                        
                        {/* Pill showing date range of generated statement */}
                        {generated && (
                            <span className="pill">
                                {fromDate && toDate
                                    ? `${fromDate} to ${toDate}`
                                    : "All Transactions"}
                            </span>
                        )}
                    </div>

                    {/* Statement content - either rendered statement or placeholder message */}
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