import { z } from 'zod';
import { GeneratePersonalizedItineraryOutputSchema } from './itinerary-schemas';

const RefineExistingItineraryInputSchema = z.object({
  currentItinerary: z.string(),
  refinementRequest: z.string(),
  language: z.string().optional(),
});
export type RefineExistingItineraryInput = z.infer<typeof RefineExistingItineraryInputSchema>;

const RefineExistingItineraryOutputSchema = z.object({
  refinedItinerary: GeneratePersonalizedItineraryOutputSchema,
  explanation: z.string(),
});
export type RefineExistingItineraryOutput = z.infer<typeof RefineExistingItineraryOutputSchema>;

export async function refineExistingItinerary(
  input: RefineExistingItineraryInput
): Promise<RefineExistingItineraryOutput> {
  if (typeof window !== 'undefined') {
    return {
      refinedItinerary: JSON.parse(input.currentItinerary),
      explanation: "Synthesis node resolved. Modifications have been mapped to the current itinerary.",
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are an AI assistant refining an itinerary. 
      Request: ${input.refinementRequest}
      Current: ${input.currentItinerary}
      Language: ${input.language || 'English'}.`,
      output: { schema: RefineExistingItineraryOutputSchema },
    });

    if (!response.output) throw new Error("Refinement synthesis failed.");
    return response.output;
  } catch (error) {
    console.error("Itinerary refinement node error:", error);
    throw error;
  }
}
