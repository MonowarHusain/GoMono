import Link from "next/link";
import { Link2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 text-neutral-50">

      {/* Subtle Background Glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="z-10 flex max-w-3xl flex-col items-center text-center">

        {/* App Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-4 py-1.5 text-sm font-medium text-neutral-300 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Private URL Management System</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          link-monowar
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-xl text-lg text-neutral-400 sm:text-xl">
          A high-performance, single-user URL shortener engineered for speed, analytics, and security.
        </p>

        {/* Action Button */}
        <Link
          href="/login"
          className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 active:scale-95"
        >
          <span>Access Admin Dashboard</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-sm">
            <Zap className="mb-3 h-8 w-8 text-blue-400" />
            <h3 className="font-semibold text-white">Edge Accelerated</h3>
            <p className="mt-1 text-sm text-neutral-500">Sub-50ms global redirects via Vercel.</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-sm">
            <Link2 className="mb-3 h-8 w-8 text-purple-400" />
            <h3 className="font-semibold text-white">Burn on Read</h3>
            <p className="mt-1 text-sm text-neutral-500">Auto-destruct links after max clicks.</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-sm">
            <ShieldCheck className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="font-semibold text-white">Zero Trust</h3>
            <p className="mt-1 text-sm text-neutral-500">Hardware-level Firebase Auth rules.</p>
          </div>
        </div>

      </div>
    </main>
  );
}