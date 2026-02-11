"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { IPO } from "@/lib/db/schema";

const statusStyles: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  listed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export function IPOCard({ ipo }: { ipo: Partial<IPO> }) {
  const currencySymbol = ipo.market === "india" ? "\u20B9" : "$";
  const listingGain =
    ipo.listingPrice && ipo.priceMax
      ? ((parseFloat(ipo.listingPrice) - parseFloat(ipo.priceMax)) /
          parseFloat(ipo.priceMax)) *
        100
      : null;

  return (
    <Link href={`/ipos/${ipo.market}/${ipo.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {ipo.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ipo.exchange} &middot; {ipo.sector}
              </p>
            </div>
            <Badge className={statusStyles[ipo.status || "upcoming"]} variant="secondary">
              {ipo.status?.charAt(0).toUpperCase()}{ipo.status?.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Price Band</p>
              <p className="font-medium">
                {currencySymbol}{ipo.priceMin} - {currencySymbol}{ipo.priceMax}
              </p>
            </div>
            {ipo.issueSize && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Issue Size</p>
                <p className="font-medium">{ipo.issueSize}</p>
              </div>
            )}
          </div>

          {listingGain !== null && (
            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5">
              {listingGain >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  listingGain >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {listingGain >= 0 ? "+" : ""}
                {listingGain.toFixed(1)}% listing
              </span>
            </div>
          )}

          {ipo.openDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {ipo.status === "listed" ? "Listed" : "Opens"}{" "}
              {new Date(ipo.openDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}

          <div className="flex items-center justify-end text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View Details <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
