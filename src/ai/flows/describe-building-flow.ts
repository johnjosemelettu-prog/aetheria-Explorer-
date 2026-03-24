
/**
 * @fileOverview A Genkit flow for identifying a building from a photo and generating a description and a simulated VR view.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

import { z } from 'zod';

const DescribeBuildingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a building or landmark, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the output.'),
});
export type DescribeBuildingInput = z.infer<typeof DescribeBuildingInputSchema>;

const DescribeBuildingOutputSchema = z.object({
  description: z.string().describe('A detailed historical and architectural description of the identified building.'),
  vrImageUrl: z.string().describe('A data URI of a generated image simulating a 360-degree panoramic view from the location.'),
});
export type DescribeBuildingOutput = z.infer<typeof DescribeBuildingOutputSchema>;

export async function describeBuilding(
  input: DescribeBuildingInput
): Promise<DescribeBuildingOutput> {
  if (typeof window !== 'undefined') {
    // Client-side/Capacitor environment: Return high-fidelity mock
    return {
      description: "A breathtaking historical landmark synthesized from local architectural DNA. This node represents centuries of structural evolution.",
      vrImageUrl: "https://picsum.photos/seed/vr/1200/600",
    };
  }

  // Server-side environment: Execute Genkit logic via dynamic imports
  try {
    const { ai } = await import('@/ai/genkit');
    
    const identificationPrompt = ai.definePrompt({
        name: 'identifyBuildingPrompt',
        input: { schema: DescribeBuildingInputSchema },
        output: { schema: z.object({
            isBuilding: z.boolean().describe('Whether a building or landmark was identified in the image.'),
            buildingName: z.string().describe('The name of the identified building or landmark.'),
            description: z.string().describe('A detailed historical and architectural description of the building.'),
            vrImagePrompt: z.string().describe('A detailed prompt for an image generation model to create a photorealistic, 360-degree equirectangular panorama of the view from a key vantage point *inside* the location looking out.'),
        })},
        prompt: `You are an expert architect and historian. Analyze the provided image.
Identify the primary building or landmark in the image. If no clear landmark is visible, set isBuilding to false.
**Output Language:** {{language}}
Image: {{media url=photoDataUri}}`
    });

    const { output: idOutput } = await identificationPrompt(input);
    if (!idOutput || !idOutput.isBuilding) {
        throw new Error('Could not identify a building or landmark in the image.');
    }
    
    const response = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: idOutput.vrImagePrompt,
    });

    const media = response.media;
    if (!media || !media.url) throw new Error('Failed to generate VR image.');

    return {
      description: idOutput.description,
      vrImageUrl: media.url,
    };
  } catch (error) {
    console.error("Describe building node error:", error);
    throw error;
  }
}
