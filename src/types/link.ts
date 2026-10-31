/**
 * Link schema and TypeScript types for GoMono URL shortener.
 * Supports core link fields and security options (password, expiresAt, maxClicks).
 */

export interface CreateLinkInput {
    originalUrl: string;
    customAlias?: string | null;
    domain?: string;
    tags?: string[] | string | null;
    password?: string | null;
    expiresAt?: string | Date | null;
    maxClicks?: number | string | null;
    iosUrl?: string | null;
    androidUrl?: string | null;
}

export interface LinkSecurityOptions {
    password?: string | null;
    expiresAt?: string | Date | null;
    maxClicks?: number | null;
    isProtected?: boolean;
}

export interface Link {
    alias: string;
    originalUrl: string;
    iosUrl?: string | null;
    androidUrl?: string | null;
    domain?: string;
    totalClicks: number;
    createdAt: string;
    isProtected?: boolean;
    password?: string | null;
    expiresAt?: string | null;
    maxClicks?: number | null;
    tags?: string[];
    isPublic?: boolean;
    createdBy?: string;
    isDemo?: boolean;
}

export interface LinkValidationResult {
    valid: boolean;
    errors: Record<string, string>;
    sanitized?: {
        originalUrl: string;
        customAlias?: string;
        domain?: string;
        password?: string | null;
        expiresAt?: Date | null;
        maxClicks?: number | null;
        tags?: string[];
        iosUrl?: string | null;
        androidUrl?: string | null;
    };
}

/**
 * Validates and sanitizes link creation payload with optional security options.
 */
export function validateLinkCreation(input: Partial<CreateLinkInput>): LinkValidationResult {
    const errors: Record<string, string> = {};

    if (!input.originalUrl || typeof input.originalUrl !== "string" || !input.originalUrl.trim()) {
        errors.originalUrl = "Original URL is required.";
    }

    let password: string | null = null;
    if (input.password && typeof input.password === "string" && input.password.trim()) {
        password = input.password.trim();
    }

    let expiresAt: Date | null = null;
    if (input.expiresAt) {
        const parsedDate = new Date(input.expiresAt);
        if (isNaN(parsedDate.getTime())) {
            errors.expiresAt = "Invalid expiration date.";
        } else {
            expiresAt = parsedDate;
        }
    }

    let maxClicks: number | null = null;
    if (input.maxClicks !== undefined && input.maxClicks !== null && input.maxClicks !== "") {
        const parsedClicks = typeof input.maxClicks === "number" ? input.maxClicks : parseInt(String(input.maxClicks), 10);
        if (isNaN(parsedClicks) || parsedClicks <= 0) {
            errors.maxClicks = "Max clicks must be a positive number.";
        } else {
            maxClicks = parsedClicks;
        }
    }

    let tags: string[] = [];
    if (Array.isArray(input.tags)) {
        tags = input.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
    } else if (typeof input.tags === "string" && input.tags.trim()) {
        tags = input.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        sanitized: {
            originalUrl: input.originalUrl ? input.originalUrl.trim() : "",
            customAlias: input.customAlias ? input.customAlias.trim().toLowerCase() : undefined,
            domain: input.domain || "to.mono.bro.bd",
            password,
            expiresAt,
            maxClicks,
            tags,
            iosUrl: input.iosUrl?.trim() || null,
            androidUrl: input.androidUrl?.trim() || null,
        },
    };
}

