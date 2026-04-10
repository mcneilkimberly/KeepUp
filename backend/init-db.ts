import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const defaultAccounts = [
  "Cash",
  "Accounts Receivable",
  "Inventory",
  "Accounts Payable",
  "Common Stock",
  "Retained Earnings",
  "Rent Expense",
  "Payroll Expense",
  "Supplies Expense",
  "Cost of Goods Sold",
  "Sales Revenue",
  "Service Revenue"
];

async function initDatabase(){
    if (!process.env.DB){
        throw new Error("DB env variable is missing in the .env file");
    }

    console.log("Connecting to DB server (without specifying DB name yet)")
    // Strip the database name from the connection string so we can connect to the server itself first
    const serverConnectionString = process.env.DB.replace(/\/keepup(\?.*)?$/, '/$1');
    const serverPool = await mysql.createPool(serverConnectionString);
    
    try{ 
        await serverPool.query("CREATE DATABASE IF NOT EXISTS keepup;");
        await serverPool.end(); // close this temporary connection
        
        console.log("Connecting to keepup DB")
        const pool = await mysql.createPool(process.env.DB);
        
        await pool.query("USE keepup;");

        console.log("Creating users table")
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(36) UNIQUE NOT NULL,
            email VARCHAR(36) UNIQUE NOT NULL,
            password_hash VARCHAR(36) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);

        console.log("Creating businesses table")
        await pool.query(`
            CREATE TABLE IF NOT EXISTS business (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            legal_name VARCHAR(255),
            tax_identifier VARCHAR(100),
            business_type ENUM('sole_prop','llc','c_corp','s_corp','partnership') NOT NULL,
            owner_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_business_owner FOREIGN KEY (owner_id) REFERENCES users(id)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
            );
            `);
        
        console.log("Creating accounts table")
        await pool.query(`
            CREATE TABLE IF NOT EXISTS account (
            id CHAR(36) PRIMARY KEY,
            business_id CHAR(36) NOT NULL,
            name VARCHAR(36) NOT NULL,
            type ENUM('asset','liability','equity','revenue','expense','contraasset','contraliability','contraequity') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_accounts_business FOREIGN KEY (business_id) REFERENCES business(id)
        );
        `);
    
        console.log("Creating journal entries")
        await pool.query(`
            CREATE TABLE IF NOT EXISTS journalEntries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            business_id CHAR(36) NOT NULL,
            created_by INT NOT NULL,
            entry_date DATE NOT NULL,
            description TEXT NOT NULL,
            is_posted BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            CONSTRAINT fk_journal_business FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
            CONSTRAINT fk_journal_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
            );
            `);

        console.log("Creating journalLines")
        await pool.query(`CREATE TABLE IF NOT EXISTS journalLines (
            id INT AUTO_INCREMENT PRIMARY KEY,
            journal_entry_id INT NOT NULL,
            account_id CHAR(36) NOT NULL,
            debit_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (debit_amount >= 0),
            credit_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (credit_amount >= 0),
            memo VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_lines_entry FOREIGN KEY (journal_entry_id) REFERENCES journalEntries(id) ON DELETE CASCADE,
            CONSTRAINT fk_lines_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE RESTRICT
            );
            `);

        console.log("Creating default_Accounts table");
        await pool.query(`CREATE TABLE IF NOT EXISTS default_Accounts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            business_type ENUM('sole_prop','llc','c_corp','s_corp','partnership'),
            name VARCHAR(36) NOT NULL,
            type ENUM('asset','liability','equity','revenue','expense','contraasset','contraliability','contraequity') NOT NULL
        );`);

        console.log("Checking if default accounts exist...");
        const [rows]: any = await pool.query(`
            SELECT COUNT(*) as count FROM default_Accounts`);
            const accountCount = rows[0].count;
            if (accountCount === 0){
                console.log("Table is empty. Inserting default accounts");
                await pool.query(`
                    INSERT INTO default_Accounts (name, type) VALUES
                    ('Cash', 'asset'),
                    ('Accounts Receivable', 'asset'),
                    ('Inventory', 'asset'),
                    ('Accounts Payable', 'liability'),
                    ('Common Stock', 'equity'),
                    ('Retained Earnings', 'equity'),
                    ('Rent Expense', 'expense'),
                    ('Payroll Expense', 'expense'),
                    ('Supplies Expense', 'expense'),
                    ('Cost of Goods Sold', 'expense'),
                    ('Sales Revenue', 'revenue'),
                    ('Service Revenue', 'revenue')
                    `);
            }else{
                console.log("Default accounts already exist. Skipping insertion.");
            }
            
        console.log("Tables have initialized! YAY!")

    } 
    catch (error){
        console.error("Couldnt Initialize Tables", error);
    }
}

initDatabase();