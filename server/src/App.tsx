import { NavLink, Route, Routes, Link, useLocation, Navigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "./pages/dashboard";
import Journal from "./pages/journal";
import Ledger from "./pages/ledger";
import Statements from "./pages/statements";
import TaxPlanner from "./pages/tax-planner";
import Help from "./pages/help";
import SignUp from "./pages/sign-up";
import Login from "./pages/login";
import Settings from "./pages/settings";
import "./App.css";
import {
  applyResolvedTheme,
  getStoredPreference,
  getSystemTheme,
  storePreference,
} from "./theme";
import type { ResolvedTheme, ThemePreference } from "./theme";
import { isAuthenticated } from "./auth";

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === "system" ? getSystemTheme() : pref;
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: NavLinkRenderProps) =>
        isActive ? "navItem navItemActive" : "navItem"
      }
    >
      {label}
    </NavLink>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();

  const [themePref, setThemePref] = useState<ThemePreference>(() =>
    getStoredPreference()
  );

  const resolvedTheme = useMemo(() => resolveTheme(themePref), [themePref]);

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

  const keepUpLogo = "/K_trans.png";

  const isAuthPage =
    location.pathname === "/sign-up" || location.pathname === "/login";

  return (
    <div className="appShell">
      {!isAuthPage && (
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

          <Link to="/settings" className="settingsIcon" title="Settings" aria-label="Open Settings">
            ⚙
          </Link>
        </div>
      </header>
      )}
      <main className={isAuthPage ? "authMain" : "appMain"}>
        <div className={isAuthPage ? "" : "appContainer"}>
          <Routes>
            <Route path="/" element={<Dashboard resolvedTheme={resolvedTheme} />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/statements" element={<Statements />} />
            <Route path="/tax-planner" element={<TaxPlanner />} />
            <Route path="/help" element={<Help />} />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings themePref={themePref} onThemeChange={setThemePref} />
                </RequireAuth>
              }
            />
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

      {!isAuthPage && (
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
                <a
                  className="footerLink"
                  href="https://github.com/mcneilkimberly/KeepUp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Repository (Github)
                </a>
              </div>
            </div>

            <div className="footerBottom">
              © {new Date().getFullYear()} KeepUp
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}