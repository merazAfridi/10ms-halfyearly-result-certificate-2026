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

