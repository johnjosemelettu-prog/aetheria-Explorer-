import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating a bespoke packing checklist.
 * Refactored for environment-aware execution to support static exports.
 */

const PackingListInputSchema = z.object({
  destination: z.string().describe("The travel destination."),
  itinerarySummary: z.string().describe("A summary of the trip activities."),
  weatherContext: z.string().describe("Predicted weather."),
  language: z.string().optional().describe("The language for the output."),
});
export type PackingListInput = z.infer<typeof PackingListInputSchema>;

const PackingItemSchema = z.object({
  item: z.string(),
  reason: z.string(),
  category: z.enum(['Clothing', 'Gear', 'Documents', 'Toiletries', 'Miscellaneous']),
});

const PackingListOutputSchema = z.object({
  summary: z.string(),
  items: z.array(PackingItemSchema),
});
export type PackingListOutput = z.infer<typeof PackingListOutputSchema>;

/**
 * Generates a bespoke packing checklist. Environment-aware for static export.
 */
export async function generatePackingList(input: PackingListInput): Promise<PackingListOutput> {
  if (typeof window !== 'undefined') {
    return {
      summary: "A proactive packing strategy for your journey.",
      items: [
        { item: "Lightweight Layers", reason: "Suitable for variable climates.", category: 'Clothing' },
        { item: "Universal Adapter", reason: "Required for local power nodes.", category: 'Gear' },
        { item: "Comfortable Sneakers", reason: "For high-velocity city exploration.", category: 'Clothing' },
        { item: "Identity Manifest", reason: "Required for crossing border nodes.", category: 'Documents' },
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Forgot Nothing Agent.' 
      Destination: ${input.destination}
      Activities: ${input.itinerarySummary}
      Weather: ${input.weatherContext}
      Output Language: ${input.language || 'English'}.
      
      Requirements:
      1. Category items logically (Clothing, Gear, etc.)
      2. Provide a brief logic/reason for each item.
      3. Summary: A short, encouraging synthesis of the strategy.`,
      output: { schema: PackingListOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize manifest.");
    return response.output;
  } catch (error) {
    console.error("Packing assistant node error:", error);
    throw error;
  }
}
