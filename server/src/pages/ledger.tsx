/**
 * Ledger Page Component
 * 
 * A comprehensive accounting ledger interface that allows users to:
 * - Create, rename, and delete accounts (chart of accounts)
 * - Add journal entries to specific accounts
 * - View, select, and delete account transactions in a table
 * - Export account data as CSV
 * - Filter and manage multiple accounts
 * 
 * Layout: Left sidebar shows account list, right panel shows selected account's entries
 */

import { useState, useEffect } from "react";

// API helper function that constructs full API URLs
const API = (path: string) => `http://localhost:3001${path}`;

/**
 * Formats a date string from "YYYY-MM-DD" to "Month Day, Year" format
 * @param dateString Date in "YYYY-MM-DD" format
 * @returns Formatted date string (e.g., "March 19, 2026")
 */
const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    // Parse YYYY-MM-DD format safely without timezone issues
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString; // Fallback if format is unexpected
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

/**
 * Account interface
 * Represents a single account from the database
 * - id: unique identifier (UUID string, not number)
 * - name: account name (e.g., "Cash", "Revenue")
 */
interface Account {
    //id is a string because we're using uuids, so we'll just treat it as a string for flexibility
    id: string;
    name: string;
}

/**
 * Entry interface
 * Represents a single journal entry/transaction
 * - id: unique identifier from the database (for deletion/updates)
 * - date: transaction date
 * - description: what the transaction was for
 * - debit: debit amount as string
 * - credit: credit amount as string
 */
interface Entry {
    id?: string | number; // Entry ID from database for deletion
    date: string;
    description: string;
    debit: string;
    credit: string;
}

/**
 * DeleteConfirmModal Component
 * 
 * A modal dialog asking the user to confirm deletion of an entry.
 * Shows the entry details being deleted.
 * 
 * Props:
 * - entry: the entry being deleted
 * - onConfirm: callback when user clicks confirm
 * - onCancel: callback when user clicks cancel
 */
function DeleteConfirmModal({
    entry,
    onConfirm,
    onCancel,
}: {
    entry: Entry;
    onConfirm: () => void;
    onCancel: () => void;
}) {
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
                    width: 400,
                }}
            >
                <h3>Delete entry?</h3>
                <p className="muted" style={{ margin: "12px 0" }}>
                    Are you sure you want to delete this entry?
                </p>
                <div
                    style={{
                        background: "rgba(139, 0, 0, 0.2)",
                        padding: 12,
                        borderRadius: 4,
                        marginBottom: 16,
                        fontSize: 13,
                    }}
                >
                    <div style={{ marginBottom: 4 }}>
                        <strong>Date:</strong> {formatDate(entry.date)}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                        <strong>Description:</strong> {entry.description}
                    </div>
                    <div>
                        <strong>Amount:</strong> Debit: {entry.debit}, Credit: {entry.credit}
                    </div>
                </div>
                <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
                    This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn" type="button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={onConfirm}
                        style={{ background: "#8b0000", color: "white" }}
                    >
                        Delete Entry
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * EntryModal Component
 * 
 * A modal dialog for creating new journal entries.
 * Provides form inputs for date, description, debit, and credit amounts.
 * 
 * Props:
 * - onSave: callback function that receives the completed entry object
 * - onClose: callback function called when user cancels the modal
 * 
 * Features:
 * - Fixed position overlay that blocks background interaction
 * - All four entry fields (date, description, debit, credit)
 * - Save and Cancel buttons
 * - Numeric validation on debit and credit fields (no letters allowed)
 */
