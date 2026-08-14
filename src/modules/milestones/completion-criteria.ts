import type { TransactionContext } from "../../db/transactions";

export type MilestoneCompletionBlocker = Readonly<{
  source: "CLIENT_ACTION" | "DELIVERABLE";
  sourceId: string;
  reason: string;
}>;

export type MilestoneCompletionCriteriaResult = Readonly<{
  satisfied: boolean;
  blockers: readonly MilestoneCompletionBlocker[];
}>;

export type MilestoneCompletionCriteriaInput = Readonly<{
  workspaceId: string;
  projectId: string;
  milestoneId: string;
}>;

/**
 * M10 owns the stable completion boundary before Client Actions (M11) and
 * Deliverables (M13) exist. Those milestones extend this evaluator with their
 * authoritative blockers; lifecycle commands continue to call the same
 * boundary instead of learning future domain tables directly.
 */
export async function evaluateMilestoneCompletionCriteria(
  transaction: TransactionContext,
  input: MilestoneCompletionCriteriaInput,
): Promise<MilestoneCompletionCriteriaResult> {
  void transaction;
  void input;

  return { satisfied: true, blockers: [] };
}
