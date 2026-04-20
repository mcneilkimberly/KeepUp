
/**
 * KeepUp Backend Server
 * 
 * A Node.js/Express backend for managing journal entries, accounts, and business data.
 * Connects to a MySQL database and provides REST API endpoints for the frontend.
 */

import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import bcrypt from "bcrypt";

// ============== SERVER SETUP ==============

const app = express();
app.use(cors()); // Enable cross-origin requests from frontend
app.use(express.json()); // Parse incoming JSON request bodies

// ============== DATABASE CONNECTION ==============

/**
 * pool: MySQL connection pool
 * Maintains a pool of reusable database connections for efficient querying
 */
let pool: Pool;

/**
 * initDb()
 * 
 * Initializes the MySQL database connection pool on server startup.
 * 
 * Steps:
 * 1. Checks if DB environment variable is set (connection string)
 * 2. Creates a connection pool using the connection string
 * 3. If DB env var is missing, throws an error
 * 4. If connection fails, logs error and exits the process
 * 
 * Called during server startup via initDb().catch()
 */
async function initDb(): Promise<void> {
  if (!process.env.DB) {
    throw new Error("DB env var missing");
  }
  pool = await mysql.createPool(process.env.DB);
}
initDb().catch(err => {
  console.error("could not connect to database:", err);
  process.exit(1);
});

// ============== HELPER FUNCTIONS ==============

/**
 * getDefaultBusinessId()
 * 
 * Gets or creates a default business for backward compatibility.
 * This allows the frontend to work without explicitly specifying a business_id.
 * 
 * Why: The database schema requires a business_id for accounts and entries.
 * To support a simple frontend experience, we automatically create a default
 * business on first use if one doesn't exist.
 * 
 * Steps:
 * 1. Queries the database for any existing business
 * 2. If business exists, returns its ID
 * 3. If no business exists:
 *    a. Creates a default user account
 *    b. Creates a default business owned by that user
 *    c. Returns the new business ID
 * 
 * Returns: Business ID (UUID string)
 * Called by: POST /account and POST /account/:id/entries endpoints
 */
async function getDefaultBusinessId() {
  // Check if a business already exists
  const [businesses]: any = await pool.query("SELECT id FROM business LIMIT 1");
  if (businesses.length > 0) return businesses[0].id;

  // No business exists, so create a default one
  // 1. Create default user
  const [userResult]: any = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    ["default_user", "default@test.com", "hash"]
  );
  
  // 2. Create default business owned by that user
  const businessId = uuidv4();
  await pool.query(
    "INSERT INTO business (id, name, business_type, owner_id) VALUES (?, ?, ?, ?)",
    [businessId, "Default Business", "sole_prop", userResult.insertId]
  );

  const [defaultAccountsRows]: any = await pool.query(
    "SELECT name, type FROM default_Accounts"
  );

  if (defaultAccountsRows.length > 0) {
    const values = defaultAccountsRows.map((acc: any) => [
      uuidv4(),   
      businessId, 
      acc.name,   
      acc.type    
    ]);

    await pool.query(
      "INSERT INTO account (id, business_id, name, type) VALUES ?",
      [values]
    );
  }

  return businessId;
}

// ============== API ENDPOINTS ==============

/* -------- USERS & BUSINESSES -------- */

/**
 * GET /users
 * 
 * Fetches a list of all users in the system.
 * 
 * Returns: Array of user objects with id, username, and email
 * 
 * Response example:
 * [
 *   { id: 1, username: "john_doe", email: "john@example.com" },
 *   { id: 2, username: "jane_smith", email: "jane@example.com" }
 * ]
 */
app.get("/users", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT id, username, email FROM users");
  res.json(rows);
});

/**
 * GET /businesses
 * 
 * Fetches a list of all businesses in the system.
 * 
 * Returns: Array of complete business objects with all columns
 */
app.get("/businesses", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT * FROM business");
  res.json(rows);
});

/* -------- ACCOUNTS -------- */

/**
 * GET /account
 * 
 * Fetches a list of all accounts (chart of accounts).
 * 
 * Returns: Array of account objects with id, name, type, and business_id
 * 
 * Response example:
 * [
 *   { id: "uuid-1", name: "Cash", type: "asset", business_id: "business-uuid" },
 *   { id: "uuid-2", name: "Revenue", type: "income", business_id: "business-uuid" }
 * ]
 */
