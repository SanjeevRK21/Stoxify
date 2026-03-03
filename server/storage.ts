import { db } from "./db";
import {
  stocks,
  investmentProfiles,
  behavioralInteractions,
  type InsertProfile,
  type InsertInteraction,
  type Stock,
  type InvestmentProfile,
  type SubmitPreferencesRequest
} from "@shared/schema";
import { eq, sql, inArray } from "drizzle-orm";

export interface IStorage {
  getRandomStocks(limit: number): Promise<Stock[]>;
  createProfile(profile: InsertProfile): Promise<InvestmentProfile>;
  getProfile(id: number): Promise<InvestmentProfile | undefined>;
  getUserProfiles(userId: string): Promise<InvestmentProfile[]>;
  saveInteractions(interactions: InsertInteraction[]): Promise<void>;
  updateProfilePreferences(profileId: number, prefs: SubmitPreferencesRequest, preferenceVector: number[], finalWeightVector: number[]): Promise<InvestmentProfile>;
  updateProfileWeights(profileId: number, finalWeightVector: number[]): Promise<InvestmentProfile>;
  deleteProfile(id: number): Promise<void>;
  getAllStocks(): Promise<Stock[]>;
}

export class DatabaseStorage implements IStorage {
  async getRandomStocks(limit: number): Promise<Stock[]> {
    return await db.select().from(stocks).orderBy(sql`RANDOM()`).limit(limit);
  }

  async createProfile(profile: InsertProfile): Promise<InvestmentProfile> {
    const [newProfile] = await db.insert(investmentProfiles).values(profile).returning();
    return newProfile;
  }

  async deleteProfile(id: number): Promise<void> {
    await db.delete(behavioralInteractions).where(eq(behavioralInteractions.profileId, id));
    await db.delete(investmentProfiles).where(eq(investmentProfiles.id, id));
  }

  async getProfile(id: number): Promise<InvestmentProfile | undefined> {
    const [profile] = await db.select().from(investmentProfiles).where(eq(investmentProfiles.id, id));
    return profile;
  }

  async getUserProfiles(userId: string): Promise<InvestmentProfile[]> {
    return await db.select().from(investmentProfiles).where(eq(investmentProfiles.userId, userId)).orderBy(sql`${investmentProfiles.createdAt} DESC`);
  }

  async saveInteractions(interactions: InsertInteraction[]): Promise<void> {
    if (interactions.length > 0) {
      await db.insert(behavioralInteractions).values(interactions);
    }
  }

  async updateProfilePreferences(
    profileId: number, 
    prefs: SubmitPreferencesRequest, 
    preferenceVector: number[], 
    finalWeightVector: number[]
  ): Promise<InvestmentProfile> {
    const [updated] = await db.update(investmentProfiles)
      .set({
        investmentGoal: prefs.investmentGoal,
        preferredSectors: prefs.preferredSectors,
        geography: prefs.geography,
        capital: prefs.capital,
        preferenceVector,
        finalWeightVector
      })
      .where(eq(investmentProfiles.id, profileId))
      .returning();
    return updated;
  }

  async updateProfileWeights(profileId: number, finalWeightVector: number[]): Promise<InvestmentProfile> {
    const [updated] = await db.update(investmentProfiles)
      .set({ finalWeightVector })
      .where(eq(investmentProfiles.id, profileId))
      .returning();
    return updated;
  }

  async getAllStocks(): Promise<Stock[]> {
    return await db.select().from(stocks);
  }
}

export const storage = new DatabaseStorage();