import type { AnalysisResults } from "./analysis-types";

export interface AnalysisEntry {
  id: string;
  status: "processing" | "completed" | "failed";
  fileName: string;
  fileSize: number;
  market: string;
  documentType: string;
  results: AnalysisResults | null;
  error: string | null;
  createdAt: number;
  totalPages?: number;
  totalChunks?: number;
  completedChunks?: number;
  currentStep?: string;
}

// Use globalThis to ensure the store survives hot reloads and is shared across route handlers
const globalStore = globalThis as unknown as { __analysisStore?: Map<string, AnalysisEntry> };
if (!globalStore.__analysisStore) {
  globalStore.__analysisStore = new Map<string, AnalysisEntry>();
}
const store = globalStore.__analysisStore;

export function getAnalysis(id: string): AnalysisEntry | undefined {
  return store.get(id);
}

export function setAnalysis(id: string, entry: AnalysisEntry): void {
  store.set(id, entry);
}

export function updateAnalysis(id: string, update: Partial<AnalysisEntry>): void {
  const existing = store.get(id);
  if (existing) {
    store.set(id, { ...existing, ...update });
  }
}
