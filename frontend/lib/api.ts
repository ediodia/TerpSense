import type {
  DecisionPayload,
  DecisionResponse,
  Goal,
  InterventionResult,
  Profile,
  PurchasePayload,
  SpendingSummary,
  Transaction,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface GoalsResponse {
  user_id: string;
  goals: Goal[];
}

interface TransactionsResponse {
  user_id: string;
  transactions: Transaction[];
}

interface ProfilesResponse {
  profiles: Profile[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function getProfiles(): Promise<Profile[]> {
  const res = await get<ProfilesResponse>("/profiles");
  return res.profiles;
}

export async function getSpendingSummary(userId = "demo", profileId?: string): Promise<SpendingSummary> {
  const params = new URLSearchParams({ user_id: userId });
  if (profileId) params.set("profile_id", profileId);
  return get<SpendingSummary>(`/spending-summary?${params}`);
}

export async function getGoals(userId = "demo", profileId?: string): Promise<Goal[]> {
  const params = new URLSearchParams({ user_id: userId });
  if (profileId) params.set("profile_id", profileId);
  const res = await get<GoalsResponse>(`/goals?${params}`);
  return res.goals;
}

export async function getTransactions(userId = "demo", profileId?: string): Promise<Transaction[]> {
  const params = new URLSearchParams({ user_id: userId, days: "30" });
  if (profileId) params.set("profile_id", profileId);
  const res = await get<TransactionsResponse>(`/transactions?${params}`);
  return res.transactions;
}

export async function analyzePurchase(payload: PurchasePayload): Promise<InterventionResult> {
  return post<InterventionResult>("/analyze-purchase", payload);
}

export async function recordDecision(payload: DecisionPayload): Promise<DecisionResponse> {
  return post<DecisionResponse>("/record-decision", payload);
}

export async function resetDemo(): Promise<void> {
  await post("/reset-demo", {});
}
