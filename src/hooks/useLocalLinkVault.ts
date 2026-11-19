"use client";

import { useSyncExternalStore, useCallback } from "react";

export interface VaultLink {
    alias: string;
    shortUrl: string;
    originalUrl: string;
    createdAt: string;
    domain?: string;
    burnAfterRead?: boolean;
    isBurned?: boolean;
    isPinned?: boolean;
    tag?: string;
}

const STORAGE_KEY = "gomono_local_vault";
const MAX_VAULT_ITEMS = 25;
const VAULT_UPDATED_EVENT = "gomono:vault-updated";

function subscribe(callback: () => void) {
    if (typeof window === "undefined") return () => {};

    const handleStorageEvent = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
            callback();
        }
    };

    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener(VAULT_UPDATED_EVENT, callback);

    return () => {
        window.removeEventListener("storage", handleStorageEvent);
        window.removeEventListener(VAULT_UPDATED_EVENT, callback);
    };
}

let cachedRaw: string | null = null;
let cachedLinks: VaultLink[] = [];

function getSnapshot(): VaultLink[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY) || "[]";
        if (raw !== cachedRaw) {
            cachedRaw = raw;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                cachedLinks = parsed
                    .filter((item) => item && typeof item.alias === "string" && typeof item.shortUrl === "string")
                    .slice(0, MAX_VAULT_ITEMS);
            } else {
                cachedLinks = [];
            }
        }
        return cachedLinks;
    } catch {
        return [];
    }
}

const SERVER_SNAPSHOT: VaultLink[] = [];
function getServerSnapshot(): VaultLink[] {
    return SERVER_SNAPSHOT;
}

/**
 * SSR-safe, zero-cost local browser link vault hook.
 * Persists up to 25 recently shortened links directly in localStorage.
 * Requires ZERO database reads, zero server storage, and works offline.
 */
export function useLocalLinkVault() {
    const links = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    // Save items to localStorage and notify listeners
    const commitToStorage = useCallback((items: VaultLink[]) => {
        if (typeof window === "undefined") return;
        try {
            const trimmed = items.slice(0, MAX_VAULT_ITEMS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
            cachedRaw = null; // Invalidate cache so getSnapshot re-reads
            window.dispatchEvent(new CustomEvent(VAULT_UPDATED_EVENT));
        } catch (err) {
            console.warn("Failed to write to local link vault:", err);
        }
    }, []);

    // Add or update a link in the vault
    const saveLink = useCallback(
        (link: Omit<VaultLink, "createdAt"> & { createdAt?: string }) => {
            const current = getSnapshot();
            const existing = current.find((item) => item.alias === link.alias);

            const newItem: VaultLink = {
                alias: link.alias,
                shortUrl: link.shortUrl,
                originalUrl: link.originalUrl,
                domain: link.domain,
                burnAfterRead: link.burnAfterRead ?? existing?.burnAfterRead,
                isBurned: link.isBurned ?? existing?.isBurned,
                isPinned: link.isPinned ?? existing?.isPinned ?? false,
                tag: link.tag ?? existing?.tag,
                createdAt: link.createdAt || new Date().toISOString(),
            };

            const filtered = current.filter((item) => item.alias !== newItem.alias);
            const nextList = [newItem, ...filtered].slice(0, MAX_VAULT_ITEMS);
            // Sort pinned links to top
            nextList.sort((a, b) => {
                if (Boolean(a.isPinned) === Boolean(b.isPinned)) return 0;
                return a.isPinned ? -1 : 1;
            });
            commitToStorage(nextList);
        },
        [commitToStorage]
    );

    // Toggle pinned status of a link
    const togglePin = useCallback(
        (alias: string) => {
            const current = getSnapshot();
            const nextList = current.map((item) =>
                item.alias === alias ? { ...item, isPinned: !item.isPinned } : item
            );
            nextList.sort((a, b) => {
                if (Boolean(a.isPinned) === Boolean(b.isPinned)) return 0;
                return a.isPinned ? -1 : 1;
            });
            commitToStorage(nextList);
        },
        [commitToStorage]
    );

    // Remove a single link by alias
    const removeLink = useCallback(
        (alias: string) => {
            const current = getSnapshot();
            const nextList = current.filter((item) => item.alias !== alias);
            commitToStorage(nextList);
        },
        [commitToStorage]
    );

    // Clear entire local vault
    const clearVault = useCallback(() => {
        if (typeof window === "undefined") return;
        try {
            localStorage.removeItem(STORAGE_KEY);
            cachedRaw = null;
            window.dispatchEvent(new CustomEvent(VAULT_UPDATED_EVENT));
        } catch (err) {
            console.warn("Failed to clear local vault:", err);
        }
    }, []);

    return {
        links,
        isLoaded: true,
        saveLink,
        togglePin,
        removeLink,
        clearVault,
        count: links.length,
    };
}
