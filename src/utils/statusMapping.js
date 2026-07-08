// ── User status ─────────────────────────────────────────────────────────────
export const USER_STATUS_COLORS = {
  active: 'bg-success/10 text-success border-success/20',
  ACTIVE: 'bg-success/10 text-success border-success/20',
  suspended: 'bg-alert/10 text-alert border-alert/20',
  SUSPENDED: 'bg-alert/10 text-alert border-alert/20',
  deactivated: 'bg-gray-200 text-gray-600 border-gray-300',
  DEACTIVATED: 'bg-gray-200 text-gray-600 border-gray-300',
};

export const KYC_COLORS = {
  verified: 'bg-success/10 text-success border-success/20',
  VERIFIED: 'bg-success/10 text-success border-success/20',
  pending: 'bg-alert/10 text-alert border-alert/20',
  PENDING: 'bg-alert/10 text-alert border-alert/20',
  unverified: 'bg-gray-200 text-gray-600 border-gray-300',
  UNVERIFIED: 'bg-gray-200 text-gray-600 border-gray-300',
};

// ── SACCO status & tier ─────────────────────────────────────────────────────
export const SACCO_STATUS_COLORS = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  SUSPENDED: 'bg-alert/10 text-alert border-alert/20',
  UNDER_REVIEW: 'bg-alert/10 text-alert border-alert/20',
  PENDING: 'bg-alert/10 text-alert border-alert/20',
  HALTED: 'bg-danger/10 text-danger border-danger/20',
};

export const SACCO_TIER_COLORS = {
  1: 'bg-success/10 text-success border-success/20',
  2: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  3: 'bg-alert/10 text-alert border-alert/20',
};

// ── Chama status ────────────────────────────────────────────────────────────
export const CHAMA_STATUS_COLORS = {
  active: 'bg-success/10 text-success border-success/20',
  ACTIVE: 'bg-success/10 text-success border-success/20',
  suspended: 'bg-danger/10 text-danger border-danger/20',
  SUSPENDED: 'bg-danger/10 text-danger border-danger/20',
  inactive: 'bg-gray-200 text-gray-600 border-gray-300',
  INACTIVE: 'bg-gray-200 text-gray-600 border-gray-300',
};

// ── Escrow status ───────────────────────────────────────────────────────────
export const ESCROW_STATUS_COLORS = {
  held: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  HELD: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  held_partial: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  HELD_PARTIAL: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  released: 'bg-success/10 text-success border-success/20',
  RELEASED: 'bg-success/10 text-success border-success/20',
  refunded: 'bg-gray-200 text-gray-600 border-gray-300',
  REFUNDED: 'bg-gray-200 text-gray-600 border-gray-300',
  CREATED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  FUNDED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  DISPUTED: 'bg-alert/10 text-alert border-alert/20',
  CANCELLED: 'bg-gray-200 text-gray-600 border-gray-300',
};

// ── Dispute status ──────────────────────────────────────────────────────────
export const DISPUTE_STATUS_COLORS = {
  open: 'bg-danger/10 text-danger border-danger/20',
  OPEN: 'bg-danger/10 text-danger border-danger/20',
  under_review: 'bg-alert/10 text-alert border-alert/20',
  UNDER_REVIEW: 'bg-alert/10 text-alert border-alert/20',
  resolved: 'bg-success/10 text-success border-success/20',
  RESOLVED: 'bg-success/10 text-success border-success/20',
  closed: 'bg-gray-200 text-gray-600 border-gray-300',
  CLOSED: 'bg-gray-200 text-gray-600 border-gray-300',
  DISPUTED_MANUAL: 'bg-alert/10 text-alert border-alert/20',
};

// ── Settlement status ───────────────────────────────────────────────────────
export const SETTLEMENT_STATUS_COLORS = {
  COMPLETED: 'bg-success/10 text-success',
  PENDING: 'bg-warning/10 text-warning',
  DISPUTED: 'bg-alert/10 text-alert',
  REVERSED: 'bg-gray-100 text-gray-500',
};

// ── Fraud risk level ────────────────────────────────────────────────────────
export const RISK_COLORS = {
  low: 'bg-success/10 text-success border-success/20',
  LOW: 'bg-success/10 text-success border-success/20',
  medium: 'bg-alert/10 text-alert border-alert/20',
  MEDIUM: 'bg-alert/10 text-alert border-alert/20',
  high: 'bg-danger/10 text-danger border-danger/20',
  HIGH: 'bg-danger/10 text-danger border-danger/20',
  critical: 'bg-danger/10 text-danger border-danger/30',
  CRITICAL: 'bg-danger/10 text-danger border-danger/30',
};

// ── Fraud review status / applied action ────────────────────────────────────
export const FRAUD_STATUS_COLORS = {
  pending: 'bg-alert/10 text-alert border-alert/20',
  PENDING: 'bg-alert/10 text-alert border-alert/20',
  approved: 'bg-success/10 text-success border-success/20',
  APPROVED: 'bg-success/10 text-success border-success/20',
  ALLOW: 'bg-success/10 text-success border-success/20',
  blocked: 'bg-danger/10 text-danger border-danger/20',
  BLOCKED: 'bg-danger/10 text-danger border-danger/20',
  BLOCK: 'bg-danger/10 text-danger border-danger/20',
  HOLD: 'bg-alert/10 text-alert border-alert/20',
  FLAG: 'bg-alert/10 text-alert border-alert/20',
};

// ── Audit action type ───────────────────────────────────────────────────────
export const ACTION_COLORS = {
  CREATE: 'bg-success/10 text-success border-success/20',
  UPDATE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  DELETE: 'bg-danger/10 text-danger border-danger/20',
  SUSPEND: 'bg-alert/10 text-alert border-alert/20',
  VERIFY: 'bg-success/10 text-success border-success/20',
  LOGIN: 'bg-gray-200 text-gray-600 border-gray-300',
  FRAUD: 'bg-danger/10 text-danger border-danger/20',
};

// ── Deletion request status ────────────────────────────────────────────────
export const DELETION_REQUEST_COLORS = {
  pending: 'bg-alert/10 text-alert border-alert/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-sand text-slate border-sand-dark/20',
};

// ── Underwriting decision ──────────────────────────────────────────────────
export const UNDERWRITING_DECISION_COLORS = {
  APPROVE: 'bg-success/10 text-success',
  APPROVE_WITH_CONDITIONS: 'bg-blue-500/10 text-blue-600',
  FLAG_FOR_REVIEW: 'bg-alert/10 text-alert',
  REJECT: 'bg-danger/10 text-danger',
};

export const UNDERWRITING_DECISION_LABELS = {
  APPROVE: 'Approve',
  APPROVE_WITH_CONDITIONS: 'Conditional',
  FLAG_FOR_REVIEW: 'Flagged',
  REJECT: 'Reject',
};

// ── Generic fallback ────────────────────────────────────────────────────────
const FALLBACK = 'bg-gray-100 text-gray-500 border-gray-200';

export function getStatusColor(value, colorMap) {
  return colorMap[value] || FALLBACK;
}


