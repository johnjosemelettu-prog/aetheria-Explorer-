
import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating immersive local folklore based on GPS coordinates.
 * Refactored for environment-aware execution to support static exports.
 */

const GenerateLocalLegendInputSchema = z.object({
  latitude: z.number().describe("User's current latitude."),
  longitude: z.number().describe("User's current longitude."),
  language: z.string().optional().describe("The language for the story."),
});
export type GenerateLocalLegendInput = z.infer<typeof GenerateLocalLegendInputSchema>;

const GenerateLocalLegendOutputSchema = z.object({
  title: z.string().describe("A catchy title for the legend."),
  story: z.string().describe("The immersive folklore story."),
  imagePrompt: z.string().describe("A prompt for an image generator."),
  imageUrl: z.string().describe("The data URI of the generated legend artwork."),
  audioDataUri: z.string().optional().describe("The synthesized audio narration data URI."),
});
export type GenerateLocalLegendOutput = z.infer<typeof GenerateLocalLegendOutputSchema>;

export async function generateLocalLegend(input: GenerateLocalLegendInput): Promise<GenerateLocalLegendOutput> {
  if (typeof window !== 'undefined') {
    return {
      title: "The Silent Sentinel",
      story: "Legend tells of a guardian node that only awakens when the grid is silent. It watches over explorers with pure intent.",
      imagePrompt: "A majestic ethereal wolf guarding a neon-lit futuristic city gate.",
      imageUrl: "https://picsum.photos/seed/legend/800/600",
      audioDataUri: "",
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const { output } = await ai.generate({
      prompt: `You are the 'Aetheria Storyteller.' Based on coordinates (${input.latitude}, ${input.longitude}), identify a nearby landmark and tell an immersive folklore story. 
      Requirements:
      1. Title: Compelling and mysterious.
      2. Story: 2 paragraphs of evocative prose.
      3. Image Prompt: Describe a visual representation for Imagen 4.
      Output Language: ${input.language || 'English'}.`,
      output: { schema: z.object({ title: z.string(), story: z.string(), imagePrompt: z.string() }) },
    });

    const legend = output!;

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: legend.imagePrompt,
    });

    return {
      ...legend,
      imageUrl: media?.url || "https://picsum.photos/seed/legend/800/600",
      audioDataUri: "", // In production, this would call textToSpeech
    };
  } catch (error) {
    console.error("Local legend node error:", error);
    throw error;
  }
}
