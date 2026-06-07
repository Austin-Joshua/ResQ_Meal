export const ROUTES = {
  HOME: '/',
  SIGNUP: '/Signup',
  DASHBOARD: '/Dashboard',
  FRESHNESS: '/Freshness',
  NGO: '/NGO',
  ELITE: '/Elite',
  REPORT: '/Report',
  REPORT_MEALS_SAVED: '/Report/meals-saved',
  REPORT_FOOD_DIVERTED: '/Report/food-diverted',
  REPORT_CO2_PREVENTED: '/Report/co2-prevented',
  REPORT_WATER_SAVED: '/Report/water-saved',
  ABOUT: '/About',
  SETTINGS: '/Settings',
  ADMIN: '/Admin',
  MAP: '/map',
  IMPACT: '/impact',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const PROTECTED_APP_PATHS: readonly string[] = [
  ROUTES.DASHBOARD,
  ROUTES.FRESHNESS,
  ROUTES.NGO,
  ROUTES.ELITE,
  ROUTES.REPORT,
  ROUTES.REPORT_MEALS_SAVED,
  ROUTES.REPORT_FOOD_DIVERTED,
  ROUTES.REPORT_CO2_PREVENTED,
  ROUTES.REPORT_WATER_SAVED,
  ROUTES.ABOUT,
  ROUTES.SETTINGS,
  ROUTES.ADMIN,
  ROUTES.MAP,
];

export function isAppPath(pathname: string): boolean {
  return PROTECTED_APP_PATHS.includes(pathname) || pathname.startsWith('/Report/');
}
