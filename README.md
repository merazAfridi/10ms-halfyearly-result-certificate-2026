# 10 Minute School — Result Certificate Generator

A full-stack web application that lets students generate, download, and share personalized result certificates. Students fill out a result submission form, upload their result card image, and instantly receive a shareable certificate. All submissions are saved to a database and displayed publicly in a Certificate Gallery.

---

## How It Works

```
Student fills form → Uploads result card photo → Certificate generated
       ↓                       ↓                        ↓
   Form Page (/form)     Cloudflare R2           Certificate Page (/certificate)
                       (image stored)            (view, download PDF/PNG)
                              ↓
                          Supabase DB
                       (submission saved)
                              ↓
                     Certificate Gallery (/gallery)
                     (all certificates listed)
```

### Step-by-Step Flow

1. **Home Page (`/`)** — Landing page with a "সার্টিফিকেট বানাও" (Make Certificate) button.
2. **Form Page (`/form`)** — Student fills in:
   - Name, School name, Class, Preparation type
   - Exam name, Total exam marks, Marks obtained, Class position
   - Uploads their result card photo (camera or gallery)
3. **Image Upload** — The photo is compressed client-side then uploaded directly to **Cloudflare R2** object storage using a pre-signed `PUT` URL. If the browser direct upload fails (CORS), a server-side fallback API route (`/api/upload-result-card`) handles it instead.
4. **Database Save** — After upload, the submission metadata (name, school, marks, position, R2 image URL) is saved to **Supabase PostgreSQL**.
5. **Certificate Page (`/certificate`)** — A beautiful styled certificate is rendered with the student's data, which can be downloaded as **PDF** or **PNG**.
6. **Gallery Page (`/gallery`)** — Displays all student submissions fetched from Supabase, searchable by name/school and filterable by class.
7. **Login (`/auth/callback`)** — Optional 10 Minute School SSO login via OAuth popup. When configured, student identity is attached to the submission.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI component library |
| **TypeScript** | Static typing |
| **Tailwind CSS v4** | Styling and design system |
| **TanStack Router** | File-based type-safe client routing |
| **TanStack Query** | Server state and data fetching |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |
| **html-to-image** | Certificate PNG export |
| **jsPDF** | Certificate PDF export |

### Backend / Server

| Technology | Purpose |
|---|---|
| **TanStack Start** | Full-stack SSR framework built on Vite |
| **Nitro** | Server engine (Node.js / Cloudflare Workers compatible) |
| **aws4fetch** | AWS Signature v4 for Cloudflare R2 API calls |
| **Server Functions** | RPC-style server functions (`createServerFn`) |

### Database

| Service | Purpose |
|---|---|
| **Supabase (PostgreSQL)** | Stores all result submission records — student name, school, marks, class, position, image URL |

### Storage

| Service | Purpose |
|---|---|
| **Cloudflare R2** | Stores uploaded result card images (`ks2026/result-cards/`) |

### Authentication

| Service | Purpose |
|---|---|
| **10 Minute School SSO** | Optional OAuth login via popup — attaches student identity to submission |

---

## Project Structure

```
src/
├── routes/
│   ├── index.tsx           # Home / landing page
│   ├── form.tsx            # Result submission form
│   ├── certificate.tsx     # Certificate view, PDF/PNG download
│   ├── gallery.tsx         # Public gallery of all certificates
│   ├── auth.callback.tsx   # OAuth callback (10MS SSO)
│   └── api/
│       └── upload-result-card.ts  # Server-side R2 upload fallback
├── components/
│   ├── Certificate.tsx     # Reusable styled certificate component
│   ├── SiteHeader.tsx      # Navigation bar with logo and login
│   └── Logo.tsx            # 10 Minute School logo
├── lib/
│   ├── r2.server.ts        # Cloudflare R2 config + presign + upload
│   ├── r2-upload.functions.ts  # TanStack server function for presigned URL
│   ├── tenms-auth.ts       # 10MS SSO login popup flow
│   ├── image-compress.ts   # Client-side image compression
│   └── utils.ts            # Tailwind class merge utility
└── integrations/
    └── supabase/
        ├── client.ts       # Supabase JS client initialization
        └── types.ts        # Generated database types
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `R2_ACCOUNT_ID` | ✅ Yes | Cloudflare Account ID (found in R2 overview) |
| `R2_ACCESS_KEY_ID` | ✅ Yes | R2 API Token Access Key |
| `R2_SECRET_ACCESS_KEY` | ✅ Yes | R2 API Token Secret Key |
| `R2_BUCKET` | ✅ Yes | Your R2 bucket name (e.g. `ks2026`) |
| `R2_PUBLIC_BASE_URL` | Optional | Public URL/CDN for serving images (e.g. `https://pub-xxx.r2.dev`) |
| `VITE_SUPABASE_URL` | Optional | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Optional | Supabase anonymous/public key |
| `VITE_TENMS_AUTH_URL` | Optional | 10 Minute School OAuth authorize URL |
| `VITE_TENMS_CLIENT_ID` | Optional | 10 Minute School OAuth client ID |

> **Note:** Without Supabase credentials, the gallery shows sample placeholder certificates and submissions are not persisted to the database.

---

## Getting Started

### Prerequisites
- Node.js >= 22.12.0
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Copy environment template and fill in credentials
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Production Build

```bash
npm run build
```

---

## Cloudflare R2 Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2 Object Storage**
2. Create a new bucket (e.g. `ks2026`)
3. Go to **Manage R2 API Tokens** → Create a token with **Edit** permissions
4. Copy the **Account ID**, **Access Key ID**, and **Secret Access Key** into `.env`
5. (Optional) Enable public access on the bucket and set `R2_PUBLIC_BASE_URL`
6. Add a **CORS policy** on the bucket to allow `PUT` requests from your domain:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Create a table called `result_submissions` with the following columns:

```sql
create table result_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  certificate_name text,
  school_name text,
  class_name text,
  preparation_type text,
  exam_name text,
  total_marks numeric,
  exam_total_marks numeric,
  class_position numeric,
  result_card_url text,
  student_phone text,
  student_email text,
  external_user_id text
);
```

3. Copy your **Project URL** and **anon/public key** from Settings → API into `.env`

---

## Deployment on Vercel

This project uses Nitro as its server engine, which supports Vercel deployment natively.

```bash
# Build
npm run build

# Deploy using Vercel CLI
npx vercel --prod
```

Set all environment variables from `.env` in your Vercel project settings under **Settings → Environment Variables**.
