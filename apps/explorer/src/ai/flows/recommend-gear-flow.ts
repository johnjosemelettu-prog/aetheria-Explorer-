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
      curationReasoning: `Optimized arsenal for ${input.destination} synthesized from local partner nodes.`,
      recommendedGear: [
        { id: 'gear-1', name: 'Nomad Pro Backpack', category: 'Luggage', price: 249, rating: 4.9, description: 'Smart tracking enabled. RFID protection and ergonomic weight distribution.', imageHint: 'tech backpack', partner: 'AeroLux' },
        { id: 'gear-2', name: 'Horizon Carry-on', category: 'Luggage', price: 599, rating: 4.8, description: 'Carbon fiber shell with integrated weight sensor and USB-C power.', imageHint: 'luxury suitcase', partner: 'Grand Explorer' },
        { id: 'gear-3', name: 'Noise Pods Elite', category: 'Electronics', price: 299, rating: 4.7, description: 'Active noise isolation with spatial travel soundscapes.', imageHint: 'earbuds', partner: 'Vortex Tech' },
        { id: 'gear-4', name: 'Global Node Adapter', category: 'Utility', price: 45, rating: 4.9, description: 'Universal power synthesis for 150+ countries with fast charging.', imageHint: 'universal adapter', partner: 'Aura Systems' },
        { id: 'gear-5', name: 'Memory Cloud Pillow', category: 'Wellness', price: 65, rating: 4.6, description: 'Biological support for long-haul recovery and neck stability.', imageHint: 'travel pillow', partner: 'ZenVoyager' },
        { id: 'gear-6', name: 'Compression Cubes', category: 'Utility', price: 85, rating: 4.8, description: 'Maximize luggage efficiency. 3-piece set with air-release tech.', imageHint: 'packing cubes', partner: 'Aura Systems' },
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Aetheria Gear Architect.' Curate a 6-item essential gear list for ${input.destination}. 
      Consider these events: ${input.events.join(', ')}. 
      Requirement: Suggest items from verified partner nodes.
      Output Language: ${input.language || 'English'}.`,
      output: { schema: RecommendGearOutputSchema },
    });

    if (!response.output) throw new Error("Gear curation failure.");
    return response.output;
  } catch (error) {
    console.error("Gear architect node error:", error);
    return {
        curationReasoning: "Standard supply node active.",
        recommendedGear: []
    }
  }
}
