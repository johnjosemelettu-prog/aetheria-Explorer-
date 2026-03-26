import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for parsing boarding pass details from an image.
 */

export const BoardingPassDetailsSchema = z.object({
  passengerName: z.string(),
  flight: z.string(),
  gate: z.string(),
  seat: z.string(),
  departureTime: z.string(),
});

export type BoardingPassDetails = z.infer<typeof BoardingPassDetailsSchema>;

export async function parseBoardingPass(input: {
  photoDataUri: string;
  language: string;
}): Promise<BoardingPassDetails> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const [mimeType, base64Data] = input.photoDataUri.split(';base64,');
    const actualMimeType = mimeType.replace('data:', '');

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: actualMimeType,
          },
        },
        {
          text: `Extract boarding pass details from this image.
          
          IMPORTANT: All text in the output MUST be in ${input.language}.`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passengerName: { type: Type.STRING },
            flight: { type: Type.STRING },
            gate: { type: Type.STRING },
            seat: { type: Type.STRING },
            departureTime: { type: Type.STRING },
          },
          required: ['passengerName', 'flight', 'gate', 'seat', 'departureTime'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text) as BoardingPassDetails;
  } catch (error) {
    console.error('Gemini parsing failed:', error);
    return getFallbackBoardingPass();
  }
}

function getFallbackBoardingPass(): BoardingPassDetails {
  return {
    passengerName: 'John Doe [FALLBACK]',
    flight: 'BA123',
    gate: 'B12',
    seat: '14A',
    departureTime: '2026-03-26T10:30:00Z',
  };
}
