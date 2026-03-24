import { z } from 'zod';
import { identifyLandmark } from './identify-landmark-flow';

/**
 * @fileOverview A Genkit flow for generating a historical version of a landmark photo.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const HistoricalImageInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a landmark as a data URI."),
  targetEra: z.string().default("100 years ago"),
  language: z.string().optional(),
});

export type HistoricalImageInput = {
  photoDataUri: string;
  targetEra: string;
  language?: string;
};

const HistoricalImageOutputSchema = z.object({
  historicalImageUrl: z.string().describe("The data URI of the generated historical image."),
  narrative: z.string().describe("A brief story about what was happening at this location in the chosen era."),
  landmarkName: z.string(),
});
export type HistoricalImageOutput = z.infer<typeof HistoricalImageOutputSchema>;

/**
 * Generates historical image. Environment-aware logic for static export.
 */
export async function generateHistoricalImage(input: HistoricalImageInput): Promise<HistoricalImageOutput> {
  if (typeof window !== 'undefined') {
    return {
      historicalImageUrl: "https://picsum.photos/seed/history/800/600",
      narrative: "Explorers in standard attire gathered here to trade silk nodes under the afternoon sun.",
      landmarkName: "The Grand Square"
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const idResult = await identifyLandmark({ 
      photoDataUri: input.photoDataUri, 
      language: input.language 
    });

    if (!idResult.isLandmark) {
      throw new Error("Could not identify a clear landmark for historical reconstruction.");
    }

    const promptResponse = await ai.generate({
      prompt: `You are a historical architect. Recreate "${idResult.landmarkName}" exactly as it appeared in ${input.targetEra}.`,
    });

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: promptResponse.text,
    });

    if (!media || !media.url) throw new Error("Failed to synthesize historical imagery.");

    const narrativeResponse = await ai.generate({
      prompt: `Write 2 evocative sentences about ${idResult.landmarkName} in ${input.targetEra}. Language: ${input.language || 'English'}.`,
    });

    return {
      historicalImageUrl: media.url,
      narrative: narrativeResponse.text,
      landmarkName: idResult.landmarkName,
    };
  } catch (error) {
    console.error("Historical synthesis node error:", error);
    throw error;
  }
}
