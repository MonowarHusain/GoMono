"use client";

import { useState, useEffect, useCallback } from "react";

export interface VaultLink {
    alias: string;
    shortUrl: string;
    originalUrl: string;
    createdAt: string;
    domain?: string;
}

const STORAGE_KEY = "gomono_local_vault";
const MAX_VAULT_ITEMS = 25;
const VAULT_UPDATED_EVENT = "gomono:vault-updated";

/**
 * SSR-safe, zero-cost local browser link vault hook.
 * Persists up to 25 recently shortened links directly in localStorage.
 * Requires ZERO database reads, zero server storage, and works offline.
 */
export function useLocalLinkVault() {
    const [links, setLinks] = useState<VaultLink[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Read stored links safely from localStorage
    const loadFromStorage = useCallback(() => {
        if (typeof window === "undefined") return;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                setLinks([]);
                setIsLoaded(true);
                return;
            }

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                // Ensure array shape conforms to VaultLink
                const valid = parsed.filter(
                    (item) => item && typeof item.alias === "string" && typeof item.shortUrl === "string"
                );
                setLinks(valid.slice(0, MAX_VAULT_ITEMS));
            } else {
                setLinks([]);
            }
        } catch (err) {
            console.warn("Failed to read from local link vault:", err);
            setLinks([]);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Initial mount hydration
    useEffect(() => {
        loadFromStorage();

        // Listen for storage changes across tabs
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadFromStorage();
            }
        };

        // Listen for custom event within same window/tab
        const handleCustomEvent = () => {
            loadFromStorage();
        };

        window.addEventListener("storage", handleStorageEvent);
        window.addEventListener(VAULT_UPDATED_EVENT, handleCustomEvent);

        return () => {
            window.removeEventListener("storage", handleStorageEvent);
            window.removeEventListener(VAULT_UPDATED_EVENT, handleCustomEvent);
        };
    }, [loadFromStorage]);

    // Save items to localStorage and notify listeners
    const commitToStorage = useCallback((items: VaultLink[]) => {
        if (typeof window === "undefined") return;
        try {
            const trimmed = items.slice(0, MAX_VAULT_ITEMS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
            setLinks(trimmed);
            // Dispatch in-window event for instant reactivity
            window.dispatchEvent(new CustomEvent(VAULT_UPDATED_EVENT));
        } catch (err) {
            console.warn("Failed to write to local link vault:", err);
        }
    }, []);

    // Add or update a link in the vault
    const saveLink = useCallback(
        (link: Omit<VaultLink, "createdAt"> & { createdAt?: string }) => {
            const newItem: VaultLink = {
                alias: link.alias,
                shortUrl: link.shortUrl,
                originalUrl: link.originalUrl,
                domain: link.domain,
                createdAt: link.createdAt || new Date().toISOString(),
            };

            setLinks((prev) => {
                // Remove existing item with same alias if present
                const filtered = prev.filter((item) => item.alias !== newItem.alias);
                const nextList = [newItem, ...filtered].slice(0, MAX_VAULT_ITEMS);
                commitToStorage(nextList);
                return nextList;
            });
        },
        [commitToStorage]
    );

    // Remove a single link by alias
    const removeLink = useCallback(
        (alias: string) => {
            setLinks((prev) => {
                const nextList = prev.filter((item) => item.alias !== alias);
                commitToStorage(nextList);
                return nextList;
            });
        },
        [commitToStorage]
    );

    // Clear entire local vault
    const clearVault = useCallback(() => {
        if (typeof window === "undefined") return;
        try {
            localStorage.removeItem(STORAGE_KEY);
            setLinks([]);
            window.dispatchEvent(new CustomEvent(VAULT_UPDATED_EVENT));
        } catch (err) {
            console.warn("Failed to clear local vault:", err);
        }
    }, []);

    return {
        links,
        isLoaded,
        saveLink,
        removeLink,
        clearVault,
        count: links.length,
    };
}
