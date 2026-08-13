# 10 Minute School — Kriti Shikkharthi 2026

Students submit their exam results and get a personalized certificate. All submissions are saved and shown in a public gallery.

---

## How It Works

1. Student fills out the form at `/form`
2. Their result card photo is uploaded to Cloudflare R2
3. Submission data is saved to Cloudflare D1
4. A certificate is generated at `/certificate` (downloadable as PDF or PNG)
5. All certificates are listed at `/gallery`

---

## Tech Stack

- **React 19 + TypeScript** — UI
- **TanStack Router + Start** — Routing and SSR
- **Tailwind CSS v4** — Styling
- **Cloudflare D1** — SQLite database for submissions
- **Cloudflare R2** — Image storage for result cards
- **html-to-image + jsPDF** — Certificate export

---

## Project Structure

```
src/
├── routes/
│   ├── index.tsx           # Home page
│   ├── form.tsx            # Result submission form
│   ├── certificate.tsx     # Certificate view and download
│   ├── gallery.tsx         # Public certificate gallery
│   └── api/
│       └── upload-result-card.ts  # Server-side R2 upload fallback
├── components/
│   ├── Certificate.tsx     # Certificate component
│   └── SiteHeader.tsx      # Top navigation
└── lib/
    ├── d1.server.ts        # D1 client
    ├── d1.functions.ts     # D1 server functions
    ├── r2.server.ts        # R2 upload logic
    └── tenms-auth.ts       # 10MS SSO
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `R2_ACCOUNT_ID` | ✅ | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | ✅ | R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | ✅ | R2 Secret Key |
| `R2_BUCKET` | ✅ | R2 bucket name |
| `R2_PUBLIC_BASE_URL` | Optional | CDN URL for images |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | Cloudflare Account ID |
| `CLOUDFLARE_D1_DATABASE_ID` | ✅ | D1 Database ID |
| `CLOUDFLARE_API_TOKEN` | Optional | For remote D1 access |
| `VITE_TENMS_AUTH_URL` | Optional | 10MS OAuth URL |
| `VITE_TENMS_CLIENT_ID` | Optional | 10MS OAuth Client ID |

---

## Getting Started

```bash
npm install
cp .env.example .env
npx wrangler d1 execute certificate_db --local --file=./schema.sql
npm run dev
```

App runs at **http://localhost:3000**

---

## D1 Setup

```bash
npx wrangler d1 create certificate_db
# Copy the ID into wrangler.json and .env
npx wrangler d1 execute certificate_db --remote --file=./schema.sql
```

---

## R2 Setup

1. Create a bucket in Cloudflare Dashboard (e.g. `ks2026`)
2. Create an R2 API token with Edit permissions
3. Add credentials to `.env`
4. Add a CORS policy to allow `PUT` requests from your domain:

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
