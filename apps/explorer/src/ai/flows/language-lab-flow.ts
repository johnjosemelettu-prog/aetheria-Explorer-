import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating a custom language survival kit for a city.
 */

export const LanguageLabOutputSchema = z.object({
  survivalKit: z.array(z.object({
    phrase: z.string(),
    translation: z.string(),
    pronunciation: z.string(),
    category: z.string(),
  })),
  localSlang: z.array(z.object({
    word: z.string(),
    meaning: z.string(),
    vibe: z.string(),
  })),
});

export type LanguageLabOutput = z.infer<typeof LanguageLabOutputSchema>;

export async function generateSurvivalKit(input: {
  city: string;
  targetLanguage: string;
  userLanguage: string;
}): Promise<LanguageLabOutput> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are a Linguistic Survival Specialist. Generate a language survival kit and local slang for ${input.city}.
      Target Language: ${input.targetLanguage}.
      User Language: ${input.userLanguage}.
      
      IMPORTANT: The 'translation' and 'meaning' fields MUST be in ${input.userLanguage}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            survivalKit: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  pronunciation: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['phrase', 'translation', 'pronunciation', 'category'],
              },
            },
            localSlang: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  vibe: { type: Type.STRING },
                },
                required: ['word', 'meaning', 'vibe'],
              },
            },
          },
          required: ['survivalKit', 'localSlang'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text) as LanguageLabOutput;
  } catch (error) {
    console.error('Gemini synthesis failed:', error);
    return getFallbackSurvivalKit(input);
  }
}

function getFallbackSurvivalKit(input: { userLanguage: string }): LanguageLabOutput {
  return {
    survivalKit: [
      {
        phrase: 'Hello',
        translation: 'Hello',
        pronunciation: 'Hello',
        category: 'Social',
      },
    ],
    localSlang: [
      {
        word: 'Cool',
        meaning: 'Something nice.',
        vibe: 'General',
      },
    ],
  };
}
