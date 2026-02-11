"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analysisSteps, funFacts } from "@/lib/analysis-types";
import { CheckCircle2, Loader2, Circle, Upload, FileText, BarChart3, Briefcase, Shield, Users, Calculator, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const iconMap: Record<string, React.ElementType> = {
  upload: Upload,
  "file-text": FileText,
  "bar-chart": BarChart3,
  briefcase: Briefcase,
  shield: Shield,
  users: Users,
  calculator: Calculator,
  brain: Brain,
};

interface AnalysisProgressProps {
  currentStep: number;
  totalPages?: number;
  totalChunks?: number;
  completedChunks?: number;
  currentStepLabel?: string;
}

export function AnalysisProgress({
  currentStep,
  totalPages,
  totalChunks,
  completedChunks,
  currentStepLabel,
}: AnalysisProgressProps) {
  const [factIndex, setFactIndex] = useState(0);

  const isChunked = totalChunks && totalChunks > 1;
  const chunkProgress = isChunked
    ? ((completedChunks || 0) / (totalChunks + 1)) * 100 // +1 for the merge step
    : ((currentStep + 1) / analysisSteps.length) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Brain className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold">Analyzing Your Document</h1>
        <p className="mt-2 text-muted-foreground">
          {isChunked
            ? `Analyzing ${totalPages} pages in ${totalChunks} sections...`
            : "Our AI is reading through your document and extracting insights..."}
        </p>
      </motion.div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <Progress value={chunkProgress} className="mb-4 h-2" />

          {isChunked ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completedChunks || 0} of {totalChunks} sections complete
                </span>
              </div>

              {currentStepLabel && (
                <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-3 py-2">
                  <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                  <span className="text-sm font-medium">{currentStepLabel}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: totalChunks }).map((_, i) => {
                  const isComplete = (completedChunks || 0) > i;
                  const isActive = (completedChunks || 0) === i;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                        isComplete
                          ? "bg-primary/10 text-primary"
                          : isActive
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      Section {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {analysisSteps.map((step, index) => {
                const Icon = iconMap[step.icon] || Circle;
                const status = index < currentStep ? "completed" : index === currentStep ? "active" : "pending";

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      status === "active" ? "bg-primary/5" : ""
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : status === "active" ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
                    )}
                    <Icon className={`h-4 w-4 flex-shrink-0 ${
                      status === "completed" ? "text-primary" :
                      status === "active" ? "text-primary" :
                      "text-muted-foreground/40"
                    }`} />
                    <span className={`text-sm ${
                      status === "pending" ? "text-muted-foreground/50" :
                      status === "active" ? "font-medium" : ""
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-xs font-medium text-primary mb-2">Did you know?</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted-foreground"
            >
              {funFacts[factIndex]}
            </motion.p>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
