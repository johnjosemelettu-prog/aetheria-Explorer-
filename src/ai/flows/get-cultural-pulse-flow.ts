import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for getting the current cultural pulse of a city.
 * Refactored for environment-aware execution to support static exports.
 */

const CulturalPulseInputSchema = z.object({
  city: z.string(),
  language: z.string().optional(),
});
export type CulturalPulseInput = z.infer<typeof CulturalPulseInputSchema>;

const CulturalPulseOutputSchema = z.object({
  currentVibe: z.string(),
  localSounds: z.object({
    genre: z.string(),
    description: z.string(),
    suggestedArtists: z.array(z.string()),
  }),
  seasonalTreat: z.object({
    name: z.string(),
    description: z.string(),
  }),
  localWisdom: z.string(),
});
export type CulturalPulseOutput = z.infer<typeof CulturalPulseOutputSchema>;

export async function getCulturalPulse(input: CulturalPulseInput): Promise<CulturalPulseOutput> {
  if (typeof window !== 'undefined') {
    return {
      currentVibe: `The atmosphere in ${input.city} is vibrant and transitional.`,
      localSounds: {
        genre: "Neo-Folk Fusion",
        description: "Traditional nodes meeting modern synthesis.",
        suggestedArtists: ["Local Node 01", "City Vibe Collective"]
      },
      seasonalTreat: { name: "Seasonal Specialty", description: "A high-fidelity local snack." },
      localWisdom: "Walk slow, see more."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Analyze the cultural pulse of ${input.city} for today.`,
      output: { schema: CulturalPulseOutputSchema },
    });

    if (!response.output) throw new Error("Failed to capture pulse.");
    return response.output;
  } catch (error) {
    console.error("Cultural pulse node error:", error);
    throw error;
  }
}
