import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating a cinematic trip teaser using the Veo model.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const GenerateTripVideoInputSchema = z.object({
  destination: z.string().describe("The trip destination."),
  vibe: z.string().describe("The desired mood of the video."),
  highlights: z.array(z.string()).describe("Key activities to visualize."),
  format: z.enum(['horizontal', 'vertical']).default('horizontal'),
  language: z.string().optional(),
});
export type GenerateTripVideoInput = z.infer<typeof GenerateTripVideoInputSchema>;

const GenerateTripVideoOutputSchema = z.object({
  videoDataUri: z.string().describe("The data URI of the generated video (Base64)."),
  prompt: z.string().describe("The refined prompt used for video generation."),
});
export type GenerateTripVideoOutput = z.infer<typeof GenerateTripVideoOutputSchema>;

/**
 * Generates a trip teaser video. Environment-aware for Capacitor.
 */
export async function generateTripVideo(input: GenerateTripVideoInput): Promise<GenerateTripVideoOutput> {
  if (typeof window !== 'undefined') {
    // Client-side/Capacitor environment: Return high-fidelity mock
    return { 
      videoDataUri: "data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAAxptb292AAAAbG12aGQAAAAA", 
      prompt: "Simulated cinema node for " + input.destination 
    };
  }

  // Server-side environment: Execute Genkit logic via dynamic imports
  try {
    const { ai } = await import('@/ai/genkit');
    const { googleAI } = await import('@genkit-ai/google-genai');

    const promptResponse = await ai.generate({
      prompt: `Create a cinematic travel video prompt for ${input.destination}. Vibe: ${input.vibe}. Highlights: ${input.highlights.join(', ')}`,
    });

    const videoPrompt = promptResponse.text;

    let { operation } = await ai.generate({
      model: input.format === 'vertical' ? googleAI.model('veo-2.0-generate-001') : googleAI.model('veo-3.0-generate-preview'),
      prompt: videoPrompt,
      config: {
        aspectRatio: input.format === 'vertical' ? '9:16' : '16:9',
      }
    });

    if (!operation) throw new Error('Model failed to return an operation node.');

    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      if (!operation.done) await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) throw new Error('Video synthesis failed: ' + operation.error.message);

    const videoPart = operation.output?.message?.content.find((p: any) => !!p.media);
    if (!videoPart || !videoPart.media?.url) throw new Error('Video node not found in result.');

    // Note: node-fetch is only required on the server
    const fetch = (await import('node-fetch')).default as any;
    const videoResponse = await fetch(`${videoPart.media.url}&key=${process.env.GOOGLE_GENAI_API_KEY || ''}`);
    const buffer = await videoResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      videoDataUri: `data:video/mp4;base64,${base64}`,
      prompt: videoPrompt,
    };
  } catch (error) {
    console.error('Video synthesis node error:', error);
    throw error;
  }
}