app.get("/account", async (req: Request, res: Response) => {
  // Automatically ensure there is a default business (which will also seed default accounts if it's new)
  await getDefaultBusinessId();
  
  const [rows] = await pool.query("SELECT id, name, type, business_id FROM account");
  res.json(rows);
});

/**
 * POST /account
 * 
 * Creates a new account in the chart of accounts.
 * 
 * Request body:
 * {
 *   name: string (required) - account name (e.g., "Cash", "Revenue")
 *   type?: string (optional) - account type (defaults to "asset")
 *   business_id?: string (optional) - business to associate with (auto-creates default if omitted)
 * }
 * 
 * Steps:
 * 1. Extracts name, type, and business_id from request body
 * 2. Generates a new UUID for the account
 * 3. Uses fallback type "asset" if not provided
 * 4. Calls getDefaultBusinessId() if business_id not provided
 * 5. Inserts the new account into the database
 * 6. Returns 201 Created with the new account object
 * 
 * Response example (201):
 * { id: "new-uuid", name: "Cash", type: "asset", business_id: "business-uuid" }
 */
app.post("/account", async (req: Request, res: Response) => {
  const { name, type, business_id } = req.body;
  const newId = uuidv4();
  
  // Fallback values so the current frontend doesn't break
  const finalType = type || "asset"; 
  const finalBusinessId = business_id || await getDefaultBusinessId();

  await pool.query(
    "INSERT INTO account (id, business_id, name, type) VALUES (?, ?, ?, ?)",
    [newId, finalBusinessId, name, finalType]
  );
  res.status(201).json({ id: newId, name, type: finalType, business_id: finalBusinessId });
});

/**
 * PUT /account/:id
 * 
 * Renames an existing account.
 * 
 * URL params:
 * - id: account UUID to update
 * 
 * Request body:
 * {
 *   name: string (required) - new account name
 * }
 * 
 * Steps:
 * 1. Extracts account id from URL and name from request body
 * 2. Updates the account record in the database
 * 3. Returns 204 No Content on success
 */
app.put("/account/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  await pool.query("UPDATE account SET name = ? WHERE id = ?", [name, id]);
  res.sendStatus(204);
});

/**
 * DELETE /account/:id
 * 
 * Deletes an account and all associated journal entries/lines.
 * 
 * URL params:
 * - id: account UUID to delete
 * 
 * Steps:
 * 1. Extracts account id from URL
 * 2. Deletes all journal lines (transaction lines) for this account
 * 3. Deletes the account itself
 * 4. Returns 204 No Content on success
 * 
 * Note: Cascading delete is performed manually (not via database foreign keys)
 * This prevents orphaned journal lines when an account is deleted.
 */
app.delete("/account/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // Delete associated lines, entries, then account
  await pool.query("DELETE FROM journalLines WHERE account_id = ?", [id]);
  await pool.query("DELETE FROM account WHERE id = ?", [id]);
  res.sendStatus(204);
});

/* -------- JOURNAL ENTRIES & LINES -------- */

/**
 * GET /entries
 * 
 * Fetches all recent journal entries from all accounts, across the entire system.
 * Useful for displaying a dashboard or recent activity feed.
 * 
 * Database structure explanation:
 * - journalEntries: Contains the overall transaction info (date, description)
 * - journalLines: Contains the individual line items for each transaction
 *   (which account, debit amount, credit amount)
 * 
 * Steps:
 * 1. Joins journalLines with journalEntries tables
 * 2. Selects date, description, debit, and credit amounts
 * 3. Orders by entry_date in descending order (most recent first)
 * 4. Returns all matching entries with their line IDs
 * 
 * Returns: Array of entry objects
 * 
 * Response example:
 * [
 *   { id: 1, date: "2026-03-18", description: "Office supplies", debit: "50.00", credit: "0.00" },
 *   { id: 2, date: "2026-03-17", description: "Client payment", debit: "0.00", credit: "500.00" }
 * ]
 */
