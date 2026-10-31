"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = React.useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    if (!mounted) {
        return (
            <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-100/60 dark:border-zinc-800/80 dark:bg-zinc-900/60 ${className}`}
                aria-hidden="true"
            >
                <span className="h-4 w-4" />
            </div>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`group relative flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100/80 text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-200/60 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${className}`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <Sun
                className={`h-4 w-4 transition-all duration-300 ${
                    isDark
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100 text-amber-500"
                }`}
            />
            <Moon
                className={`absolute h-4 w-4 transition-all duration-300 ${
                    isDark
                        ? "rotate-0 scale-100 opacity-100 text-indigo-400"
                        : "-rotate-90 scale-0 opacity-0"
                }`}
            />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
