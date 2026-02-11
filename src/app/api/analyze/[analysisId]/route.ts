import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/analysis-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;
    const analysis = await getAnalysis(analysisId);

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: analysis.id,
      status: analysis.status,
      fileName: analysis.fileName,
      fileSize: analysis.fileSize,
      market: analysis.market,
      documentType: analysis.documentType,
      results: analysis.results,
      error: analysis.error,
      totalPages: analysis.totalPages,
      totalChunks: analysis.totalChunks,
      completedChunks: analysis.completedChunks,
      currentStep: analysis.currentStep,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis status" },
      { status: 500 }
    );
  }
}
