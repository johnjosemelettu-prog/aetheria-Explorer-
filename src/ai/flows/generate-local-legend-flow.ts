/**
 * @fileOverview A Genkit flow for generating immersive local folklore based on GPS coordinates.
 */

import { z } from 'zod';

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
  audioDataUri: z.string().optional().describe("The narration audio."),
});
export type GenerateLocalLegendOutput = z.infer<typeof GenerateLocalLegendOutputSchema>;

export async function generateLocalLegend(input: GenerateLocalLegendInput): Promise<GenerateLocalLegendOutput> {
  if (typeof window !== 'undefined') {
    return {
      title: "The Spirit of the Golden Gate",
      story: "Legend tells of a celestial fox that guards the bridge, appearing only to those with pure intent during the summer fog.",
      imagePrompt: "An ethereal fox made of fog guarding a golden bridge at dawn, oil painting style.",
      imageUrl: "https://picsum.photos/seed/legend/800/600",
      audioDataUri: ""
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const { textToSpeech } = await import('./text-to-speech-flow');

    const legendResponse = await ai.generate({
      prompt: `Based on coordinates (${input.latitude}, ${input.longitude}), identify a nearby landmark and tell an immersive folklore story. Output in ${input.language || 'English'}.`,
      output: { schema: z.object({
        title: z.string(),
        story: z.string(),
        imagePrompt: z.string()
      })},
    });

    const legend = legendResponse.output!;

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: legend.imagePrompt,
    });

    let audioDataUri = '';
    try {
        const audioResult = await textToSpeech(legend.story);
        audioDataUri = audioResult.audioDataUri;
    } catch (e) {
        console.warn("TTS failed for legend.");
    }

    return {
      title: legend.title,
      story: legend.story,
      imagePrompt: legend.imagePrompt,
      imageUrl: media?.url || "https://picsum.photos/seed/legend/800/600",
      audioDataUri,
    };
  } catch (error) {
    console.error("Local legend synthesis failure:", error);
    throw error;
  }
}
