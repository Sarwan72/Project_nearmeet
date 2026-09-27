import { create } from "zustand";
const getInitialTheme = () => {
    if (typeof window === "undefined")
        return "lemonade";
    const stored = localStorage.getItem("streamify-theme");
    const theme = (stored || "lemonade").toLowerCase();
    document.documentElement.setAttribute("data-theme", theme);
    return theme;
};
export const useThemeStore = create((set) => ({
    theme: getInitialTheme(),
    setTheme: (newTheme) => {
        const normalized = (newTheme || "lemonade").toLowerCase();
        localStorage.setItem("streamify-theme", normalized);
        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", normalized);
        }
        set({ theme: normalized });
    },
}));
