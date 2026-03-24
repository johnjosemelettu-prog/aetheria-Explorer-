import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for curating paid tourism promotions based on user context.
 */

const PromotionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  partnerName: z.string(),
  partnerType: z.enum(['cobrand', 'affiliate', 'tourism_dept']),
  link: z.string(),
  ctaText: z.string(),
  badgeText: z.string(),
});

const GetPromotionsInputSchema = z.object({
  destination: z.string().optional().describe("Current or upcoming destination."),
  interests: z.array(z.string()).optional(),
  language: z.string().optional(),
});
export type GetPromotionsInput = z.infer<typeof GetPromotionsInputSchema>;

const GetPromotionsOutputSchema = z.object({
  promotions: z.array(PromotionSchema),
});
export type GetPromotionsOutput = z.infer<typeof GetPromotionsOutputSchema>;

const fallbackPromos: GetPromotionsOutput = {
  promotions: [
    {
      id: 'fallback-1',
      title: 'Visit France: The Art of Living',
      description: 'Discover the hidden chateaus and culinary secrets of the Loire Valley with an exclusive explorer pass.',
      imageUrl: 'https://picsum.photos/seed/promo-france/800/400',
      partnerName: 'Visit France',
      partnerType: 'tourism_dept',
      link: 'https://www.france.fr',
      ctaText: 'Explore Deeper',
      badgeText: 'Official Partner',
    },
    {
      id: 'fallback-2',
      title: 'Patagonia x Backpacker: Gear for the Extremes',
      description: 'Upgrade your adventure arsenal with sustainable technical shells designed for the modern nomad.',
      imageUrl: 'https://picsum.photos/seed/promo-patagonia/800/400',
      partnerName: 'Patagonia',
      partnerType: 'cobrand',
      link: 'https://www.patagonia.com',
      ctaText: 'Secure Gear',
      badgeText: 'Limited Offer',
    }
  ]
};

export async function getPromotions(input: GetPromotionsInput): Promise<GetPromotionsOutput> {
  if (typeof window !== 'undefined') {
    return fallbackPromos;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Backpacker Partnership Curator.' Synthesize 3 paid tourism promotions. Destination: ${input.destination || 'Global'}. Language: ${input.language || 'English'}.`,
      output: { schema: GetPromotionsOutputSchema },
    });

    return response.output || fallbackPromos;
  } catch (error) {
    console.warn('getPromotions AI call failed. Returning fallback data.');
    return fallbackPromos;
  }
}
