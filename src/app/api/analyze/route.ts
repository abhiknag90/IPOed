import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai-client";
import {
  ANALYSIS_PROMPT,
  CHUNK_ANALYSIS_PROMPT,
  MERGE_ANALYSIS_PROMPT,
} from "@/lib/ai-prompts";
import { setAnalysis, updateAnalysis } from "@/lib/analysis-store";
import { splitPDF, getPDFPageCount } from "@/lib/pdf-chunker";
import type { PDFChunk } from "@/lib/pdf-chunker";
import type { AnalysisResults } from "@/lib/analysis-types";
import { sanitizeResults } from "@/lib/analysis-types";

const MAX_PAGES = 1000;
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB locally
// Vercel serverless has 4.5MB request body limit — uploads over ~4.5MB fail with 413 before reaching our handler
const VERCEL_MAX_BODY = 10 * 1024 * 1024; // 10MB (note: Vercel platform rejects ~4.5MB+ at the edge)

/** Anthropic API rejects base64 with whitespace/newlines — ensure clean format */
function sanitizeBase64ForAPI(b64: string): string {
  return b64.replace(/\s/g, "");
}

const sampleResults: AnalysisResults = {
  companyName: "Sample Tech Corp",
  documentType: "DRHP",
  overallScore: 72,
  financialHealth: {
    revenue: [1200, 1580, 2100, 2800, 3500],
    revenueYears: ["FY2020", "FY2021", "FY2022", "FY2023", "FY2024"],
    profit: [120, 180, 250, 380, 520],
    profitYears: ["FY2020", "FY2021", "FY2022", "FY2023", "FY2024"],
    debt: 450,
    debtToEquity: 0.35,
    revenueGrowth: 25,
    profitMargin: 14.8,
    score: 78,
  },
  businessModel: {
    description:
      "Enterprise SaaS platform providing digital transformation solutions to Fortune 500 companies with a subscription-based revenue model.",
    revenueStreams: [
      { name: "Subscriptions", percentage: 65 },
      { name: "Professional Services", percentage: 20 },
      { name: "Licensing", percentage: 10 },
      { name: "Support", percentage: 5 },
    ],
    moat: "Deep enterprise integrations creating high switching costs, proprietary AI/ML models, and a network of certified implementation partners.",
    score: 75,
  },
  riskFactors: {
    market: 35,
    financial: 25,
    operational: 40,
    regulatory: 30,
    competitive: 55,
    keyRisks: [
      "High dependence on top 10 clients for 60% of revenue",
      "Increasing competition from global SaaS providers",
      "Regulatory changes in data privacy laws across markets",
      "Currency fluctuation risk with 40% international revenue",
      "Key person dependency on founding team",
    ],
  },
  management: {
    experience: 82,
    trackRecord: 75,
    transparency: 70,
    alignment: 68,
    keyPeople: [
      { name: "Rajesh Kumar", role: "CEO & Founder", experience: "20+ years in enterprise software, ex-VP at Infosys" },
      { name: "Priya Sharma", role: "CFO", experience: "15 years in financial leadership, ex-Goldman Sachs" },
      { name: "Amit Patel", role: "CTO", experience: "18 years in technology, built 3 successful platforms" },
    ],
    score: 74,
  },
  competitivePosition: {
    competitors: [
      { name: "TCS", marketShare: 25, valuation: 12000 },
      { name: "Infosys", marketShare: 20, valuation: 8000 },
      { name: "Wipro", marketShare: 15, valuation: 4000 },
      { name: "Sample Tech", marketShare: 5, valuation: 2000 },
    ],
    companyMarketShare: 5,
    differentiators: [
      "AI-first platform architecture",
      "Vertical-specific solutions",
      "Lower total cost of ownership",
    ],
    score: 65,
  },
  valuation: {
    peRatio: 35,
    industryPeAverage: 28,
    priceToBV: 4.2,
    assessment: "fair",
    peerComparison: [
      { name: "TCS", pe: 32 },
      { name: "Infosys", pe: 26 },
      { name: "Wipro", pe: 22 },
      { name: "HCLTech", pe: 24 },
    ],
    score: 62,
  },
  strengths: [
    "Strong revenue growth of 25% CAGR over 5 years",
    "Expanding profit margins with operational efficiency",
    "Diversified client base across industries",
    "Proprietary technology stack with AI capabilities",
    "Low debt-to-equity ratio of 0.35",
    "Experienced management team with industry pedigree",
  ],
  weaknesses: [
    "Premium valuation at 35x P/E vs industry average of 28x",
    "High client concentration in top 10 accounts",
    "Competitive pressure from larger IT services firms",
    "Limited brand recognition compared to established players",
    "Currency risk exposure on international revenues",
  ],
  verdict: {
    recommendation: "Subscribe",
    summary:
      "Sample Tech Corp presents a compelling investment opportunity driven by strong revenue growth, expanding margins, and a differentiated AI-first platform strategy. The company has demonstrated consistent execution over the past 5 years with a 25% revenue CAGR and improving profitability.\n\nWhile the valuation at 35x P/E carries a premium over industry peers, this is partly justified by the company's superior growth profile and technology differentiation. The low debt levels and healthy cash flows provide a margin of safety.\n\nInvestors should be mindful of client concentration risk and the competitive intensity in the IT services space. Overall, we recommend subscribing to this IPO for medium to long-term gains, though listing-day returns may be moderate given the premium pricing.",
    keyPoints: [
      "Strong 25% revenue CAGR with improving margins",
      "AI-first platform provides competitive differentiation",
      "Premium valuation of 35x P/E partially justified by growth",
      "Low leverage with debt-to-equity of 0.35",
      "Client concentration is the key risk to monitor",
    ],
  },
};

