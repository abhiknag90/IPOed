"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarket } from "@/lib/market-context";
import { getFeaturedIPOs } from "@/lib/ipo-data";
import { IPOCard } from "@/components/ipo/ipo-card";
import {
  ArrowRight,
  BarChart3,
  FileSearch,
  TrendingUp,
  Brain,
  Shield,
  Globe,
  Sparkles,
  Zap,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "IPO Calendar",
    description: "Track upcoming, open, and recently listed IPOs across India and US markets in real-time.",
    href: "/ipos",
  },
  {
    icon: FileSearch,
    title: "AI Document Analysis",
    description: "Upload DRHP or S-1 filings and get instant AI-powered analysis with scores and charts.",
    href: "/analyze",
  },
  {
    icon: Brain,
    title: "AI Verdicts",
    description: "Get intelligent Subscribe/Avoid recommendations backed by financial data analysis.",
    href: "/ipos",
  },
  {
    icon: Globe,
    title: "Dual Market Coverage",
    description: "Comprehensive coverage of both Indian (NSE/BSE) and US (NYSE/NASDAQ) IPO markets.",
    href: "/ipos",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Visual risk radar covering market, financial, operational, regulatory, and competitive risks.",
    href: "/analyze",
  },
  {
    icon: BookOpen,
    title: "Educational Hub",
    description: "Learn everything about IPOs, from basics to advanced valuation techniques.",
    href: "/learn",
  },
];

const stats = [
  { label: "IPOs Tracked", value: "500+" },
  { label: "Markets Covered", value: "2" },
  { label: "Analysis Metrics", value: "25+" },
  { label: "Educational Articles", value: "6" },
];

export default function HomePage() {
  const { market } = useMarket();
  const featuredIPOs = getFeaturedIPOs();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_40%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Sparkles className="mr-1.5 h-3 w-3" />
              AI-Powered IPO Intelligence
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Make Smarter
              <br />
              <span className="text-primary">IPO Decisions</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Track IPOs, analyze prospectus documents with AI, and get instant
              verdicts. Covering both Indian and US markets in one beautiful platform.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/analyze">
                  <FileSearch className="h-4 w-4" />
                  Analyze a Document
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href="/ipos">
                  <TrendingUp className="h-4 w-4" />
                  View IPO Calendar
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Everything You Need for IPO Research
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              From tracking upcoming IPOs to deep-diving into prospectus documents with AI analysis.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={feature.href}>
                    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
                      <CardContent className="pt-6">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold group-hover:text-primary">{feature.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Killer Feature CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:gap-12">
                  <div className="flex-1">
                    <Badge className="mb-4 bg-primary/10 text-primary border-none">
                      <Zap className="mr-1 h-3 w-3" />
                      Killer Feature
                    </Badge>
                    <h2 className="text-2xl font-bold sm:text-3xl">
                      AI-Powered Document Analysis
                    </h2>
                    <p className="mt-3 text-muted-foreground max-w-lg">
                      Upload any DRHP or S-1 filing and our AI will analyze it in
                      under 60 seconds. Get financial health scores, risk assessments,
                      management analysis, valuation metrics, and an overall verdict
                      — all beautifully visualized.
                    </p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                      <Button size="lg" asChild className="gap-2">
                        <Link href="/analyze">
                          Try It Now
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-8 flex-shrink-0 lg:mt-0">
                    <div className="relative flex h-48 w-48 items-center justify-center">
                      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
                      <div className="absolute inset-4 rounded-full bg-primary/5" />
                      <Brain className="h-20 w-20 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Featured IPOs */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured IPOs</h2>
              <p className="mt-1 text-muted-foreground">
                Upcoming and open IPOs worth watching
              </p>
            </div>
            <Button variant="outline" asChild className="gap-1.5">
              <Link href="/ipos">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredIPOs.map((ipo, i) => (
              <motion.div
                key={ipo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <IPOCard ipo={ipo} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight">
              New to IPO Investing?
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Our educational hub covers everything from the basics of IPOs to
              advanced valuation techniques. Start learning today.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href="/learn">
                  <BookOpen className="h-4 w-4" />
                  Start Learning
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
