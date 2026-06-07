import { styles } from '@/styles/classes';

const FOOD_TYPE_LABELS: Record<string, string> = {
  meals: 'Prepared Meals',
  vegetables: 'Vegetables',
  baked: 'Baked Goods',
  dairy: 'Dairy',
  fruits: 'Fruits',
  others: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  POSTED: styles.badge.available,
  MATCHED: styles.badge.matched,
  EXPIRED: styles.badge.expired,
  available: styles.badge.available,
  matched: styles.badge.matched,
  expired: styles.badge.expired,
};

export function getFoodTypeLabel(type: string): string {
  return FOOD_TYPE_LABELS[type] ?? type;
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? styles.badge.expired;
}