// Delay between chunk API calls to respect rate limits
// Text chunks are much smaller than PDF chunks, so we can use shorter delays
const CHUNK_DELAY_MS = 15_000; // 15 seconds between text chunks

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isRateLimit =
        error instanceof Error && error.message.includes("rate_limit");
      const is429 =
        error instanceof Error && error.message.includes("429");

      if ((isRateLimit || is429) && attempt < maxRetries) {
        // Exponential backoff: 60s, 120s, 240s
        const waitMs = 60_000 * Math.pow(2, attempt);
        console.log(
          `Rate limited (attempt ${attempt + 1}/${maxRetries + 1}). Waiting ${waitMs / 1000}s...`
        );
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

function parseJsonResponse(text: string): unknown {
  let jsonText = text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(jsonText);
}

// ==========================================
// Single-chunk analysis (≤100 pages)
// ==========================================

async function runSingleAnalysis(
  analysisId: string,
  base64Data: string,
  documentType: string
) {
  const client = getAnthropicClient();

  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 8000));
    await updateAnalysis(analysisId, { status: "completed", results: sampleResults });
    return;
  }

  await updateAnalysis(analysisId, { currentStep: "Analyzing document..." });

  if (!ANALYSIS_PROMPT) {
    throw new Error("ANALYSIS_PROMPT is undefined — check ai-prompts.ts exports");
  }
  const prompt = ANALYSIS_PROMPT.replace(/{documentType}/g, documentType || "DRHP");

  let response;
  try {
    response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Data,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });
  } catch (apiError) {
    const err = apiError as Error & { status?: number; error?: { message?: string } };
    const msg = err.message || err.error?.message || "";
    if (msg.includes("expected pattern") || msg.includes("base64") || msg.includes("invalid")) {
      throw new Error(
        "PDF format issue: The document could not be processed. Try re-saving the PDF or use a smaller file (max 10MB)."
      );
    }
    throw apiError;
  }

  const textContent = response!.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response received from Claude");
  }

  const rawResults = parseJsonResponse(textContent.text) as Record<string, unknown>;
  console.log(`[Analysis ${analysisId}] Raw single-analysis keys:`, Object.keys(rawResults));
  const fh = rawResults.financialHealth as Record<string, unknown> | undefined;
  if (fh) {
    console.log(`[Analysis ${analysisId}] financialHealth:`, JSON.stringify({
      revenueLen: Array.isArray(fh.revenue) ? fh.revenue.length : "missing",
      profitLen: Array.isArray(fh.profit) ? fh.profit.length : "missing",
      debt: fh.debt,
      revenueGrowth: fh.revenueGrowth,
    }));
  } else {
    console.log(`[Analysis ${analysisId}] WARNING: financialHealth is missing from AI response`);
  }
  const vl = rawResults.valuation as Record<string, unknown> | undefined;
  if (vl) {
    console.log(`[Analysis ${analysisId}] valuation:`, JSON.stringify({
      peRatio: vl.peRatio,
      industryPeAverage: vl.industryPeAverage,
      peerCount: Array.isArray(vl.peerComparison) ? vl.peerComparison.length : "missing",
    }));
  } else {
    console.log(`[Analysis ${analysisId}] WARNING: valuation is missing from AI response`);
  }
  const results = sanitizeResults(rawResults);
  await updateAnalysis(analysisId, { status: "completed", results });
}

