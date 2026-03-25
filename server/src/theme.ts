export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "keepup-theme";

export function getStoredPreference(): ThemePreference {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
    return "system";
}

export function storePreference(pref: ThemePreference) {
    localStorage.setItem(STORAGE_KEY, pref);
}

export function getSystemTheme(): ResolvedTheme {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyResolvedTheme(theme: ResolvedTheme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme; 
}