import { pgTable, text, timestamp, integer, jsonb, varchar, boolean, decimal } from "drizzle-orm/pg-core";

export const ipos = pgTable("ipos", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  market: varchar("market", { length: 10 }).notNull(), // "india" or "us"
  exchange: varchar("exchange", { length: 20 }).notNull(), // NSE, BSE, NYSE, NASDAQ
  status: varchar("status", { length: 20 }).notNull(), // "upcoming", "open", "listed"
  priceMin: decimal("price_min", { precision: 12, scale: 2 }),
  priceMax: decimal("price_max", { precision: 12, scale: 2 }),
  listingPrice: decimal("listing_price", { precision: 12, scale: 2 }),
  lotSize: integer("lot_size"),
  issueSize: text("issue_size"),
  openDate: timestamp("open_date"),
  closeDate: timestamp("close_date"),
  allotmentDate: timestamp("allotment_date"),
  listingDate: timestamp("listing_date"),
  description: text("description"),
  sector: text("sector"),
  logoUrl: text("logo_url"),
  subscriptionStatus: jsonb("subscription_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analyses = pgTable("analyses", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  documentType: varchar("document_type", { length: 10 }).notNull(), // "drhp" or "s1"
  market: varchar("market", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, processing, completed, failed
  results: jsonb("results"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verdicts = pgTable("verdicts", {
  id: text("id").primaryKey(),
  ipoId: text("ipo_id").notNull().references(() => ipos.id),
  verdict: text("verdict").notNull(),
  score: integer("score"),
  summary: text("summary"),
  strengths: jsonb("strengths"),
  weaknesses: jsonb("weaknesses"),
  recommendation: varchar("recommendation", { length: 20 }), // "subscribe", "avoid", "neutral"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 50 }),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type IPO = typeof ipos.$inferSelect;
export type NewIPO = typeof ipos.$inferInsert;
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
export type Verdict = typeof verdicts.$inferSelect;
export type Article = typeof articles.$inferSelect;
