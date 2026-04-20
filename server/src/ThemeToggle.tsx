import type { ThemePreference } from "./theme";

type ThemeToggleProps = {
  pref: ThemePreference;
  onChange: (next: ThemePreference) => void;
};

export default function ThemeToggle({ pref, onChange }: ThemeToggleProps) {
  return (
    <div className="themeToggle" role="radiogroup" aria-label="Theme">
      <button
        type="button"
        className={pref === "system" ? "themeOption themeOptionActive" : "themeOption"}
        role="radio"
        aria-checked={pref === "system"}
        onClick={() => onChange("system")}
        title="System"
      >
        ◐
      </button>

      <button
        type="button"
        className={pref === "light" ? "themeOption themeOptionActive" : "themeOption"}
        role="radio"
        aria-checked={pref === "light"}
        onClick={() => onChange("light")}
        title="Light"
      >
        ☀
      </button>

      <button
        type="button"
        className={pref === "dark" ? "themeOption themeOptionActive" : "themeOption"}
        role="radio"
        aria-checked={pref === "dark"}
        onClick={() => onChange("dark")}
        title="Dark"
      >
        ☾
      </button>
    </div>
  );
}