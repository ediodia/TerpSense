export type TransactionCategory =
  | "Clothing"
  | "Dining"
  | "Entertainment"
  | "Transport"
  | "Subscriptions"
  | "Health"
  | "Shopping"
  | "Other";

export type Severity = "green" | "yellow" | "orange" | "red";

export type Decision = "proceed" | "delay" | "redirect" | "alternative";

export interface Transaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  merchant: string;
  date: string;
  type: "purchase";
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution_needed: number;
  days_to_goal_at_current_pace: number;
  created_at: string;
}

export interface SpendingSummary {
  user_id: string;
  week: Record<string, number>;
  month: Record<string, number>;
  total_week: number;
  total_month: number;
  avg_weekly_spend: number;
  category_weekly_averages: Record<string, number>;
  profile_id?: string;
  profile_name?: string;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  nessie_account_id: string;
  avatar: string;
}

export interface PurchasePayload {
  user_id: string;
  amount: number;
  category: TransactionCategory;
  merchant?: string;
  profile_id?: string;
}

export interface InterventionResult {
  severity: Severity;
  insights: string[];
  goal_impact_days: number;
  redirect_value_6mo: number;
  alternative_suggestion: string | null;
  summary_line: string;
  score: number;
}

export interface DecisionPayload {
  user_id: string;
  purchase_amount: number;
  category: TransactionCategory;
  merchant?: string;
  decision: Decision;
  profile_id?: string;
}

export interface DecisionResponse {
  acknowledged: boolean;
  decision: Decision;
  updated_goal_amount?: number;
  confirmation_message: string;
}
