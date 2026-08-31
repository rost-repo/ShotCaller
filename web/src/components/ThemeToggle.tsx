"use client";

import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() { 
    function toggle() {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
    }
    return (
        <button
            onClick={toggle}
            aria-label="Toggle color theme"
            className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-hairline bg-surface text-fg sm:h-9 sm:w-9"
        >
            <Moon size={18} className="dark:hidden" />
            <Sun size={18} className="hidden dark:block" />
        </button>
    );
}