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

        const isProtected = formData.get("isProtected") === "on";
        const password = formData.get("password") as string | null;
        const expiresAtInput = formData.get("expiresAt") as string;
        const expiresAt = expiresAtInput ? new Date(expiresAtInput) : null;

        // Burn After Reading limit
        const maxClicksInput = formData.get("maxClicks") as string;
        const maxClicks = maxClicksInput ? parseInt(maxClicksInput, 10) : null;

        // Tagging System
        const tagsInput = formData.get("tags") as string;
        const tags = tagsInput
            ? tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
            : [];

        const linkRef = adminDb.collection("links").doc(alias);
        const doc = await linkRef.get();

        if (doc.exists) return { error: `The alias "${alias}" is already taken.` };

        await linkRef.set({
            originalUrl,
            alias,
            domain,    // Saved to DB
            createdAt: new Date(),
            expiresAt,
            isProtected,
            password: isProtected ? password : null,
            maxClicks, // Saved to DB
            tags,      // Saved to DB
            totalClicks: 0,
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
        const isProtected = formData.get("isProtected") === "on";
        const password = formData.get("password") as string | null;
        const expiresAtInput = formData.get("expiresAt") as string;
        const expiresAt = expiresAtInput ? new Date(expiresAtInput) : null;

        // Extract the updated domain
        const domain = (formData.get("domain") as string) || "to.mono.bro.bd";

        const maxClicksInput = formData.get("maxClicks") as string;
        const maxClicks = maxClicksInput ? parseInt(maxClicksInput, 10) : null;

        const tagsInput = formData.get("tags") as string;
        const tags = tagsInput
            ? tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
            : [];

        // Extract and sanitize the new alias
        let newAlias = (formData.get("alias") as string) || oldAlias;
        newAlias = newAlias.toLowerCase().trim();

        // Build the update payload
        const updateData: any = {
            originalUrl,
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