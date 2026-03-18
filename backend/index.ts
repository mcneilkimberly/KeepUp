
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let pool: Pool;
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

// Helper to get or create a default user and business for backward compatibility
//backward compatibility: If the frontend forgets to send a business_id, thats okay, 
// itll stay silently create a default business in the background and attach it to the account so the query still succeeds
async function getDefaultBusinessId() {
  const [businesses]: any = await pool.query("SELECT id FROM business LIMIT 1");
  if (businesses.length > 0) return businesses[0].id;

  // Insert default user
  const [userResult]: any = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    ["default_user", "default@test.com", "hash"]
  );
  
  // Insert default business
  const businessId = uuidv4();
  await pool.query(
    "INSERT INTO business (id, name, business_type, owner_id) VALUES (?, ?, ?, ?)",
    [businessId, "Default Business", "sole_prop", userResult.insertId]
  );
  return businessId;
}

/* ---------------- USERS & BUSINESSES (NEW) ---------------- */
app.get("/users", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT id, username, email FROM users");
  res.json(rows);
});

app.get("/businesses", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT * FROM business");
  res.json(rows);
});


/* ---------------- ACCOUNTS ---------------- */
app.get("/account", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT id, name, type, business_id FROM account");
  res.json(rows);
});

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

app.put("/account/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  await pool.query("UPDATE account SET name = ? WHERE id = ?", [name, id]);
  res.sendStatus(204);
});

app.delete("/account/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // Delete associated lines, entries, then account
  await pool.query("DELETE FROM journalLines WHERE account_id = ?", [id]);
  await pool.query("DELETE FROM account WHERE id = ?", [id]);
  res.sendStatus(204);
});

/* ---------------- JOURNAL ENTRIES & LINES ---------------- */
app.get("/entries", async (req: Request, res: Response) => {
  const [rows] = await pool.query(
    `SELECT e.entry_date as date, e.description, l.debit_amount as debit, l.credit_amount as credit 
     FROM journalLines l
     JOIN journalEntries e ON l.journal_entry_id = e.id
     ORDER BY e.entry_date DESC`
  );
  res.json(rows);
});

app.get("/account/:id/entries", async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Fetch entries utilizing the new relationship (journalEntries -> journalLines -> account)
  const [rows] = await pool.query(
    `SELECT e.entry_date as date, e.description, l.debit_amount as debit, l.credit_amount as credit 
     FROM journalLines l
     JOIN journalEntries e ON l.journal_entry_id = e.id
     WHERE l.account_id = ? 
     ORDER BY e.entry_date`,
    [id]
  );
  res.json(rows);
});

app.post("/account/:id/entries", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, description, debit, credit } = req.body;
  
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

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server listening on ${port}`));
