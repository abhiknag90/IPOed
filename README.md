# IPO'ed — IPO Intelligence Platform

AI-powered IPO analysis for India and US markets. Track IPOs, analyze DRHP/S-1 documents, and get AI verdicts.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### 1. Push to GitHub

Ensure your project is in a Git repository and pushed to GitHub.

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Vercel will auto-detect Next.js. Click **Deploy**.

### 3. Configure Environment Variables

In your Vercel project: **Settings → Environment Variables**. Add:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | Claude API key for document analysis & verdicts |
| `BLOB_READ_WRITE_TOKEN` | For 4–10MB uploads | Vercel Blob token. Create a Blob store in Vercel Storage to enable 10MB PDF uploads (bypasses 4.5MB limit) |
| `UPSTASH_REDIS_REST_URL` | **Yes on Vercel** | Upstash Redis URL. Required for document analysis to work across serverless instances (fixes 404 during processing) |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes on Vercel** | Upstash Redis token. Create a KV store in Vercel Storage or at [upstash.com](https://upstash.com) |
| `FINNHUB_API_KEY` | No | US IPO data (Finnhub). Without it, sample data is used |
| `IPOALERTS_API_KEY` | No | Indian IPO data. Without it, sample data is used |
| `DATABASE_URL` | No | Neon Postgres (for future persistence features) |

**Minimum for full AI features:** Set `ANTHROPIC_API_KEY`.

**For 10MB PDFs:** Create a Vercel Blob store (Project → Storage → Blob). This adds `BLOB_READ_WRITE_TOKEN` and enables uploads up to 10MB.

### 4. Redeploy

After adding env vars, redeploy from the Vercel dashboard.

---

**Note:** Document analysis runs asynchronously. For large PDFs (>100 pages), processing can take several minutes. On Vercel Hobby, functions timeout at 10s; on Pro, up to 60s. Small documents (≤100 pages) typically complete within limits. For very large documents, consider Vercel Pro or a long-running worker.
