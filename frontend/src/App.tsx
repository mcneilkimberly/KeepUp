import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Journal from "./pages/journal";
import Ledger from "./pages/ledger";
import Statements from "./pages/statements";
import Help from "./pages/help";
import "./App.css";

function NavItem({ to, label }: { to: string; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => (isActive ? "navItem navItemActive" : "navItem")}
            >
            {label}
        </NavLink>
    );
}

export default function App() {
    return (
        <div className="appShell">
            <header className="appHeader">
                <div className="appTitle">
                <div className="brand">KeepUp</div>
                <div className="brandSub">Accounting</div>
                </div>

                <nav className="nav">
                    <NavItem to="/" label="Home" />
                    <NavItem to="/journal" label="Journal" />
                    <NavItem to="/ledger" label="Ledger" />
                    <NavItem to="/statements" label="Statements" />
                    <NavItem to="/help" label="Help" />
                </nav>
            </header>

            {/* Full-width main content (no max-width container) */}
            <main className="appMain">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/ledger" element={<Ledger />} />
                    <Route path="/statements" element={<Statements />} />
                    <Route path="/help" element={<Help />} />
                    <Route
                        path="*"
                        element={
                        <div style={{ padding: 18 }}>
                            <h2 style={{ marginTop: 0 }}>404</h2>
                            <p style={{ color: "#bdbdbd" }}>That page doesn't exist yet.</p>
                        </div>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}