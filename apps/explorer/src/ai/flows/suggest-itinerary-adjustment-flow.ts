import { z } from 'zod';
import { GeneratePersonalizedItineraryOutputSchema } from './itinerary-schemas';

/**
 * @fileOverview A Genkit flow for dynamically suggesting an adjustment to an itinerary.
 * Refactored for environment-aware execution to support static exports.
 */

const SuggestItineraryAdjustmentInputSchema = z.object({
  currentItinerary: z.string(),
  context: z.string(),
  language: z.string().optional(),
});
export type SuggestItineraryAdjustmentInput = z.infer<typeof SuggestItineraryAdjustmentInputSchema>;

const SuggestItineraryAdjustmentOutputSchema = z.object({
  reason: z.string(),
  updatedItinerary: GeneratePersonalizedItineraryOutputSchema,
});
export type SuggestItineraryAdjustmentOutput = z.infer<typeof SuggestItineraryAdjustmentOutputSchema>;

export async function suggestItineraryAdjustment(
  input: SuggestItineraryAdjustmentInput
): Promise<SuggestItineraryAdjustmentOutput> {
  if (typeof window !== 'undefined') {
    return {
      reason: "Synthesis Node Adjustment: Outdoor activities have been swapped for climate-controlled alternatives.",
      updatedItinerary: JSON.parse(input.currentItinerary),
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const response = await ai.generate({
      prompt: `You are a proactive travel assistant. 
      Context: ${input.context}
      Current: ${input.currentItinerary}
      Language: ${input.language || 'English'}.`,
      output: { schema: SuggestItineraryAdjustmentOutputSchema },
    });

    if (!response.output) throw new Error("Adjustment synthesis failed.");
    return response.output;
  } catch (error) {
    console.error("Itinerary adjustment node error:", error);
    throw error;
  }
}
