"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ValuationData {
  peRatio: number;
  industryPeAverage: number;
  priceToBV: number;
  assessment: "undervalued" | "fair" | "overvalued" | "expensive";
  peerComparison: { name: string; pe: number }[];
  score: number;
}

const assessmentStyles: Record<string, { color: string; label: string }> = {
  undervalued: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Undervalued" },
  fair: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Fairly Valued" },
  overvalued: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", label: "Overvalued" },
  expensive: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Expensive" },
};

function formatNum(v: number, suffix = "x"): string {
  if (!v || !Number.isFinite(v)) return "N/A";
  return `${v}${suffix}`;
}

export function ValuationGauge({ valuation }: { valuation: ValuationData }) {
  const normalizedAssessment = (valuation.assessment || "fair").toString().toLowerCase().replace(/\s+/g, "").replace("fairlyvalued", "fair");
  const assessment = assessmentStyles[normalizedAssessment] || assessmentStyles["fair"];
  const peerData = (valuation.peerComparison || []).map((peer) => ({
    name: peer.name,
    pe: peer.pe,
  }));

  const hasPeData = valuation.peRatio > 0 && valuation.industryPeAverage > 0;
  const gaugePosition = hasPeData
    ? Math.min((valuation.peRatio / (valuation.industryPeAverage * 2)) * 100, 95)
    : 50;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        Valuation Assessment
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-3xl font-bold">{formatNum(valuation.peRatio)}</p>
              </div>
              <Badge className={assessment.color}>{assessment.label}</Badge>
            </div>

            <div className="space-y-4">
              <div className="relative h-4 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500">
                <motion.div
                  initial={{ left: "0%" }}
                  animate={{ left: `${gaugePosition}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                >
                  <div className="h-6 w-6 rounded-full border-2 border-white bg-foreground shadow-lg" />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Undervalued</span>
                <span>Fair</span>
                <span>Expensive</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Industry Avg P/E</p>
                <p className="text-lg font-bold">{formatNum(valuation.industryPeAverage)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Price/Book</p>
                <p className="text-lg font-bold">{formatNum(valuation.priceToBV)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {peerData.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">P/E Peer Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peerData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                      }}
                    />
                    {valuation.industryPeAverage > 0 && (
                      <ReferenceLine x={valuation.industryPeAverage} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: "Avg", fontSize: 10 }} />
                    )}
                    <Bar dataKey="pe" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">P/E Peer Comparison</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">Peer comparison data not available in this document</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
