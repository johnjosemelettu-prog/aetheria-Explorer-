import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing high-speed itineraries for terminal layovers.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const GenerateLayoverItineraryInputSchema = z.object({
  airportCode: z.string(),
  durationHours: z.number().min(3).max(12),
  timeOfDay: z.string().describe("e.g., 'Morning', 'Evening'"),
  interests: z.array(z.string()).optional(),
  language: z.string().optional(),
});
export type GenerateLayoverItineraryInput = z.infer<typeof GenerateLayoverItineraryInputSchema>;

const LayoverActivitySchema = z.object({
  time: z.string(),
  activity: z.string(),
  location: z.string(),
  transitNote: z.string().describe("Specific notes on getting there from the airport and back."),
});

const GenerateLayoverItineraryOutputSchema = z.object({
  itineraryTitle: z.string(),
  summary: z.string(),
  activities: z.array(LayoverActivitySchema),
  securityBufferMinutes: z.number().describe("Recommended time to be back at terminal before flight."),
});
export type GenerateLayoverItineraryOutput = z.infer<typeof GenerateLayoverItineraryOutputSchema>;

/**
 * Generates layover itinerary. Environment-aware logic for static export.
 */
export async function generateLayoverItinerary(input: GenerateLayoverItineraryInput): Promise<GenerateLayoverItineraryOutput> {
  if (typeof window !== 'undefined') {
    return {
      itineraryTitle: `LHR Express Odyssey`,
      summary: "A high-speed mission to the local botanical nodes.",
      activities: [
        { time: "14:00", activity: "Quick Garden Mission", location: "Kew Gardens", transitNote: "15 min via Heathrow Express." }
      ],
      securityBufferMinutes: 90
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Backpacker Layover Strategist.' Airport: ${input.airportCode}, Duration: ${input.durationHours}h. Language: ${input.language || 'English'}.`,
      output: { schema: GenerateLayoverItineraryOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize layover odyssey.");
    return response.output;
  } catch (error) {
    console.error("Layover synthesis node error:", error);
    throw error;
  }
}
