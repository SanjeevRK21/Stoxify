import { z } from 'zod';
import { stocks, investmentProfiles } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  stocks: {
    random: {
      method: 'GET' as const,
      path: '/api/stocks/random' as const,
      responses: {
        200: z.array(z.custom<typeof stocks.$inferSelect>()),
      }
    }
  },
  profiles: {
    list: {
      method: 'GET' as const,
      path: '/api/profiles' as const,
      responses: {
        200: z.array(z.custom<typeof investmentProfiles.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:id' as const,
      responses: {
        200: z.custom<typeof investmentProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/profiles/:id' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    }
  },
  behavioral: {
    submit: {
      method: 'POST' as const,
      path: '/api/behavioral/submit' as const,
      input: z.object({
        profileName: z.string().min(1),
        interactions: z.array(z.object({
          stockId: z.number(),
          liked: z.boolean(),
        })),
      }),
      responses: {
        201: z.custom<typeof investmentProfiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  preferences: {
    submit: {
      method: 'POST' as const,
      path: '/api/preferences/submit' as const,
      input: z.object({
        profileId: z.number(),
        investmentGoal: z.enum(['Capital Preservation', 'Wealth Growth', 'Short-term']),
        preferredSectors: z.array(z.string()),
        geography: z.string(),
        capital: z.number().min(1),
      }),
      responses: {
        200: z.custom<typeof investmentProfiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  recommend: {
    generate: {
      method: 'POST' as const,
      path: '/api/recommend' as const,
      input: z.object({
        profileId: z.number(),
        mode: z.enum(['single', 'diversify']),
      }),
      responses: {
        200: z.object({
          allocations: z.array(z.object({
            stock: z.custom<typeof stocks.$inferSelect>(),
            score: z.number(),
            allocationPercent: z.number(),
            investmentAmount: z.number(),
            shares: z.number(),
          })),
          totalInvested: z.number(),
          remainingCapital: z.number(),
        }),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  feedback: {
    submit: {
      method: 'POST' as const,
      path: '/api/feedback' as const,
      input: z.object({
        profileId: z.number(),
        confirmed: z.boolean(),
        portfolio: z.array(z.object({
          stock: z.custom<typeof stocks.$inferSelect>(),
          score: z.number(),
          allocationPercent: z.number(),
          investmentAmount: z.number(),
          shares: z.number(),
        })).optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}