// ==========================================
// Multi-chunk analysis (>100 pages)
// ==========================================

async function analyzeChunk(
  client: NonNullable<ReturnType<typeof getAnthropicClient>>,
  chunk: PDFChunk,
  documentType: string,
  totalPages: number
): Promise<string> {
  if (!CHUNK_ANALYSIS_PROMPT) {
    throw new Error("CHUNK_ANALYSIS_PROMPT is undefined — check ai-prompts.ts exports");
  }
  const prompt = CHUNK_ANALYSIS_PROMPT
    .replace(/{documentType}/g, documentType || "DRHP")
    .replace(/{startPage}/g, String(chunk.startPage))
    .replace(/{endPage}/g, String(chunk.endPage))
    .replace(/{totalPages}/g, String(totalPages))
    .replace(/{chunkIndex}/g, String(chunk.index + 1))
    .replace(/{totalChunks}/g, String(chunk.totalChunks));

  // Build message content: PDF document or extracted text
  const base64Data = chunk.base64Data
    ? sanitizeBase64ForAPI(chunk.base64Data)
    : undefined;
  const messageContent: Parameters<typeof client.messages.create>[0]["messages"][0]["content"] =
    base64Data
      ? [
          {
            type: "document" as const,
            source: {
              type: "base64" as const,
              media_type: "application/pdf" as const,
              data: base64Data,
            },
          },
          { type: "text" as const, text: prompt },
        ]
      : [
          {
            type: "text" as const,
            text: `${prompt}\n\n--- EXTRACTED DOCUMENT TEXT (pages ~${chunk.startPage}-${chunk.endPage}) ---\n\n${chunk.textContent}`,
          },
        ];

  console.log(
    `[Chunk ${chunk.index + 1}/${chunk.totalChunks}] Sending ${base64Data ? "PDF document" : `text (${((chunk.textContent?.length || 0) / 1000).toFixed(0)}K chars)`} to Claude`
  );

  const response = await callWithRetry(() =>
    client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      messages: [{ role: "user", content: messageContent }],
    })
  );

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error(`No response for chunk ${chunk.index + 1}`);
  }

  return textContent.text;
}

