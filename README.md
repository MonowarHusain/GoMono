# GoMono 🚀

**Premium Link Management & URL Shortener**

GoMono is a high-performance, self-hosted URL shortener built with Next.js and Firebase. Designed for speed, security, and advanced link routing, it offers "SaaS-tier" premium features like self-destructing links, password protection, and automated UTM parameter generation.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Admin-FFCA28?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

GoMono goes beyond basic URL shortening by offering advanced link control and security mechanisms:

* **Custom Routing:** Support for multiple custom domains (e.g., `to.mono.bro.bd` for personal, `go.mono.bro.bd` for tech).
* **🔥 Burn After Reading (Max Clicks):** Set a strict click limit. Once reached, the link self-destructs and redirects to a secure "Burned" page.
* **🔒 Password Protection:** Lock sensitive destination URLs behind a custom password.
* **⏳ Time-Based Expiration:** Automatically disable links after a specific date and time.
* **🏷️ Tagging System:** Organize and categorize links for easy dashboard management.
* **🔗 Built-in UTM Builder:** Automatically append Google Analytics UTM tracking parameters to destination URLs before shortening.
* **📱 QR Code Generation:** Instantly generate and download scannable QR codes for any short link.
* **📊 Click Analytics:** Track total clicks and engagement in real-time.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Database:** Firebase Firestore (via Firebase Admin SDK)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Hosting:** Vercel

## 🚀 Getting Started

Want to spin up your own instance of GoMono? Follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/link-monowar.git](https://github.com/your-username/link-monowar.git)
cd link-monowar

### 2. Install dependencies
```bash
npm install

### 3. Environment Variables
Create a `.env.local` file in the root directory. You will need to generate a Firebase Admin SDK private key from your Firebase Console.

```env
# Authentication (Comma-separated list of allowed admin emails)
NEXT_PUBLIC_ADMIN_EMAILS="your-email@gmail.com"

# Firebase Admin Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
# Note: Format the private key exactly as it appears, preserving the \n characters
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"

### 4. Run the development server
```bash
npm run dev
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Schema (Firestore)

GoMono uses a NoSQL architecture optimized for fast read/redirects.

**Collection:** `links`  
**Document ID:** `{alias}`

```typescript
{
  alias: string;           // e.g., "github"
  originalUrl: string;     // The target destination
  domain: string;          // The routing domain (e.g., "go.mono.bro.bd")
  createdAt: Timestamp;    // Server timestamp
  expiresAt: Timestamp | null;
  maxClicks: number | null; 
  totalClicks: number;
  isProtected: boolean;
  password: string | null; // Hashed/stored password
  tags: string[];          // e.g., ["social", "portfolio"]
}

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

I'm sorry for the headache—let me know if those buttons show up properly for you once you swap that line!
