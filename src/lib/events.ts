import { type Link } from "@/components/dashboard/LinksTable";

export const GOMONO_LINK_CREATED_EVENT = "gomono:link-created";
export const GOMONO_LINK_DELETED_EVENT = "gomono:link-deleted";

export type LinkCreatedPayload = Partial<Link> & {
    alias: string;
    originalUrl: string;
};

/**
 * Notifies the dashboard and other tabs that a new link was created.
 * Uses both in-window CustomEvent and cross-tab BroadcastChannel.
 */
export function notifyLinkCreated(payload?: LinkCreatedPayload) {
    if (typeof window === "undefined") return;

    try {
        window.dispatchEvent(
            new CustomEvent(GOMONO_LINK_CREATED_EVENT, { detail: payload })
        );
    } catch (err) {
        console.warn("Failed to dispatch DOM event", err);
    }

    try {
        if ("BroadcastChannel" in window) {
            const bc = new BroadcastChannel("gomono_links_channel");
            bc.postMessage({ type: "LINK_CREATED", payload });
            bc.close();
        }
    } catch (err) {
        console.warn("Failed to broadcast link creation", err);
    }
}

/**
 * Notifies the dashboard and other tabs that a link was deleted.
 */
export function notifyLinkDeleted(alias: string) {
    if (typeof window === "undefined") return;

    try {
        window.dispatchEvent(
            new CustomEvent(GOMONO_LINK_DELETED_EVENT, { detail: { alias } })
        );
    } catch (err) {
        console.warn("Failed to dispatch DOM event", err);
    }

    try {
        if ("BroadcastChannel" in window) {
            const bc = new BroadcastChannel("gomono_links_channel");
            bc.postMessage({ type: "LINK_DELETED", alias });
            bc.close();
        }
    } catch (err) {
        console.warn("Failed to broadcast link deletion", err);
    }
}

