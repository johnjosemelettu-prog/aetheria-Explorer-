
/**
 * @fileOverview A Genkit flow for fetching the latest travel industry news.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

import { z } from 'zod';

const NewsArticleSchema = z.object({
  title: z.string(),
  summary: z.string(),
  source: z.string(),
  category: z.string(),
  publishedDate: z.string(),
});

const GetTravelNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});

export type GetTravelNewsOutput = z.infer<typeof GetTravelNewsOutputSchema>;

const fallbackNews: GetTravelNewsOutput = {
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

export async function getTravelNews(input?: { language?: string }): Promise<GetTravelNewsOutput> {
  if (typeof window !== 'undefined') {
    return fallbackNews;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const language = input?.language || 'English';
    
    const response = await ai.generate({
      prompt: `You are an expert travel industry analyst. Find and summarize the top 5 most significant travel news stories from the past 3 weeks. Output Language: ${language}`,
      output: { schema: GetTravelNewsOutputSchema },
    });

    return response.output || fallbackNews;
  } catch (error) {
    console.error('getTravelNews AI call failed. Using fallback data.', error);
    return fallbackNews;
  }
}
