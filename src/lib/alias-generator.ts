/**
 * Zero-dependency human-readable memorable alias and pronounceable slug generator.
 * Produces friendly adjective-noun-number slugs (e.g. swift-falcon-42) and
 * phonetic pronounceable words (e.g. vokera, talimo) as alternatives to random base62 strings.
 */

const ADJECTIVES = [
    "swift", "neon", "rapid", "cosmic", "lunar", "bold", "silent", "vivid",
    "quantum", "hyper", "stellar", "crystal", "golden", "agile", "solar",
    "brave", "prime", "calm", "slick", "fierce", "cyber", "mystic", "lucky",
    "radiant", "turbo", "epic", "bright", "clever", "gentle", "dynamic",
    "zen", "frosty", "shadow", "blazing", "noble", "infinite", "vibrant",
];

const NOUNS = [
    "falcon", "orbit", "pulse", "spark", "nexus", "beacon", "wave", "horizon",
    "comet", "prism", "valley", "echo", "surge", "forest", "canyon", "voyage",
    "shield", "thunder", "matrix", "vector", "atlas", "phantom", "vortex",
    "quest", "apex", "stream", "tiger", "zenith", "phoenix", "glider",
    "haven", "summit", "drift", "ember", "beacon", "aurora", "oasis",
];

const CONSONANTS = ["b", "c", "d", "f", "g", "h", "k", "l", "m", "n", "p", "r", "s", "t", "v", "z"];
const VOWELS = ["a", "e", "i", "o", "u"];

export interface MemorableAliasOptions {
    /** Whether to append a random 1-99 number suffix. Defaults to true. */
    includeNumber?: boolean;
    /** Separator character between words. Defaults to "-". */
    delimiter?: string;
    /** Whether to include a second adjective for higher entropy. Defaults to false. */
    doubleAdjective?: boolean;
}

/**
 * Returns a cryptographically sound or pseudorandom integer between min and max inclusive.
 */
function getRandomInt(min: number, max: number): number {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return min + (arr[0] % (max - min + 1));
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a random item from an array.
 */
function pickRandom<T>(items: T[]): T {
    return items[getRandomInt(0, items.length - 1)];
}

/**
 * Generates an intuitive, memorable slug like `swift-falcon-42` or `neon-orbit-7`.
 */
export function generateMemorableAlias(options: MemorableAliasOptions = {}): string {
    const { includeNumber = true, delimiter = "-", doubleAdjective = false } = options;

    const parts: string[] = [];

    if (doubleAdjective) {
        let adj1 = pickRandom(ADJECTIVES);
        let adj2 = pickRandom(ADJECTIVES);
        while (adj2 === adj1) {
            adj2 = pickRandom(ADJECTIVES);
        }
        parts.push(adj1, adj2);
    } else {
        parts.push(pickRandom(ADJECTIVES));
    }

    parts.push(pickRandom(NOUNS));

    if (includeNumber) {
        parts.push(String(getRandomInt(2, 99)));
    }

    return parts.join(delimiter).toLowerCase();
}

/**
 * Generates a pronounceable phonetic slug of alternating consonants and vowels (e.g. `vokera`, `nubari`).
 * Extremely easy to read, remember, or share verbally.
 */
export function generatePronounceableSlug(length = 6): string {
    const safeLength = Math.max(3, Math.min(16, length));
    let result = "";

    // Start with consonant or vowel at random
    let isConsonant = getRandomInt(0, 1) === 0;

    for (let i = 0; i < safeLength; i++) {
        if (isConsonant) {
            result += pickRandom(CONSONANTS);
        } else {
            result += pickRandom(VOWELS);
        }
        isConsonant = !isConsonant;
    }

    return result;
}
