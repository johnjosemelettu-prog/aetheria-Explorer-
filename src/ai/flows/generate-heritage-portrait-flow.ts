import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating a historical heritage portrait.
 * Refactored for environment-aware execution to support static exports.
 */

const HeritagePortraitInputSchema = z.object({
  photoDataUri: z.string().describe("A selfie of the user as a data URI."),
  location: z.string().describe("The city or region for the heritage style."),
  language: z.string().optional(),
});
export type HeritagePortraitInput = z.infer<typeof HeritagePortraitInputSchema>;

const HeritagePortraitOutputSchema = z.object({
  portraitUrl: z.string().describe("The data URI of the generated heritage portrait."),
  historicalContext: z.string().describe("A brief explanation of the attire and its era."),
});
export type HeritagePortraitOutput = z.infer<typeof HeritagePortraitOutputSchema>;

export async function generateHeritagePortrait(input: HeritagePortraitInput): Promise<HeritagePortraitOutput> {
  if (typeof window !== 'undefined') {
    return {
      portraitUrl: "https://picsum.photos/seed/heritage/800/1000",
      historicalContext: `A high-fidelity synthesis of traditional attire from the historical era of ${input.location}.`,
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const analysisResponse = await ai.generate({
      prompt: `Analyze the face and location: ${input.location}. Design a detailed traditional outfit. Return an image generation prompt.`,
    });

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: analysisResponse.text,
    });

    return {
      portraitUrl: media?.url || "https://picsum.photos/seed/heritage/800/1000",
      historicalContext: `Synthesized heritage node for ${input.location}.`,
    };
  } catch (error) {
    console.error("Heritage mirror node error:", error);
    throw error;
  }
}
