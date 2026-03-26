import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating custom explorer quests for a city.
 */

export const ExplorerQuestOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  quests: z.array(z.object({
    id: z.string(),
    task: z.string(),
    category: z.string(),
    hint: z.string(),
    points: z.number(),
  })),
});

export type ExplorerQuestOutput = z.infer<typeof ExplorerQuestOutputSchema>;

export async function generateExplorerQuest(input: {
  city: string;
  interests: string[];
  language: string;
}): Promise<ExplorerQuestOutput> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are the Urban Decryption Architect. Generate a high-stakes scavenger hunt (quests) for ${input.city}.
      Interests: ${input.interests.join(', ')}.
      
      IMPORTANT: All text in the output MUST be in ${input.language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            quests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  task: { type: Type.STRING },
                  category: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                },
                required: ['id', 'task', 'category', 'hint', 'points'],
              },
            },
          },
          required: ['title', 'description', 'quests'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text) as ExplorerQuestOutput;
  } catch (error) {
    console.error('Gemini synthesis failed:', error);
    return getFallbackQuest(input);
  }
}

function getFallbackQuest(input: { city: string; language: string }): ExplorerQuestOutput {
  return {
    title: `${input.city} Urban Decryption [FALLBACK]`,
    description: `A high-stakes scavenger hunt through the heart of ${input.city}. (Language: ${input.language})`,
    quests: [
      {
        id: 'q1',
        task: 'Locate the hidden shrine near the central station.',
        category: 'Culture',
        hint: 'Look for the red gates tucked behind the modern glass tower.',
        points: 150,
      },
    ],
  };
}
