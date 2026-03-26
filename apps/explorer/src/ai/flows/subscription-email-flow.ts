import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing personalized subscription confirmation emails.
 */

export async function synthesizeSubscriptionEmail(input: any): Promise<any> {
  const language = input.language || 'English';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are a Customer Success Specialist. Synthesize a personalized subscription confirmation email.
      Tier: ${input.tier}.
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
    console.error("Subscription email synthesis error:", error);
    return {
      subject: `Subscription Confirmed: ${input.tier} (${language})`,
      body: `Your access to the ${input.tier} tier has been activated. (Fallback in ${language})`
    };
  }
}
