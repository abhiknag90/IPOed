"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface VerdictData {
  recommendation: string;
  summary: string;
  keyPoints: string[];
}

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

const recConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Strong Subscribe": { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  Subscribe: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  Neutral: { icon: MinusCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  Avoid: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  "Strong Avoid": { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
};

export function VerdictBanner({ verdict }: { verdict: VerdictData }) {
  const config = recConfig[verdict.recommendation] || recConfig.Neutral;
  const RecIcon = config.icon;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        AI Verdict
      </h2>

      <Card className="overflow-hidden">
        <div className={`${config.bg} px-6 py-4 flex items-center gap-3`}>
          <RecIcon className={`h-8 w-8 ${config.color}`} />
          <div>
            <Badge className={`text-base px-3 py-1 ${config.bg} ${config.color} border-none`}>
              {verdict.recommendation}
            </Badge>
          </div>
        </div>
        <CardContent className="pt-6 space-y-6">
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            <TypewriterText text={verdict.summary} />
          </div>

          <div>
            <p className="font-medium text-sm mb-3">Key Takeaways</p>
            <ul className="space-y-2">
              {(verdict.keyPoints || []).map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground/60 italic">
            Disclaimer: This analysis is AI-generated for educational purposes only and should not be considered financial advice. Always consult a qualified financial advisor before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
