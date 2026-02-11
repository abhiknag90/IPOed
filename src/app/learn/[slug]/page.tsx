"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  FileText,
  Lightbulb,
  GraduationCap,
  HelpCircle,
  BarChart,
  ArrowLeft,
  ArrowRight,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { getAllArticles, getArticleBySlug } from "@/lib/articles-data";

const iconMap: Record<string, LucideIcon> = {
  HelpCircle,
  FileText,
  BarChart,
  Lightbulb,
  GraduationCap,
  BookOpen,
};

interface ContentBlock {
  type: "paragraph" | "heading" | "ordered-list" | "unordered-list";
  text?: string;
  items?: string[];
}

function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const paragraphs = content.split("\n\n");

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");

    // Check if all lines are ordered list items (e.g., "1. Something")
    const allOrdered = lines.every((line) => /^\d+\.\s/.test(line.trim()));
    if (allOrdered && lines.length > 0) {
      blocks.push({
        type: "ordered-list",
        items: lines.map((line) => line.trim().replace(/^\d+\.\s/, "")),
      });
      continue;
    }

    // Check if all lines are unordered list items (e.g., "- Something")
    const allUnordered = lines.every((line) => line.trim().startsWith("- "));
    if (allUnordered && lines.length > 0) {
      blocks.push({
        type: "unordered-list",
        items: lines.map((line) => line.trim().replace(/^- /, "")),
      });
      continue;
    }

    // Mixed content: lines can be a heading followed by list items, or paragraphs
    // Check if first line is a heading (ends with ":") and remaining are list items
    if (lines.length > 1 && /[:\u2014]$/.test(lines[0].trim())) {
      const heading = lines[0].trim();
      const rest = lines.slice(1);

      const restOrdered = rest.every((line) => /^\d+\.\s/.test(line.trim()));
      const restUnordered = rest.every((line) => line.trim().startsWith("- "));

      if (restOrdered) {
        blocks.push({ type: "heading", text: heading });
        blocks.push({
          type: "ordered-list",
          items: rest.map((line) => line.trim().replace(/^\d+\.\s/, "")),
        });
        continue;
      }

      if (restUnordered) {
        blocks.push({ type: "heading", text: heading });
        blocks.push({
          type: "unordered-list",
          items: rest.map((line) => line.trim().replace(/^- /, "")),
        });
        continue;
      }
    }

    // Check if it's a single-line heading (ends with ":")
    if (lines.length === 1 && /[:\u2014]$/.test(trimmed)) {
      blocks.push({ type: "heading", text: trimmed });
      continue;
    }

    // Default: treat as paragraph
    blocks.push({ type: "paragraph", text: trimmed });
  }

  return blocks;
}

function RenderedContent({ content }: { content: string }) {
  const blocks = parseContent(content);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <motion.h2
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                className="text-xl font-semibold tracking-tight mt-8 mb-2 text-foreground"
              >
                {block.text}
              </motion.h2>
            );
          case "ordered-list":
            return (
              <motion.ol
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                className="list-decimal list-outside ml-6 space-y-2 text-muted-foreground leading-relaxed"
              >
                {block.items?.map((item, i) => (
                  <li key={i} className="pl-1">
                    {item}
                  </li>
                ))}
              </motion.ol>
            );
          case "unordered-list":
            return (
              <motion.ul
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                className="list-disc list-outside ml-6 space-y-2 text-muted-foreground leading-relaxed"
              >
                {block.items?.map((item, i) => (
                  <li key={i} className="pl-1">
                    {item}
                  </li>
                ))}
              </motion.ul>
            );
          case "paragraph":
          default:
            return (
              <motion.p
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                className="text-muted-foreground leading-relaxed whitespace-pre-line"
              >
                {block.text}
              </motion.p>
            );
        }
      })}
    </div>
  );
}

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === slug);
  const nextArticle = allArticles[(currentIndex + 1) % allArticles.length];

  const Icon = iconMap[article.icon] || HelpCircle;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back link */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learn
        </Link>

        {/* Article header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime} read
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {article.title}
          </h1>
        </motion.div>

        <Separator className="mb-8" />

        {/* Article content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="prose-spacing"
        >
          <RenderedContent content={article.content} />
        </motion.article>

        <Separator className="my-10" />

        {/* Next article */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Link
            href={`/learn/${nextArticle.slug}`}
            className="group flex items-center justify-between rounded-xl border p-5 transition-all hover:shadow-md hover:border-primary/30"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-1">Next Article</p>
              <p className="font-medium group-hover:text-primary transition-colors">
                {nextArticle.title}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
