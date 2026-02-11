"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { AnalysisResults } from "@/lib/analysis-types";
import { analysisSteps } from "@/lib/analysis-types";
import { AnalysisProgress } from "@/components/analysis/analysis-progress";
import { ScoreGauge } from "@/components/analysis/score-gauge";
import { FinancialCharts } from "@/components/analysis/financial-charts";
import { RiskRadar } from "@/components/analysis/risk-radar";
import { ManagementCard } from "@/components/analysis/management-card";
import { ValuationGauge } from "@/components/analysis/valuation-gauge";
import { StrengthsWeaknesses } from "@/components/analysis/strengths-weaknesses";
import { VerdictBanner } from "@/components/analysis/verdict-banner";
import { Separator } from "@/components/ui/separator";

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = use(params);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [totalChunks, setTotalChunks] = useState<number | undefined>();
  const [completedChunks, setCompletedChunks] = useState<number | undefined>();
  const [currentStepLabel, setCurrentStepLabel] = useState<string | undefined>();
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleComplete = useCallback((analysisResults: AnalysisResults) => {
    // Jump to last step, then show results
    setCurrentStep(analysisSteps.length - 1);
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults(analysisResults);
    }, 1000);
  }, []);

  // Step animation - advance steps every 2 seconds during analysis
  useEffect(() => {
    const totalSteps = analysisSteps.length;

    stepIntervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        // Don't go past the second-to-last step while still analyzing
        // The final step will be set when results come in
        if (prev >= totalSteps - 2) {
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, []);

  // Poll the API for results
  useEffect(() => {
    const pollAnalysis = async () => {
      try {
        const response = await fetch(`/api/analyze/${analysisId}`);
        if (!response.ok) {
          // Analysis not found yet or server error - keep polling
          if (response.status === 404) return;
          throw new Error("Failed to fetch analysis status");
        }

        const data = await response.json();

        // Update chunk progress
        if (data.totalPages) setTotalPages(data.totalPages);
        if (data.totalChunks) setTotalChunks(data.totalChunks);
        if (data.completedChunks !== undefined) setCompletedChunks(data.completedChunks);
        if (data.currentStep) setCurrentStepLabel(data.currentStep);

        if (data.status === "completed" && data.results) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          handleComplete(data.results);
        } else if (data.status === "failed") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setError(data.error || "Analysis failed");
          setIsAnalyzing(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Start polling every 2 seconds
    pollIntervalRef.current = setInterval(pollAnalysis, 2000);
    // Also poll immediately
    pollAnalysis();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [analysisId, handleComplete]);

  if (isAnalyzing) {
    return (
      <AnalysisProgress
        currentStep={currentStep}
        totalPages={totalPages}
        totalChunks={totalChunks}
        completedChunks={completedChunks}
        currentStepLabel={currentStepLabel}
      />
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Analysis Failed</h1>
        <p className="mt-4 text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {results.companyName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {results.documentType} Analysis Report
          </p>
        </div>

        <div className="mb-12">
          <ScoreGauge score={results.overallScore} label="Overall IPO Score" />
        </div>

        <Separator className="my-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <FinancialCharts data={results.financialHealth} />
        </motion.div>

        <Separator className="my-10" />

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <RiskRadar risks={results.riskFactors} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ManagementCard management={results.management} />
          </motion.div>
        </div>

        <Separator className="my-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ValuationGauge valuation={results.valuation} />
        </motion.div>

        <Separator className="my-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <StrengthsWeaknesses
            strengths={results.strengths}
            weaknesses={results.weaknesses}
          />
        </motion.div>

        <Separator className="my-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <VerdictBanner verdict={results.verdict} />
        </motion.div>
      </motion.div>
    </div>
  );
}
