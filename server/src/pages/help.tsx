export default function Help() {
    return (
        <div>
            <h1 className="pageTitle">Help</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                This page will become a mini knowledge base (FAQs, docs, and whatnot). 
            </p>

            <div className="helpGrid">
                <div className="card helpSection">
                    <h2 className="cardTitle">FAQ</h2>

                    <details>
                        <summary style={{ cursor: "pointer", fontWeight: 800, marginBottom: 10 }}>
                            What is KeepUp?
                        </summary>
                        <p className="muted" style={{ marginTop: 0 }}>
                            KeepUp is a bookkeeping + financial management app. This repo currently contains the front-end UI shell; later we'll connect it to a backend and real data.
                        </p>
                    </details>

                    <details>
                        <summary style={{ cursor: "pointer", fontWeight: 800, marginBottom: 10 }}>
                            What's the difference between Journal and Ledger?
                        </summary>
                        <p className="muted" style={{ marginTop: 0 }}> 
                            The Journal is where you enter transactions. The Ledger is where you view transactions grouped/filterable by account and see running balances.
                        </p>
                    </details>

                    <details>
                        <summary style={{ cursor: "pointer", fontWeight: 800, marginBottom: 10 }}>
                            When will statements generate real numbers?
                        </summary>
                        <p className="muted" style={{ marginTop: 0 }}> 
                            Once we store journal entries and compute account totals, we can render real Balance Sheets and Income Statements from the Ledger data.
                        </p>
                    </details>

                    <details>
                        <summary style={{ cursor: "pointer", fontWeight: 800, marginBottom: 10 }}>
                            How do I report a bug?
                        </summary>
                        <p className="muted" style={{ marginTop: 0 }}>
                            For now: create an issue in the project repo with steps to reproduce and screenshots.
                        </p>
                    </details>
                </div>
            </div>

            <div className="helpGrid">
                <div className="card helpSection">
                    <h2 className="cardTitle">Accounting Terms and Definitions</h2>

                    <h3>
                        <b><u>General Ledger (GL)</u>: The General Ledger is a complete record of all financial transactions over the life of an organization. It serves as the primary accounting record for a company and includes all accounts related to assets, liabilities, equity, revenue, and expenses.</b>
                    </h3>
                    <ul>
                        <li>
                            <b>Chart of Accounts</b>: A list of all the accounts used by an organization in its general ledger.
                        </li>
                        <li>
                            <b>Journal Entries</b>: The method used to record transactions in the general ledger. Each journal entry typically includes the date, amount, and accounts involved.
                        </li>
                        <li>
                            <b>Double-Entry Accounting</b>: A system where every financial transaction affects at least two accounts (i.e., one account is debited and another is credited).
                        </li>
                        <li>
                            <b>Trial Balance</b>: A report that lists the balances of all general ledger accounts to ensure the books are balanced before preparing financial statements.
                        </li>
                    </ul>
                    <p style={{ textAlign: "center" }}>
                        ***
                    </p>

                    <h3>
                        <b><u>Income Statement (IS)</u></b>: The Income Statement, also known as the Profit and Loss Statement or Statement of Earnings, is a financial statement that shows a company's revenues, expenses, and profits over a specific period, typically a quarter or year.
                    </h3>
                    <ul>
                        <li>
                            <b>Revenue</b>: The total amount of money a company earns from its business activities, such as sales of goods or services.
                        </li>
                        <li>
                            <b>Cost of Goods Sold (COGS)</b>: The direct costs associated with producing the goods or services sold by the company.
                        </li>
                        <li>
                            <b>Gross Profit</b>: <i>Revenue minus the cost of goods sold (COGS), indicating the profitability from core operations.</i>
                        </li>
                        <li>
                            <b>Operating Expenses</b>: Expenses related to running the business, such as salaries, rent, and utilities.
                        </li>
                        <li>
                            <b>Operating Income</b>: The profit a company makes from its core business operations, calculated as gross profit minus operating expenses.
                        </li>
                        <li>
                            <b>Net Income</b>: The final profit after all expenses (including taxes and interest) have been deducted from revenues. Often referred to as the "bottom line".
                        </li>
                    </ul>
                    <p style={{ textAlign: "center" }}>
                        ***
                    </p>

                    <h3>
                        <b><u>Balance Sheet (BS)</u></b>: The Balance Sheet is a financial statement that presents a company's financial position at a specific point in time, detailing its assets, liabilities, and equity. The balance sheet follows the basic accounting equation: Assets = Liabilities + Shareholders' Equity
                    </h3>
                    <ul>
                        <li>
                            <b>Current Assets</b>: Assets that are expected to be converted to cash or used up within one year (e.g., cash, accounts receivable, inventory).
                        </li>
                        <li>
                            <b>Non-Current Assets</b>: Long-term investments, property, plant, equipment, and intangible assets like patents.
                        </li>
                        <li>
                            <b>Current Liabilities</b>: Short-term financial obligations due within one year (e.g., accounts payable, short-term debt).
                        </li>
                        <li>
                            <b>Non-Current Liabilities</b>: Long-term obligations due after one year (e.g., long-term debt, pension liabilities).
                        </li>
                        <li>
                            <b>Equity</b>: The owners' residual interest in the assets of the company after liabilities are deducted, representing the net worth of the company.
                        </li>
                        <li>
                            <b>Common Stock</b>: The value of the company's stock issued to shareholders.
                        </li>
                        <li>
                            <b>Retained Earnings</b>: The accumulated profits that have been reinvested into the business rather than distributed as dividends.
                        </li>
                    </ul>
                </div>
            </div>
            <div className="helpGrid">
                <div className="card helpSection">
                    <h2 className="cardTitle">Accounting Terms and Definitions</h2>

                    <ol>
                        <li>
                            <b>Keep Personal and Business Finances Separate</b>: Always maintain separate bank accounts and credit cards for personal and business expenses. Mixing them up can lead to errors and make tax filing more difficult.
                        </li>
                        <li>
                            <b>Reconcile Accounts Regularly</b>: Reconcile your bank accounts, credit cards, and other financial accounts regularly to ensure that your records are accurate and complete.
                        </li>
                        <li>
                            <b>Keep Track of All Receipts and Invoices</b>: Maintain a system for recording all receipts, invoices, and transactions. Use a scanner or mobile app to digitize paper receipts for better organization.
                        </li>
                        <li>
                            <b>Understand the Accounting Equation</b>: Ensure your books balance using the fundamental accounting equation: Assets = Liabilities + Equity. This equation should always hold true.
                        </li>
                        <li>
                            <b>Maintain Consistent and Accurate Documentation</b>: Proper documentation is crucial for bookkeeping. Always ensure that your financial records are detailed and stored securely for future reference, especially for tax purposes.
                        </li>
                        <li>
                            <b>Implement Internal Controls</b>: Implement a system of internal controls to prevent fraud and errors, such as requiring multiple approvals for large transactions or conducting regular audits.
                        </li>
                        <li>
                            <b>Know Your Tax Obligations</b>: Stay informed about your tax obligations, including sales tax, income tax, and payroll tax. Keep track of tax deadlines to avoid penalties and interest.
                        </li>
                        <li>
                            <b>Record Transactions Promptly</b>: Enter transactions as soon as they occur to ensure your financial records are up-to-date and to avoid missing critical information during monthly reconciliations.
                        </li>
                        <li>
                            <b>Plan for Business Taxes</b>: Set aside money each month to pay your business taxes. Avoid the stress of scrambling for funds at tax time by budgeting for taxes ahead of time.
                        </li>
                        <li>
                            <b>Perform Regular Financial Audits</b>: Conduct regular internal audits to review your financial statements, check for discrepancies, and identify areas of improvement or risk.
                        </li>
                        <li>
                            <b>Seek Professional Help When Needed</b>: If your business finances become too complex, consider hiring a certified accountant or bookkeeping professional to ensure accuracy and compliance with tax laws.
                        </li>
                    </ol>
                    <p style={{ textAlign: "center" }}>
                        <small><b>Sources</b>: <a href="https://www.investopedia.com" target="_blank" rel="noopener noreferrer"><i>Investopedia.com</i></a>, <a href="https://www.aaahq.org" target="_blank" rel="noopener noreferrer"><i>aaahq.org</i></a></small>
                    </p>
                </div>
            </div>
        </div>
    );
}