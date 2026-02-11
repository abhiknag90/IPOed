"use client";

import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

export function MarketSwitcher() {
  const { market, setMarket } = useMarket();

  return (
    <div className="flex items-center rounded-full border bg-muted/50 p-0.5">
      <button
        onClick={() => setMarket("india")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-all",
          market === "india"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇮🇳 India
      </button>
      <button
        onClick={() => setMarket("us")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-all",
          market === "us"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇺🇸 US
      </button>
    </div>
  );
}
