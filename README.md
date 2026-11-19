<div align="center">

# ⚡ GoMono

**The elite, lightning-fast, zero-storage enterprise URL shortener and intelligence suite.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br />

[Features](#-core-features-the-bitly-killer-suite) • [Architecture](#-architecture--design-philosophy) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Quickstart](#-getting-started) • [API Reference](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 🌟 Overview

**GoMono** is a modern, enterprise-ready URL management platform designed to rival industry leaders like Bitly, TinyURL, and Short.io. Built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**, GoMono delivers sub-millisecond edge redirects, zero-storage QR generation, hardware-level smart routing, and real-time click telemetry—wrapped in an ultra-clean, minimalist interface inspired by **Linear**, **Vercel**, and **Raycast**.

---

## ⚡ Core Features (The "Bitly-Killer" Suite)

### 1. 🚀 Lightning Bulk URL Shortening
- **Batch Text Area**: Paste up to 50 URLs at once (one per line) or drag-and-drop `.csv` and `.txt` files.
- **Concurrent Processing**: Parallel asynchronous requests with individual failure isolation (one faulty URL won't halt the batch).
- **Summary Export Dashboard**: Real-time batch progress bar, visual status mapping, one-click **"Copy All Short Links"**, and instant **"Download CSV"** report.

### 2. 🎨 Zero-Storage Custom QR Studio (`/qr`)
- **Zero Server Overhead**: 100% of QR codes are generated dynamically on the client canvas; no images are saved to your database or storage buckets.
- **4 Custom Dot Styles**: Classic Crisp Squares, Smooth Rounded Dots, Elegant Classy Diamonds, and Connected Matrix.
- **Custom Palettes & Gradients**: Full hex code customization with instant brand preset color pickers.
- **11 Embedded Vector Logos**: Zero-storage preset center badges including GitHub, Twitter / X, LinkedIn, YouTube, Instagram, Discord, Telegram, WhatsApp, Spotify, Google, and Globe.
- **High-Definition Vector & Raster Export**: Download crisp vector `.svg` or ultra-high-resolution 2048×2048px print-ready `.png`.

### 3. 📱 Device-Based Smart Routing
- **Hardware-Aware Redirection**: Inspects incoming visitor `User-Agent` headers in real time.
- **Targeted Fallbacks**:
  - **iOS Visitors**: Automatically routed to your iOS App Store link or native deep link.
  - **Android Visitors**: Automatically routed to your Google Play Store link or Android intent.
  - **Desktop / Other Visitors**: Directed to the standard primary destination URL.

### 4. 📈 Enterprise Analytics & Intelligence Studio
- **$O(1)$ Atomic Counters**: Instant telemetry reads via Firestore `FieldValue.increment(1)` without heavy table scans.
- **Device Category Breakdown**: Real-time segmented distribution tracking for **Mobile**, **Desktop**, and **Tablet**.
- **Browser & OS Intelligence**: Accurate classification across Chrome, Safari, Firefox, Edge, Opera, Samsung Internet, macOS, iOS, Android, Windows, and Linux.
- **Visitor Audit Trail**: Live traffic log table displaying timestamps, exact device badges, browser/OS pairs, smart routing indicators, and referers.
- **Zero Aggressive Polling**: On-demand telemetry sync with manual refresh and one-click **"Download Activity CSV"** export.

### 5. 🛡️ Zero-Trust Security & Link Governance
- **⏳ Time-Based Auto-Expiration**: Schedule links to automatically shut down at a specific date and time, serving a clean, branded expiration screen.
- **🔥 Burn-After-Reading (Max Click Limits)**: Enforce a strict click threshold; once reached, the link self-destructs and redirects to a dedicated `/burned` view.
- **🔒 Cryptographic Password Protection**: Shield sensitive destinations behind an encrypted password gate with secure inline credential verification.

### 6. 🌓 Modern Pro UI & Theme Studio
- **Flicker-Free Dark/Light Mode**: Smooth, persistent theme switching using Tailwind v4 CSS variables and system preference detection.
- **Live Sync & Optimistic UI**: Cross-tab synchronization via `BroadcastChannel` and scoped Firestore snapshots that update link tables instantly without reloading.

### 7. 🗄️ Standalone CSV Studio & Data Engine (`/csv-studio`)
- **100% Client-Side Processing**: Zero server-side file uploads, zero database bloat, and total privacy for sensitive datasets.
- **High-Performance Data Grid**: View, edit, sort, and paginate thousands of records with zero UI latency.
- **Data Hygiene & Transformation**: One-click deduplication, empty row stripping, URL protocol normalization, and regex find-and-replace.
- **Multi-Format Export**: Instant conversions between CSV, JSON, and formatted TXT data formats.

### 8. ⚡ Zero-Cost Power-User Suite
- **Bitly-Style `+` Link Safety Inspector (`/[alias]+`)**: Append `+` (or `%2B`) to any short link (e.g. `to.mono.bro.bd/launch+`) to preview destination safety, TLS/HTTPS security status, creation date, and total human clicks—without triggering redirects or skewing telemetry.
- **Instant Address-Bar Prefix Shortening**: Prepend GoMono's domain before any URL in your browser's address bar (e.g. `to.mono.bro.bd/https://github.com/trending`) to instantly generate or retrieve a short link with auto-copy and vector SVG QR code.
- **1-Click Draggable Bookmarklet**: Drag the "⚡ Shorten with GoMono" bookmarklet button directly to your browser's bookmarks bar to shorten any active tab in a single click.
- **Client-Side Local Link Vault**: Anonymous visitors get instant access to their last 25 shortened links saved in browser `localStorage` (`gomono_local_vault`) with cross-tab live synchronization and $0 Firestore read cost.
- **Zero-Dependency Bot & Crawler Shield**: Intelligent user-agent detection intercepts search crawlers (Googlebot, Bingbot, Baiduspider), social scrapers, and automated scripts (curl, wget, python-requests) to bypass analytics logging—preserving free-tier Firestore write quotas.
- **Dynamic Social OpenGraph (OG) Cloaking**: Custom social cards (`ogTitle`, `ogDescription`, `ogImage`) served specifically to social preview bots (WhatsApp, Discord, Twitterbot, Telegram, Facebook) with automatic `<meta http-equiv="refresh">` client fallback.

### 9. 📱 Zero-Storage Link-in-Bio Studio (`/bio-builder` & `/b/[handle]`)
- **Fast Mobile-First Profile Pages**: Dedicated public profiles at `/b/[handle]` with custom avatars, display names, bio descriptions, social rows, and interactive destination cards.
- **5 Curated Designer Themes**: Minimal Light, Midnight Dark, Emerald Glass, Cyber Indigo, and Sunset Gradient.
- **Zero-Storage Privacy Architecture**: Built entirely around external image links—100% zero file storage uploads, bounded to <15KB Firestore payloads.
- **Anonymous Creator Ownership**: Automatically stores a cryptographic `editToken` in creator browser `localStorage` (`gomono_bio_edit_tokens`), allowing free profile updates anytime without requiring an account.

### 10. 🎯 Growth & Experimentation Engine
- **Weighted A/B Traffic Splitting**: Run high-conversion split testing experiments by specifying a Challenger Variant B URL and split weight (50/50, 80/20, 90/10) with zero external routing latency.
- **Built-in Campaign UTM Studio**: Query-safe parameter builder (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) with 1-click channel presets (WhatsApp, LinkedIn, X/Twitter, Newsletter, QR Print) and local preset persistence (`gomono_utm_presets`).
- **Global `Cmd+K` / `Ctrl+K` Command Palette**: Raycast-inspired keyboard command bar accessible from any page for instantaneous navigation between Shortener, Bio Studio, CSV Studio, QR Studio, recent Device Vault links, and 1-click clipboard shortening.

### 11. 🌐 Zero-API Accept-Language Locale Smart Routing
- **Native Browser Language Routing**: Automatically redirect visitors to localized pages (e.g., Spanish `/es`, French `/fr`, Japanese `/ja`, German `/de`, Bengali `/bn`) based on incoming RFC 7231 `Accept-Language` headers.
- **Quality Factor ($q$) Sorting**: Accurately honors user language priority lists with prefix and region fallback matching (e.g., `es-MX` -> `es`).
- **$0 Free-Tier Architecture**: 100% zero external GeoIP API calls, zero vendor lock-in, and sub-millisecond edge resolution.

### 12. ⏰ Scheduled Time-Window Links & Active Operating Hours
- **Future Launch & Expiration Windows**: Specify exact activation timestamps (`startAt`) and hard sunset times (`endAt`).
- **Recurring Active Operating Windows**: Restrict link availability to specific days of the week (e.g., Monday through Friday) and daily active hour windows (e.g., 09:00 to 18:00 UTC).
- **Branded Holding Screen**: Visitors arriving before launch or outside scheduled operating hours receive a clean holding notice detailing link availability status.

### 13. 🔐 Cryptographic SHA-256 Link Password Gates
- **One-Way SHA-256 Hashing**: Passwords are cryptographically hashed using the Web Crypto API before storing in Firestore—passwords are never saved in plain text.
- **Timing-Attack Resistance**: Verification uses bitwise XOR constant-time byte accumulation to guard against side-channel analysis.
- **Interactive Unlock Gate**: Displays an elegant glassmorphism unlock modal (`PasswordGateCard`) prompting visitors for the passcode before revealing or redirecting to the destination.

### 14. 🩺 Zero-Cost Batch HTTP Link Health Checker
- **Lightweight Batch Status Checker**: Evaluates up to 25 target URLs concurrently via `/api/health-check` using non-blocking HTTP `HEAD` requests and a 4-second timeout.
- **Range GET Resiliency Fallback**: Automatically falls back to a single-byte `Range: bytes=0-0` GET request for servers that reject or drop HEAD requests (e.g. Cloudflare, AWS CloudFront, Fastly).
- **Live Status Badges**: Integrated directly into both the Admin Dashboard table (`200 OK`, `Redirect`, `Broken`) and the CSV Studio data grid with instant "Health Status" column generation.

### 15. 🚀 One-Click Social Share Matrix & Embed Snippets
- **Multi-Platform Share Triggers**: 1-click instant sharing to WhatsApp, X (Twitter), LinkedIn, Telegram, and Email with pre-filled link copy.
- **Instant Embed Copy**: 1-click buttons to copy Markdown snippets (`[Title](shortUrl)`) and HTML anchor tags (`<a href="shortUrl">Title</a>`) for fast publishing in documentation, newsletters, and blogs.

### 16. 🛡️ Privacy Shield: One-Click Tracking Parameter Stripper
- **Zero-Storage URL Sanitizer (`src/lib/url-cleaner.ts`)**: Automatically strips invasive surveillance parameters (`fbclid`, `gclid`, `msclkid`, `igshid`, `ttclid`, `twclid`, `si`, `_hsenc`, `mc_eid`) while preserving valid functional query keys.
- **Interactive UI Toggle**: One-click "Strip Trackers" pill in public shortener and admin forms to clean URLs before generating short links.

### 17. 🎲 Memorable "Magic Dice" Alias & Pronounceable Slug Generator
- **Human-Friendly Slugs (`src/lib/alias-generator.ts`)**: Generates memorable adjective-noun pairs (e.g. `swift-falcon`, `cosmic-orbit`) and pronounceable phonetic slugs (e.g. `bonari`, `velura`).
- **1-Click Magic Dice Button**: Integrated directly into custom alias fields in both public and admin shortener forms.

### 18. 🔥 Burn-After-Reading (Self-Destructing 1-Time) Links Engine
- **Atomic Deactivation**: Links self-destruct immediately after the very first human visitor arrives; destination is wiped and future visitors are routed to a branded `/burned` view.
- **Visual Status Badges**: Dedicated glowing flame badges in the Admin Dashboard and Local Device Vault.

### 19. 📑 Bulk Regex URL Extractor from Unstructured Text
- **Unstructured Text Blob Parser (`src/lib/url-extractor.ts`)**: Extracts all valid HTTP/HTTPS URLs from raw articles, customer support logs, emails, and markdown paragraphs.
- **Dedicated Modal**: Integrated directly into the Bulk Shortener modal and standalone CSV Studio toolbar.

### 20. 📲 Native Mobile App Deep-Link URI Auto-Mapper
- **Direct App Launch (`src/lib/deep-link-mapper.ts`)**: Detects standard web URLs for YouTube, Twitter/X, Instagram, Spotify, GitHub, and LinkedIn, converting them to native app protocols (`vnd.youtube://`, `spotify://`, `twitter://`) on iOS and Android visitors.
- **Zero-Paid SDK Dependencies**: Works entirely via native client URI schemes without paid branch/app-indexing vendors.

### 21. 📷 Zero-Storage Client-Side QR Image Decoder
- **Hardware-Accelerated Scanning (`src/lib/qr-decoder.ts`)**: Uses the browser's native `BarcodeDetector` API and canvas pixel sampling to decode QR codes directly from image uploads and clipboard paste (`Ctrl+V`).
- **1-Click Shorten Decoded URL**: Allows instant re-shortening of any decoded QR destination.

### 22. ⏳ Customizable Branded 3-Second Redirect Interstitial Screen
- **Splash Announcement Screen (`src/components/RedirectSplashScreen.tsx`)**: Optional 3-second animated circular countdown screen with customizable announcement message, destination preview, and manual "Open Destination Now" override.

### 23. 🔀 Multi-Destination Link Rotator (Weighted & Round-Robin Pools)
- **Rotator Pools (`src/lib/ab-router.ts`)**: Extends A/B testing into a multi-URL traffic rotator (up to 6 destinations) with weighted random or deterministic round-robin (`clickCount % poolSize`) distribution.

### 24. ⭐ Link Favorites / Pinning & Color-Coded Tag Filters
- **Star / Pin to Top**: Pin priority links to the top of both the Admin Dashboard table and the Local Device Vault.
- **Interactive Tag Filtering**: One-click color-coded tag pills dynamically extracted across links for instantaneous category filtering.

### 25. 📊 Client-Side Peak Click Hours & Inline SVG Sparkline Charts
- **Peak Hours Aggregator (`src/lib/analytics-aggregator.ts`)**: Computes 24-hour visitor distribution, identifies peak operating hours, and generates RFC-4180 compliant CSV exports.
- **Zero-Dependency SVG Sparklines (`src/components/AnalyticsSparkCharts.tsx`)**: Interactive 7-day trend sparkline and 24-hour click distribution bar charts mounted in link intelligence modals.

### 26. 🔔 Zero-Cost Discord, Slack, and HTTP Webhook Click Alerts
- **Real-Time Click Pings (`src/lib/webhook-notifier.ts`)**: Fires non-blocking HTTP POST alerts with rich embeds to Discord webhooks, Slack incoming webhooks, or custom endpoints with a strict 3-second timeout.

### 27. 📲 Progressive Web App (PWA) & Offline Desktop Install
- **Installable Web App**: Configured with `public/manifest.json`, standalone display mode, high-res PWA icons, and fast app-like launching on desktop and mobile home screens.

### 28. ⌨️ Global Keyboard Shortcut Cheat-Sheet (`?` Key)
- **Power User Modal (`src/components/ShortcutsModal.tsx`)**: Press `?` from any screen to view all system shortcuts (`Cmd+K` command palette, `?` cheat-sheet, `Esc` dismiss, `/[alias]+` inspection).

### 29. 🧰 Public Zero-Cost Browser Tools Hub (`/tools`)
- **Dedicated Central Hub**: Public showcase of all GoMono client-side utilities (URL Shortener, QR Studio, CSV Grid, Bio Builder, Rotator, Decoder, Inspector).

### 30. 🚨 Branded 404 & Link-Not-Found Recovery Screen (`src/app/not-found.tsx`)
- **Polished Recovery Screen**: Diagnostics checklist for typos, expired links, or burned 1-time destinations with 1-click recovery actions to the shortener and tools hub.

---

## 🏛️ Architecture & Design Philosophy

```
                            ┌────────────────────────┐
                            │    Visitor Request     │
                            │      go.mono/...       │
                            └───────────┬────────────┘
                                        │
                         ┌──────────────▼─────────────┐
                         │  Next.js 16 Dynamic Route  │
                         │    (src/app/[alias])       │
                         └──────────────┬─────────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
        [Security Checks]      [Device Inspection]    [Atomic Telemetry]
        - Expiration date      - User-Agent parser    - Increment doc counter
        - Burn / max clicks    - iOS / Android route  - Log event to subcol
        - Password gate                 │                      │
                 │                      │                      │
                 └──────────────────────┼──────────────────────┘
                                        │
                            ┌───────────▼────────────┐
                            │   Instant Redirect     │
                            │  307 HTTP Redirect     │
                            └────────────────────────┘
```

1. **Zero-Storage Efficiency**: Everything that can be rendered dynamically (QR codes, SVGs, export payloads) is computed on the fly on the client to preserve database storage and eliminate hosting bills.
2. **High-Availability Fallbacks**: Click tracking operations are decoupled from redirection logic; if an analytics write suffers a network hiccup, the visitor's redirect is never blocked.
3. **Slim & Slick Aesthetic**: Inspired by the design standards of Linear and Raycast—focused input bars, ultra-thin borders (`border-zinc-800/80`), subtle ambient glow, and generous whitespace.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16.2](https://nextjs.org/) (App Router, Turbopack, Server Components) |
| **Frontend Runtime** | [React 19.2](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) |
| **Backend & Auth** | [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) & [Firebase Client SDK](https://firebase.google.com/docs/web/setup) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts & Data** | [Recharts](https://recharts.org/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Language & Tooling** | [TypeScript 5](https://www.typescriptlang.org/), [ESLint 9](https://eslint.org/) |

---

## 🚀 Getting Started

Follow these instructions to run your own local instance of GoMono.

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm** or **pnpm**
- A **Firebase Project** with Firestore and Authentication enabled

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/MonowarHusain/GoMono.git
cd GoMono
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Populate `.env.local` with your Firebase credentials:

```env
# ==========================================
# Firebase Client SDK (Public Web Config)
# ==========================================
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyYourApiKeyHere..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"

# ==========================================
# Firebase Admin SDK (Server-Side Secrets)
# ==========================================
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> [!TIP]
> GoMono includes built-in fallback mock values for static builds and development testing, so the application compiles cleanly even before credentials are bound.

---

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

### Step 5: Verify the Build

Run the automated QA suite to ensure zero type errors and zero linter warnings:

```bash
# Type-check without emitting files
npx tsc --noEmit

# Run strict ESLint verification
npm run lint

# Build production bundle with Turbopack
npm run build
```

---

## 📡 API Reference

### 1. Create Short Link (Single or Batch)
```http
POST /api/links
Content-Type: application/json
Authorization: Bearer <optional-firebase-token>
```

#### Request Body
```json
{
  "originalUrl": "https://example.com/long-page-url",
  "customAlias": "spring-sale",
  "domain": "to.mono.bro.bd",
  "deepLink": true,
  "splashMessage": "Welcome to our 2026 Spring Launch!",
  "webhookUrl": "https://discord.com/api/webhooks/123/abc",
  "burnAfterRead": false,
  "iosUrl": "https://apps.apple.com/app/id123456789",
  "androidUrl": "https://play.google.com/store/apps/details?id=com.example",
  "ogTitle": "Exclusive Spring Sale",
  "ogDescription": "Get up to 50% off all developer tools",
  "ogImage": "https://example.com/og-banner.png",
  "password": "secret-password",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "maxClicks": 100,
  "tags": ["marketing", "campaign"]
}
```

#### Response (`200 OK`)
```json
{
  "alias": "spring-sale",
  "shortUrl": "https://go.mono.bro.bd/spring-sale",
  "originalUrl": "https://example.com/long-page-url",
  "iosUrl": "https://apps.apple.com/app/id123456789",
  "androidUrl": "https://play.google.com/store/apps/details?id=com.example",
  "totalClicks": 0,
  "createdAt": "2026-10-31T15:00:00.000Z"
}
```

---

### 2. Fetch Link Intelligence & Telemetry
```http
GET /api/analytics?alias=spring-sale
Authorization: Bearer <optional-firebase-token>
```

#### Response (`200 OK`)
```json
{
  "alias": "spring-sale",
  "domain": "go.mono.bro.bd",
  "originalUrl": "https://example.com/long-page-url",
  "totalClicks": 142,
  "lastClickedAt": "2026-10-31T16:45:12.000Z",
  "devices": {
    "desktop": 85,
    "mobile": 52,
    "tablet": 5
  },
  "browsers": {
    "chrome": 90,
    "safari": 38,
    "firefox": 14
  },
  "os": {
    "macos": 60,
    "ios": 45,
    "windows": 25,
    "android": 12
  },
  "recentClicks": [
    {
      "id": "clk_98234",
      "timestamp": "2026-10-31T16:45:12.000Z",
      "device": "Mobile",
      "browser": "Safari",
      "os": "iOS",
      "targetUrl": "https://apps.apple.com/app/id123456789",
      "referer": "https://t.co"
    }
  ]
}
```

---

### 3. Batch URL Health Check
```http
POST /api/health-check
Content-Type: application/json
```

#### Request Body
```json
{
  "urls": [
    "https://github.com/MonowarHusain/GoMono",
    "https://example.com/broken-page"
  ]
}
```

#### Response (`200 OK`)
```json
{
  "total": 2,
  "results": [
    {
      "url": "https://github.com/MonowarHusain/GoMono",
      "status": 200,
      "ok": true,
      "statusText": "OK",
      "latencyMs": 85
    },
    {
      "url": "https://example.com/broken-page",
      "status": 404,
      "ok": false,
      "statusText": "Not Found",
      "latencyMs": 142
    }
  ]
}
```

---

### 4. Verify Link Passcode (Gated Links)
```http
POST /api/verify-password
Content-Type: application/json
```

#### Request Body
```json
{
  "alias": "protected-doc",
  "password": "user-entered-passcode"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "destinationUrl": "https://example.com/confidential-brief.pdf"
}
```

---

## 🚢 Deployment

### Deploy to Vercel

The fastest way to deploy GoMono to production is with the [Vercel Platform](https://vercel.com):

1. Push your code to your GitHub/GitLab repository.
2. Import the project into your Vercel Dashboard.
3. In **Project Settings** ➔ **Environment Variables**, add the Firebase credentials defined in `.env.local`.
4. Deploy! Next.js 16 automatically optimizes route handlers, static pages, and edge functions.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

---

<div align="center">

Crafted with precision by **Monowar Husain** & the GoMono Open-Source Contributors.

⭐ **Star GoMono on GitHub** if you find it helpful!

</div>
