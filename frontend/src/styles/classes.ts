export const styles = {
  card: 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4',
  input:
    'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent',
  badge: {
    available: 'bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full',
    matched: 'bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full',
    expired: 'bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full',
  },
} as const;
