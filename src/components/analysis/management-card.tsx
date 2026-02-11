"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ManagementData {
  experience: number;
  trackRecord: number;
  transparency: number;
  alignment: number;
  keyPeople: { name: string; role: string; experience: string }[];
  score: number;
}

export function ManagementCard({ management }: { management: ManagementData }) {
  const metrics = [
    { label: "Experience", value: management.experience },
    { label: "Track Record", value: management.trackRecord },
    { label: "Transparency", value: management.transparency },
    { label: "Alignment", value: management.alignment },
  ];

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Management Analysis
      </h2>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{metric.label}</span>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </motion.div>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium flex items-center gap-1.5 mb-3">
              <Award className="h-3.5 w-3.5 text-primary" />
              Key People
            </p>
            <div className="space-y-3">
              {(management.keyPeople || []).map((person, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-lg bg-muted/50 p-3"
                >
                  <p className="font-medium text-sm">{person.name}</p>
                  <p className="text-xs text-primary">{person.role}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{person.experience}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
