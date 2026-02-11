"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Percent, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FinancialData {
  revenue: number[];
  revenueYears: string[];
  profit: number[];
  profitYears: string[];
  debt: number;
  debtToEquity: number;
  revenueGrowth: number;
  profitMargin: number;
  score: number;
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const isValid = Number.isFinite(value) && value !== 0;

  useEffect(() => {
    if (!isValid) return;
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Number((value * eased).toFixed(1)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, isValid]);

  if (!isValid) return <span className="text-muted-foreground">N/A</span>;
  return <span>{prefix}{current}{suffix}</span>;
}

export function FinancialCharts({ data }: { data: FinancialData }) {
  const revenueData = (data.revenueYears || []).map((year, i) => ({
    year,
    revenue: (data.revenue || [])[i] || 0,
  }));

  const profitData = (data.profitYears || []).map((year, i) => ({
    year,
    profit: (data.profit || [])[i] || 0,
  }));

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        Financial Health
      </h2>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Revenue Growth", value: data.revenueGrowth, suffix: "%", icon: TrendingUp },
          { label: "Profit Margin", value: data.profitMargin, suffix: "%", icon: Percent },
          { label: "Total Debt", value: data.debt, prefix: "$", suffix: "M", icon: DollarSign },
          { label: "D/E Ratio", value: data.debtToEquity, suffix: "x", icon: Scale },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
                <p className="text-2xl font-bold">
                  <AnimatedNumber value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Trend (in Millions)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Revenue data not available in this document</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Trend (in Millions)</CardTitle>
          </CardHeader>
          <CardContent>
            {profitData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Profit data not available in this document</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
