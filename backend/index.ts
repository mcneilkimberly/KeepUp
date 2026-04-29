
/**
 * KeepUp Backend Server
 * 
 * A Node.js/Express backend for managing journal entries, accounts, and business data.
 * Connects to a MySQL database and provides REST API endpoints for the frontend.
 */

import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import mysql, { Pool } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

// Extend Express's Request type so we can attach the authenticated user's id.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// ============== SERVER SETUP ==============

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
})); // Enable cross-origin requests from frontend
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
 * signToken(userId)
 *
 * Creates a JWT that identifies the user. The frontend will store this token
 * and send it back on every request via the Authorization header.
 */
function signToken(userId: number) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET env is missing")
  }
  return jwt.sign({ userId }, secret, { expiresIn: "1h" });
}

/**
 * requireAuth middleware
 *
 * Reads the "Authorization: Bearer <token>" header, verifies the token,
 * and attaches the decoded user id to req.userId. If the token is missing
 * or invalid, responds with 401 and halts the request.
 *
 * Usage: app.get("/some-protected-route", requireAuth, async (req, res) => { ... })
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, secret) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * getBusinessIdForUser(userId)
 *
 * Returns the business id owned by the given user. Every user has exactly one
 * business (created at signup), so this is how we scope every data query.
 *
 * Throws if the user doesn't have a business (shouldn't happen for valid accounts).
 */
async function getBusinessIdForUser(userId: number): Promise<string> {
  const [rows]: any = await pool.query(
    "SELECT id FROM business WHERE owner_id = ? LIMIT 1",
    [userId]
  );
  if (rows.length === 0) {
    throw new Error(`No business found for user ${userId}`);
  }
    return rows[0].id;
}
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
// async function getDefaultBusinessId() {
//   // Check if a business already exists
//   const [businesses]: any = await pool.query("SELECT id FROM business LIMIT 1");
//   if (businesses.length > 0) return businesses[0].id;

//   // No business exists, so create a default one
//   // 1. Create default user
//   const [userResult]: any = await pool.query(
//     "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
//     ["default_user", "default@test.com", "hash"]
//   );
  
//   // 2. Create default business owned by that user
//   const businessId = uuidv4();
//   await pool.query(
//     "INSERT INTO business (id, name, business_type, owner_id) VALUES (?, ?, ?, ?)",
//     [businessId, "Default Business", "sole_prop", userResult.insertId]
//   );

//   const [defaultAccountsRows]: any = await pool.query(
//     "SELECT name, type FROM default_Accounts"
//   );

//   if (defaultAccountsRows.length > 0) {
//     const values = defaultAccountsRows.map((acc: any) => [
//       uuidv4(),   
//       businessId, 
//       acc.name,   
//       acc.type    
//     ]);

//     await pool.query(
//       "INSERT INTO account (id, business_id, name, type) VALUES ?",
//       [values]
//     );
//   }