app.get("/entries", async (req: Request, res: Response) => {
  const [rows] = await pool.query(
    `SELECT l.id, e.entry_date as date, e.description, l.debit_amount as debit, l.credit_amount as credit 
     FROM journalLines l
     JOIN journalEntries e ON l.journal_entry_id = e.id
     ORDER BY e.entry_date DESC`
  );
  res.json(rows);
});

/**
 * GET /account/:id/entries
 * 
 * Fetches all journal entries (transactions) for a specific account with optional sorting.
 * 
 * URL params:
 * - id: account UUID to fetch entries for
 * 
 * Query params:
 * - sort: (optional) sort order - "date-newest", "date-oldest", "amount-high", "amount-low"
 * 
 * Database structure:
 * - Queries journalLines filtered by account_id
 * - Joins with journalEntries to get transaction details
 * 
 * Steps:
 * 1. Extracts account id from URL and sort parameter from query string
 * 2. Determines ORDER BY clause based on sort parameter:
 *    - "date-newest": ORDER BY entry_date DESC
 *    - "date-oldest": ORDER BY entry_date ASC (default)
 *    - "amount-high": ORDER BY GREATEST(debit_amount, credit_amount) DESC
 *    - "amount-low": ORDER BY GREATEST(debit_amount, credit_amount) ASC
 * 3. Queries journalLines where account_id matches
 * 4. Joins with journalEntries to get date and description
 * 5. Returns the filtered and sorted entries
 * 
 * Returns: Array of entry objects for that specific account
 * 
 * Response example:
 * [
 *   { id: 1, date: "2026-03-15", description: "Initial deposit", debit: "1000.00", credit: "0.00" },
 *   { id: 2, date: "2026-03-16", description: "Expense payment", debit: "50.00", credit: "0.00" }
 * ]
 */
app.get("/account/:id/entries", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { sort } = req.query as { sort?: string };
  
  // Determine ORDER BY clause based on sort parameter
  let orderByClause = "ORDER BY e.entry_date ASC"; // Default: oldest first
  
  if (sort === "date-newest") {
    orderByClause = "ORDER BY e.entry_date DESC";
  } else if (sort === "date-oldest") {
    orderByClause = "ORDER BY e.entry_date ASC";
  } else if (sort === "amount-high") {
    orderByClause = "ORDER BY GREATEST(l.debit_amount, l.credit_amount) DESC";
  } else if (sort === "amount-low") {
    orderByClause = "ORDER BY GREATEST(l.debit_amount, l.credit_amount) ASC";
  }
  
  // Fetch entries utilizing the new relationship (journalEntries -> journalLines -> account)
  // Include the journalLines id so we can delete individual entries
  const [rows] = await pool.query(
    `SELECT l.id, e.entry_date as date, e.description, l.debit_amount as debit, l.credit_amount as credit 
     FROM journalLines l
     JOIN journalEntries e ON l.journal_entry_id = e.id
     WHERE l.account_id = ? 
     ${orderByClause}`,
    [id]
  );
  res.json(rows);
});

/**
 * POST /account/:id/entries
 * 
 * Creates a new journal entry (transaction) for a specific account.
 * This is called when the user submits the "Add entry" form on the frontend.
 * 
 * URL params:
 * - id: account UUID to add the entry to
 * 
 * Request body:
 * {
 *   date: string (YYYY-MM-DD format) - transaction date
 *   description: string - what the transaction was for
 *   debit: number or "0.00" - debit amount
 *   credit: number or "0.00" - credit amount
 * }
 * 
 * Database design:
 * We use a two-table structure to support double-entry bookkeeping:
 * - journalEntries: One row per transaction (contains date & description)
 * - journalLines: One or more rows per transaction (one for each account affected)
 * 
 * For now, we only create single-line entries (one account per transaction).
 * This simplifies the UI but can be extended later for multi-account transactions.
 * 
 * Steps:
 * 1. Extracts account id from URL and entry data from request body
 * 2. Gets or creates the default business (for backward compatibility)
 * 3. Insert into journalEntries:
 *    - Creates the overall transaction record
 *    - Stores date and description
 *    - Associates with the business
 *    - Records user 1 as creator (hardcoded for simplicity)
 * 4. Insert into journalLines:
 *    - Creates a line item for this specific account
 *    - Stores debit and credit amounts (0 if not provided)
 *    - Associates with the journal entry we just created
 * 5. Returns 201 Created (no response body needed)
 * 
 * Example flow:
 * 1. User fills form: date="2026-03-18", description="Office supplies", debit="50"
 * 2. POST to /account/account-uuid/entries
 * 3. System creates journalEntry: { id: 123, entry_date: "2026-03-18", description: "Office supplies" }
 * 4. System creates journalLine: { journal_entry_id: 123, account_id: "account-uuid", debit: 50, credit: 0 }
 * 5. Frontend sees 201 response and refreshes the entries list
 */
