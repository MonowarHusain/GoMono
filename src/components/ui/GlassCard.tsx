export function GlassCard({ children }: { children: React.ReactNode }) {
    return <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-xl">{children}</div>;
}