function EntryModal({
    onSave,
    onClose,
}: {
    onSave: (entry: { date: string; description: string; debit: string; credit: string }) => void;
    onClose: () => void;
}) {
    // State for form fields in this modal
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [debit, setDebit] = useState("");
    const [credit, setCredit] = useState("");
    
    /**
     * Validates and filters numeric input (allows digits and decimal point)
     * Removes any letters or invalid characters
     */
    const filterNumericInput = (value: string): string => {
        // Only allow digits and one decimal point
        return value.replace(/[^\d.]/g, "").replace(/(\..*?)\./g, "$1");
    };
    
    return (
        <div
            // Modal backdrop - covers entire screen with semi-transparent dark overlay
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
            {/* Modal dialog box */}
            <div
                style={{
                    background: "#1e1e1e",
                    padding: 20,
                    borderRadius: 6,
                    width: 350,
                }}
            >
                <h3>Add entry</h3>
                
                {/* Date input - controlled by 'date' state */}
                <input
                    className="input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                
                {/* Description input - controlled by 'description' state */}
                <input
                    className="input"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                
                {/* Debit amount input - controlled by 'debit' state */}
                {/* Only accepts numeric input (no letters) */}
                <input
                    className="input"
                    placeholder="Debit"
                    value={debit}
                    onChange={(e) => setDebit(filterNumericInput(e.target.value))}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                
                {/* Credit amount input - controlled by 'credit' state */}
                {/* Only accepts numeric input (no letters) */}
                <input
                    className="input"
                    placeholder="Credit"
                    value={credit}
                    onChange={(e) => setCredit(filterNumericInput(e.target.value))}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                
                {/* Action buttons */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    {/* Save button - calls onSave with completed entry data */}
                    <button
                        className="btn btnPrimary"
                        type="button"
                        onClick={() => {
                            onSave({ date, description, debit, credit });
                        }}
                    >
                        Save
                    </button>
                    
                    {/* Cancel button - closes modal without saving */}
                    <button className="btn" type="button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * AccountModal Component
 * 
 * A reusable modal dialog for adding or renaming accounts.
 * The title and behavior change based on whether initialName is provided.
 * 
 * Props:
 * - initialName: (optional) name of account being renamed. If empty, modal is for adding new account
 * - onSave: callback function that receives the trimmed account name
 * - onClose: callback function called when user cancels the modal
 * 
 * Features:
 * - Dynamic title: "Add account" or "Rename account"
 * - Trims whitespace from input before saving
 * - Only saves if name is not empty
 */
function AccountModal({
    initialName = "",
    onSave,
    onClose,
}: {
    initialName?: string;
    onSave: (name: string) => void;
    onClose: () => void;
}) {
    // State for the account name input
    const [name, setName] = useState(initialName);
    
    return (
        <div
            // Modal backdrop - covers entire screen with semi-transparent dark overlay
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
            {/* Modal dialog box */}
            <div
                style={{
                    background: "#1e1e1e",
                    padding: 20,
                    borderRadius: 6,
                    width: 300,
                }}
            >
                {/* Title changes based on whether we're adding or renaming */}
                <h3>{initialName ? "Rename account" : "Add account"}</h3>
                
                {/* Account name input - controlled by 'name' state */}
                <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Account name"
                    style={{ width: "100%" }}
                />
                
                {/* Action buttons */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    {/* Save button - trims whitespace and saves if not empty */}
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
                    
                    {/* Cancel button - closes modal without saving */}
                    <button className="btn" type="button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Ledger Component (Main)
 * 
 * The main ledger page component that manages account data and user interactions.
 */
export default function Ledger() {
    // ============== STATE VARIABLES ==============
    
    // List of all accounts from the database
    const [accounts, setAccounts] = useState<Account[]>([]);
    
    /**
     * entries state structure: Record<accountId, Entry[]>
     * Maps each account ID to its array of journal entries
     * Example: {
     *   "uuid-1": [{ date: "2026-03-18", description: "...", debit: "...", credit: "..." }, ...],
     *   "uuid-2": [...]
     * }
     * Using Record<string> instead of Record<number> because account IDs are UUID strings
     */
    const [entries, setEntries] = useState<Record<string, Entry[]>>({});

    // Modal visibility states
    const [isAdding, setIsAdding] = useState(false);        // "Add account" modal visibility
    const [isRenaming, setIsRenaming] = useState(false);    // "Rename account" modal visibility
    const [isAddingEntry, setIsAddingEntry] = useState(false); // "Add entry" modal visibility
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // Delete confirmation modal visibility
    
    // Currently selected account (null if none selected)
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    
    // Currently selected entry - tracks which entry in the table is clicked
    // Stored as index into the entries array for the selected account
    const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);

    // ============== EFFECTS ==============

    /**
     * useEffect: Fetch accounts on component mount
     * 
     * Runs once when the page loads.
     * Retrieves all accounts from the backend and populates the sidebar list.
     * 
     * Steps:
     * 1. Calls GET /account endpoint
     * 2. Parses JSON response
     * 3. Sets accounts state with the returned data
     * 4. Catches any errors and logs them
     * 
     * Empty dependency array [] means it runs only on mount.
     */
    useEffect(() => {
        fetch(API("/account"))
            .then((r) => r.json())
            .then((data: Account[]) => setAccounts(data))
            .catch(console.error);
    }, []);

    /**
     * useEffect: Fetch entries when selected account changes
     * 
     * Runs whenever selectedAccount changes.
     * Fetches all journal entries for the currently selected account.
     * 
     * Steps:
     * 1. If no account is selected, return early (do nothing)
     * 2. Calls GET /account/{accountId}/entries endpoint
     * 3. Parses JSON response
     * 4. Updates entries state with the fetched data (stored under account ID key)
     * 5. Catches any errors and logs them
     * 
     * Dependency: [selectedAccount]
     */
    useEffect(() => {
        if (!selectedAccount) return;
        fetch(API(`/account/${selectedAccount.id}/entries`))
            .then((r) => r.json())
            .then((data: Entry[]) =>
                setEntries((prev) => ({ ...prev, [selectedAccount.id]: data }))
            )
            .catch(console.error);
    }, [selectedAccount]);

    /**
     * useEffect: Clear entry selection when account changes
     * 
     * Clears the selected entry whenever a different account is selected.
     * Separated from fetch effect to avoid cascading renders.
     * 
     * Dependency: [selectedAccount]
     */
    useEffect(() => {
        setSelectedEntryIndex(null);
    }, [selectedAccount]);

    // ============== FUNCTIONS ==============

    /**
     * addAccount(name: string)
     * 
     * Creates a new account and adds it to the list.
     * 
     * Steps:
     * 1. Makes POST request to /account with name in body
     * 2. Parses the returned account object (includes auto-generated ID)
     * 3. Adds the new account to the accounts state
     * 4. Automatically selects the newly created account
     * 5. Catches any errors and logs them
     * 
     * Called by: AccountModal's onSave (when user clicks Save in "Add account" dialog)
     */
    function addAccount(name: string) {
        fetch(API("/account"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
            .then((r) => r.json())
            .then((acct: Account) => {
                setAccounts((prev) => [...prev, acct]);
                setSelectedAccount(acct);
            })
            .catch(console.error);
    }

    /**
     * renameAccount(newName: string)
     * 
     * Renames the currently selected account.
     * 
     * Steps:
     * 1. Guards against no selected account (returns early if none)
     * 2. Makes PUT request to /account/{accountId} with new name
     * 3. Updates the account in the accounts list with the new name
     * 4. Updates selectedAccount state with the new name
     * 5. Catches any errors (no explicit error handling shown, but errors logged by catch)
     * 
     * Called by: AccountModal's onSave (when user clicks Save in "Rename account" dialog)
     */
    function renameAccount(newName: string) {
        if (!selectedAccount) return;
        fetch(API(`/account/${selectedAccount.id}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
        }).then(() => {
            // Update the account in the list
            setAccounts((prev) =>
                prev.map((a) =>
                    a.id === selectedAccount.id ? { ...a, name: newName } : a
                )
            );
            // Update the selected account with new name
            setSelectedAccount((a) => (a ? { ...a, name: newName } : null));
        });
    }

    /**
     * deleteAccount()
     * 
     * Deletes the currently selected account from the system.
     * Also clears its entries from the entries state.
     * 
     * Steps:
     * 1. Guards against no selected account (returns early if none)
     * 2. Makes DELETE request to /account/{accountId}
     * 3. Removes the deleted account from the accounts list
     * 4. Removes the deleted account's entries from the entries Record
     * 5. Clears selectedAccount (deselects it)
     * 6. Catches any errors (no explicit error handling shown)
     * 
     * Called by: "Delete" button onClick (disabled if no account selected)
     */
    function deleteAccount() {
        if (!selectedAccount) return;
        fetch(API(`/account/${selectedAccount.id}`), { method: "DELETE" }).then(() => {
            // Remove from accounts list
            setAccounts((prev) => prev.filter((a) => a.id !== selectedAccount.id));
            
            // Remove from entries Record
            setEntries((prev) => {
                const n = { ...prev };
                delete n[selectedAccount.id];
                return n;
            });
            
            // Clear selected account
            setSelectedAccount(null);
        });
    }

    /**
     * addEntry(entry: Entry)
     * 
     * Adds a new journal entry to the currently selected account.
     * 
     * Steps:
     * 1. Guards against no selected account (returns early if none)
     * 2. Makes POST request to /account/{accountId}/entries with entry data
     * 3. Adds the new entry to the entries state under the selected account ID
     * 4. Catches any errors (no explicit error handling shown)
     * 
     * Called by: EntryModal's onSave (when user clicks Save in "Add entry" dialog)
     */
    function addEntry(entry: Entry) {
        if (!selectedAccount) return;
        fetch(API(`/account/${selectedAccount.id}/entries`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
        }).then(() => {
            // Add the entry to the entries Record
            setEntries((prev) => {
                const accountEntries = prev[selectedAccount.id] || [];
                return {
                    ...prev,
                    [selectedAccount.id]: [...accountEntries, entry],
                };
            });
        });
    }

    /**
     * deleteEntry(entryIndex: number)
     * 
     * Deletes a selected entry from the currently selected account.
     * 
     * Steps:
     * 1. Guards against no selected account (returns early if none)
     * 2. Gets the entry at the specified index
     * 3. If entry has an ID, makes DELETE request to /account/{accountId}/entries/{entryId}
     * 4. Removes entry from the entries state
     * 5. Clears the selection
     * 
     * Called by: Delete confirmation modal
     */
    function deleteEntry(entryIndex: number) {
        if (!selectedAccount) return;
        
        const accountEntries = entries[selectedAccount.id] || [];
        const entryToDelete = accountEntries[entryIndex];
        
        // Make DELETE request to backend if entry has an ID
        if (entryToDelete?.id) {
            fetch(API(`/account/${selectedAccount.id}/entries/${entryToDelete.id}`), {
                method: "DELETE",
            }).catch(console.error);
        }
        
        // Remove from UI state
        setEntries((prev) => {
            const updatedEntries = accountEntries.filter((_, idx) => idx !== entryIndex);
            return {
                ...prev,
                [selectedAccount.id]: updatedEntries,
            };
        });
        setSelectedEntryIndex(null);
    }

    /**
     * exportCsv()
     * 
     * Exports the currently selected account's entries as a downloadable CSV file.
     * The CSV contains columns: Date, Description, Debit, Credit
     * 
     * Steps:
     * 1. Guards against no selected account (returns early if none)
     * 2. Gets the entries array for the selected account
     * 3. Constructs CSV header row: "Date,Description,Debit,Credit"
     * 4. Maps each entry to a CSV row, properly escaping quotes in values
     * 5. Joins header and rows with newlines
     * 6. Creates a Blob with CSV MIME type
     * 7. Creates a temporary download link using Object URL
     * 8. Creates a temporary anchor element
     * 9. Sets anchor filename to "{accountName}-ledger.csv"
     * 10. Programmatically clicks the anchor to trigger browser download
     * 11. Removes the anchor from the DOM
     * 12. Revokes the Object URL to free memory
     * 
     * Called by: "Export CSV" button onClick (disabled if no account selected)
     */
    function exportCsv() {
        if (!selectedAccount) return;
        const accountEntries = entries[selectedAccount.id] || [];
        
        // Build CSV header
        const header = ["Date", "Description", "Debit", "Credit"].join(",");
        
        // Build CSV rows - escape quotes by doubling them
        const rows = accountEntries.map(e => 
            [e.date, e.description, e.debit, e.credit]
                .map(v => `"${v.replace(/"/g, '""')}"`) // Wrap in quotes, escape internal quotes
                .join(",")
        );
        
        // Combine header and rows
        const csv = [header, ...rows].join("\n");
        
        // Create downloadable blob and trigger browser download
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedAccount.name}-ledger.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ============== RENDER ==============
    return (
        <div>
            <h1 className="pageTitle">Ledger</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                View accounts and their transactions. Click on any entry to select it, then use the delete button to remove it.
            </p>

            <div className="grid">
                {/* LEFT SIDEBAR: Account management */}
                <div className="card" style={{ gridColumn: "span 3" }}>
                    <div className="row" style={{ marginBottom: 10 }}>
                        <h2 className="cardTitle" style={{ margin: 0 }}>Accounts</h2>
                        <span className="pill">Prototype</span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "grid", gap: 8 }}>
                        {/* Add Account button - opens AccountModal for creating new account */}
                        <button
                            className="btn btnPrimary"
                            type="button"
                            onClick={() => setIsAdding(true)}
                        >
                            + Add account
                        </button>
                        
                        {/* Rename button - disabled if no account selected */}
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
                        
                        {/* Delete button - disabled if no account selected */}
                        <button
                            className="btn"
                            type="button"
                            onClick={deleteAccount}
                            disabled={!selectedAccount}
                        >
                            Delete
                        </button>
                    </div>

                    {/* Visual divider */}
                    <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0" }} />

                    {/* Account list - each account is clickable */}
                    <div style={{ display: "grid", gap: 8 }}>
                        {accounts.map((acct) => (
                            <button
                                key={acct.id}
                                className="btn"
                                type="button"
                                style={{ textAlign: "left" }}
                                onClick={() => setSelectedAccount(acct)}
                            >
                                {acct.name}
                            </button>
                        ))}
                    </div>
                    
                    {/* Modals - only render when active */}
                    
                    {/* "Add account" modal */}
                    {isAdding && (
                        <AccountModal
                            onSave={(name) => {
                                addAccount(name);
                                setIsAdding(false);
                            }}
                            onClose={() => setIsAdding(false)}
                        />
                    )}
                    
                    {/* "Rename account" modal */}
                    {isRenaming && selectedAccount && (
                        <AccountModal
                            initialName={selectedAccount.name}
                            onSave={(name) => {
                                renameAccount(name);
                                setIsRenaming(false);
                            }}
                            onClose={() => setIsRenaming(false)}
                        />
                    )}
                    
                    {/* "Add entry" modal */}
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

                {/* RIGHT PANEL: Account entries and details */}
                <div className="card" style={{ gridColumn: "span 9" }}>
                    {/* Header section with title and controls */}
                    <div className="row" style={{ marginBottom: 10 }}>
                        <div>
                            {/* Title shows selected account name or placeholder */}
                            <h2 className="cardTitle" style={{ margin: 0 }}>
                                {selectedAccount ? selectedAccount.name : "Select an account"}
                            </h2>
                            
                            {/* Subtitle shows which account entries are displayed */}
                            <div className="muted" style={{ marginTop: 4 }}>
                                {selectedAccount
                                    ? `Showing entries for ${selectedAccount.name}`
                                    : "No account selected"}
                            </div>
                        </div>

                        {/* Control buttons and filter dropdown */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {/* Filter dropdown - currently non-functional (placeholder) */}
                            <select className="input" defaultValue="" style={{ width: 220 }}>
                                <option value="" disabled>Filter…</option>
                                <option>Date (newest)</option>
                                <option>Date (oldest)</option>
                                <option>Amount (high→low)</option>
                            </select>
                            
                            {/* Add entry button - opens EntryModal, disabled if no account selected */}
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
                            
                            {/* Delete entry button - opens delete confirmation, disabled if no entry selected */}
                            <button
                                className="btn"
                                type="button"
                                onClick={() => setIsConfirmingDelete(true)}
                                disabled={selectedEntryIndex === null}
                                style={{
                                    background: selectedEntryIndex !== null ? "#8b0000" : "gray",
                                    color: "white",
                                }}
                            >
                                Delete entry
                            </button>
                            
                            {/* Export CSV button - downloads entries as CSV, disabled if no account selected */}
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

                    {/* Entries table */}
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
                                // If account is selected, show its entries
                                (entries[selectedAccount.id] || []).length ? (
                                    // If account has entries, map and display each one
                                    (entries[selectedAccount.id] || []).map((e, idx) => (
                                        <tr
                                            key={idx}
                                            onClick={() => setSelectedEntryIndex(idx)}
                                            style={{
                                                cursor: "pointer",
                                                background:
                                                    selectedEntryIndex === idx
                                                        ? "rgba(59, 130, 246, 0.2)"
                                                        : "transparent",
                                                transition: "background-color 0.2s",
                                            }}
                                        >
                                            <td>{formatDate(e.date)}</td>
                                            <td>{e.description}</td>
                                            <td>{e.debit}</td>
                                            <td>{e.credit}</td>
                                            <td className="muted">—</td> {/* Balance column: placeholder for future */}
                                        </tr>
                                    ))
                                ) : (
                                    // If account has no entries, show empty state message
                                    <tr>
                                        <td colSpan={5} className="muted" style={{ textAlign: "center" }}>
                                            No entries for {selectedAccount.name}
                                        </td>
                                    </tr>
                                )
                            ) : (
                                // If no account selected, show placeholder row
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

                    {/* Delete confirmation modal */}
                    {isConfirmingDelete && selectedEntryIndex !== null && selectedAccount && (entries[selectedAccount.id] || [])[selectedEntryIndex] && (
                        <DeleteConfirmModal
                            entry={(entries[selectedAccount.id] || [])[selectedEntryIndex]}
                            onConfirm={() => {
                                deleteEntry(selectedEntryIndex);
                                setIsConfirmingDelete(false);
                            }}
                            onCancel={() => setIsConfirmingDelete(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}