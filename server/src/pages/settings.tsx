import { useState } from "react";
import type { ThemePreference } from "../theme";

type SettingsProps = {
  themePref: ThemePreference;
  onThemeChange: (next: ThemePreference) => void;
};

export default function Settings({ themePref, onThemeChange }: SettingsProps) {
  const currentEmail = "user@example.com"; // TODO: Replace with actual user email
  const [accountName, setAccountName] = useState(currentEmail);
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: true,
    autoSave: true,
    compactView: false,
  });

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="settingsPage">
      <h1>Settings</h1>

      {/* Account Section */}
      <section className="settingsSection">
        <h2>Account</h2>
        <div className="settingsForm">
          <div className="formGroup">
            <label htmlFor="accountName">Account Name</label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter your account name"
            />
          </div>

          <div className="formGroup">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="formGroup">
            <div className="passwordLabelGroup">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="showPasswordToggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
        </div>
      </section>

      {/* Theme Section */}
      <section className="settingsSection">
        <h2>Appearance</h2>
        <div className="themeSettings" role="radiogroup" aria-label="Theme">
          <button
            type="button"
            className={`themeButton ${themePref === "system" ? "themeButtonActive" : ""}`}
            onClick={() => onThemeChange("system")}
            role="radio"
            aria-checked={themePref === "system"}
          >
            <span className="themeIcon">◐</span>
            <span className="themeName">System Default</span>
          </button>

          <button
            type="button"
            className={`themeButton ${themePref === "light" ? "themeButtonActive" : ""}`}
            onClick={() => onThemeChange("light")}
            role="radio"
            aria-checked={themePref === "light"}
          >
            <span className="themeIcon">☀</span>
            <span className="themeName">Light</span>
          </button>

          <button
            type="button"
            className={`themeButton ${themePref === "dark" ? "themeButtonActive" : ""}`}
            onClick={() => onThemeChange("dark")}
            role="radio"
            aria-checked={themePref === "dark"}
          >
            <span className="themeIcon">☾</span>
            <span className="themeName">Dark</span>
          </button>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="settingsSection">
        <h2>Preferences</h2>
        <div className="preferencesList">
          <label className="preferenceItem">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={() => handlePreferenceChange("notifications")}
            />
            <span>Enable Notifications</span>
          </label>

          <label className="preferenceItem">
            <input
              type="checkbox"
              checked={preferences.autoSave}
              onChange={() => handlePreferenceChange("autoSave")}
            />
            <span>Auto-save Changes</span>
          </label>

          <label className="preferenceItem">
            <input
              type="checkbox"
              checked={preferences.compactView}
              onChange={() => handlePreferenceChange("compactView")}
            />
            <span>Compact View</span>
          </label>
        </div>
      </section>
    </div>
  );
}
