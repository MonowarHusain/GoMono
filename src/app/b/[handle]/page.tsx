import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { detectTrafficType } from "@/lib/bot-detector";
import {
    BIO_THEMES,
    type BioPage,
    type BioTheme,
} from "@/lib/bio-schema";
import { SocialIcon } from "@/components/SocialIcons";
import {
    ExternalLink,
    Sparkles,
} from "lucide-react";

interface BioPageProps {
    params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: BioPageProps): Promise<Metadata> {
    const { handle } = await params;
    const cleanHandle = handle.toLowerCase().trim();

    try {
        const snap = await adminDb.collection("bio_pages").doc(cleanHandle).get();
        if (!snap.exists) {
            return {
                title: "Profile Not Found - GoMono",
            };
        }
        const data = snap.data() as BioPage;
        return {
            title: `${data.displayName} (@${data.handle}) - GoMono Bio`,
            description: data.bio || `Connect with ${data.displayName} on GoMono.`,
            openGraph: {
                title: `${data.displayName} (@${data.handle})`,
                description: data.bio || `Check out ${data.displayName}'s links.`,
                images: data.avatarUrl ? [data.avatarUrl] : [],
            },
        };
    } catch {
        return { title: "GoMono Bio" };
    }
}

export default async function BioPageRoute({ params }: BioPageProps) {
    const { handle } = await params;
    const cleanHandle = handle.toLowerCase().trim();

    const snap = await adminDb.collection("bio_pages").doc(cleanHandle).get();
    if (!snap.exists) {
        notFound();
    }

    const data = snap.data() as BioPage;
    const themeKey = (data.theme as BioTheme) || "midnight-dark";
    const theme = BIO_THEMES[themeKey] || BIO_THEMES["midnight-dark"];

    // Atomic visitor view tracking (protecting free-tier writes by filtering bots)
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || "";
    const trafficInfo = detectTrafficType(userAgent);

    if (!trafficInfo.isBot) {
        adminDb
            .collection("bio_pages")
            .doc(cleanHandle)
            .update({
                totalViews: FieldValue.increment(1),
            })
            .catch(() => {});
    }

    const activeLinks = (data.links || []).filter((l) => l.active !== false);

    return (
        <main className={`flex min-h-screen flex-col items-center justify-between p-4 sm:p-8 transition-colors ${theme.wrapperClass}`}>
            {/* Centered Profile Container */}
            <div className="w-full max-w-md mx-auto pt-6 pb-12 flex flex-col items-center text-center">
                {/* Avatar with subtle glow */}
                <div className="relative mb-4 group">
                    <div className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 blur-md opacity-60" />
                    {data.avatarUrl ? (
                        // External image URL (zero server file storage)
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={data.avatarUrl}
                            alt={data.displayName}
                            className="relative h-24 w-24 rounded-full object-cover shadow-lg border-2 border-white/20"
                            loading="lazy"
                        />
                    ) : (
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600/20 border-2 border-indigo-400/30 text-2xl font-bold uppercase shadow-lg">
                            {data.displayName.slice(0, 2) || "GM"}
                        </div>
                    )}
                </div>

                {/* Display Name & Handle */}
                <h1 className={`text-xl font-bold tracking-tight sm:text-2xl ${theme.textClass}`}>
                    {data.displayName}
                </h1>
                <p className="mt-0.5 text-xs font-mono opacity-60">
                    @{data.handle}
                </p>

                {/* Bio text */}
                {data.bio && (
                    <p className={`mt-3 max-w-xs text-xs sm:text-sm leading-relaxed ${theme.subtextClass}`}>
                        {data.bio}
                    </p>
                )}

                {/* Social Icon Row */}
                {data.socials && data.socials.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        {data.socials.map((social, idx) => (
                            <a
                                key={`${social.platform}_${idx}`}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-all hover:scale-110 hover:border-white/30 hover:bg-white/15 hover:text-white"
                                title={social.platform}
                            >
                                <SocialIcon platform={social.platform} className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                )}

                {/* Vertical Card Links List */}
                <div className="mt-7 w-full space-y-3">
                    {activeLinks.length > 0 ? (
                        activeLinks.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                                    link.highlight
                                        ? theme.highlightClass
                                        : theme.cardClass
                                }`}
                            >
                                <span className="flex-1 text-center font-medium truncate px-4">
                                    {link.title}
                                </span>
                                <ExternalLink className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/15 p-6 text-xs opacity-60">
                            No links added to this profile yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Zero-Storage Minimal Footer */}
            <footer className="w-full text-center pb-4 text-[11px] opacity-50 hover:opacity-80 transition-opacity">
                <Link
                    href="/bio-builder"
                    className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                >
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    <span>Create your own free Bio Page with GoMono</span>
                </Link>
            </footer>
        </main>
    );
}
