/**
 * Weighted A/B Split Testing Destination Engine
 * Zero-dependency, mathematically sound weighted random selection
 * for multi-variant traffic splitting and landing page experiments.
 */

export interface AbVariant {
    url: string;
    weight: number; // Relative or percentage weight (e.g., 50 for 50%)
    label?: string; // Optional human-readable tag, e.g. "Control (A)", "Challenger (B)"
}

export interface SplitResult {
    selectedUrl: string;
    selectedIndex: number;
    variantLabel: string;
    totalVariants: number;
}

/**
 * Resolves an A/B split destination URL using weighted random probability distribution.
 * Falls back gracefully to fallbackUrl if variants are empty or invalid.
 */
export function resolveSplitDestination(
    variants: AbVariant[] | null | undefined,
    fallbackUrl: string
): SplitResult {
    const trimmedFallback = fallbackUrl.trim();

    if (!Array.isArray(variants) || variants.length === 0) {
        return {
            selectedUrl: trimmedFallback,
            selectedIndex: -1,
            variantLabel: "Default",
            totalVariants: 0,
        };
    }

    // Filter valid variants with non-empty URL and weight >= 0
    const validVariants = variants.filter(
        (v) => v && typeof v.url === "string" && v.url.trim().length > 0 && Number(v.weight) > 0
    );

    if (validVariants.length === 0) {
        return {
            selectedUrl: trimmedFallback,
            selectedIndex: -1,
            variantLabel: "Default Fallback",
            totalVariants: 0,
        };
    }

    if (validVariants.length === 1) {
        return {
            selectedUrl: validVariants[0].url.trim(),
            selectedIndex: 0,
            variantLabel: validVariants[0].label || "Variant A",
            totalVariants: 1,
        };
    }

    // Calculate sum of weights
    const totalWeight = validVariants.reduce((sum, v) => sum + Math.max(0, Number(v.weight) || 0), 0);

    if (totalWeight <= 0) {
        return {
            selectedUrl: validVariants[0].url.trim(),
            selectedIndex: 0,
            variantLabel: validVariants[0].label || "Variant A",
            totalVariants: validVariants.length,
        };
    }

    // Weighted random selection: pick random number in [0, totalWeight)
    const randomThreshold = Math.random() * totalWeight;
    let accumulatedWeight = 0;

    for (let i = 0; i < validVariants.length; i++) {
        accumulatedWeight += Number(validVariants[i].weight) || 0;
        if (randomThreshold <= accumulatedWeight) {
            return {
                selectedUrl: validVariants[i].url.trim(),
                selectedIndex: i,
                variantLabel: validVariants[i].label || `Variant ${String.fromCharCode(65 + i)}`,
                totalVariants: validVariants.length,
            };
        }
    }

    // Edge-case rounding fallback: return last valid variant
    const lastVariant = validVariants[validVariants.length - 1];
    return {
        selectedUrl: lastVariant.url.trim(),
        selectedIndex: validVariants.length - 1,
        variantLabel: lastVariant.label || `Variant ${String.fromCharCode(64 + validVariants.length)}`,
        totalVariants: validVariants.length,
    };
}

/**
 * Validates whether an A/B variant payload has valid URL destinations and weights.
 */
export function isValidVariantList(variants: unknown): variants is AbVariant[] {
    if (!Array.isArray(variants) || variants.length < 2) return false;
    return variants.every(
        (v) =>
            v &&
            typeof v === "object" &&
            typeof (v as AbVariant).url === "string" &&
            (v as AbVariant).url.trim().length > 0 &&
            typeof (v as AbVariant).weight === "number" &&
            (v as AbVariant).weight > 0
    );
}
