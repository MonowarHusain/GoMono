/**
 * Zero-Storage Link-in-Bio Profile Schema & Validator
 * Compact, high-efficiency data model strictly bounded to <15KB per Firestore document.
 * Requires ZERO server-side image/file uploads (external avatar URLs only).
 */

export type BioTheme =
    | "minimal-light"
    | "midnight-dark"
    | "emerald-glass"
    | "cyber-indigo"
    | "sunset-gradient";

export type SocialPlatform =
    | "github"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "instagram"
    | "email"
    | "website"
    | "telegram"
    | "discord";

export interface BioSocialLink {
    platform: SocialPlatform;
    url: string;
}

export interface BioCardLink {
    id: string;
    title: string;
    url: string;
    icon?: string;
    active: boolean;
    highlight?: boolean;
}

export interface BioPage {
    handle: string; // URL path slug: /b/[handle]
    displayName: string;
    bio: string;
    avatarUrl?: string | null;
    theme: BioTheme;
    socials: BioSocialLink[];
    links: BioCardLink[];
    editToken: string; // Secret key saved to creator's localStorage for free zero-account edits
    totalViews: number;
    createdAt: string;
    updatedAt: string;
}

export interface BioPageInput {
    handle: string;
    displayName: string;
    bio: string;
    avatarUrl?: string;
    theme?: BioTheme;
    socials?: BioSocialLink[];
    links?: BioCardLink[];
    editToken?: string;
}

export interface BioThemeDefinition {
    id: BioTheme;
    name: string;
    previewBg: string;
    wrapperClass: string;
    cardClass: string;
    highlightClass: string;
    textClass: string;
    subtextClass: string;
}

export const BIO_THEMES: Record<BioTheme, BioThemeDefinition> = {
    "midnight-dark": {
        id: "midnight-dark",
        name: "Midnight Dark",
        previewBg: "#09090b",
        wrapperClass: "bg-zinc-950 text-white min-h-screen",
        cardClass: "bg-zinc-900/80 border border-zinc-800 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800/80",
        highlightClass: "border-indigo-500/80 bg-indigo-950/40 text-indigo-200 ring-1 ring-indigo-500/30",
        textClass: "text-zinc-100",
        subtextClass: "text-zinc-400",
    },
    "minimal-light": {
        id: "minimal-light",
        name: "Minimal Light",
        previewBg: "#f8fafc",
        wrapperClass: "bg-slate-50 text-slate-900 min-h-screen",
        cardClass: "bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs",
        highlightClass: "border-slate-800 bg-slate-900 text-white hover:bg-slate-800",
        textClass: "text-slate-900",
        subtextClass: "text-slate-600",
    },
    "emerald-glass": {
        id: "emerald-glass",
        name: "Emerald Glass",
        previewBg: "#022c22",
        wrapperClass: "bg-gradient-to-b from-emerald-950 via-zinc-950 to-zinc-950 text-white min-h-screen",
        cardClass: "bg-emerald-950/30 border border-emerald-800/40 backdrop-blur-md text-emerald-100 hover:border-emerald-700 hover:bg-emerald-900/40",
        highlightClass: "border-emerald-400 bg-emerald-500/20 text-white ring-1 ring-emerald-400/40",
        textClass: "text-emerald-50",
        subtextClass: "text-emerald-300/70",
    },
    "cyber-indigo": {
        id: "cyber-indigo",
        name: "Cyber Indigo",
        previewBg: "#1e1b4b",
        wrapperClass: "bg-gradient-to-b from-indigo-950 via-zinc-950 to-black text-white min-h-screen",
        cardClass: "bg-indigo-950/40 border border-indigo-800/50 backdrop-blur-md text-indigo-100 hover:border-indigo-600 hover:bg-indigo-900/40",
        highlightClass: "border-indigo-400 bg-indigo-600/30 text-white ring-1 ring-indigo-400/40",
        textClass: "text-indigo-50",
        subtextClass: "text-indigo-300/70",
    },
    "sunset-gradient": {
        id: "sunset-gradient",
        name: "Sunset Gradient",
        previewBg: "#4c0519",
        wrapperClass: "bg-gradient-to-b from-rose-950 via-orange-950 to-zinc-950 text-white min-h-screen",
        cardClass: "bg-white/5 border border-rose-800/30 backdrop-blur-md text-rose-100 hover:border-rose-600 hover:bg-white/10",
        highlightClass: "border-rose-400 bg-rose-500/20 text-white ring-1 ring-rose-400/40",
        textClass: "text-rose-50",
        subtextClass: "text-rose-300/70",
    },
};

