import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  geography: text("geography").notNull(),
  cagr: real("cagr").notNull(),
  volatility: real("volatility").notNull(),
  skewness: real("skewness").notNull(),
  alpha: real("alpha").notNull(),
  recoveryTime: real("recovery_time").notNull(),
  normCagr: real("norm_cagr").notNull(),
  normVolatility: real("norm_volatility").notNull(),
  normSkewness: real("norm_skewness").notNull(),
  normAlpha: real("norm_alpha").notNull(),
  normRecovery: real("norm_recovery").notNull(),
  price: real("price").notNull(),
});

export const investmentProfiles = pgTable("investment_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  profileName: text("profile_name").notNull(),
  behavioralVector: jsonb("behavioral_vector").$type<number[]>(),
  preferenceVector: jsonb("preference_vector").$type<number[]>(),
  finalWeightVector: jsonb("final_weight_vector").$type<number[]>(),
  investmentGoal: text("investment_goal"),
  preferredSectors: jsonb("preferred_sectors").$type<string[]>(),
  geography: text("geography"),
  capital: real("capital"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const behavioralInteractions = pgTable("behavioral_interactions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => investmentProfiles.id).notNull(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  liked: boolean("liked").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas
export const insertStockSchema = createInsertSchema(stocks).omit({ id: true });
export const insertProfileSchema = createInsertSchema(investmentProfiles).omit({ id: true, createdAt: true, behavioralVector: true, preferenceVector: true, finalWeightVector: true });
export const insertInteractionSchema = createInsertSchema(behavioralInteractions).omit({ id: true, timestamp: true });

// Types
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type InvestmentProfile = typeof investmentProfiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type BehavioralInteraction = typeof behavioralInteractions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

// API request/response types
export type SubmitBehavioralRequest = {
  profileName: string;
  interactions: { stockId: number; liked: boolean }[];
};

export type SubmitPreferencesRequest = {
  profileId: number;
  investmentGoal: 'Capital Preservation' | 'Wealth Growth' | 'Short-term';
  preferredSectors: string[];
  geography: string;
  capital: number;
};

export type RecommendRequest = {
  profileId: number;
  mode: 'single' | 'diversify';
};

export type PortfolioAllocation = {
  stock: Stock;
  score: number;
  allocationPercent: number;
  investmentAmount: number;
  shares: number;
};

export type RecommendResponse = {
  allocations: PortfolioAllocation[];
  totalInvested: number;
  remainingCapital: number;
};

export type FeedbackRequest = {
  profileId: number;
  confirmed: boolean;
};