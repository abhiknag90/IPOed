"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function StrengthsWeaknesses({
  strengths,
  weaknesses,
}: {
  strengths: string[];
  weaknesses: string[];
}) {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Key Findings</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ThumbsUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(strengths || []).map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ThumbsDown className="h-5 w-5" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(weaknesses || []).map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
