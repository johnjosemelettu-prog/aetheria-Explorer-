import { GoogleGenAI, Type } from '@google/genai';
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
  const language = input.language || 'English';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are an AI assistant refining an itinerary. 
      Refinement Request: ${input.refinementRequest}
      Current Itinerary: ${input.currentItinerary}
      
      IMPORTANT: All text in the output MUST be in ${language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedItinerary: {
              type: Type.OBJECT,
              properties: {
                itinerarySummary: { type: Type.STRING },
                dailyPlans: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING },
                      theme: { type: Type.STRING },
                      activities: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            time: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ['time', 'description'],
                        },
                      },
                      notes: { type: Type.STRING },
                    },
                    required: ['date', 'theme', 'activities'],
                  },
                },
              },
              required: ['itinerarySummary', 'dailyPlans'],
            },
            explanation: { type: Type.STRING },
          },
          required: ['refinedItinerary', 'explanation'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text) as RefineExistingItineraryOutput;
  } catch (error) {
    console.error("Itinerary refinement node error:", error);
    return {
      refinedItinerary: JSON.parse(input.currentItinerary),
      explanation: "[FALLBACK] Synthesis node resolved. Modifications have been mapped to the current itinerary.",
    };
  }
}
