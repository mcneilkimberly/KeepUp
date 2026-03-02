import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import mysql, { Pool } from "mysql2/promise";

const app = express();
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

/* accounts */
app.get("/accounts", async (req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT id,name FROM accounts");
  res.json(rows);
});

app.post("/accounts", async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const [result] = await pool.query("INSERT INTO accounts (name) VALUES (?)", [name]);
  res.status(201).json({ id: (result as any).insertId, name });
});

app.put("/accounts/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body as { name: string };
  await pool.query("UPDATE accounts SET name = ? WHERE id = ?", [name, id]);
  res.sendStatus(204);
});

app.delete("/accounts/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM accounts WHERE id = ?", [id]);
  await pool.query("DELETE FROM entries WHERE account_id = ?", [id]);
  res.sendStatus(204);
});

/* entries */
app.get("/accounts/:id/entries", async (req: Request, res: Response) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    "SELECT date,description,debit,credit FROM entries WHERE account_id = ? ORDER BY date",
    [id]
  );
  res.json(rows);
});

app.post("/accounts/:id/entries", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, description, debit, credit } = req.body as {
    date: string;
    description: string;
    debit: string;
    credit: string;
  };
  await pool.query(
    "INSERT INTO entries (account_id,date,description,debit,credit) VALUES (?,?,?,?,?)",
    [id, date, description, debit, credit]
  );
  res.sendStatus(201);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server listening on ${port}`));