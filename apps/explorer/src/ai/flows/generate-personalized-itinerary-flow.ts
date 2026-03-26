
import { GoogleGenAI, Type } from '@google/genai';
import {
  type GeneratePersonalizedItineraryInput,
  type GeneratePersonalizedItineraryOutput,
  GeneratePersonalizedItineraryOutputSchema,
} from './itinerary-schemas';

/**
 * Environment-aware synthesis for the Itinerary flow.
 */
export async function generatePersonalizedItinerary(
  input: GeneratePersonalizedItineraryInput
): Promise<GeneratePersonalizedItineraryOutput> {
  const language = input.language || 'English';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are the Aura Odyssey Architect. Generate a high-fidelity itinerary for ${input.destination}.
      Interests: ${input.interests.join(', ')}.
      Budget: ${input.budget}.
      Travel Style: ${input.travelStyle.join(', ')}.
      Vibe: ${input.vibe || 'N/A'}.
      Start Date: ${input.startDate}.
      End Date: ${input.endDate}.
      
      IMPORTANT: All text in the output MUST be in ${language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
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
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text) as GeneratePersonalizedItineraryOutput;
  } catch (error) {
    console.error('Gemini synthesis failed:', error);
    return getFallbackItinerary(input);
  }
}

function getFallbackItinerary(input: GeneratePersonalizedItineraryInput): GeneratePersonalizedItineraryOutput {
  const language = input.language || 'English';
  return {
    itinerarySummary: `[FALLBACK] A curated journey to ${input.destination} focusing on ${input.interests.join(', ')}. (Language: ${language})`,
    dailyPlans: [
      {
        date: input.startDate,
        theme: "Arrival & Orientation",
        activities: [
          { time: "10:00 AM", description: `Arrival in ${input.destination} and transfer to your hub.` },
          { time: "01:00 PM", description: "Lunch at a local marketplace." },
          { time: "03:00 PM", description: `Visit a primary landmark node.` }
        ],
        notes: "Recalibrate to local time nodes."
      }
    ]
  };
}