async function mergeChunkResults(
  client: NonNullable<ReturnType<typeof getAnthropicClient>>,
  chunkResults: string[],
  documentType: string,
  totalPages: number,
  totalChunks: number
): Promise<AnalysisResults> {
  const formattedResults = chunkResults
    .map((result, i) => `--- Chunk ${i + 1} of ${totalChunks} ---\n${result}`)
    .join("\n\n");

  if (!MERGE_ANALYSIS_PROMPT) {
    throw new Error("MERGE_ANALYSIS_PROMPT is undefined — check ai-prompts.ts exports");
  }
  const prompt = MERGE_ANALYSIS_PROMPT
    .replace(/{documentType}/g, documentType || "DRHP")
    .replace(/{totalPages}/g, String(totalPages))
    .replace(/{totalChunks}/g, String(totalChunks))
    .replace(/{chunkResults}/g, formattedResults);

  const response = await callWithRetry(() =>
    client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 16384,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
    })
  );

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No response from merge step");
  }

  const rawResults = parseJsonResponse(textContent.text) as Record<string, unknown>;
  console.log(`[Merge] Raw merge keys:`, Object.keys(rawResults));
  const fh = rawResults.financialHealth as Record<string, unknown> | undefined;
  if (fh) {
    console.log(`[Merge] financialHealth:`, JSON.stringify({
      revenueLen: Array.isArray(fh.revenue) ? fh.revenue.length : "missing",
      profitLen: Array.isArray(fh.profit) ? fh.profit.length : "missing",
      debt: fh.debt,
    }));
  } else {
    console.log(`[Merge] WARNING: financialHealth missing from merge response`);
  }
  return sanitizeResults(rawResults);
}

async function runChunkedAnalysis(
  analysisId: string,
  chunks: PDFChunk[],
  documentType: string,
  totalPages: number
) {
  const client = getAnthropicClient();

  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 8000));
    await updateAnalysis(analysisId, { status: "completed", results: sampleResults });
    return;
  }

  const totalChunks = chunks.length;
  await updateAnalysis(analysisId, {
    totalChunks,
    completedChunks: 0,
    currentStep: `Analyzing chunk 1 of ${totalChunks} (pages ${chunks[0].startPage}-${chunks[0].endPage})...`,
  });

  // Process chunks sequentially with delays to respect rate limits
  const chunkResults: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Wait between chunks to stay under the rate limit (30k tokens/min)
    if (i > 0) {
      const waitSec = Math.ceil(CHUNK_DELAY_MS / 1000);
      await updateAnalysis(analysisId, {
        currentStep: `Waiting ${waitSec}s for rate limit before chunk ${i + 1}...`,
      });
      await sleep(CHUNK_DELAY_MS);
    }

    await updateAnalysis(analysisId, {
      completedChunks: i,
      currentStep: `Analyzing section ${i + 1} of ${totalChunks} (pages ${chunk.startPage}-${chunk.endPage})...`,
    });

    try {
      const result = await analyzeChunk(client, chunk, documentType, totalPages);
      chunkResults.push(result);
    } catch (error) {
      console.error(`Chunk ${i + 1} failed:`, error);
      chunkResults.push(
        JSON.stringify({ chunkInfo: `pages ${chunk.startPage}-${chunk.endPage}`, error: "Analysis of this section failed" })
      );
    }

    await updateAnalysis(analysisId, { completedChunks: i + 1 });
  }

  // Wait before merge step to respect rate limits
  await updateAnalysis(analysisId, {
    currentStep: "Waiting before final synthesis...",
  });
  await sleep(CHUNK_DELAY_MS);

  // Merge all chunk results
  await updateAnalysis(analysisId, {
    currentStep: "Synthesizing results from all sections...",
  });

  const results = await mergeChunkResults(
    client,
    chunkResults,
    documentType,
    totalPages,
    totalChunks
  );

  await updateAnalysis(analysisId, { status: "completed", results });
}

// ==========================================
// Main analysis orchestrator
// ==========================================

