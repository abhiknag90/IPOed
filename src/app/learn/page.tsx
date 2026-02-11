"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Lightbulb,
  GraduationCap,
  HelpCircle,
  BarChart,
  type LucideIcon,
} from "lucide-react";
import { getAllArticles } from "@/lib/articles-data";

const iconMap: Record<string, LucideIcon> = {
  HelpCircle,
  FileText,
  BarChart,
  Lightbulb,
  GraduationCap,
  BookOpen,
};

const articles = getAllArticles();

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Learn About IPOs
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about investing in IPOs, from basics to advanced analysis techniques.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article, index) => {
            const Icon = iconMap[article.icon] || HelpCircle;
            return (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/learn/${article.slug}`}>
                  <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">{article.readTime} read</span>
                      </div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
