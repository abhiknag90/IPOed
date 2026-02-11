"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Upload, FileText, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMarket } from "@/lib/market-context";

const BLOB_UPLOAD_THRESHOLD = 4 * 1024 * 1024; // 4MB — use Blob for larger files to bypass Vercel 4.5MB limit

export default function AnalyzePage() {
  const router = useRouter();
  const { market } = useMarket();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const useBlobUpload = file.size > BLOB_UPLOAD_THRESHOLD;

      if (useBlobUpload) {
        // Upload to Vercel Blob first (bypasses 4.5MB request limit)
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/analyze/upload",
          multipart: file.size > 5 * 1024 * 1024,
        });

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blobUrl: blob.url,
            fileName: file.name,
            fileSize: file.size,
            market,
            documentType: market === "india" ? "drhp" : "s1",
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Analysis failed");
        }

        const { analysisId } = await res.json();
        router.push(`/analyze/${analysisId}`);
      } else {
        // Direct FormData for smaller files
        const formData = new FormData();
        formData.append("file", file);
        formData.append("market", market);
        formData.append("documentType", market === "india" ? "drhp" : "s1");

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { analysisId } = await res.json();
        router.push(`/analyze/${analysisId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          AI Document Analysis
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Upload a {market === "india" ? "DRHP (Draft Red Herring Prospectus)" : "S-1 Filing"} and
          get an instant AI-powered analysis with scores, charts, and a verdict.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10"
      >
        <Card
          className={`relative overflow-hidden transition-all ${
            dragOver
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : file
              ? "border-primary/50 bg-primary/5"
              : "border-dashed"
          }`}
        >
          <CardContent className="p-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center py-8"
            >
              {file ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-medium">{file.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setFile(null)}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium">
                    Drag & drop your {market === "india" ? "DRHP" : "S-1"} PDF here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse (Max 10MB, up to 1000 pages)
                  </p>
                  <label className="mt-4 inline-block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <span className="cursor-pointer rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
                      Browse Files
                    </span>
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!file || uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                Analyze with AI
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Financial Analysis",
              desc: "Revenue, profit, debt metrics with trend charts",
            },
            {
              title: "Risk Assessment",
              desc: "Market, regulatory, operational risk radar",
            },
            {
              title: "AI Verdict",
              desc: "Subscribe/Avoid recommendation with detailed reasoning",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="rounded-lg border bg-card p-4 text-center"
            >
              <h3 className="font-medium">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