app.post("/account/:id/entries", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, description, debit, credit } = req.body;
  
  // Get or create default business
  const businessId = await getDefaultBusinessId();

  // 1. Create the overarching Journal Entry
  const [entryResult]: any = await pool.query(
    "INSERT INTO journalEntries (business_id, created_by, entry_date, description) VALUES (?, ?, ?, ?)",
    [businessId, 1, date, description] // Assuming user 1 created it for simplicity
  );
  
  const journalEntryId = entryResult.insertId;

  // 2. Create the Journal Line for this specific account
  await pool.query(
    "INSERT INTO journalLines (journal_entry_id, account_id, debit_amount, credit_amount) VALUES (?, ?, ?, ?)",
    [journalEntryId, id, debit || 0, credit || 0]
  );

  res.sendStatus(201);
});

/* -------- DASHBOARD -------- */

/**
 * GET /dashboard/summary
 * 
 * Returns dashboard summary statistics:
 * - Total debit (sum of all debits across all entries)
 * - Total credit (sum of all credits across all entries)
 * - Total account count
 * - Recent entries (last 5)
 * 
 * Returns: Object with summary stats and recent entries
 */
app.get("/dashboard/summary", async (req: Request, res: Response) => {
  try {
    console.log("Dashboard summary endpoint called");
    
    // Get total debits across all entries
    const [debitResult]: any = await pool.query(
      `SELECT COALESCE(SUM(l.debit_amount), 0) as total_debit
       FROM journalLines l
       JOIN journalEntries e ON l.journal_entry_id = e.id`
    );
    console.log("Debit result:", debitResult);

    // Get total credits across all entries
    const [creditResult]: any = await pool.query(
      `SELECT COALESCE(SUM(l.credit_amount), 0) as total_credit
       FROM journalLines l
       JOIN journalEntries e ON l.journal_entry_id = e.id`
    );
    console.log("Credit result:", creditResult);

    // Get account count
    const [accountCount]: any = await pool.query(
      `SELECT COUNT(*) as count FROM account`
    );
    console.log("Account count result:", accountCount);

    // Get recent entries (last 5)
    const [recentEntries]: any = await pool.query(
      `SELECT e.entry_date as date, e.description, a.name as account, l.debit_amount as debit, l.credit_amount as credit
       FROM journalLines l
       JOIN journalEntries e ON l.journal_entry_id = e.id
       JOIN account a ON l.account_id = a.id
       ORDER BY e.entry_date DESC
       LIMIT 5`
    );
    console.log("Recent entries:", recentEntries);

    const response = {
      totalIncome: parseFloat(debitResult[0].total_debit),
      totalSpending: parseFloat(creditResult[0].total_credit),
      accountCount: accountCount[0].count,
      recentEntries: recentEntries
    };
    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

/** SIGN UP  */
app.post("/signup", async(req: Request, res: Response) => {
  const {username, name, email, password} = req.body;
  try{
    const hashedpassword = await bcrypt.hash(password, 10);

    await pool.query(`INSERT INTO users( username, name, email, password_hash) VALUES (?, ?, ?, ? )`,
  [username, name, email, hashedpassword]
    );
    console.log("Successfully signed up user:", username);
    res.status(201).json({ message: "User signed up successfully" });

  }catch(error){
    console.error("Error signing up:", error);
    res.status(500).json({ error: "Failed to sign up" });
  }
})

// ============== SERVER STARTUP ==============

/**
 * Start the Express server
 * 
 * Listens on the port specified by PORT environment variable (defaults to 3001)
 * Logs a message when the server is ready to accept requests
 */
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server listening on ${port}`));
