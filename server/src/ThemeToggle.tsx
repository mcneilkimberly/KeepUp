import { useEffect, useMemo, useState } from "react";
import type { ThemePreference, ResolvedTheme } from "./theme";
import {
    applyResolvedTheme,
    getStoredPreference,
    getSystemTheme,
    storePreference,
} from "./theme";

function resolve(pref: ThemePreference): ResolvedTheme {
    return pref === "system" ? getSystemTheme() : pref;
}

export default function ThemeToggle() {
    const [pref, setPref] = useState<ThemePreference>(() => getStoredPreference());

    const resolved = useMemo(() => resolve(pref), [pref]);

    useEffect(() => {
        //apply immediately
        applyResolvedTheme(resolved);
    }, [resolved]);

    useEffect(() => {
        //if on system, react to OS changes live
        if (pref !== "system") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => applyResolvedTheme(getSystemTheme());

        //Safari compatibility
        if (mq.addEventListener) mq.addEventListener("change", handler);
        else mq.addListener(handler);

        return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", handler);
        else mq.removeListener(handler);
        };
    }, [pref]);

    function choose(next: ThemePreference) {
        setPref(next);
        storePreference(next);
    }

    return (
        <div className="themeToggle" role="radiogroup" aria-label="Theme">
        <button
            type="button"
            className={pref === "system" ? "themeOption themeOptionActive" : "themeOption"}
            role="radio"
            aria-checked={pref === "system"}
            onClick={() => choose("system")}
            title="System"
        >
            ◐
        </button>
        <button
            type="button"
            className={pref === "light" ? "themeOption themeOptionActive" : "themeOption"}
            role="radio"
            aria-checked={pref === "light"}
            onClick={() => choose("light")}
            title="Light"
        >
            ☀
        </button>
        <button
            type="button"
            className={pref === "dark" ? "themeOption themeOptionActive" : "themeOption"}
            role="radio"
            aria-checked={pref === "dark"}
            onClick={() => choose("dark")}
            title="Dark"
        >
            ☾
        </button>
        </div>
    );
}