export const ROLES = {
  RESTAURANT: 'restaurant',
  NGO: 'ngo',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
} as const;

/** Domain food-post statuses (DB values). */
export const POST_STATUS = {
  POSTED: 'POSTED',
  MATCHED: 'MATCHED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export const MATCH_STATUS = {
  PENDING: 'PENDING',
  MATCHED: 'MATCHED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
} as const;

export const FRESHNESS = {
  ML: 'ml',
  RULE: 'rule-based',
} as const;

export const DEFAULT_PAGE = 0;
export const DEFAULT_PAGE_SIZE = 20;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];
export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];
