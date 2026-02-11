import { NextRequest, NextResponse } from "next/server";
import { fetchIPOs, fetchIPOsByStatus } from "@/lib/ipo-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const market = (searchParams.get("market") || "india") as "india" | "us";
  const status = searchParams.get("status") as "upcoming" | "open" | "listed" | null;

  try {
    const ipos = status
      ? await fetchIPOsByStatus(market, status)
      : await fetchIPOs(market);

    return NextResponse.json({ ipos, market, total: ipos.length });
  } catch (error) {
    console.error("IPO data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch IPO data" },
      { status: 500 }
    );
  }
}
