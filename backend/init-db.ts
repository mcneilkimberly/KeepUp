import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

async function initDatabase(){
    if (!process.env.DB){
        throw new Error("DB env variable is missing in the .env file");
    }

    console.log("Connecting to DB")
    const pool = await mysql.createPool(process.env.DB);
    try{
        //USER SCHEMA CREATION TABLE
        // console.log("Creating users table")
        // await pool.query(`
        //     CREATE TABLE IF NOT EXISTS users (
        //     id INTEGER PRIMARY KEY AUTOINCREMENT,
        //     username TEXT UNIQUE NOT NULL,
        //     email TEXT UNIQUE NOT NULL,
        //     password_hash TEXT NOT NULL,
        //     created_at TEXT DEFAULT CURRENT_TIMESTAMP
        //     );
        //     `)
        //ACCOUNT SCHEMA CREATION TABLE 
        console.log("Creating accounts table")
        await pool.query(`
            CREATE TABLE IF NOT EXISTS accounts (
            id CHAR(36) PRIMARY KEY,
            business_id CHAR(36) NOT NULL,
            name VARCHAR(36) NOT NULL,
            type ENUM('asset','liability','equity','revenue','expense','contraasset','contraliability','contraequity') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_accounts_business # the business the accounts are for
            FOREIGN KEY (business_id)
            REFERENCES Businesses(id)
            );
            `);

        //ENTRIES SCHEMA CREATION TABLE
        console.log("Creating entries table")
        await pool.query(`
            CREATE TABLE IF NOT EXISTS entries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_id CHAR(36) NOT NULL,
            date DATE NOT NULL,
            description VARCHAR(250) NOT NULL,
            debit DECIMAL(10,2) DEFAULT 0.00,
            credit DECIMAL (10,2) DEFAULT 0.00,
            FOREIGN KEY (account_id) REFERENCES accounts(id)
            );
            `);

        console.log("Databases have initialized! YAY!")

    } 
    catch (error){
        console.error("Couldnt Initialize database", error);
        await pool.end();
    }
}

initDatabase();