import { useState, useEffect } from "react";
import Papa from "papaparse";

// API helper function that constructs full API URLs
// Takes a path like "/entries" and returns "http://localhost:3001/entries"
const API = (path: string) => `http://localhost:3001${path}`;

/**
 * Account interface
 * Represents a single account from the database with:
 * - id: unique identifier (UUID string)
 * - name: account name (e.g., "Cash", "Revenue")
 */
interface Account {
    id: string;
    name: string;
}

/**
 * Entry interface
 * Represents a single journal entry from the database with:
 * - date: transaction date
 * - description: what the transaction was for
 * - debit: debit amount as string (for currency formatting)
 * - credit: credit amount as string
 */
interface Entry {
    date: string;
    description: string;
    debit: string;
    credit: string;
    accountName?: string;
}

export default function Journal() {
    // ============== STATE VARIABLES ==============
    
    // Form input states - user enters these values to create a new entry
    const [date, setDate] = useState("");           // Date of the transaction
    const [description, setDescription] = useState(""); // What the transaction was for
    const [accountId, setAccountId] = useState("");    // Which account to post the entry to
    const [debit, setDebit] = useState("");            // Debit amount (optional)
    const [credit, setCredit] = useState("");          // Credit amount (optional)
    
    // Display states - populated from database
    const [accounts, setAccounts] = useState<Account[]>([]); // List of all accounts from DB
    const [entries, setEntries] = useState<Entry[]>([]);     // List of all recent entries from DB

    // ============== FUNCTIONS ==============

    /**
     * fetchRecentEntries()
     * 
     * Fetches all recent journal entries from the backend and updates the display.
     * 
     * Steps:
     * 1. Calls GET /entries endpoint on backend
     * 2. Parses the JSON response
     * 3. Sets the entries state with the returned data
     * 4. Catches any errors and logs them
     * 
     * Called by:
     * - Initial useEffect on page load
     * - handleAddEntry() after successfully posting a new entry
     */
    function fetchRecentEntries() {
        fetch(API("/entries"))
            .then((r) => r.json())
            .then((data: Entry[]) => setEntries(data))
            .catch(console.error);
    }

    /**
     * useEffect hook - runs on component mount
     * 
     * Initializes the page with data from the backend.
     * 
     * Steps:
     * 1. Calls GET /account endpoint to fetch all accounts
     * 2. Parses the JSON response
     * 3. Sets the accounts state with the returned data (populates the account dropdown)
     * 4. Calls fetchRecentEntries() to load all recent entries
     * 5. Catches any errors and logs them
     * 
     * The empty dependency array [] means this runs only once when the component mounts.
     */
    useEffect(() => {
        fetch(API("/account"))
            .then((r) => r.json())
            .then((data: Account[]) => setAccounts(data))
            .catch(console.error);

        fetchRecentEntries();
    }, []);

    /**
     * handleAddEntry()
     * 
     * Submits a new journal entry to the backend and updates the recent entries display.
     * 
     * Steps:
     * 1. Validates that required fields (date, description, accountId) are filled
     * 2. Creates a POST request to /account/{accountId}/entries with the entry data
     * 3. Converts empty debit/credit fields to "0.00" to ensure valid numbers
     * 4. Sends the request to the backend
     * 5. On success, calls fetchRecentEntries() to refresh the recent entries display
     * 6. Resets all form fields to empty strings (clears the form)
     * 7. Catches any errors and logs them
     * 
     * Called by: "Add entry" button onClick
     */
    function handleAddEntry() {
        if (!date || !description || !accountId) return;
        
        fetch(API(`/account/${accountId}/entries`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date,
                description,
                debit: debit || "0.00",
                credit: credit || "0.00",
            }),
        })
            .then(() => {
                // Fetch and display all recent entries
                fetchRecentEntries();
            })
            .catch(console.error);
        
        // Reset form to empty state
        setDate("");
        setDescription("");
        setAccountId("");
        setDebit("");
        setCredit("");
    }


    // cleanCsvData is a function that takes raw CSV data
