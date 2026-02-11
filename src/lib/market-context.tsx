"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Market = "india" | "us";

interface MarketContextType {
  market: Market;
  setMarket: (market: Market) => void;
  marketLabel: string;
  currencySymbol: string;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarket] = useState<Market>("india");

  const value: MarketContextType = {
    market,
    setMarket,
    marketLabel: market === "india" ? "India (NSE/BSE)" : "US (NYSE/NASDAQ)",
    currencySymbol: market === "india" ? "\u20B9" : "$",
  };

  return (
    <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used within MarketProvider");
  return context;
}
