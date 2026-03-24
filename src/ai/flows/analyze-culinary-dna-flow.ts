import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for analyzing a user's cumulative culinary history.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const CulinaryDnaInputSchema = z.object({
  foodHistory: z.array(z.object({
    dishName: z.string(),
    cuisine: z.string(),
    rating: z.number(),
    notes: z.string().optional(),
  })).describe("A list of dishes the user has rated or scanned."),
  currentDestination: z.string().describe("The city the user is currently exploring."),
  language: z.string().optional(),
});
export type CulinaryDnaInput = z.infer<typeof CulinaryDnaInputSchema>;

const CulinaryDnaOutputSchema = z.object({
  palateProfile: z.string().describe("A high-fidelity summary of the user's taste preferences."),
  dominantFlavors: z.array(z.string()).describe("e.g., 'Umami', 'Spicy', 'Floral'."),
  sensitivityAlert: z.string().describe("Warning about textures or ingredients the user likely dislikes."),
  nextDishRecommendation: z.object({
    name: z.string(),
    reasoning: z.string(),
    whereToFind: z.string().describe("Generic description of the type of place (e.g., 'Hidden Izakaya')."),
  }),
});
export type CulinaryDnaOutput = z.infer<typeof CulinaryDnaOutputSchema>;

/**
 * Analyzes culinary DNA. Environment-aware logic for static export.
 */
export async function analyzeCulinaryDna(input: CulinaryDnaInput): Promise<CulinaryDnaOutput> {
  if (typeof window !== 'undefined') {
    return {
      palateProfile: "A sophisticated explorer palate with a heavy lean towards Umami and Fermentation nodes.",
      dominantFlavors: ["Umami", "Spice", "Charred"],
      sensitivityAlert: "High sensitivity to overly processed dairy nodes detected.",
      nextDishRecommendation: {
        name: "Aged Wagyu Tataki",
        reasoning: "Matches your preference for intense protein synthesis and light searing.",
        whereToFind: "Back-alley Roppongi Speakeasy"
      }
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Aura Culinary Architect.' 
      Analyze the explorer's food history: ${JSON.stringify(input.foodHistory)}
      Current Destination: ${input.currentDestination}
      Output Language: ${input.language || 'English'}.`,
      output: { schema: CulinaryDnaOutputSchema },
    });

    if (!response.output) throw new Error("Culinary DNA synthesis failed.");
    return response.output;
  } catch (error) {
    console.error("Culinary DNA node error:", error);
    throw error;
  }
}
