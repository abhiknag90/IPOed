"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface RiskData {
  market: number;
  financial: number;
  operational: number;
  regulatory: number;
  competitive: number;
  keyRisks: string[];
}

export function RiskRadar({ risks }: { risks: RiskData }) {
  const radarData = [
    { subject: "Market", value: risks.market },
    { subject: "Financial", value: risks.financial },
    { subject: "Operational", value: risks.operational },
    { subject: "Regulatory", value: risks.regulatory },
    { subject: "Competitive", value: risks.competitive },
  ];

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Risk Assessment
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="hsl(var(--chart-5))"
                  fill="hsl(var(--chart-5))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Key Risks
            </p>
            <ul className="space-y-1.5">
              {(risks.keyRisks || []).map((risk, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {risk}
                </motion.li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
