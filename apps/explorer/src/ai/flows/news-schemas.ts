
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

export const fallbackNews: GetTravelNewsOutput = {
  articles: [
    {
      title: 'Global Travel Trends 2026: Sustainable Tourism Takes Center Stage',
      summary: 'Travelers are increasingly prioritizing eco-friendly destinations and sustainable practices, leading to a surge in "slow travel" and carbon-neutral resort bookings worldwide.',
      source: 'World Travel Monitor',
      category: 'Sustainability',
      publishedDate: '2026-03-05',
    }
  ],
};
