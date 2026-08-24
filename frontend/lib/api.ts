import type {
  DecisionPayload,
  DecisionResponse,
  FinancialProfileRequest,
  FinancialProfileResponse,
  Goal,
  InterventionResult,
  PersonalTransactionInput,
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

function authHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function getAuthed<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function postAuthed<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(token),
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

// --- Auth (email/password signup — Google/Microsoft go through NextAuth directly) ---

interface RegisterResponse {
  user_id: string;
  email: string;
  name: string;
  token: string;
}

export async function registerUser(name: string, email: string, password: string): Promise<RegisterResponse> {
  return post<RegisterResponse>("/auth/register", { name, email, password });
}

// --- Personal mode: real financial data (all require a bearer token) ---

export async function getFinancialProfile(token: string): Promise<FinancialProfileResponse> {
  return getAuthed<FinancialProfileResponse>("/financial-profile", token);
}

export async function saveFinancialProfile(
  token: string,
  payload: FinancialProfileRequest
): Promise<FinancialProfileResponse> {
  return postAuthed<FinancialProfileResponse>("/financial-profile", token, payload);
}

export async function logPersonalTransaction(
  token: string,
  payload: PersonalTransactionInput
): Promise<{ transactions: Transaction[] }> {
  return postAuthed<{ transactions: Transaction[] }>("/personal-transactions", token, payload);
}

export async function getPersonalTransactions(token: string): Promise<Transaction[]> {
  const res = await getAuthed<{ transactions: Transaction[] }>("/personal-transactions", token);
  return res.transactions;
}

export async function analyzePersonalPurchase(
  token: string,
  payload: Omit<PurchasePayload, "user_id">
): Promise<InterventionResult> {
  return postAuthed<InterventionResult>("/analyze-purchase", token, payload);
}

export async function recordPersonalDecision(
  token: string,
  payload: Omit<DecisionPayload, "user_id">
): Promise<DecisionResponse> {
  return postAuthed<DecisionResponse>("/record-decision", token, payload);
}
