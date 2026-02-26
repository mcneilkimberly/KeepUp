export default function Help() {
    return (
        <div>
            <h1 className="pageTitle">Help</h1>
            <p className="muted" style={{ maxWidth: 760, marginTop: 12 }}>
                This page will become a mini knowledge base (FAQs, docs, and whatnot). 
            </p>

            <div className="grid">
                <div className="card" style={{ gridColumn: "span 8" }}>
                <h2 className="cardTitle">FAQ</h2>

                <details open>
                    <summary style={{ cursor: "pointer", fontWeight: 800, marginBottom: 10 }}>
                    What is KeepUp?
                    </summary>
                    <p className="muted" style={{ marginTop: 0 }}>
                    KeepUp is a bookkeeping + financial management app. This repo currently contains
                    the front-end UI shell; later we'll connect it to a backend and real data.
                    </p>
                </details>

                <details>
                    <summary style={{ cursor: "pointer", fontWeight: 800, marginBottom: 10 }}>
                    What's the difference between Journal and Ledger?
                    </summary>
                    <p className="muted" style={{ marginTop: 0 }}>
                    The Journal is where you enter transactions. The Ledger is where you view transactions
                    grouped/filterable by account and see running balances.
                    </p>
                </details>

                <details>
                    <summary style={{ cursor: "pointer", fontWeight: 800, marginBottom: 10 }}>
                    When will statements generate real numbers?
                    </summary>
                    <p className="muted" style={{ marginTop: 0 }}>
                    Once we store journal entries and compute account totals, we can render real Balance Sheets
                    and Income Statements from the Ledger data.
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

                <div className="card" style={{ gridColumn: "span 4" }}>
                <h2 className="cardTitle">Contact / Project notes</h2>
                <p className="muted" style={{ marginTop: 0 }}>
                    Add whatever your team needs here: office hours, team roles, a link to the repo, or a short
                    “How to run locally” section.
                </p>

                <div style={{ display: "grid", gap: 10 }}>
                    <button className="btn" type="button">Open README (later)</button>
                    <button className="btn" type="button">Database status (later)</button>
                    <button className="btn btnPrimary" type="button">Contact form (later)</button>
                </div>
                </div>
            </div>
        </div>
    );
}