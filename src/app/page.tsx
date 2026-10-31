import Link from "next/link";
import { Zap, ArrowRight, Lock, Flame, Shield, Activity, Sparkles, Terminal } from "lucide-react";
import PublicShortener from "@/components/public/PublicShortener";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-white">
      {/* Ambient Lighting & Minimal Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),rgba(255,255,255,0))]" />
        <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/5 blur-[120px]" />
        {/* Subtle Engineering Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/50 bg-zinc-950/70 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 transition-transform">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-sm transition-colors group-hover:border-zinc-700">
              <span className="font-mono text-sm font-black tracking-tighter text-indigo-400">G</span>
            </div>
            <span className="text-base font-bold tracking-tight text-white">GoMono</span>
            <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              v2.0
            </span>
          </Link>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-4">
            {/* Live Operational Status */}
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400 backdrop-blur-md">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Edge Network: Online</span>
            </div>

            {/* Admin Portal Link */}
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <span>Admin Portal</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-12 pb-24 text-center sm:pt-20 sm:pb-32">
        {/* Status Pill Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-3.5 py-1 text-xs font-medium text-zinc-300 shadow-xs backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Next-Gen URL Infrastructure</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Zero Account Required</span>
        </div>

        {/* Hero Headline */}
        <h1 className="mb-4 max-w-3xl font-extrabold tracking-tight text-4xl sm:text-6xl sm:leading-[1.1] text-balance">
          <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Precision URL Shortening
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-white bg-clip-text text-transparent">
            Engineered for Speed.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-xl text-sm text-zinc-400 sm:text-base leading-relaxed text-balance">
          Transform lengthy URLs into high-speed, memorable links in milliseconds. Edge-accelerated with optional self-destruction and passcode security.
        </p>

        {/* Central Public Shortener Component */}
        <div className="w-full flex justify-center">
          <PublicShortener />
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1 font-mono">
            <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400 font-semibold">/</kbd>
            <span>focus input</span>
          </span>
          <span>•</span>
          <span>50 URLs batch limit</span>
        </div>

        {/* Feature Bento Grid (Vercel / Linear inspired) */}
        <div className="mt-28 grid w-full grid-cols-1 gap-4 sm:grid-cols-3 text-left">
          {/* Card 1: Edge Accelerated */}
          <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-colors group-hover:border-blue-500/40">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Edge Accelerated</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Sub-50ms redirects powered by Next.js edge routing and global cloud infrastructure.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              <Activity className="h-3 w-3 text-blue-400" />
              <span>Global edge latency: ~24ms</span>
            </div>
          </div>

          {/* Card 2: Burn on Read */}
          <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400 transition-colors group-hover:border-orange-500/40">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Burn on Read</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Self-destruct limits automatically erase the destination link after your chosen number of clicks.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              <Lock className="h-3 w-3 text-orange-400" />
              <span>Zero-trace expiration</span>
            </div>
          </div>

          {/* Card 3: Zero Profile Leakage */}
          <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-colors group-hover:border-emerald-500/40">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero Telemetry Leakage</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Public links are created anonymously without collecting personal accounts, tracking cookies, or device IDs.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              <Terminal className="h-3 w-3 text-emerald-400" />
              <span>Privacy by design</span>
            </div>
          </div>
        </div>
      </main>

      {/* Sleek Minimalist Footer */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950 py-8 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">GoMono</span>
            <span>•</span>
            <span>Lightning Fast Edge Redirection</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-zinc-300 transition-colors">
              Admin Portal
            </Link>
            <span>•</span>
            <span className="text-zinc-600">© {new Date().getFullYear()} GoMono</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
