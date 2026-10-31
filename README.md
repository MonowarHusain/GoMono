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
  "domain": "go.mono.bro.bd",
  "iosUrl": "https://apps.apple.com/app/id123456789",
  "androidUrl": "https://play.google.com/store/apps/details?id=com.example",
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
