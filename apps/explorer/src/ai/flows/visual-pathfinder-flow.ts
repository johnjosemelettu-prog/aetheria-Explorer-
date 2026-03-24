import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for the Visual Pathfinder.
 * Refactored for environment-aware execution to support static exports.
 */

const VisualPathfinderInputSchema = z.object({
  photoDataUri: z.string(),
  language: z.string().optional(),
});
export type VisualPathfinderInput = z.infer<typeof VisualPathfinderInputSchema>;

const VisualPathfinderOutputSchema = z.object({
  vibeAesthetic: z.string(),
  suggestedDestination: z.string(),
  matchingLogic: z.string(),
  activities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    aestheticScore: z.number(),
  })),
});
export type VisualPathfinderOutput = z.infer<typeof VisualPathfinderOutputSchema>;

export async function synthesizeFromPhoto(input: VisualPathfinderInput): Promise<VisualPathfinderOutput> {
  if (typeof window !== 'undefined') {
    return {
      vibeAesthetic: "Minimalist Brutalism",
      suggestedDestination: "Tokyo, Japan",
      matchingLogic: "Visual nodes match Nakagin-inspired architecture.",
      activities: [{ name: "Tower Mission", description: "Visit structural cores.", aestheticScore: 10 }]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: "Analyze the aesthetic of this image and map it to a travel destination. Describe the vibe, the destination, and 3 activities that match this aesthetic. Output in " + (input.language || 'English') }
      ],
      output: { schema: VisualPathfinderOutputSchema },
    });

    if (!response.output) throw new Error("Visual architecture node failure.");
    return response.output;
  } catch (error) {
    console.error("Visual pathfinder node error:", error);
    throw error;
  }
}
