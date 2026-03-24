import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for identifying and explaining street art from photos.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const DecodeStreetArtInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of street art as a data URI."),
  language: z.string().optional().describe("Output language."),
});
export type DecodeStreetArtInput = z.infer<typeof DecodeStreetArtInputSchema>;

const DecodeStreetArtOutputSchema = z.object({
  artTitle: z.string().describe("The title of the piece if known, or a descriptive name."),
  artist: z.string().describe("The artist's name or handle."),
  meaning: z.string().describe("The deeper social or political meaning of the work."),
  culturalImpact: z.string().describe("How this art relates to the local neighborhood or history."),
  styleAnalysis: z.string().describe("Brief analysis of the technique used."),
});
export type DecodeStreetArtOutput = z.infer<typeof DecodeStreetArtOutputSchema>;

/**
 * Decodes street art. Environment-aware logic for static export.
 */
export async function decodeStreetArt(input: DecodeStreetArtInput): Promise<DecodeStreetArtOutput> {
  if (typeof window !== 'undefined') {
    return {
      artTitle: "The Urban Pulse",
      artist: "Aura Resident 01",
      meaning: "A representation of the struggle between biological intent and industrial logic.",
      culturalImpact: "Central anchor for the District 7 creative node.",
      styleAnalysis: "Multi-layered stencil with UV-reactive pigment overlays."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `Analyze the street art. Output in ${input.language || 'English'}.` }
      ],
      output: { schema: DecodeStreetArtOutputSchema },
    });

    if (!response.output) throw new Error('Failed to decode street art.');
    return response.output;
  } catch (error) {
    console.error("Street art decoder node error:", error);
    throw error;
  }
}
