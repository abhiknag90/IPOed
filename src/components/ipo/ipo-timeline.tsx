"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { IPO } from "@/lib/db/schema";

interface TimelineStep {
  label: string;
  date: string | null;
  status: "completed" | "active" | "pending";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function IPOTimeline({ ipo }: { ipo: Partial<IPO> }) {
  const now = new Date();

  const getStatus = (
    date: Date | null | undefined,
    nextDate: Date | null | undefined
  ): "completed" | "active" | "pending" => {
    if (!date) return "pending";
    if (now >= date) {
      if (!nextDate || now >= nextDate) return "completed";
      return "active";
    }
    return "pending";
  };

  const openDate = ipo.openDate ? new Date(ipo.openDate) : null;
  const closeDate = ipo.closeDate ? new Date(ipo.closeDate) : null;
  const allotmentDate = ipo.allotmentDate ? new Date(ipo.allotmentDate) : null;
  const listingDate = ipo.listingDate ? new Date(ipo.listingDate) : null;

  const steps: TimelineStep[] = [
    {
      label: "Subscription Opens",
      date: openDate ? formatDate(openDate) : null,
      status: getStatus(openDate, closeDate),
    },
    {
      label: "Subscription Closes",
      date: closeDate ? formatDate(closeDate) : null,
      status: getStatus(closeDate, allotmentDate || listingDate),
    },
    {
      label: "Allotment",
      date: allotmentDate ? formatDate(allotmentDate) : null,
      status: allotmentDate
        ? now >= allotmentDate
          ? "completed"
          : "pending"
        : "pending",
    },
    {
      label: "Listing Day",
      date: listingDate ? formatDate(listingDate) : null,
      status: listingDate
        ? now >= listingDate
          ? "completed"
          : "pending"
        : "pending",
    },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">IPO Timeline</h2>
      <div className="relative">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="relative flex gap-4 pb-10 last:pb-0"
          >
            {/* Connecting line — starts below the icon and ends before the next icon */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-[11px] top-[28px] bottom-[12px] w-0.5 ${
                  step.status === "completed" ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            {/* Icon with background to create clean separation from line */}
            <div className="relative z-10 flex-shrink-0">
              <div className="bg-background rounded-full">
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : step.status === "active" ? (
                  <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
            </div>
            <div className="flex-1 pt-0.5">
              <p
                className={`font-medium ${
                  step.status === "pending" ? "text-muted-foreground" : ""
                }`}
              >
                {step.label}
              </p>
              {step.date ? (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {step.date}
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground/60">
                  TBD
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
