import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { 
  SubmitBehavioralRequest, 
  SubmitPreferencesRequest, 
  RecommendRequest, 
  FeedbackRequest 
} from "@shared/schema";
import { redirectToLogin } from "@/lib/auth-utils";

export function useSubmitBehavioral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmitBehavioralRequest) => {
      const validated = api.behavioral.submit.input.parse(data);
      const res = await fetch(api.behavioral.submit.path, {
        method: api.behavioral.submit.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (res.status === 401) redirectToLogin();
      if (!res.ok) throw new Error("Failed to submit behavioral profile");
      
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] }),
  });
}

export function useSubmitPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmitPreferencesRequest) => {
      const validated = api.preferences.submit.input.parse(data);
      const res = await fetch(api.preferences.submit.path, {
        method: api.preferences.submit.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (res.status === 401) redirectToLogin();
      if (!res.ok) throw new Error("Failed to submit preferences");
      
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] }),
  });
}

export function useGenerateRecommendation() {
  return useMutation({
    mutationFn: async (data: RecommendRequest) => {
      const validated = api.recommend.generate.input.parse(data);
      const res = await fetch(api.recommend.generate.path, {
        method: api.recommend.generate.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (res.status === 401) redirectToLogin();
      if (!res.ok) throw new Error("Failed to generate recommendation");
      
      return await res.json();
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FeedbackRequest) => {
      const validated = api.feedback.submit.input.parse(data);
      const res = await fetch(api.feedback.submit.path, {
        method: api.feedback.submit.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (res.status === 401) redirectToLogin();
      if (!res.ok) throw new Error("Failed to submit feedback");
      
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] }),
  });
}
