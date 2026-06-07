export type CardPucId = 'activity' | 'help' | 'weeklyTrend';

export const PAGE_ID_TO_PATH: Record<string, string> = {
  dashboard: '/Dashboard',
  freshness: '/Freshness',
  matches: '/NGO',
  elite: '/Elite',
  impact: '/Report',
  mealsSaved: '/Report/meals-saved',
  foodDiverted: '/Report/food-diverted',
  co2Prevented: '/Report/co2-prevented',
  waterSaved: '/Report/water-saved',
  about: '/About',
  settings: '/Settings',
};

/** "Did you know?" facts – one is picked at random each time the user logs in */
export const DID_YOU_KNOW_TIPS = [
  'Every 1 kg of food rescued saves ~2.5 kg CO₂ and helps feed someone in need.',
  'Roughly one third of food produced for human consumption is lost or wasted globally each year.',
  'Food waste in landfills produces methane, a greenhouse gas many times more potent than CO₂.',
  'Donating surplus food can reduce your organisation’s carbon footprint and support local communities.',
  'Rescuing just 10% of avoidable food waste could feed millions of people in need.',
  'Keeping surplus food in the “human consumption” loop saves water, energy, and land used to grow it.',
];

export function pickRandomTip() {
  return DID_YOU_KNOW_TIPS[Math.floor(Math.random() * DID_YOU_KNOW_TIPS.length)];
}
