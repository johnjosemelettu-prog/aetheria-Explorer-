import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for identifying a landmark.
 * Refactored for environment-aware execution to support static exports.
 */

const IdentifyLandmarkInputSchema = z.object({
  photoDataUri: z.string(),
  language: z.string().optional(),
});
export type IdentifyLandmarkInput = z.infer<typeof IdentifyLandmarkInputSchema>;

const IdentifyLandmarkOutputSchema = z.object({
  landmarkName: z.string(),
  isLandmark: z.boolean(),
});
export type IdentifyLandmarkOutput = z.infer<typeof IdentifyLandmarkOutputSchema>;

export async function identifyLandmark(input: IdentifyLandmarkInput): Promise<IdentifyLandmarkOutput> {
  if (typeof window !== 'undefined') {
    return { landmarkName: "Historical Monument", isLandmark: true };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `Identify the primary landmark in this image. Output in ${input.language || 'English'}.` }
      ],
      output: { schema: IdentifyLandmarkOutputSchema },
    });

    if (!response.output) throw new Error("Identification failed.");
    return response.output;
  } catch (error) {
    console.error("Landmark identification node error:", error);
    return { landmarkName: "Unknown Landmark", isLandmark: false };
  }
}
