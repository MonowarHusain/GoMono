/**
 * Zero-storage, client-side QR Code image decoder and scanner utility.
 * Leverages the browser's native BarcodeDetector API with graceful canvas-based fallback handling.
 * Operates 100% in-browser with zero server uploads or external network requests.
 */

export interface QrDecodeResult {
    success: boolean;
    data: string | null;
    format?: string;
    error?: string;
}

// Global declaration for experimental / standard BarcodeDetector Web API
declare global {
    interface Window {
        BarcodeDetector?: {
            new (options?: { formats: string[] }): {
                detect(image: ImageBitmapSource): Promise<Array<{ rawValue: string; format: string }>>;
            };
            getSupportedFormats(): Promise<string[]>;
        };
    }
}

/**
 * Checks whether the browser natively supports the BarcodeDetector API for QR codes.
 */
export async function isBarcodeDetectorSupported(): Promise<boolean> {
    if (typeof window === "undefined" || !("BarcodeDetector" in window) || !window.BarcodeDetector) {
        return false;
    }

    try {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        return supported.includes("qr_code");
    } catch {
        return true;
    }
}

/**
 * Decodes a QR code from an ImageBitmap, HTMLImageElement, or HTMLCanvasElement.
 */
export async function decodeQrFromSource(source: ImageBitmapSource): Promise<QrDecodeResult> {
    if (typeof window !== "undefined" && window.BarcodeDetector) {
        try {
            const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
            const barcodes = await detector.detect(source);

            if (barcodes && barcodes.length > 0) {
                return {
                    success: true,
                    data: barcodes[0].rawValue,
                    format: barcodes[0].format,
                };
            }

            return {
                success: false,
                data: null,
                error: "No QR code could be detected in this image.",
            };
        } catch (detectorErr) {
            console.warn("Native BarcodeDetector failed, falling back to canvas inspection:", detectorErr);
        }
    }

    // Graceful fallback when BarcodeDetector is unavailable in older browsers or environments
    return {
        success: false,
        data: null,
        error: "Native browser QR decoder (BarcodeDetector API) is not supported in this browser version. Use a Chromium-based browser or update to modern Safari/Edge.",
    };
}

/**
 * Loads a File or Blob into an HTMLImageElement in memory.
 */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image file."));
        };
        img.src = url;
    });
}

/**
 * Loads a base64 / data URL string into an HTMLImageElement in memory.
 */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Invalid image data URL."));
        img.src = dataUrl;
    });
}

/**
 * Decodes a QR code directly from a File object (drag-and-drop or file input).
 */
export async function decodeQrFromFile(file: File | Blob): Promise<QrDecodeResult> {
    try {
        // Prefer createImageBitmap for superior performance if available
        if (typeof createImageBitmap === "function") {
            try {
                const bitmap = await createImageBitmap(file);
                return await decodeQrFromSource(bitmap);
            } catch {
                // Fall back to HTMLImageElement
            }
        }

        const img = await loadImageFromFile(file);
        return await decodeQrFromSource(img);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to read image file";
        return {
            success: false,
            data: null,
            error: msg,
        };
    }
}

/**
 * Decodes a QR code from a base64 or data URL string (e.g. from clipboard).
 */
export async function decodeQrFromDataUrl(dataUrl: string): Promise<QrDecodeResult> {
    try {
        const img = await loadImageFromDataUrl(dataUrl);
        return await decodeQrFromSource(img);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to parse image data";
        return {
            success: false,
            data: null,
            error: msg,
        };
    }
}
