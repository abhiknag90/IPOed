import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                IPO<span className="text-primary">&apos;ed</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Making IPO information accessible, visual, and actionable for everyone.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/ipos" className="hover:text-foreground transition-colors">IPO Calendar</Link></li>
              <li><Link href="/analyze" className="hover:text-foreground transition-colors">Analyze Document</Link></li>
              <li><Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Markets</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/ipos?market=india" className="hover:text-foreground transition-colors">India (NSE/BSE)</Link></li>
              <li><Link href="/ipos?market=us" className="hover:text-foreground transition-colors">US (NYSE/NASDAQ)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/learn" className="hover:text-foreground transition-colors">What is an IPO?</Link></li>
              <li><Link href="/learn" className="hover:text-foreground transition-colors">How to read a DRHP</Link></li>
              <li><Link href="/learn" className="hover:text-foreground transition-colors">IPO Glossary</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} IPO&apos;ed. For educational purposes only. Not financial advice.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by AI &middot; Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
