import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for calculating travel carbon footprint and offset costs.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const CalculateCarbonFootprintInputSchema = z.object({
  travelType: z.enum(['flight', 'car', 'cruise', 'train']),
  distanceKm: z.number(),
  language: z.string().optional(),
});
export type CalculateCarbonFootprintInput = z.infer<typeof CalculateCarbonFootprintInputSchema>;

const CalculateCarbonFootprintOutputSchema = z.object({
  co2Tons: z.number().describe("The calculated metric tons of CO2."),
  offsetCostUsd: z.number().describe("The cost to offset this footprint in USD."),
  explanation: z.string().describe("A brief explanation of the impact and how the offset helps."),
  equivalentImpact: z.string().describe("A relatable comparison (e.g., 'equivalent to planting 5 trees')."),
});
export type CalculateCarbonFootprintOutput = z.infer<typeof CalculateCarbonFootprintOutputSchema>;

/**
 * Calculates carbon footprint. Environment-aware logic for static export.
 */
export async function calculateCarbonFootprint(input: CalculateCarbonFootprintInput): Promise<CalculateCarbonFootprintOutput> {
  if (typeof window !== 'undefined') {
    const co2 = (input.distanceKm * 0.00015);
    return {
      co2Tons: co2,
      offsetCostUsd: co2 * 20,
      explanation: `Calculated molecular impact for a ${input.travelType} journey of ${input.distanceKm}km.`,
      equivalentImpact: `Equivalent to planting ${Math.round(co2 * 5)} trees in the Amazon Basin.`
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are an environmental scientist specializing in travel sustainability.
      Calculate the carbon footprint for a ${input.travelType} journey of ${input.distanceKm} km.
      Output Language: ${input.language || 'English'}.`,
      output: { schema: CalculateCarbonFootprintOutputSchema },
    });

    if (!response.output) throw new Error("Failed to calculate carbon synthesis.");
    return response.output;
  } catch (error) {
    console.error("Carbon synthesis node error:", error);
    throw error;
  }
}
