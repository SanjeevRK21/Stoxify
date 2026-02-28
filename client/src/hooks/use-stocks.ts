import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useRandomStocks() {
  return useQuery({
    queryKey: [api.stocks.random.path],
    queryFn: async () => {
      const res = await fetch(api.stocks.random.path, { credentials: "include" });
      
      if (res.status === 401) {
        redirectToLogin();
        throw new Error("Unauthorized");
      }
      
      if (!res.ok) throw new Error("Failed to fetch random stocks");
      
      const data = await res.json();
      return parseWithLogging(api.stocks.random.responses[200], data, "stocks.random");
    },
    staleTime: 0, // Always fetch new random stocks when mounted
    refetchOnWindowFocus: false,
  });
}