async function runAnalysis(
  analysisId: string,
  pdfBytes: Uint8Array,
  documentType: string
) {
  try {
    // Ensure documentType is defined
    const docType = documentType || "DRHP";

    console.log(`[Analysis ${analysisId}] Starting. documentType="${docType}", pdfBytes.length=${pdfBytes.length}`);

    const chunks = await splitPDF(pdfBytes);
    const totalPages = chunks.reduce(
      (sum, c) => Math.max(sum, c.endPage),
      0
    );

    console.log(`[Analysis ${analysisId}] PDF split into ${chunks.length} chunks, ${totalPages} total pages`);

    await updateAnalysis(analysisId, {
      totalPages,
      totalChunks: chunks.length,
    });

    if (chunks.length === 1 && chunks[0].base64Data) {
      await runSingleAnalysis(
        analysisId,
        sanitizeBase64ForAPI(chunks[0].base64Data),
        docType
      );
    } else {
      await runChunkedAnalysis(analysisId, chunks, docType, totalPages);
    }
  } catch (error) {
    console.error("Analysis error:", error);
    let errorMessage = "Analysis failed";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Stack:", error.stack);
    }
    await updateAnalysis(analysisId, {
      status: "failed",
      error: errorMessage,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let pdfBytes: Uint8Array;
    let fileName: string;
    let fileSize: number;
    let market: string;
    let documentType: string;

    if (contentType.includes("application/json")) {
      // Blob URL flow (for large files on Vercel)
      const body = await request.json();
      const { blobUrl } = body;
      if (!blobUrl || typeof blobUrl !== "string") {
        return NextResponse.json(
          { error: "Missing blobUrl. Upload the file first." },
          { status: 400 }
        );
      }
      market = body.market || "india";
      documentType = body.documentType || (market === "india" ? "drhp" : "s1");
      fileName = body.fileName || "document.pdf";
      fileSize = body.fileSize || 0;

      const res = await fetch(blobUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to fetch uploaded file from blob storage" },
          { status: 400 }
        );
      }
      const arrayBuffer = await res.arrayBuffer();
      pdfBytes = new Uint8Array(arrayBuffer);
    } else {
      // FormData flow (direct file upload)
      const formData = await request.formData();
      const file = formData.get("file") as File;
      market = (formData.get("market") as string) || "india";
      documentType =
        (formData.get("documentType") as string) ||
        (market === "india" ? "drhp" : "s1");

      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }

      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF files are accepted" },
          { status: 400 }
        );
      }

      const bodyLimit = process.env.VERCEL ? VERCEL_MAX_BODY : MAX_FILE_SIZE;
      const bodyLimitMB = process.env.VERCEL ? 10 : 200;
      if (file.size > bodyLimit) {
        return NextResponse.json(
          {
            error:
              process.env.VERCEL && file.size > VERCEL_MAX_BODY
                ? `File too large for direct upload. Use a file under ${bodyLimitMB}MB or ensure Vercel Blob is configured for larger uploads.`
                : `File size must be under ${bodyLimitMB}MB`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      pdfBytes = new Uint8Array(arrayBuffer);
      fileName = file.name;
      fileSize = file.size;
    }

    // Check page count before proceeding
    const pageCount = await getPDFPageCount(pdfBytes);
    if (pageCount > MAX_PAGES) {
      return NextResponse.json(
        { error: `This PDF has ${pageCount} pages. Maximum supported is ${MAX_PAGES} pages.` },
        { status: 400 }
      );
    }

    const analysisId = crypto.randomUUID();

    await setAnalysis(analysisId, {
      id: analysisId,
      status: "processing",
      fileName,
      fileSize,
      market,
      documentType,
      results: null,
      error: null,
      createdAt: Date.now(),
      totalPages: pageCount,
      totalChunks: Math.ceil(pageCount / 95),
      completedChunks: 0,
      currentStep: "Preparing document...",
    });

    // Fire and forget
    runAnalysis(analysisId, pdfBytes, documentType);

    return NextResponse.json({
      analysisId,
      status: "processing",
      fileName,
      fileSize,
      market,
      documentType,
      totalPages: pageCount,
    });
  } catch (error) {
    console.error("Analysis upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
