import { NavLink, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/home";
import Journal from "./pages/journal";
import Ledger from "./pages/ledger";
import Statements from "./pages/statements";
import Help from "./pages/help";
import "./App.css";


// Put your real logo in this file path (we'll create it below)
import keepUpLogo from "/keepup-logo.svg";

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
            <Link to="/" className="appTitleLink" aria-label="Go to KeepUp home">
                <img className="brandLogo" src={keepUpLogo} alt="" aria-hidden="true" />
                <span className="brand">KeepUp</span>
            </Link>


            <nav className="nav" aria-label="Primary navigation">
                <NavItem to="/" label="Home" />
                <NavItem to="/journal" label="Journal" />
                <NavItem to="/ledger" label="Ledger" />
                <NavItem to="/statements" label="Statements" />
                <NavItem to="/help" label="Help" />
            </nav>
      </header>

      <main className="appMain">
        <div className="appContainer">
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
                  <p className="muted">That page doesn't exist yet.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </main>

      <footer className="appFooter">
        <div className="appContainer footerWrap">
            {/* Top: centered brand */}
            <div className="footerTop">
            <Link to="/" className="footerBrandLink" aria-label="Go to KeepUp home">
                <img className="footerLogo" src={keepUpLogo} alt="" aria-hidden="true" />
                <span className="footerBrand">KeepUp</span>
            </Link>
            </div>

            {/* Middle: sections underneath */}
            <div className="footerSections">
            <div className="footerCol">
                <div className="footerHeading">Pages</div>
                <Link className="footerLink" to="/">Home</Link>
                <Link className="footerLink" to="/journal">Journal</Link>
                <Link className="footerLink" to="/ledger">Ledger</Link>
                <Link className="footerLink" to="/statements">Statements</Link>
                <Link className="footerLink" to="/help">Help</Link>
            </div>

            <div className="footerCol">
                <div className="footerHeading">Project</div>
                <a
                className="footerLink"
                href="https://github.com/mcneilkimberly/KeepUp"
                target="_blank"
                rel="noopener noreferrer"
                >
                Repo
                </a>
                <a className="footerLink" href="https://ih1.redbubble.net/image.446409693.5124/st,small,507x507-pad,600x600,f8f8f8.u1.jpg" target="_blank" rel="noopener noreferrer">
                Docs (idk)
                </a>
            </div>
            </div>

            {/* Bottom: copyright */}
            <div className="footerBottom">
            © {new Date().getFullYear()} KeepUp
            </div>
        </div>
        </footer>
    </div>
  );
}