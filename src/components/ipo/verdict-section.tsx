"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import type { IPO } from "@/lib/db/schema";

function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse text-primary">|</span>
      )}
    </span>
  );
}

interface VerdictData {
  recommendation: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keyPoints?: string[];
}

function getRecommendationStyle(rec: string) {
  const r = rec.toLowerCase();
  if (r.includes("subscribe") && !r.includes("avoid")) {
    return {
      icon: ThumbsUp,
      color: "text-emerald-500",
      bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
      badgeClass:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
  }
  if (r.includes("avoid")) {
    return {
      icon: ThumbsDown,
      color: "text-red-500",
      bgClass: "bg-red-100 dark:bg-red-900/30",
      badgeClass:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  }
  return {
    icon: Minus,
    color: "text-amber-500",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };
}

export function VerdictSection({ ipo }: { ipo: Partial<IPO> }) {
  const [showVerdict, setShowVerdict] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const currencySymbol = ipo.market === "india" ? "\u20B9" : "$";
      let priceRange = "";
      if (ipo.priceMin && ipo.priceMax) {
        priceRange = `${currencySymbol}${ipo.priceMin} - ${currencySymbol}${ipo.priceMax}`;
      }

      const response = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipoName: ipo.name,
          market: ipo.market,
          exchange: ipo.exchange,
          sector: ipo.sector,
          priceRange,
          issueSize: ipo.issueSize,
          description: ipo.description,
          status: ipo.status,
          listingPrice: ipo.listingPrice
            ? `${currencySymbol}${ipo.listingPrice}`
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate verdict");
      }

      setVerdict(data);
      setShowVerdict(true);
    } catch (err) {
      console.error("Error generating verdict:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!showVerdict) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Verdict
          </h2>
          <Button onClick={handleGenerate} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Researching {ipo.name}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Verdict
              </>
            )}
          </Button>
        </div>
        {loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground text-center py-4"
          >
            Claude is analyzing {ipo.name}&apos;s financials, market position,
            and competitive landscape...
          </motion.p>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>
    );
  }

  if (!verdict) return null;

  const style = getRecommendationStyle(verdict.recommendation);
  const RecIcon = style.icon;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Verdict
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.bgClass}`}
              >
                <RecIcon className={`h-6 w-6 ${style.color}`} />
              </div>
              <div>
                <Badge className={`text-sm ${style.badgeClass}`}>
                  {verdict.recommendation}
                </Badge>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confidence Score: {verdict.score}/100
                </p>
              </div>
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <TypewriterText text={verdict.summary} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ThumbsUp className="h-4 w-4" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {verdict.strengths.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {s}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <ThumbsDown className="h-4 w-4" />
                Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {verdict.weaknesses.map((w, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {w}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {verdict.keyPoints && verdict.keyPoints.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Key Takeaways
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {verdict.keyPoints.map((point, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {point}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
