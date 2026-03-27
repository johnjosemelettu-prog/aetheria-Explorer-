import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing personalized wardrobe recommendation emails.
 */

export async function synthesizeWardrobeEmail(input: any): Promise<any> {
  const language = input.language || 'English';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are a Personal Stylist & Travel Consultant. Synthesize a personalized wardrobe recommendation email for an upcoming trip.
      Destination: ${input.destination}.
      Duration: ${input.duration}.
      Style Preference: ${input.stylePreference || 'Casual'}.
      User Name: ${input.userName || 'Explorer'}.
      
      IMPORTANT: The email subject and body MUST be in ${language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['subject', 'body'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text);
  } catch (error) {
    console.error("Wardrobe email synthesis error:", error);
    return {
      subject: `Your Travel Wardrobe for ${input.destination} (${language})`,
      body: `We have curated a selection of items for your trip to ${input.destination}. (Fallback in ${language})`
    };
  }
}
