export interface AnalysisResults {
  companyName: string;
  documentType: "DRHP" | "S-1";
  overallScore: number;
  financialHealth: {
    revenue: number[];
    revenueYears: string[];
    profit: number[];
    profitYears: string[];
    debt: number;
    debtToEquity: number;
    revenueGrowth: number;
    profitMargin: number;
    score: number;
  };
  businessModel: {
    description: string;
    revenueStreams: { name: string; percentage: number }[];
    moat: string;
    score: number;
  };
  riskFactors: {
    market: number;
    financial: number;
    operational: number;
    regulatory: number;
    competitive: number;
    keyRisks: string[];
  };
  management: {
    experience: number;
    trackRecord: number;
    transparency: number;
    alignment: number;
    keyPeople: { name: string; role: string; experience: string }[];
    score: number;
  };
  competitivePosition: {
    competitors: { name: string; marketShare: number; valuation: number }[];
    companyMarketShare: number;
    differentiators: string[];
    score: number;
  };
  valuation: {
    peRatio: number;
    industryPeAverage: number;
    priceToBV: number;
    assessment: "undervalued" | "fair" | "overvalued" | "expensive";
    peerComparison: { name: string; pe: number }[];
    score: number;
  };
  strengths: string[];
  weaknesses: string[];
  verdict: {
    recommendation: "Strong Subscribe" | "Subscribe" | "Neutral" | "Avoid" | "Strong Avoid";
    summary: string;
    keyPoints: string[];
  };
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
  icon: string;
}

export const analysisSteps: AnalysisStep[] = [
  { id: "upload", label: "Uploading document", status: "pending", icon: "upload" },
  { id: "parse", label: "Reading document content", status: "pending", icon: "file-text" },
  { id: "financials", label: "Analyzing financial data", status: "pending", icon: "bar-chart" },
  { id: "business", label: "Evaluating business model", status: "pending", icon: "briefcase" },
  { id: "risks", label: "Assessing risk factors", status: "pending", icon: "shield" },
  { id: "management", label: "Reviewing management team", status: "pending", icon: "users" },
  { id: "valuation", label: "Computing valuation metrics", status: "pending", icon: "calculator" },
  { id: "verdict", label: "Generating AI verdict", status: "pending", icon: "brain" },
];

/** Ensures all required fields exist with sensible defaults so components never crash */
export function sanitizeResults(raw: Record<string, unknown>): AnalysisResults {
  const r = raw as Partial<AnalysisResults> & Record<string, unknown>;

  const num = (v: unknown, fallback = 0): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const arr = <T>(v: unknown, fallback: T[] = []): T[] =>
    Array.isArray(v) ? v : fallback;

  /** Parse array of numbers — AI may return strings like ["1200", "1580"] */
  const numArr = (v: unknown): number[] =>
    Array.isArray(v) ? v.map((x) => num(x, 0)) : [];

  const str = (v: unknown, fallback = ""): string =>
    typeof v === "string" && v.length > 0 ? v : fallback;

  const fh = (r.financialHealth || {}) as Record<string, unknown>;
  const bm = (r.businessModel || {}) as Record<string, unknown>;
  const rf = (r.riskFactors || {}) as Record<string, unknown>;
  const mg = (r.management || {}) as Record<string, unknown>;
  const cp = (r.competitivePosition || {}) as Record<string, unknown>;
  const vl = (r.valuation || {}) as Record<string, unknown>;
  const vd = (r.verdict || {}) as Record<string, unknown>;

  // Normalize valuation assessment
  const rawAssessment = str(vl.assessment, "fair").toLowerCase().replace(/\s+/g, "").replace("fairlyvalued", "fair");
  const validAssessments = ["undervalued", "fair", "overvalued", "expensive"];
  const assessment = (validAssessments.includes(rawAssessment) ? rawAssessment : "fair") as AnalysisResults["valuation"]["assessment"];

  // Normalize verdict recommendation
  const rawRec = str(vd.recommendation, "Neutral");
  const validRecs = ["Strong Subscribe", "Subscribe", "Neutral", "Avoid", "Strong Avoid"];
  const recommendation = (validRecs.find((r) => r.toLowerCase() === rawRec.toLowerCase()) || "Neutral") as AnalysisResults["verdict"]["recommendation"];

  return {
    companyName: str(r.companyName, "Unknown Company"),
    documentType: (str(r.documentType, "DRHP") === "S-1" ? "S-1" : "DRHP") as AnalysisResults["documentType"],
    overallScore: num(r.overallScore, 50),
    financialHealth: {
      revenue: numArr(fh.revenue),
      revenueYears: arr<string>(fh.revenueYears),
      profit: numArr(fh.profit),
      profitYears: arr<string>(fh.profitYears),
      debt: num(fh.debt),
      debtToEquity: num(fh.debtToEquity),
      revenueGrowth: num(fh.revenueGrowth),
      profitMargin: num(fh.profitMargin),
      score: num(fh.score, 50),
    },
    businessModel: {
      description: str(bm.description, "Not available"),
      revenueStreams: arr(bm.revenueStreams),
      moat: str(bm.moat, "Not available"),
      score: num(bm.score, 50),
    },
    riskFactors: {
      market: num(rf.market, 50),
      financial: num(rf.financial, 50),
      operational: num(rf.operational, 50),
      regulatory: num(rf.regulatory, 50),
      competitive: num(rf.competitive, 50),
      keyRisks: arr<string>(rf.keyRisks),
    },
    management: {
      experience: num(mg.experience, 50),
      trackRecord: num(mg.trackRecord, 50),
      transparency: num(mg.transparency, 50),
      alignment: num(mg.alignment, 50),
      keyPeople: arr(mg.keyPeople),
      score: num(mg.score, 50),
    },
    competitivePosition: {
      competitors: arr(cp.competitors),
      companyMarketShare: num(cp.companyMarketShare),
      differentiators: arr<string>(cp.differentiators),
      score: num(cp.score, 50),
    },
    valuation: {
      peRatio: num(vl.peRatio),
      industryPeAverage: num(vl.industryPeAverage),
      priceToBV: num(vl.priceToBV),
      assessment,
      peerComparison: arr(vl.peerComparison),
      score: num(vl.score, 50),
    },
    strengths: arr<string>(r.strengths),
    weaknesses: arr<string>(r.weaknesses),
    verdict: {
      recommendation,
      summary: str(vd.summary, "Analysis could not generate a complete verdict."),
      keyPoints: arr<string>(vd.keyPoints),
    },
  };
}

export const funFacts = [
  "The largest IPO in history was Saudi Aramco at $25.6 billion in 2019.",
  "Google's IPO in 2004 used a Dutch auction format, which was very unusual at the time.",
  "Facebook's IPO in 2012 was the biggest tech IPO ever at $16 billion.",
  "India's IPO market has seen record activity, with 200+ IPOs in 2024 alone.",
  "The term 'IPO' was first used in the 1600s when the Dutch East India Company went public.",
  "Warren Buffett has famously said he avoids most IPOs.",
  "About 60% of IPOs trade below their offering price within the first year.",
  "A DRHP (Draft Red Herring Prospectus) can be 400-800 pages long!",
  "The SEC requires a 'quiet period' of 40 days after a US IPO.",
  "SEBI mandates that Indian IPO applications must be in multiples of the lot size.",
];
