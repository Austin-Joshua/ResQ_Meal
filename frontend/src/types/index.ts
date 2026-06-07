export type FoodPostStatus = 'POSTED' | 'MATCHED' | 'EXPIRED' | 'CANCELLED';

export type MatchStatus = 'PENDING' | 'MATCHED' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'REJECTED';

export type UserRole = 'restaurant' | 'ngo' | 'volunteer';

export type PageEnvelope<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
