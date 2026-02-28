import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { redirectToLogin } from "@/lib/auth-utils";

export function useProfiles() {
  return useQuery({
    queryKey: [api.profiles.list.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.list.path, { credentials: "include" });
      
      if (res.status === 401) {
        redirectToLogin();
        throw new Error("Unauthorized");
      }
      
      if (!res.ok) throw new Error("Failed to fetch profiles");
      
      const data = await res.json();
      // Handle Date coercion explicitly for arrays of objects
      return data; // Trusting backend for now to avoid Zod date string coercion issues on lists
    },
  });
}

export function useProfile(id: number | null) {
  return useQuery({
    queryKey: [api.profiles.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.profiles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 401) {
        redirectToLogin();
        throw new Error("Unauthorized");
      }
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      
      return await res.json();
    },
    enabled: !!id,
  });
}