const RESERVED_HANDLES = new Set([
    "admin",
    "api",
    "dashboard",
    "login",
    "qr",
    "csv-studio",
    "burned",
    "settings",
    "b",
    "bio-builder",
    "null",
    "undefined",
]);

/**
 * Validates and sanitizes Link-in-Bio payload input.
 */
export function validateBioPageInput(raw: unknown): {
    valid: boolean;
    errors: Record<string, string>;
    sanitized?: BioPageInput;
} {
    const errors: Record<string, string> = {};

    if (!raw || typeof raw !== "object") {
        return { valid: false, errors: { form: "Invalid input payload" } };
    }

    const data = raw as Record<string, unknown>;

    // 1. Validate Handle (Slug)
    let handle = typeof data.handle === "string" ? data.handle.trim().toLowerCase() : "";
    handle = handle.replace(/[^a-z0-9-_]/g, "");

    if (!handle) {
        errors.handle = "Profile handle is required";
    } else if (handle.length < 2 || handle.length > 30) {
        errors.handle = "Handle must be between 2 and 30 characters";
    } else if (RESERVED_HANDLES.has(handle)) {
        errors.handle = `The handle "${handle}" is reserved`;
    }

    // 2. Validate Display Name
    const displayName = typeof data.displayName === "string" ? data.displayName.trim().slice(0, 60) : "";
    if (!displayName) {
        errors.displayName = "Display name is required";
    }

    // 3. Bio summary
    const bio = typeof data.bio === "string" ? data.bio.trim().slice(0, 250) : "";

    // 4. Avatar URL (external link only, zero storage)
    let avatarUrl: string | undefined = undefined;
    if (typeof data.avatarUrl === "string" && data.avatarUrl.trim()) {
        const trimmed = data.avatarUrl.trim();
        if (/^https?:\/\//i.test(trimmed)) {
            avatarUrl = trimmed.slice(0, 500);
        } else {
            avatarUrl = `https://${trimmed}`.slice(0, 500);
        }
    }

    // 5. Theme
    const validThemes: BioTheme[] = [
        "midnight-dark",
        "minimal-light",
        "emerald-glass",
        "cyber-indigo",
        "sunset-gradient",
    ];
    const theme: BioTheme =
        typeof data.theme === "string" && validThemes.includes(data.theme as BioTheme)
            ? (data.theme as BioTheme)
            : "midnight-dark";

    // 6. Social Links (up to 8)
    const socials: BioSocialLink[] = [];
    if (Array.isArray(data.socials)) {
        for (const item of data.socials.slice(0, 8)) {
            if (item && typeof item === "object") {
                const p = String((item as BioSocialLink).platform || "").toLowerCase() as SocialPlatform;
                const u = String((item as BioSocialLink).url || "").trim();
                if (u && (item as BioSocialLink).platform) {
                    const formattedUrl = /^(https?:\/\/|mailto:)/i.test(u) ? u : `https://${u}`;
                    socials.push({ platform: p, url: formattedUrl.slice(0, 300) });
                }
            }
        }
    }

    // 7. Card Links (up to 15 links)
    const links: BioCardLink[] = [];
    if (Array.isArray(data.links)) {
        for (let i = 0; i < Math.min(data.links.length, 15); i++) {
            const item = data.links[i];
            if (item && typeof item === "object") {
                const title = String((item as BioCardLink).title || "").trim().slice(0, 80);
                const rawUrl = String((item as BioCardLink).url || "").trim();
                if (title && rawUrl) {
                    const formattedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
                    links.push({
                        id: String((item as BioCardLink).id || `link_${i + 1}`).slice(0, 40),
                        title,
                        url: formattedUrl.slice(0, 400),
                        active: (item as BioCardLink).active !== false,
                        highlight: Boolean((item as BioCardLink).highlight),
                    });
                }
            }
        }
    }

    // 8. Edit Token
    const editToken = typeof data.editToken === "string" && data.editToken.trim()
        ? data.editToken.trim().slice(0, 64)
        : undefined;

    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        errors: {},
        sanitized: {
            handle,
            displayName,
            bio,
            avatarUrl,
            theme,
            socials,
            links,
            editToken,
        },
    };
}
