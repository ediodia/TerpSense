import { create } from "zustand";
import type { Decision, Goal, InterventionResult, SpendingSummary, TransactionCategory } from "@/types";

interface PendingPurchase {
  amount: number;
  category: TransactionCategory;
  merchant?: string;
}

interface SessionState {
  pendingPurchase: PendingPurchase | null;
  interventionResult: InterventionResult | null;
  decision: Decision | null;
  updatedGoalAmount: number | null;
  activeGoal: Goal | null;
  activeProfileId: string;
  spendingSummary: SpendingSummary | null;
  dashboardNeedsRefresh: boolean;

  setPendingPurchase: (purchase: PendingPurchase) => void;
  setInterventionResult: (result: InterventionResult) => void;
  setDecision: (decision: Decision) => void;
  setUpdatedGoalAmount: (amount: number) => void;
  setActiveGoal: (goal: Goal) => void;
  setActiveProfileId: (profileId: string) => void;
  setSpendingSummary: (summary: SpendingSummary) => void;
  setDashboardNeedsRefresh: (val: boolean) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  pendingPurchase: null,
  interventionResult: null,
  decision: null,
  updatedGoalAmount: null,
  activeGoal: null,
  activeProfileId: "alex",
  spendingSummary: null,
  dashboardNeedsRefresh: false,

  setPendingPurchase: (purchase) => set({ pendingPurchase: purchase }),
  setInterventionResult: (result) => set({ interventionResult: result }),
  setDecision: (decision) => set({ decision }),
  setUpdatedGoalAmount: (amount) => set({ updatedGoalAmount: amount }),
  setActiveGoal: (goal) => set({ activeGoal: goal }),
  setActiveProfileId: (profileId) => set({ activeProfileId: profileId }),
  setSpendingSummary: (summary) => set({ spendingSummary: summary }),
  setDashboardNeedsRefresh: (val) => set({ dashboardNeedsRefresh: val }),
  resetSession: () =>
    set({
      pendingPurchase: null,
      interventionResult: null,
      decision: null,
      updatedGoalAmount: null,
      dashboardNeedsRefresh: false,
    }),
}));
