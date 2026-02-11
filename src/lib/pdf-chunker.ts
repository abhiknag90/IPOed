import { PDFDocument } from "pdf-lib";

const PAGES_PER_CHUNK = 15; // Very dense PDFs (tables, images) can exceed 6K tokens/page; 15 pages keeps under 200K

export interface PDFChunk {
  index: number;
  totalChunks: number;
  startPage: number;
  endPage: number;
  /** Base64-encoded PDF — always set (we use PDF splitting, not text extraction) */
  base64Data?: string;
  /** Extracted text — no longer used; kept for type compatibility */
  textContent?: string;
}

/**
 * Get the page count of a PDF without splitting it.
 */
export async function getPDFPageCount(pdfBytes: Uint8Array): Promise<number> {
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  return pdf.getPageCount();
}

/**
 * Split a PDF into page-based chunks using pdf-lib.
 * Each chunk is a valid PDF that Claude can read directly (no text extraction).
 */
async function createPdfChunks(
  sourcePdf: PDFDocument,
  totalPages: number
): Promise<PDFChunk[]> {
  const chunks: PDFChunk[] = [];
  let startPage = 1;

  while (startPage <= totalPages) {
    const endPage = Math.min(startPage + PAGES_PER_CHUNK - 1, totalPages);
    // pdf-lib uses 0-based page indices
    const pageIndices = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage - 1 + i
    );

    const chunkPdf = await PDFDocument.create();
    const copiedPages = await chunkPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => chunkPdf.addPage(page));

    const chunkBytes = await chunkPdf.save();
    const base64Data = Buffer.from(chunkBytes).toString("base64");

    chunks.push({
      index: chunks.length,
      totalChunks: 0, // Set below
      startPage,
      endPage,
      base64Data,
    });

    startPage = endPage + 1;
  }

  for (const chunk of chunks) {
    chunk.totalChunks = chunks.length;
  }

  return chunks;
}

/**
 * Process a PDF for analysis.
 * - ≤25 pages: return the whole PDF as a single base64 chunk (Claude reads it directly)
 * - >25 pages: split into page-based PDF chunks (dense PDFs can exceed 200K tokens otherwise)
 */
export async function splitPDF(pdfBytes: Uint8Array): Promise<PDFChunk[]> {
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  if (totalPages <= 25) {
    const base64Data = Buffer.from(pdfBytes).toString("base64");
    return [
      {
        index: 0,
        totalChunks: 1,
        startPage: 1,
        endPage: totalPages,
        base64Data,
      },
    ];
  }

  // For >100 pages, split into PDF chunks (no pdf-parse / text extraction)
  console.log(
    `[PDF Chunker] Splitting ${totalPages}-page PDF into page-based chunks...`
  );
  const chunks = await createPdfChunks(sourcePdf, totalPages);
  console.log(
    `[PDF Chunker] Created ${chunks.length} PDF chunks (${PAGES_PER_CHUNK} pages each)`
  );

  return chunks;
}
