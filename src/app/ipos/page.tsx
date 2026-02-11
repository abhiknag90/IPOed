"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarket } from "@/lib/market-context";
import { IPOCard } from "@/components/ipo/ipo-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, Search } from "lucide-react";
import type { IPO } from "@/lib/db/schema";

function IPOCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <IPOCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function IPOsPage() {
  const { market, marketLabel } = useMarket();
  const [search, setSearch] = useState("");
  const [allIPOs, setAllIPOs] = useState<Partial<IPO>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (m: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ipos?market=${m}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch IPOs: ${res.status}`);
      }
      const data = await res.json();
      // Restore Date objects from JSON strings
      const ipos = (data.ipos as Partial<IPO>[]).map((ipo) => ({
        ...ipo,
        openDate: ipo.openDate ? new Date(ipo.openDate) : undefined,
        closeDate: ipo.closeDate ? new Date(ipo.closeDate) : undefined,
        listingDate: ipo.listingDate ? new Date(ipo.listingDate) : undefined,
      }));
      setAllIPOs(ipos);
    } catch (err) {
      console.error("Error fetching IPOs:", err);
      setError(err instanceof Error ? err.message : "Failed to load IPO data");
      setAllIPOs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(market);
  }, [market, fetchData]);

  const filteredIPOs = useMemo(() => {
    if (!search) return allIPOs;
    const q = search.toLowerCase();
    return allIPOs.filter(
      (ipo) =>
        ipo.name?.toLowerCase().includes(q) ||
        ipo.sector?.toLowerCase().includes(q)
    );
  }, [allIPOs, search]);

  const upcoming = filteredIPOs.filter((i) => i.status === "upcoming");
  const open = filteredIPOs.filter((i) => i.status === "open");
  const listed = filteredIPOs.filter((i) => i.status === "listed");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            IPO Calendar
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track upcoming, open, and recently listed IPOs in {marketLabel}
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            {error}. Showing cached data if available.
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
            <LoadingGrid />
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="upcoming" className="gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="open" className="gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Open ({open.length})
              </TabsTrigger>
              <TabsTrigger value="listed" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Listed ({listed.length})
              </TabsTrigger>
            </TabsList>

            {(["upcoming", "open", "listed"] as const).map((status) => {
              const items =
                status === "upcoming" ? upcoming : status === "open" ? open : listed;
              return (
                <TabsContent key={status} value={status}>
                  <AnimatePresence mode="wait">
                    {items.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-16 text-center"
                      >
                        <p className="text-muted-foreground">
                          No {status} IPOs found
                          {search ? ` matching "${search}"` : ""}.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {items.map((ipo, index) => (
                          <motion.div
                            key={ipo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <IPOCard ipo={ipo} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </motion.div>
    </div>
  );
}
