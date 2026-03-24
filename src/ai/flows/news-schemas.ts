
import { z } from 'zod';

/**
 * @fileOverview Universal schemas for the Travel News feature.
 */

export const GetTravelNewsInputSchema = z.object({
  language: z.string().optional().describe('The language for the output.'),
});

export type GetTravelNewsInput = z.infer<typeof GetTravelNewsInputSchema>;

export const NewsArticleSchema = z.object({
  title: z.string().describe('A concise, compelling headline for the news article.'),
  summary: z.string().describe('A one-paragraph summary of the key points of the article.'),
  source: z.string().describe('The original source of the news (e.g., "Reuters", "Skift", "CNN Travel").'),
  category: z.string().describe('A relevant category, e.g., "Aviation", "Hospitality", "Technology", "Sustainability".'),
  publishedDate: z.string().describe('The approximate publication date in YYYY-MM-DD format.'),
});

export const GetTravelNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});

export type GetTravelNewsOutput = z.infer<typeof GetTravelNewsOutputSchema>;

const getRecentDate = (daysAgo: number) => {
  if (typeof window === 'undefined') return '2026-03-01';
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const fallbackNews: GetTravelNewsOutput = {
  articles: [
    {
      title: 'Global Travel Trends 2025: Sustainable Tourism Takes Center Stage',
      summary: 'Travelers are increasingly prioritizing eco-friendly destinations and sustainable practices, leading to a surge in "slow travel" and carbon-neutral resort bookings worldwide.',
      source: 'World Travel Monitor',
      category: 'Sustainability',
      publishedDate: '2026-03-05',
    },
    {
      title: 'Major Airlines Announce New Transatlantic Routes for Summer Season',
      summary: 'Several leading carriers have unveiled expanded schedules for the upcoming peak season, including new direct flights to secondary European cities from major North American hubs.',
      source: 'Aviation Daily',
      category: 'Aviation',
      publishedDate: '2026-03-04',
    },
    {
      title: 'Hyper-Personalization: How AI is Reshaping the Hotel Guest Experience',
      summary: 'From AI-powered room settings to custom-tailored local guides, the hospitality sector is leveraging generative AI to provide deeply personalized experiences for every traveler.',
      source: 'Hospitality Tech',
      category: 'Technology',
      publishedDate: '2026-03-03',
    },
    {
      title: 'Hidden Gems: Why "Dupe Destinations" are Trending in 2025',
      summary: 'Social media trends are driving travelers toward more affordable, less crowded alternatives to iconic tourist spots, such as choosing Taipei over Tokyo or Girona over Barcelona.',
      source: 'Travel Explorer',
      category: 'Tourism',
      publishedDate: '2026-03-02',
    },
    {
      title: 'Digital Nomad Visas: More Countries Join the Remote Work Revolution',
      summary: 'Two more nations have introduced specialized visas for remote workers, offering simplified residency requirements and tax incentives to attract high-earning digital professionals.',
      source: 'Global Nomad Network',
      category: 'Work & Travel',
      publishedDate: '2026-03-01',
    }
  ],
};
