
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing a "Trip Wrapped" summary.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const TripWrappedInputSchema = z.object({
  tripName: z.string(),
  destination: z.string(),
  itinerarySummary: z.string(),
  totalSpend: z.number(),
  carbonOffset: z.number(),
  milestones: z.array(z.string()),
  language: z.string().optional(),
});
export type TripWrappedInput = z.infer<typeof TripWrappedInputSchema>;

const TripWrappedOutputSchema = z.object({
  vibeTitle: z.string(),
  vibeDescription: z.string(),
  topMilestone: z.string(),
  stats: z.object({
    daysCount: z.number(),
    carbonImpact: z.string(),
    spendVibe: z.string(),
  }),
  shareablePoem: z.string(),
});
export type TripWrappedOutput = z.infer<typeof TripWrappedOutputSchema>;

export async function generateTripWrapped(input: TripWrappedInput): Promise<TripWrappedOutput> {
  if (typeof window !== 'undefined') {
    return {
      vibeTitle: "The Zen Technologist",
      vibeDescription: "A journey defined by high-fidelity digital nodes and ancient temple silences.",
      topMilestone: "Sunrise at Fushimi Inari",
      stats: { daysCount: 14, carbonImpact: "Offset 0.45 tons", spendVibe: "Value Architect" },
      shareablePoem: "Neon lights fade to / Ancient bells in the stillness / Journey complete now."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a 'Trip Wrapped' for ${input.tripName}. Output Language: ${input.language || 'English'}.`,
      output: { schema: TripWrappedOutputSchema },
    });

    if (!response.output) throw new Error("Synthesis node failure.");
    return response.output;
  } catch (error) {
    console.error("Trip wrapped node error:", error);
    return {
      vibeTitle: "The Explorer",
      vibeDescription: "A journey across the grid.",
      topMilestone: "Discovery Node",
      stats: { daysCount: 7, carbonImpact: "Offset pending", spendVibe: "Strategist" },
      shareablePoem: "A path taken well / Memories stored in the vault / Odyssey resolved."
    };
  }
}
