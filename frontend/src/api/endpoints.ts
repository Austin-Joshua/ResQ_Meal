export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  foodPosts: '/food-posts',
  food: '/food',
  matches: '/matches',
  notifications: '/notifications',
  publicImpact: '/public/impact',
  health: '/health',
  upload: '/upload',
} as const;
