import { notFound } from "next/navigation";
import { fetchIPOBySlug } from "@/lib/ipo-service";
import { IPODetailClient } from "./ipo-detail-client";

export default async function IPODetailPage({
  params,
}: {
  params: Promise<{ market: string; slug: string }>;
}) {
  const { market, slug } = await params;
  const ipo = await fetchIPOBySlug(market as "india" | "us", slug);

  if (!ipo) {
    notFound();
  }

  return <IPODetailClient ipo={ipo} market={market} />;
}
