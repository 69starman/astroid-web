import { isMockMode } from '@/lib/env';
import * as mock from '@/services/mock';
import type {
  Agent,
  AiBriefing,
  AnalyticsOverview,
  ApiKey,
  AppNotification,
  Budget,
  ChatMessage,
  MemoryRecord,
  Policy,
  PolicySimulationResult,
  Proposal,
  Transaction,
  User,
  Wallet,
  Webhook,
} from '@/types/domain';

/**
 * Resource layer.
 *
 * Every screen calls these functions through TanStack Query hooks. In mock mode
 * they resolve local fixtures behind a small simulated latency so loading and
 * skeleton states are exercised. When a real API base is configured, swap these
 * bodies for `apiClient.request(...)` calls — the return types already match the
 * API envelope's `data` payloads.
 */

const LATENCY_MS = 320;

function resolve<T>(value: T, ms = LATENCY_MS): Promise<T> {
  if (!isMockMode) {
    // Live mode would call apiClient.request here; the mock still backs local dev.
    return Promise.resolve(value);
  }
  return new Promise((r) => setTimeout(() => r(value), ms));
}

function notFound(entity: string): never {
  throw new Error(`${entity} not found`);
}

export const resources = {
  // -- session / org ------------------------------------------------------
  getCurrentUser: (): Promise<User> => resolve(mock.currentUser),
  getOrganizations: () => resolve(mock.organizations),
  getTeam: (): Promise<User[]> => resolve(mock.teamMembers),

  // -- analytics ----------------------------------------------------------
  getOverview: (): Promise<AnalyticsOverview> => resolve(mock.analyticsOverview),

  // -- ai assistant -------------------------------------------------------
  getBriefing: (): Promise<AiBriefing> => resolve(mock.aiBriefing),
  getAssistantSeed: (): Promise<ChatMessage[]> => resolve(mock.assistantSeed, 120),

  // -- wallets ------------------------------------------------------------
  getWallets: (): Promise<Wallet[]> => resolve(mock.wallets),
  getWallet: (id: string): Promise<Wallet> =>
    resolve(mock.wallets.find((w) => w.id === id) ?? notFound('Wallet')),

  // -- agents -------------------------------------------------------------
  getAgents: (): Promise<Agent[]> => resolve(mock.agents),
  getAgent: (id: string): Promise<Agent> =>
    resolve(mock.agents.find((a) => a.id === id) ?? notFound('Agent')),

  // -- policies -----------------------------------------------------------
  getPolicies: (): Promise<Policy[]> => resolve(mock.policies),
  getPolicy: (id: string): Promise<Policy> =>
    resolve(mock.policies.find((p) => p.id === id) ?? notFound('Policy')),
  simulatePolicy: (amount: number): Promise<PolicySimulationResult> => {
    const requiresApproval = amount >= 5_000;
    const blocked = amount > 25_000;
    const risk = Math.min(98, Math.round(6 + (amount / 25_000) * 60));
    return resolve(
      {
        passed: !blocked,
        triggeredPolicies: [
          { policyId: 'pol_max_txn', name: 'Maximum transaction ceiling', passed: !blocked },
          {
            policyId: 'pol_approval_5k',
            name: 'Dual approval above 5,000',
            passed: !requiresApproval,
          },
        ],
        requiredApprovals: blocked ? 3 : requiresApproval ? 2 : 0,
        estimatedRisk: risk,
        budgetImpact: {
          budgetId: 'bud_eng',
          name: 'Engineering',
          remainingAfter: Math.max(0, 41_400 - amount),
        },
        predictedOutcome: blocked
          ? 'blocked'
          : requiresApproval
            ? 'requires_approval'
            : 'auto_execute',
      },
      460,
    );
  },

  // -- budgets ------------------------------------------------------------
  getBudgets: (): Promise<Budget[]> => resolve(mock.budgets),

  // -- transactions -------------------------------------------------------
  getTransactions: (): Promise<Transaction[]> => resolve(mock.transactions),
  getTransaction: (id: string): Promise<Transaction> =>
    resolve(mock.transactions.find((t) => t.id === id) ?? notFound('Transaction')),

  // -- proposals / approvals ---------------------------------------------
  getProposals: (): Promise<Proposal[]> => resolve(mock.proposals),
  getProposal: (id: string): Promise<Proposal> =>
    resolve(mock.proposals.find((p) => p.id === id) ?? notFound('Proposal')),

  // -- financial memory ---------------------------------------------------
  getMemoryRecords: (): Promise<MemoryRecord[]> => resolve(mock.memoryRecords),
  getMemoryRecord: (id: string): Promise<MemoryRecord> =>
    resolve(mock.memoryRecords.find((m) => m.id === id) ?? notFound('Memory record')),

  // -- notifications ------------------------------------------------------
  getNotifications: (): Promise<AppNotification[]> => resolve(mock.notifications),

  // -- developer ----------------------------------------------------------
  getApiKeys: (): Promise<ApiKey[]> => resolve(mock.apiKeys),
  getWebhooks: (): Promise<Webhook[]> => resolve(mock.webhooks),
};
