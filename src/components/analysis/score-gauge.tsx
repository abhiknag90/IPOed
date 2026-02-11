"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function ScoreGauge({ score, label }: { score: number; label: string }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 75) return { text: "text-emerald-500", bg: "bg-emerald-500", stroke: "#10b981" };
    if (s >= 50) return { text: "text-amber-500", bg: "bg-amber-500", stroke: "#f59e0b" };
    return { text: "text-red-500", bg: "bg-red-500", stroke: "#ef4444" };
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <Card className="mx-auto max-w-sm">
      <CardContent className="flex flex-col items-center pt-8 pb-6">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/30"
            />
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={color.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${color.text}`}>
              {animatedScore}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <p className="mt-4 font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Weak"} investment potential
        </p>
      </CardContent>
    </Card>
  );
}