// and transforms it into an array of Entry objects that can be added to the ledger.
function cleanCsvData(rows: string[][]): Entry[] {
    let currentDate = "";
    const cleanEntries: Entry[] = [];

    // .slice(4) automatically skips the first 4 rows!
    for (const [date, account, debit, credit] of rows.slice(4)) {
        if (!date && !account) continue;

        // If 'date' exists, use it. Otherwise, use the old 'currentDate'
        currentDate = date?.trim() || currentDate;

        if (account?.trim()) {
            cleanEntries.push({
                date: currentDate,
                accountName: account.trim(),
                description: "CSV Import",
                debit: (debit || "0.00").replace(/[,"]/g, ''),
                credit: (credit || "0.00").replace(/[,"]/g, ''),
            });
        }
    }
    return cleanEntries;
} 

//** createMissingAccounts is a functions that 
// creates any accounts that are in the CSV that do not exist already
// */ 
async function createMissingAccounts(csvEntries: Entry[], currentAccounts: Account[]){
    const updatedAccounts = [...currentAccounts];

    //Get every unique account name form the CSV
    const allNames = csvEntries.map(entry=> entry.accountName || "");
    const uniqueNames = Array.from(new Set(allNames));

    //Check the database ones against the CSV ones
    for (const name of uniqueNames){
        if (!name) continue;

        const exists = updatedAccounts.find(a => a.name.toLowerCase() === name.toLowerCase());

        //If it doesn't exist, create it!
        if (!exists) {
            try{
                const response = await fetch (API("/account"),{
                    method: "POST",
                    headers: { "Content-Type": "application/json"},
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

//** sortEntriesIntoFolders is a function that
// sorts CSV entries into folders based on their account IDs
// */ 
function sortEntriesIntoFolders( csvEntries:Entry[], currentFolders:Record<string,Entry[]>, allAccounts: Account[]){
    const updatedFolders ={ ...currentFolders };

    for (const row of csvEntries){
        const matchedAccount = allAccounts.find(
            a => a.name.toLowerCase() === row.accountName?.toLowerCase()
        );
        const accountId = matchedAccount ? matchedAccount.id : "Unknown";

        if (!updatedFolders[accountId]){
            updatedFolders[accountId] = [];
        }
        updatedFolders[accountId].push(row);
    }
    return updatedFolders;
}



    function importCSV(e: React.ChangeEvent<HTMLInputElement>){
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: async function(result: any){
                const cleanEntries = cleanCsvData(result.data as string[][]);
                const updatedAccounts = await createMissingAccounts(cleanEntries, accounts);
                setAccounts(updatedAccounts);

                // POST each parsed entry to the backend database
                for (const row of cleanEntries){
                    const matchedAccount = updatedAccounts.find(
                        a => a.name.toLowerCase() === row.accountName?.toLowerCase()
                    );
                    const accountId = matchedAccount ? matchedAccount.id : null;
                    if (accountId){
                        try {
                            await fetch(API(`/account/${accountId}/entries`),{
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    date: row.date,
                                    description: row.description,
                                    debit: row.debit,
                                    credit: row.credit
                                }),
                            });
                        }catch (err){
                            console.error("Failed to add CSV entry to DB:", err);
                        }
                    }
                }

                // Fetch the updated list of entries from the backend 
                fetchRecentEntries();
            }
        });
        e.target.value = ""
    }

    // ============== RENDER ==============
    return (
        <div>
            <h1 className="pageTitle">Journal</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                Record transactions here.
            </p>

            <div className="grid">
                {/* LEFT SIDE CARD: Entry form */}
                <div className="card" style={{ gridColumn: "span 5" }}>
                    <h2 className="cardTitle">New entry</h2>

                    <div style={{ display: "grid", gap: 10 }}>
                        {/* Date input - controlled by 'date' state */}
                        <label>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Date</div>
                            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </label>

                        {/* Description input - controlled by 'description' state */}
                        <label>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Description</div>
                            <input className="input" placeholder="e.g., Office supplies" value={description} onChange={e => setDescription(e.target.value)} />
                        </label>

                        {/* Account dropdown - populated by 'accounts' array from database */}
                        {/* controlled by 'accountId' state */}
                        <label>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Account</div>
                            <select className="input" value={accountId} onChange={e => setAccountId(e.target.value)}>
                                <option value="" disabled>Select an account…</option>
                                {accounts.map((acct) => (
                                    <option key={acct.id} value={acct.id}>
                                        {acct.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Debit and Credit inputs side-by-side */}
                        {/* Controlled by 'debit' and 'credit' states */}
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

                        {/* Submit button - disabled if any required field is empty */}
                        <button className="btn btnPrimary" type="button" onClick={handleAddEntry} disabled={!date || !description || !accountId}>
                            Add entry
                        </button>

                        <label
                                className="btn"
                                style={{ cursor: "pointer", textAlign: "center" }}
                            >
                                Import CSV
                                <input
                                    type="file"
                                    accept=".csv"
                                    style={{ display: "none" }}
                                    onChange={importCSV}
                                />
                            </label>
                    </div>
                </div>

                {/* RIGHT SIDE CARD: Recent entries table */}
                <div className="card" style={{ gridColumn: "span 7" }}>
                    <div className="row" style={{ marginBottom: 10 }}>
                        <h2 className="cardTitle" style={{ margin: 0 }}>Recent entries</h2>
                        {/* Pill shows count of entries, or "No data yet" if empty */}
                        <span className="pill">{entries.length ? `${entries.length} entries` : "No data yet"}</span>
                    </div>

                    {/* Table displaying all recent entries from the 'entries' state */}
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: 140 }}>Date</th>
                                <th>Description</th>
                                <th style={{ width: 120 }}>Debit</th>
                                <th style={{ width: 120 }}>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* If entries exist, render each one as a table row */}
                            {entries.length ? (
                                entries.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td>{entry.date}</td>
                                        <td>{entry.description}</td>
                                        <td>{entry.debit}</td>
                                        <td>{entry.credit}</td>
                                    </tr>
                                ))
                            ) : (
                                /* If no entries exist, show a placeholder row */
                                <tr>
                                    <td className="muted">—</td>
                                    <td className="muted">No entries recorded</td>
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