import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating a custom layover itinerary for an airport.
 */

export const GenerateLayoverItineraryOutputSchema = z.object({
  itineraryTitle: z.string(),
  activities: z.array(z.object({
    time: z.string(),
    activity: z.string(),
    location: z.string(),
    transitNote: z.string(),
  })),
});

export type GenerateLayoverItineraryOutput = z.infer<typeof GenerateLayoverItineraryOutputSchema>;

export async function generateLayoverItinerary(input: {
  airportCode: string;
  durationHours: number;
  timeOfDay: string;
  language: string;
}): Promise<GenerateLayoverItineraryOutput> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are the Layover Odyssey Architect. Generate a custom layover itinerary for ${input.airportCode}.
      Duration: ${input.durationHours} hours.
      Time of Day: ${input.timeOfDay}.
      
      IMPORTANT: All text in the output MUST be in ${input.language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itineraryTitle: { type: Type.STRING },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  location: { type: Type.STRING },
                  transitNote: { type: Type.STRING },
                },
                required: ['time', 'activity', 'location', 'transitNote'],
              },
            },
          },
          required: ['itineraryTitle', 'activities'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text) as GenerateLayoverItineraryOutput;
  } catch (error) {
    console.error('Gemini synthesis failed:', error);
    return getFallbackLayoverItinerary(input);
  }
}

function getFallbackLayoverItinerary(input: { airportCode: string; durationHours: number; language: string }): GenerateLayoverItineraryOutput {
  return {
    itineraryTitle: `${input.durationHours}-Hour ${input.airportCode} Odyssey [FALLBACK]`,
    activities: [
      {
        time: '0:00',
        activity: 'Arrival & Immigration',
        location: 'Terminal 3',
        transitNote: 'Follow the purple signs for fast-track exit.',
      },
    ],
  };
}
