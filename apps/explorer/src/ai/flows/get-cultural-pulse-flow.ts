
/**
 * @fileOverview A cultural pulse flow that captures the rhythm of a city.
 */

import { z } from 'zod';

const CulturalPulseInputSchema = z.object({
  city: z.string(),
  language: z.string().optional(),
});
export type CulturalPulseInput = z.infer<typeof CulturalPulseInputSchema>;

const CulturalPulseOutputSchema = z.object({
  currentVibe: z.string().describe("Summary of the city's current atmosphere."),
  localSounds: z.object({
    genre: z.string(),
    description: z.string(),
    suggestedArtists: z.array(z.string()),
  }),
  seasonalTreat: z.object({
    name: z.string(),
    description: z.string(),
  }),
  localWisdom: z.string().describe("A short piece of local advice."),
});
export type CulturalPulseOutput = z.infer<typeof CulturalPulseOutputSchema>;

export async function getCulturalPulse(input: CulturalPulseInput): Promise<CulturalPulseOutput> {
  if (typeof window !== 'undefined') {
    return {
      currentVibe: "A vibrant synthesis of nocturnal neon and morning market nodes.",
      localSounds: {
        genre: "Neo-Folk Fusion",
        description: "High-fidelity traditional instruments meeting digital bass nodes.",
        suggestedArtists: ["Aura Node 01", "The Grid Collective"]
      },
      seasonalTreat: { name: "Lunar Dumplings", description: "Soft dough nodes filled with sweet bean synthesis." },
      localWisdom: "Walk without intent, and the destination will reveal itself."
    };
  }

  const { ai } = await import('@/ai/genkit');
  const { output } = await ai.generate({
    prompt: `Analyze the real-time cultural pulse of ${input.city}.
    Capture the current atmosphere, trending local music nodes, and a seasonal delicacy.
    Output Language: ${input.language || 'English'}.`,
    output: { schema: CulturalPulseOutputSchema },
  });

  return output!;
}
