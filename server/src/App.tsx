import { NavLink, Route, Routes, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "./pages/dashboard";
import Journal from "./pages/journal";
import Ledger from "./pages/ledger";
import Statements from "./pages/statements";
import TaxPlanner from "./pages/tax-planner";
import Help from "./pages/help";
import "./App.css";
import ThemeToggle from "./ThemeToggle";
import {
  applyResolvedTheme,
  getStoredPreference,
  getSystemTheme,
  storePreference,
} from "./theme";
import type { ResolvedTheme, ThemePreference } from "./theme";

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === "system" ? getSystemTheme() : pref;
}

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
  const [themePref, setThemePref] = useState<ThemePreference>(() =>
    getStoredPreference()
  );

  const resolvedTheme = useMemo(
    () => resolveTheme(themePref),
    [themePref]
  );

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
    storePreference(themePref);
  }, [themePref, resolvedTheme]);

  useEffect(() => {
    if (themePref !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setThemePref((current) => (current === "system" ? "system" : current));
    };

    if (mq.addEventListener) mq.addEventListener("change", handleChange);
    else mq.addListener(handleChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handleChange);
      else mq.removeListener(handleChange);
    };
  }, [themePref]);

  const keepUpLogo =
    resolvedTheme === "dark" ? "/keepup-logo-dark.svg" : "/keepup-logo-light.svg";

  return (
    <div className="appShell">
      <header className="appHeader">
        <Link to="/" className="appTitleLink" aria-label="Go to KeepUp Dashboard">
          <img className="brandLogo" src={keepUpLogo} alt="" aria-hidden="true" />
          <span className="brand">KeepUp</span>
        </Link>

        <div className="headerRight">
          <nav className="nav" aria-label="Primary navigation">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/journal" label="Journal" />
            <NavItem to="/ledger" label="Ledger" />
            <NavItem to="/statements" label="Statements" />
            <NavItem to="/tax-planner" label="Tax Planner" />
            <NavItem to="/help" label="Help" />
          </nav>

          <ThemeToggle pref={themePref} onChange={setThemePref} />
        </div>
      </header>

      <main className="appMain">
        <div className="appContainer">
          <Routes>
            <Route path="/" element={<Dashboard resolvedTheme={resolvedTheme} />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/statements" element={<Statements />} />
            <Route path="/tax-planner" element={<TaxPlanner />} />
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
          <div className="footerTop">
            <Link to="/" className="footerBrandLink" aria-label="Go to KeepUp Dashboard">
              <img className="footerLogo" src={keepUpLogo} alt="" aria-hidden="true" />
              <span className="footerBrand">KeepUp</span>
            </Link>
          </div>

          <div className="footerSections">
            <div className="footerCol">
              <div className="footerHeading">Pages</div>
              <Link className="footerLink" to="/">Dashboard</Link>
              <Link className="footerLink" to="/journal">Journal</Link>
              <Link className="footerLink" to="/ledger">Ledger</Link>
              <Link className="footerLink" to="/statements">Statements</Link>
              <Link className="footerLink" to="/tax-planner">Tax Planner</Link>
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
              <a
                className="footerLink"
                href="https://ih1.redbubble.net/image.446409693.5124/st,small,507x507-pad,600x600,f8f8f8.u1.jpg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs (idk)
              </a>
            </div>
          </div>

          <div className="footerBottom">
            © {new Date().getFullYear()} KeepUp
          </div>
        </div>
      </footer>
    </div>
  );
}