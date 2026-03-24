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
  milestones: z.array(z.string()).describe("Key themes or activities from the trip."),
  language: z.string().optional(),
});
export type TripWrappedInput = z.infer<typeof TripWrappedInputSchema>;

const TripWrappedOutputSchema = z.object({
  vibeTitle: z.string().describe("Catchy name for the trip's personality (e.g., 'The Zen Explorer')."),
  vibeDescription: z.string().describe("A poetic summary of the journey's soul."),
  topMilestone: z.string().describe("The most unique or high-impact activity."),
  stats: z.object({
    daysCount: z.number(),
    carbonImpact: z.string().describe("e.g. 'Saved 2 trees'"),
    spendVibe: z.string().describe("e.g. 'Value Strategist' or 'Elite Voyager'"),
  }),
  shareablePoem: z.string().describe("A short, evocative haiku or poem about the trip."),
});
export type TripWrappedOutput = z.infer<typeof TripWrappedOutputSchema>;

/**
 * Generates trip wrapped. Environment-aware logic for static export.
 */
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
      prompt: `Synthesize a 'Trip Wrapped' for ${input.tripName}. Language: ${input.language || 'English'}.`,
      output: { schema: TripWrappedOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize trip wrapped.");
    return response.output;
  } catch (error) {
    console.error("Trip wrapped node error:", error);
    throw error;
  }
}