//   return businessId;
// }

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
app.get("/users", requireAuth,async (req: Request, res: Response) => {
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
app.get("/businesses", requireAuth, async (req: Request, res: Response) => {
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
app.get("/account",requireAuth, async (req: Request, res: Response) => {
  // Automatically ensure there is a default business (which will also seed default accounts if it's new)
  const businessId = await getBusinessIdForUser(req.userId!);
  
  const [rows] = await pool.query("SELECT id, name, type, business_id FROM account WHERE business_id = ?", [businessId]);
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
app.post("/account", requireAuth, async (req: Request, res: Response) => {
  const { name, type} = req.body;
  const businessId = await getBusinessIdForUser(req.userId!);
  const newId = uuidv4();
  
  // Fallback values so the current frontend doesn't break
  const finalType = type || "asset"; 
  // const finalBusinessId = business_id || await getBusinessIdForUser(userId);

  await pool.query(
    "INSERT INTO account (id, business_id, name, type) VALUES (?, ?, ?, ?)",
    [newId, businessId, name, finalType]
  );
  res.status(201).json({ id: newId, name, type: finalType, business_id: businessId });
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
app.put("/account/:id", requireAuth,async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const businessId = await getBusinessIdForUser(req.userId!);

  const [result]: any = await pool.query("UPDATE account SET name = ? WHERE id = ?", [name, id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Account not found" });
  }
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
app.delete("/account/:id", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const businessId = await getBusinessIdForUser(req.userId!);

  // Confirm the account belongs to this user's business before deleting.
  const [owned]: any = await pool.query(
    "SELECT id FROM account WHERE id = ? AND business_id = ?",
    [id, businessId]
  );
  if (owned.length === 0) {
    return res.status(404).json({ error: "Account not found" });
  }

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
app.get("/entries", requireAuth,async (req: Request, res: Response) => {
  const businessId = await getBusinessIdForUser(req.userId!);
  const [rows] = await pool.query(
    `SELECT l.id, e.entry_date as date, e.description, l.debit_amount as debit, l.credit_amount as credit 
     FROM journalLines l
     JOIN journalEntries e ON l.journal_entry_id = e.id
     WHERE e.business_id = ?
     ORDER BY e.entry_date DESC`,
    [businessId]
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
app.get("/account/:id/entries", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { sort } = req.query as { sort?: string };
  const businessId = await getBusinessIdForUser(req.userId!);
    // Make sure this account belongs to the caller's business.
  const [owned]: any = await pool.query(
    "SELECT id FROM account WHERE id = ? AND business_id = ?",
    [id, businessId]
  );
  if (owned.length === 0) {
    return res.status(404).json({ error: "Account not found" });
  }

  
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
app.post("/account/:id/entries", requireAuth,async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, description, debit, credit } = req.body;
  
  
  // Get or create default business
  const businessId = await getBusinessIdForUser(req.userId!);

    // Ensure the account is one of this user's.
  const [owned]: any = await pool.query(
    "SELECT id FROM account WHERE id = ? AND business_id = ?",
    [id, businessId]
  );
  if (owned.length === 0) {
    return res.status(404).json({ error: "Account not found" });
  }

  // 1. Create the overarching Journal Entry
  const [entryResult]: any = await pool.query(
    "INSERT INTO journalEntries (business_id, created_by, entry_date, description) VALUES (?, ?, ?, ?)",
    [businessId, req.userId, date, description] 
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
app.get("/dashboard/summary", requireAuth, async (req: Request, res: Response) => {
  try {
    console.log("Dashboard summary endpoint called");
    const businessId = await getBusinessIdForUser(req.userId!);

    
    // Get total debits across all entries
    const [incomeResult]: any = await pool.query(
        `SELECT COALESCE(SUM(jl.credit_amount), 0) as total_income
        FROM journalLines jl
        JOIN journalEntries je ON jl.journal_entry_id = je.id
        JOIN account a ON jl.account_id = a.id
        WHERE a.type = 'revenue' AND je.business_id = ?`,
        [businessId]
    );
    console.log("Income result:", incomeResult);

    const [spendingResult]: any = await pool.query(
        `SELECT COALESCE(SUM(jl.debit_amount), 0) as total_spending
        FROM journalLines jl
        JOIN journalEntries je ON jl.journal_entry_id = je.id
        JOIN account a ON jl.account_id = a.id
        WHERE a.type = 'expense' AND je.business_id = ?`,
        [businessId]
    );
    console.log("Spending result:", spendingResult);

    // Get account count
    const [accountCount]: any = await pool.query(
      `SELECT COUNT(*) as count FROM account WHERE business_id = ?`,
      [businessId]
    );
    console.log("Account count result:", accountCount);

    // Get recent entries (last 5)
    const [recentEntries]: any = await pool.query(
      `SELECT e.entry_date as date, e.description, a.name as account, l.debit_amount as debit, l.credit_amount as credit
       FROM journalLines l
       JOIN journalEntries e ON l.journal_entry_id = e.id
       JOIN account a ON l.account_id = a.id
       WHERE e.business_id = ?
       ORDER BY e.entry_date DESC
       LIMIT 5`,
       [businessId]
    );
    console.log("Recent entries:", recentEntries);

    const response = {
        totalIncome: parseFloat(incomeResult[0].total_income),
        totalSpending: parseFloat(spendingResult[0].total_spending),
        accountCount: accountCount[0].count,
        recentEntries, //: recentEntries
    };
    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

app.get("/dashboard/monthly", requireAuth, async (req, res) => {
    try {
        const businessId = await getBusinessIdForUser(req.userId!);

        const [rows] = await pool.query(`
            SELECT
                DATE_FORMAT(je.entry_date, '%b %Y')  AS month,
                DATE_FORMAT(je.entry_date, '%Y-%m')  AS month_sort,
                SUM(CASE WHEN a.type = 'revenue'  THEN jl.credit_amount ELSE 0 END) AS revenue,
                SUM(CASE WHEN a.type = 'expense'  THEN jl.debit_amount  ELSE 0 END) AS expenses
            FROM journalEntries je
            JOIN journalLines   jl ON jl.journal_entry_id = je.id
            JOIN account        a  ON a.id = jl.account_id
            WHERE je.entry_date >= DATE_FORMAT(
                DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01'
            )
            AND je.is_posted = TRUE
           AND je.business_id = ?
            GROUP BY month_sort, month
            ORDER BY month_sort ASC`,
            [businessId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch monthly data" });
    }
});

/** Returns a breakdown of expenses by category for the current month. */
app.get("/dashboard/expenses", requireAuth, async (req, res) => {
    try {
        const businessId = await getBusinessIdForUser(req.userId!);
        const [rows] = await pool.query(`
            SELECT
                a.name                        AS label,
                SUM(jl.debit_amount)          AS amount
            FROM journalLines jl
            JOIN journalEntries je ON jl.journal_entry_id = je.id
            JOIN account a         ON jl.account_id = a.id
            WHERE a.type = 'expense'
            AND DATE_FORMAT(je.entry_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
            AND je.is_posted = TRUE
            AND je.business_id = ?
            GROUP BY a.id, a.name
            HAVING amount > 0
            ORDER BY amount DESC
        `, [businessId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch expense breakdown" });
    }
});

app.get("/dashboard/ratios", requireAuth, async (req, res) => {
    try {
        const businessId = await getBusinessIdForUser(req.userId!);

        const [rows]: any = await pool.query(`
            SELECT
                a.type,
                SUM(jl.debit_amount)  AS total_debit,
                SUM(jl.credit_amount) AS total_credit
            FROM journalLines jl
            JOIN journalEntries je ON jl.journal_entry_id = je.id
            JOIN account a         ON jl.account_id = a.id
            WHERE je.business_id = ?
            GROUP BY a.type
        `, [businessId]);

        const get = (type: string, side: "debit" | "credit") => {
            const row = rows.find((r: any) => r.type === type);
            if (!row) return 0;
            return parseFloat(side === "debit" ? row.total_debit : row.total_credit) || 0;
        };

        const revenue   = get("revenue",   "credit");
        const expenses  = get("expense",   "debit");
        const assets    = get("asset",     "debit");
        const liabilities = get("liability", "credit");
        const equity    = get("equity",    "credit");
        const netIncome = revenue - expenses;

        res.json({ revenue, expenses, assets, liabilities, equity, netIncome });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch ratios" });
    }
});

/** SIGN UP  */
app.post("/signup", async(req: Request, res: Response) => {
  const {username, name, email, password} = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Use a single connection so we can wrap the whole thing in a transaction.
  // If anything fails partway, nothing gets half-created.
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    // 1. Hash the password INSIDE the try block
    const hashedpassword = await bcrypt.hash(password, 10);
    
  const [userResult]: any = await connection.query(
      `INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)`,
      [username, name, email, hashedpassword]
    );
    const newUserId: number = userResult.insertId;

    // 2. Create a business owned by this new user.
    const businessId = uuidv4();
    await connection.query(
      `INSERT INTO business (id, name, business_type, owner_id) VALUES (?, ?, ?, ?)`,
      [businessId, `${name}'s Business`, "sole_prop", newUserId]
    );

    // 3. Seed default accounts for this business (moved from getDefaultBusinessId).
    const [defaultAccountsRows]: any = await connection.query(
      "SELECT name, type FROM default_Accounts"
    );
    if (defaultAccountsRows.length > 0) {
      const values = defaultAccountsRows.map((acc: any) => [
        uuidv4(),
        businessId,
        acc.name,
        acc.type,
      ]);
      await connection.query(
        "INSERT INTO account (id, business_id, name, type) VALUES ?",
        [values]
      );
    }

    await connection.commit();

    // 4. Sign a JWT and return it alongside the user profile.
    const token = signToken(newUserId);
    console.log("Successfully signed up user:", username);
    res.status(201).json({
      token,
      user: { id: newUserId, username, name, email },
    });
  } catch (error: any) {
    await connection.rollback();
    console.error("Error signing up:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Username or email already exists." });
    }
    res.status(500).json({ error: "Failed to sign up. Please try again." });
  } finally {
    connection.release();
  }
});

/** LOGIN
 *
 * Accepts a username OR email plus a password. If the credentials are valid,
 * returns a JWT + the user profile.
 */
app.post("/login", async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Look up a user matching EITHER username OR email.
    const [users]: any = await pool.query(
      `SELECT id, username, name, email, password_hash
       FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [emailOrUsername, emailOrUsername]
    );

    if (users.length === 0) {
      // Generic message so we don't reveal whether an account exists.
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user.id);
    console.log("Successfully logged in user:", user.username);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ============== SERVER STARTUP ==============

/**
 * Start the Express server
 * 
 * Listens on the port specified by PORT environment variable (defaults to 3001)
 * Logs a message when the server is ready to accept requests
 */
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server listening on ${port}`));
