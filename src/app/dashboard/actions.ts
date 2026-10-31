// src/app/dashboard/actions.ts
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

function generateRandomAlias() {
    return Math.random().toString(36).substring(2, 8).toLowerCase();
}

export async function createLink(formData: FormData) {
    try {
        const originalUrl = formData.get("originalUrl") as string;
        let alias = (formData.get("alias") as string) || generateRandomAlias();
        alias = alias.toLowerCase().trim();

        // Extract domain preference
        const domain = (formData.get("domain") as string) || "to.mono.bro.bd";

        const rawPassword = formData.get("password") as string | null;
        const password = rawPassword && rawPassword.trim() ? rawPassword.trim() : null;
        const isProtected = formData.get("isProtected") === "on" || !!password;

        const expiresAtInput = formData.get("expiresAt") as string;
        let expiresAt: Date | null = null;
        if (expiresAtInput) {
            const parsedDate = new Date(expiresAtInput);
            if (!isNaN(parsedDate.getTime())) {
                expiresAt = parsedDate;
            }
        }

        // Burn After Reading limit
        const maxClicksInput = formData.get("maxClicks") as string;
        let maxClicks: number | null = null;
        if (maxClicksInput) {
            const parsedClicks = parseInt(maxClicksInput, 10);
            if (!isNaN(parsedClicks) && parsedClicks > 0) {
                maxClicks = parsedClicks;
            }
        }

        // Tagging System
        const tagsInput = formData.get("tags") as string;
        const tags = tagsInput
            ? tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
            : [];

        // Device-Based Smart Routing
        const rawIosUrl = (formData.get("iosUrl") as string)?.trim() || null;
        let iosUrl: string | null = null;
        if (rawIosUrl) {
            iosUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawIosUrl) ? rawIosUrl : `https://${rawIosUrl}`;
        }

        const rawAndroidUrl = (formData.get("androidUrl") as string)?.trim() || null;
        let androidUrl: string | null = null;
        if (rawAndroidUrl) {
            androidUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawAndroidUrl) ? rawAndroidUrl : `https://${rawAndroidUrl}`;
        }

        const linkRef = adminDb.collection("links").doc(alias);
        const doc = await linkRef.get();

        if (doc.exists) return { error: `The alias "${alias}" is already taken.` };

        await linkRef.set({
            originalUrl,
            iosUrl,
            androidUrl,
            alias,
            domain,    // Saved to DB
            createdAt: new Date(),
            expiresAt,
            isProtected,
            password: isProtected ? password : null,
            maxClicks, // Saved to DB
            tags,      // Saved to DB
            totalClicks: 0,
            createdBy: "admin",
            creatorType: "admin",
            userId: "admin",
            isAdminOnly: true,
            isPublic: false,
        });

        revalidatePath("/dashboard");
        return { success: true, alias };
    } catch (error) {
        console.error("Error creating link:", error);
        return { error: "Failed to create link." };
    }
}

export async function deleteLink(alias: string) {
    try {
        await adminDb.collection("links").doc(alias).delete();
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting link:", error);
        return { error: "Failed to delete link." };
    }
}

export async function updateLink(oldAlias: string, formData: FormData) {
    try {
        const originalUrl = formData.get("originalUrl") as string;
        const rawPassword = formData.get("password") as string | null;
        const password = rawPassword && rawPassword.trim() ? rawPassword.trim() : null;
        const isProtected = formData.get("isProtected") === "on" || !!password;
        
        const expiresAtInput = formData.get("expiresAt") as string;
        let expiresAt: Date | null = null;
        if (expiresAtInput) {
            const parsedDate = new Date(expiresAtInput);
            if (!isNaN(parsedDate.getTime())) {
                expiresAt = parsedDate;
            }
        }

        // Extract the updated domain
        const domain = (formData.get("domain") as string) || "to.mono.bro.bd";

        const maxClicksInput = formData.get("maxClicks") as string;
        let maxClicks: number | null = null;
        if (maxClicksInput) {
            const parsedClicks = parseInt(maxClicksInput, 10);
            if (!isNaN(parsedClicks) && parsedClicks > 0) {
                maxClicks = parsedClicks;
            }
        }

        const tagsInput = formData.get("tags") as string;
        const tags = tagsInput
            ? tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
            : [];

        // Extract and sanitize the new alias
        let newAlias = (formData.get("alias") as string) || oldAlias;
        newAlias = newAlias.toLowerCase().trim();

        // Device-Based Smart Routing
        const rawIosUrl = (formData.get("iosUrl") as string)?.trim() || null;
        let iosUrl: string | null = null;
        if (rawIosUrl) {
            iosUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawIosUrl) ? rawIosUrl : `https://${rawIosUrl}`;
        }

        const rawAndroidUrl = (formData.get("androidUrl") as string)?.trim() || null;
        let androidUrl: string | null = null;
        if (rawAndroidUrl) {
            androidUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawAndroidUrl) ? rawAndroidUrl : `https://${rawAndroidUrl}`;
        }

        // Build the update payload
        const updateData: Record<string, unknown> = {
            originalUrl,
            iosUrl,
            androidUrl,
            domain, // Ensure domain updates are captured
            expiresAt,
            isProtected,
            maxClicks,
            tags,
        };

        if (isProtected && password) {
            updateData.password = password;
        } else if (!isProtected) {
            updateData.password = null;
        }

        const oldLinkRef = adminDb.collection("links").doc(oldAlias);

        // If the user actually changed the alias, we must perform a Move operation
        if (newAlias !== oldAlias) {
            const newLinkRef = adminDb.collection("links").doc(newAlias);
            const newDoc = await newLinkRef.get();

            if (newDoc.exists) {
                return { error: `The alias "${newAlias}" is already taken.` };
            }

            // Fetch the existing data so we don't lose totalClicks and createdAt
            const oldDoc = await oldLinkRef.get();
            const oldData = oldDoc.data();

            // Create the new document merging old data with new updates
            await newLinkRef.set({
                ...oldData,
                ...updateData,
                alias: newAlias, // Update the internal field
            });

            // Delete the old document
            await oldLinkRef.delete();

        } else {
            // If the alias is the same, just do a standard fast update
            await oldLinkRef.update(updateData);
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating link:", error);
        return { error: "Failed to update link." };
    }
}