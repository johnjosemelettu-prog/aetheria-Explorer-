import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for curating travel gear.
 * Refactored for environment-aware execution to support static exports.
 */

const RecommendGearInputSchema = z.object({
  destination: z.string(),
  events: z.array(z.string()),
  language: z.string().optional(),
});
export type RecommendGearInput = z.infer<typeof RecommendGearInputSchema>;

const GearItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['Luggage', 'Electronics', 'Apparel', 'Wellness', 'Accessories', 'Footwear', 'Utility']),
  price: z.number(),
  rating: z.number(),
  description: z.string(),
  imageHint: z.string(),
  partner: z.string().optional(),
});

export type GearItem = z.infer<typeof GearItemSchema>;

const RecommendGearOutputSchema = z.object({
  curationReasoning: z.string(),
  recommendedGear: z.array(GearItemSchema),
});
export type RecommendGearOutput = z.infer<typeof RecommendGearOutputSchema>;

export async function recommendGear(input: RecommendGearInput): Promise<RecommendGearOutput> {
  if (typeof window !== 'undefined') {
    return {
      curationReasoning: `Optimized arsenal for ${input.destination}.`,
      recommendedGear: [
        { id: 'g1', name: "Smart Backpack", category: 'Luggage', price: 150, rating: 4.9, description: "Anti-theft node.", imageHint: "tech backpack" }
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Curate gear for ${input.destination}. Events: ${input.events.join(', ')}.`,
      output: { schema: RecommendGearOutputSchema },
    });

    if (!response.output) throw new Error("Gear curation failure.");
    return response.output;
  } catch (error) {
    console.error("Gear architect node error:", error);
    throw error;
  }
}
