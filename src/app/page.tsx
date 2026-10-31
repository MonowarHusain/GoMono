import Link from "next/link";
import { Link2, Zap, ArrowRight, Lock, Flame } from "lucide-react";
import PublicShortener from "@/components/public/PublicShortener";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-50 selection:bg-blue-500/30 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none fixed left-1/2 top-1/4 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed right-1/4 bottom-1/4 -z-10 h-[400px] w-[500px] rounded-full bg-purple-600/10 blur-[130px]" />

      {/* Top Navigation */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
            <Link2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GoMono</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-xs font-semibold text-neutral-200 backdrop-blur-md transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white sm:text-sm"
          >
            <span>Admin Portal</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Main Hero & Public Shortener */}
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-8 pb-20 text-center sm:pt-14 sm:pb-28">
        {/* App Status Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Public Shortener • No Account Required</span>
        </div>

        {/* Headline */}
        <h1 className="mb-5 max-w-3xl bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl sm:leading-tight">
          Lightning Fast URL Shortening for Everyone
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-xl text-base text-neutral-400 sm:text-lg">
          Paste your destination link below to create an ultra-fast, trackable short URL in seconds. Free, frictionless, and secure.
        </p>

        {/* Public Shortener Component */}
        <div className="w-full flex justify-center">
          <PublicShortener />
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-center backdrop-blur-sm transition-all hover:border-neutral-700">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-white">Edge Accelerated</h3>
            <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
              Sub-50ms global redirects powered by Next.js and Firebase cloud infrastructure.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-center backdrop-blur-sm transition-all hover:border-neutral-700">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-white">Burn on Read</h3>
            <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
              Optional self-destruct limits to auto-expire links after a chosen number of clicks.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-center backdrop-blur-sm transition-all hover:border-neutral-700">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-white">Zero Profile Leakage</h3>
            <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
              Public links are created anonymously without collecting personal accounts or private metadata.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-8 text-center text-xs text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p>© {new Date().getFullYear()} GoMono. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-neutral-300 transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}