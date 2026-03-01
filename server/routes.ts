import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { db } from "./db";
import { stocks } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper: vector math
  const calculateBehavioralVector = async (interactions: { stockId: number, liked: boolean }[]) => {
    // We fetch the stocks that were liked.
    const likedStockIds = interactions.filter(i => i.liked).map(i => i.stockId);
    if (likedStockIds.length === 0) {
      return [0.2, 0.2, 0.2, 0.2, 0.2]; // Default uniform if no likes
    }
    const allStocks = await storage.getAllStocks();
    const likedStocks = allStocks.filter(s => likedStockIds.includes(s.id));
    
    let sumCagr = 0, sumVol = 0, sumSkew = 0, sumAlpha = 0, sumRec = 0;
    for (const s of likedStocks) {
      sumCagr += s.normCagr;
      sumVol += s.normVolatility;
      sumSkew += s.normSkewness;
      sumAlpha += s.normAlpha;
      sumRec += s.normRecovery;
    }
    
    let vector = [
      sumCagr / likedStocks.length,
      sumVol / likedStocks.length,
      sumSkew / likedStocks.length,
      sumAlpha / likedStocks.length,
      sumRec / likedStocks.length,
    ];
    // Normalize sum to 1
    const total = vector.reduce((a,b) => a+b, 0);
    return total > 0 ? vector.map(v => v / total) : [0.2, 0.2, 0.2, 0.2, 0.2];
  };

  const calculatePreferenceVector = (goal: string) => {
    // Vector order: [cagr, volatility, skewness, alpha, recovery]
    let p = [0.2, 0.2, 0.2, 0.2, 0.2];
    if (goal === 'Capital Preservation') {
      p = [0.1, 0.4, 0.1, 0.1, 0.3]; // Value low volatility, high recovery
    } else if (goal === 'Wealth Growth') {
      p = [0.4, 0.1, 0.1, 0.3, 0.1]; // Value cagr, alpha
    } else if (goal === 'Short-term') {
      p = [0.2, 0.3, 0.3, 0.1, 0.1]; // Volatility and skewness
    }
    const total = p.reduce((a,b) => a+b, 0);
    return p.map(v => v / total);
  };

  const combineVectors = (b: number[], p: number[], alpha = 0.7) => {
    return b.map((val, i) => val * alpha + p[i] * (1 - alpha));
  };


  app.get(api.stocks.random.path, async (req, res) => {
    const randomStocks = await storage.getRandomStocks(10);
    res.json(randomStocks);
  });

  app.get(api.profiles.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profiles = await storage.getUserProfiles(userId);
    res.json(profiles);
  });

  app.get(api.profiles.get.path, isAuthenticated, async (req: any, res) => {
    const profile = await storage.getProfile(Number(req.params.id));
    if (!profile) return res.status(404).json({ message: "Not found" });
    if (profile.userId !== req.user.claims.sub) return res.status(401).json({ message: "Unauthorized" });
    res.json(profile);
  });

  app.post(api.behavioral.submit.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.behavioral.submit.input.parse(req.body);
      const userId = req.user.claims.sub;

      const behavioralVector = await calculateBehavioralVector(input.interactions);

      const profile = await storage.createProfile({
        userId,
        profileName: input.profileName,
        behavioralVector,
        isActive: true,
      });

      await storage.saveInteractions(input.interactions.map(i => ({
        profileId: profile.id,
        stockId: i.stockId,
        liked: i.liked,
      })));

      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal error" });
      }
    }
  });

  app.post(api.preferences.submit.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.preferences.submit.input.parse(req.body);
      const profile = await storage.getProfile(input.profileId);
      
      if (!profile) return res.status(404).json({ message: "Not found" });
      if (profile.userId !== req.user.claims.sub) return res.status(401).json({ message: "Unauthorized" });

      const preferenceVector = calculatePreferenceVector(input.investmentGoal);
      const finalWeightVector = combineVectors(profile.behavioralVector || [0.2, 0.2, 0.2, 0.2, 0.2], preferenceVector);

      const updated = await storage.updateProfilePreferences(
        input.profileId, 
        input, 
        preferenceVector, 
        finalWeightVector
      );

      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  app.post(api.recommend.generate.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.recommend.generate.input.parse(req.body);
      const profile = await storage.getProfile(input.profileId);
      
      if (!profile) return res.status(404).json({ message: "Not found" });
      if (profile.userId !== req.user.claims.sub) return res.status(401).json({ message: "Unauthorized" });

      if (!profile.capital || !profile.finalWeightVector) {
        return res.status(400).json({ message: "Profile incomplete" });
      }

      const allStocks = await storage.getAllStocks();
      
      // Filter stocks by geography and sectors
      let filteredStocks = allStocks;
      if (profile.geography && profile.geography !== 'Global') {
        filteredStocks = filteredStocks.filter(s => s.geography === profile.geography);
      }
      if (profile.preferredSectors && profile.preferredSectors.length > 0) {
        filteredStocks = filteredStocks.filter(s => profile.preferredSectors!.includes(s.sector));
      }

      if (filteredStocks.length === 0) {
        // Fallback to all if overly filtered
        filteredStocks = allStocks;
      }

      // Score stocks
      const [w1, w2, w3, w4, w5] = profile.finalWeightVector;
      const scoredStocks = filteredStocks.map(stock => {
        const score = 
          stock.normCagr * w1 +
          (1 - stock.normVolatility) * w2 + 
          stock.normSkewness * w3 +
          stock.normAlpha * w4 +
          stock.normRecovery * w5;
        return { stock, score };
      }).sort((a, b) => b.score - a.score);

      const topStocks = scoredStocks.slice(0, input.mode === 'single' ? 1 : 5);
      const totalScore = topStocks.reduce((sum, item) => sum + item.score, 0) || 1;

      let totalInvested = 0;
      const allocations = topStocks.map(item => {
        const allocationPercent = input.mode === 'single' ? 1 : (item.score / totalScore);
        const targetInvestment = profile.capital! * allocationPercent;
        const shares = Math.floor(targetInvestment / item.stock.price);
        const actualInvestment = shares * item.stock.price;
        totalInvested += actualInvestment;

        return {
          stock: item.stock,
          score: item.score,
          allocationPercent,
          investmentAmount: actualInvestment,
          shares
        };
      });

      res.json({
        allocations,
        totalInvested,
        remainingCapital: profile.capital - totalInvested
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  app.post(api.feedback.submit.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.feedback.submit.input.parse(req.body);
      const profile = await storage.getProfile(input.profileId);
      
      if (!profile || profile.userId !== req.user.claims.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Optional feedback loop: slightly adjust dominant weights
      if (profile.finalWeightVector) {
        let vec = [...profile.finalWeightVector];
        const maxIdx = vec.indexOf(Math.max(...vec));
        
        if (input.confirmed) {
           vec[maxIdx] *= 1.05;
        } else {
           vec[maxIdx] *= 0.95;
        }
        
        const sum = vec.reduce((a,b)=>a+b, 0) || 1;
        vec = vec.map(v => v/sum);

        await storage.updateProfileWeights(profile.id, vec);
      }

      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // Seed DB with some fake stocks on startup if none exist
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  try {
    const allStocks = await storage.getAllStocks();
    if (allStocks.length === 0) {
      const seedStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Tech', geography: 'US', price: 150.0, cagr: 0.25, volatility: 0.15, skewness: -0.1, alpha: 0.05, recoveryTime: 30, normCagr: 0.8, normVolatility: 0.6, normSkewness: 0.5, normAlpha: 0.7, normRecovery: 0.9 },
        { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Tech', geography: 'US', price: 250.0, cagr: 0.22, volatility: 0.14, skewness: -0.05, alpha: 0.04, recoveryTime: 35, normCagr: 0.75, normVolatility: 0.65, normSkewness: 0.55, normAlpha: 0.6, normRecovery: 0.85 },
        { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Health', geography: 'US', price: 160.0, cagr: 0.10, volatility: 0.10, skewness: 0.0, alpha: 0.02, recoveryTime: 20, normCagr: 0.4, normVolatility: 0.8, normSkewness: 0.6, normAlpha: 0.4, normRecovery: 0.95 },
        { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', geography: 'US', price: 130.0, cagr: 0.12, volatility: 0.18, skewness: -0.2, alpha: 0.03, recoveryTime: 50, normCagr: 0.5, normVolatility: 0.5, normSkewness: 0.4, normAlpha: 0.5, normRecovery: 0.7 },
        { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energy', geography: 'US', price: 105.0, cagr: 0.08, volatility: 0.25, skewness: -0.3, alpha: 0.01, recoveryTime: 90, normCagr: 0.3, normVolatility: 0.3, normSkewness: 0.3, normAlpha: 0.2, normRecovery: 0.4 },
        { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Auto', geography: 'US', price: 200.0, cagr: 0.40, volatility: 0.50, skewness: 0.2, alpha: 0.10, recoveryTime: 80, normCagr: 0.95, normVolatility: 0.1, normSkewness: 0.8, normAlpha: 0.9, normRecovery: 0.5 },
        { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer', geography: 'US', price: 140.0, cagr: 0.09, volatility: 0.11, skewness: 0.05, alpha: 0.02, recoveryTime: 25, normCagr: 0.35, normVolatility: 0.75, normSkewness: 0.65, normAlpha: 0.4, normRecovery: 0.9 },
        { ticker: 'V', name: 'Visa Inc.', sector: 'Finance', geography: 'US', price: 220.0, cagr: 0.18, volatility: 0.16, skewness: -0.15, alpha: 0.04, recoveryTime: 40, normCagr: 0.65, normVolatility: 0.55, normSkewness: 0.45, normAlpha: 0.6, normRecovery: 0.8 },
        { ticker: 'ASML', name: 'ASML Holding', sector: 'Tech', geography: 'Global', price: 600.0, cagr: 0.30, volatility: 0.28, skewness: -0.05, alpha: 0.07, recoveryTime: 45, normCagr: 0.85, normVolatility: 0.4, normSkewness: 0.55, normAlpha: 0.8, normRecovery: 0.75 },
        { ticker: 'NVO', name: 'Novo Nordisk', sector: 'Health', geography: 'Global', price: 100.0, cagr: 0.35, volatility: 0.22, skewness: 0.1, alpha: 0.08, recoveryTime: 35, normCagr: 0.9, normVolatility: 0.45, normSkewness: 0.7, normAlpha: 0.85, normRecovery: 0.85 },
        { ticker: 'TMUS', name: 'T-Mobile US', sector: 'Telecom', geography: 'US', price: 145.0, cagr: 0.15, volatility: 0.20, skewness: -0.05, alpha: 0.03, recoveryTime: 55, normCagr: 0.55, normVolatility: 0.45, normSkewness: 0.55, normAlpha: 0.5, normRecovery: 0.65 },
        { ticker: 'PEP', name: 'PepsiCo', sector: 'Consumer', geography: 'US', price: 170.0, cagr: 0.08, volatility: 0.12, skewness: 0.02, alpha: 0.01, recoveryTime: 22, normCagr: 0.3, normVolatility: 0.7, normSkewness: 0.6, normAlpha: 0.3, normRecovery: 0.92 },
        { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Tech', geography: 'US', price: 800.0, cagr: 0.50, volatility: 0.35, skewness: 0.15, alpha: 0.12, recoveryTime: 40, normCagr: 0.98, normVolatility: 0.25, normSkewness: 0.75, normAlpha: 0.95, normRecovery: 0.8 },
        { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Tech', geography: 'US', price: 140.0, cagr: 0.20, volatility: 0.18, skewness: -0.05, alpha: 0.04, recoveryTime: 30, normCagr: 0.7, normVolatility: 0.5, normSkewness: 0.55, normAlpha: 0.6, normRecovery: 0.9 },
        { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Tech', geography: 'US', price: 175.0, cagr: 0.24, volatility: 0.22, skewness: -0.1, alpha: 0.06, recoveryTime: 45, normCagr: 0.8, normVolatility: 0.45, normSkewness: 0.5, normAlpha: 0.75, normRecovery: 0.75 },
        { ticker: 'META', name: 'Meta Platforms', sector: 'Tech', geography: 'US', price: 500.0, cagr: 0.28, volatility: 0.30, skewness: 0.0, alpha: 0.08, recoveryTime: 50, normCagr: 0.85, normVolatility: 0.35, normSkewness: 0.6, normAlpha: 0.85, normRecovery: 0.7 },
        { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Finance', geography: 'US', price: 400.0, cagr: 0.15, volatility: 0.12, skewness: 0.05, alpha: 0.03, recoveryTime: 25, normCagr: 0.55, normVolatility: 0.75, normSkewness: 0.65, normAlpha: 0.5, normRecovery: 0.92 },
        { ticker: 'LLY', name: 'Eli Lilly', sector: 'Health', geography: 'US', price: 750.0, cagr: 0.32, volatility: 0.20, skewness: 0.1, alpha: 0.09, recoveryTime: 30, normCagr: 0.9, normVolatility: 0.5, normSkewness: 0.7, normAlpha: 0.9, normRecovery: 0.9 },
        { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Tech', geography: 'US', price: 1300.0, cagr: 0.26, volatility: 0.24, skewness: -0.05, alpha: 0.07, recoveryTime: 40, normCagr: 0.82, normVolatility: 0.45, normSkewness: 0.55, normAlpha: 0.8, normRecovery: 0.8 },
        { ticker: 'COST', name: 'Costco Wholesale', sector: 'Consumer', geography: 'US', price: 720.0, cagr: 0.18, volatility: 0.14, skewness: 0.0, alpha: 0.04, recoveryTime: 20, normCagr: 0.65, normVolatility: 0.7, normSkewness: 0.6, normAlpha: 0.6, normRecovery: 0.95 },
        { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Finance', geography: 'US', price: 450.0, cagr: 0.17, volatility: 0.16, skewness: -0.05, alpha: 0.04, recoveryTime: 30, normCagr: 0.62, normVolatility: 0.65, normSkewness: 0.55, normAlpha: 0.6, normRecovery: 0.9 },
        { ticker: 'HD', name: 'Home Depot', sector: 'Consumer', geography: 'US', price: 350.0, cagr: 0.14, volatility: 0.18, skewness: -0.1, alpha: 0.03, recoveryTime: 35, normCagr: 0.52, normVolatility: 0.6, normSkewness: 0.5, normAlpha: 0.5, normRecovery: 0.85 },
        { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Health', geography: 'US', price: 175.0, cagr: 0.16, volatility: 0.15, skewness: -0.05, alpha: 0.04, recoveryTime: 25, normCagr: 0.58, normVolatility: 0.68, normSkewness: 0.55, normAlpha: 0.6, normRecovery: 0.9 },
        { ticker: 'CVX', name: 'Chevron Corp.', sector: 'Energy', geography: 'US', price: 155.0, cagr: 0.09, volatility: 0.22, skewness: -0.25, alpha: 0.01, recoveryTime: 80, normCagr: 0.35, normVolatility: 0.4, normSkewness: 0.35, normAlpha: 0.2, normRecovery: 0.5 }

      ];
      await db.insert(stocks).values(seedStocks);
    }
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}