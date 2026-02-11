"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IPOTimeline } from "@/components/ipo/ipo-timeline";
import { VerdictSection } from "@/components/ipo/verdict-section";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  TrendingUp,
  TrendingDown,
  Package,
} from "lucide-react";
import Link from "next/link";
import type { IPO } from "@/lib/db/schema";

export function IPODetailClient({
  ipo,
  market,
}: {
  ipo: Partial<IPO>;
  market: string;
}) {
  const currencySymbol = market === "india" ? "\u20B9" : "$";
  const listingGain =
    ipo.listingPrice && ipo.priceMax
      ? (
          ((parseFloat(ipo.listingPrice) - parseFloat(ipo.priceMax)) /
            parseFloat(ipo.priceMax)) *
          100
        ).toFixed(1)
      : null;

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    listed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/ipos"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to IPO Calendar
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{ipo.name}</h1>
              <Badge className={statusColors[ipo.status || "upcoming"]}>
                {ipo.status?.charAt(0).toUpperCase()}{ipo.status?.slice(1)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {ipo.exchange}
              </span>
              {ipo.sector && (
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {ipo.sector}
                </span>
              )}
            </div>
          </div>
          {listingGain && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
              {parseFloat(listingGain) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Listing Gain</p>
                <p
                  className={`text-lg font-bold ${
                    parseFloat(listingGain) >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {parseFloat(listingGain) >= 0 ? "+" : ""}
                  {listingGain}%
                </p>
              </div>
            </div>
          )}
        </div>

        {ipo.description && (
          <p className="mb-8 text-muted-foreground leading-relaxed">
            {ipo.description}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Price Band
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ipo.priceMin && ipo.priceMax ? (
                <p className="text-2xl font-bold">
                  {currencySymbol}{ipo.priceMin} - {currencySymbol}{ipo.priceMax}
                </p>
              ) : (
                <p className="text-2xl font-bold text-muted-foreground">TBD</p>
              )}
              {ipo.listingPrice && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Listed at {currencySymbol}{ipo.listingPrice}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Issue Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{ipo.issueSize || "TBD"}</p>
              {ipo.lotSize && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Lot size: {ipo.lotSize} shares
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ipo.openDate && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Opens:</span>{" "}
                  {new Date(ipo.openDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              {ipo.closeDate && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Closes:</span>{" "}
                  {new Date(ipo.closeDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              {ipo.allotmentDate && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Allotment:</span>{" "}
                  {new Date(ipo.allotmentDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              {ipo.listingDate && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Listed:</span>{" "}
                  {new Date(ipo.listingDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <IPOTimeline ipo={ipo} />

        <Separator className="my-8" />

        <VerdictSection ipo={ipo} />
      </motion.div>
    </div>
  );
}
