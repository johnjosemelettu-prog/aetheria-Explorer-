
export type SubscriptionTier = 'free' | 'voyager' | 'pathfinder' | 'sovereign' | 'legend';

export interface RouteRule {
  path: string;
  minTier: SubscriptionTier;
  exact?: boolean;
}

export const subscriptionRules: RouteRule[] = [
  { path: '/pathfinder', minTier: 'voyager' },
  { path: '/scanner', minTier: 'voyager' },
  { path: '/guide', minTier: 'voyager' },
  { path: '/ar-wayfinding', minTier: 'voyager' },
  { path: '/local-legends', minTier: 'voyager' },
  { path: '/cultural-pulse', minTier: 'voyager' },
  { path: '/audio-guide', minTier: 'voyager' },
  { path: '/video-teaser', minTier: 'voyager' },
  { path: '/postcard-studio', minTier: 'voyager' },
  { path: '/heritage-mirror', minTier: 'voyager' },
  { path: '/digital-tailor', minTier: 'voyager' },
  { path: '/carbon-synthesis', minTier: 'voyager' },
  { path: '/mood-synthesis', minTier: 'voyager' },
  { path: '/flavor-dna', minTier: 'voyager' },
  { path: '/biometric-sync', minTier: 'voyager' },
  { path: '/jet-lag', minTier: 'voyager' },
  { path: '/packing-assistant', minTier: 'voyager' },
  { path: '/visa-architect', minTier: 'voyager' },
  { path: '/esim', minTier: 'voyager' },
  { path: '/translator', minTier: 'voyager' },
  { path: '/gift-odyssey', minTier: 'voyager' },
  { path: '/video-brochure', minTier: 'voyager' },
  { path: '/vr-previews', minTier: 'voyager' },
  { path: '/wrapped', minTier: 'voyager' },
  { path: '/cabs', minTier: 'voyager' },
  { path: '/cruises', minTier: 'voyager' },
  { path: '/flights', minTier: 'voyager' },
  { path: '/dining', minTier: 'voyager' },
  { path: '/rentals', minTier: 'voyager' },
  { path: '/transit-connect', minTier: 'voyager' },
  { path: '/layover-odyssey', minTier: 'voyager' },
  { path: '/local-insider', minTier: 'voyager' },
  { path: '/culture-scout', minTier: 'voyager' },
  { path: '/haggling-coach', minTier: 'voyager' },
  { path: '/language-lab', minTier: 'voyager' },
  { path: '/menu-explorer', minTier: 'voyager' },
  { path: '/souvenir-storyteller', minTier: 'voyager' },
  { path: '/street-art-decoder', minTier: 'voyager' },
  { path: '/explorer-quests', minTier: 'pathfinder' },
  { path: '/loyalty', minTier: 'pathfinder' },
  { path: '/achievements', minTier: 'free' }, // Explicitly free
  { path: '/dashboard', minTier: 'free' },
  { path: '/profile', minTier: 'free' },
  { path: '/wallet', minTier: 'free' },
  { path: '/booking', minTier: 'free' },
  { path: '/marketplace', minTier: 'free' },
  { path: '/store', minTier: 'free' },
  { path: '/itinerary-generator', minTier: 'free' },
  { path: '/budget-synthesis', minTier: 'free' },
  { path: '/journal', minTier: 'free' },
  { path: '/trips', minTier: 'free' },
  { path: '/sos', minTier: 'free' },
  { path: '/cart', minTier: 'free' },
  { path: '/safety', minTier: 'free' },
  { path: '/faq', minTier: 'free' },
  { path: '/contact', minTier: 'free' },
  { path: '/corporate', minTier: 'free' },
  { path: '/legal', minTier: 'free' },
  { path: '/privacy', minTier: 'free' },
  { path: '/terms', minTier: 'free' },
  { path: '/news', minTier: 'free' },
  { path: '/partners', minTier: 'free' },
  { path: '/data-security', minTier: 'free' },
  { path: '/flight-status', minTier: 'free' },
  { path: '/insurance', minTier: 'free' },
  { path: '/scan-and-pay', minTier: 'voyager' },
  { path: '/street-food-roulette', minTier: 'voyager' },
  { path: '/soundtrack', minTier: 'voyager' },
  { path: '/events', minTier: 'free' },
  { path: '/brochure', minTier: 'free' },
];

export const tierHierarchy: Record<SubscriptionTier, number> = {
  'free': 0,
  'voyager': 1,
  'pathfinder': 2,
  'sovereign': 3,
  'legend': 4,
};

export function canAccess(userTier: SubscriptionTier, routePath: string): boolean {
  const rule = subscriptionRules.find(r => 
    r.exact ? routePath === r.path : routePath.startsWith(r.path)
  );
  
  if (!rule) return true; // Default to allow if no rule defined
  
  return tierHierarchy[userTier] >= tierHierarchy[rule.minTier];
}
