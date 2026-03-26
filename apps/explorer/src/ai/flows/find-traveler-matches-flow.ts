import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for finding nearby traveler matches.
 */

const FindTravelerMatchesInputSchema = z.object({
  vibe: z.string().describe('The user\'s selected "vibe".'),
  flight: z.string().describe('The user\'s flight number.'),
  terminal: z.string().describe('The user\'s current terminal.'),
  language: z.string().optional().describe('The language for the output.'),
});
export type FindTravelerMatchesInput = z.infer<typeof FindTravelerMatchesInputSchema>;

const TravelerSchema = z.object({
  id: z.string(),
  name: z.string(),
  vibe: z.string(),
  onSameFlight: z.boolean(),
  avatarUrl: z.string(),
});
export type Traveler = z.infer<typeof TravelerSchema>;

const FindTravelerMatchesOutputSchema = z.array(TravelerSchema);
export type FindTravelerMatchesOutput = z.infer<typeof FindTravelerMatchesOutputSchema>;

const mockTravelers: Traveler[] = [
  { id: 'user-1', name: 'Brenda', vibe: 'Networking', onSameFlight: true, avatarUrl: 'https://i.pravatar.cc/150?u=brenda' },
  { id: 'user-2', name: 'Carlos', vibe: 'Grab a coffee', onSameFlight: false, avatarUrl: 'https://i.pravatar.cc/150?u=carlos' },
  { id: 'user-3', name: 'Dana', vibe: 'Networking', onSameFlight: true, avatarUrl: 'https://i.pravatar.cc/150?u=dana' },
];

export async function findTravelerMatches(input: FindTravelerMatchesInput): Promise<FindTravelerMatchesOutput> {
  const language = input.language || 'English';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `You are a Social Connection Architect. Generate a list of 3-5 fictional travelers nearby in the terminal.
      User Vibe: ${input.vibe}.
      User Flight: ${input.flight}.
      User Terminal: ${input.terminal}.
      
      IMPORTANT: All text in the output (names, vibes) MUST be in ${language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              vibe: { type: Type.STRING },
              onSameFlight: { type: Type.BOOLEAN },
              avatarUrl: { type: Type.STRING },
            },
            required: ['id', 'name', 'vibe', 'onSameFlight', 'avatarUrl'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response text from Gemini');
    return JSON.parse(text) as FindTravelerMatchesOutput;
  } catch (error) {
    console.error("Matchmaking node error:", error);
    return mockTravelers;
  }
}
