import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating artistic postcards from user photos.
 * Refactored for environment-aware execution to support static exports.
 */

const PostcardStyleSchema = z.enum(['Vintage', 'Oil Painting', 'Watercolor', 'Cyberpunk', 'Cinematic', 'Sketch']);

const GeneratePostcardInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a destination as a data URI (Base64)."),
  style: PostcardStyleSchema,
  message: z.string().optional().describe("A message to be included conceptually in the artwork context."),
  language: z.string().optional().describe("The user's preferred language."),
});
export type GeneratePostcardInput = z.infer<typeof GeneratePostcardInputSchema>;

const GeneratePostcardOutputSchema = z.object({
  postcardImageUrl: z.string().describe("The data URI of the generated artistic image."),
  description: z.string().describe("A poetic description of the transformed scene."),
});
export type GeneratePostcardOutput = z.infer<typeof GeneratePostcardOutputSchema>;

export async function generatePostcard(input: GeneratePostcardInput): Promise<GeneratePostcardOutput> {
  if (typeof window !== 'undefined') {
    return {
      postcardImageUrl: "https://picsum.photos/seed/postcard/800/600",
      description: `A beautiful ${input.style} synthesis of your travel memory.`,
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const analysisResponse = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: "Analyze this travel photo. Identify the key landmarks and natural features." }
      ],
    });

    const stylePromptMap: Record<string, string> = {
        'Vintage': 'a 1950s style vintage travel postcard',
        'Oil Painting': 'an impressionist oil painting',
        'Watercolor': 'a delicate watercolor painting',
        'Cyberpunk': 'a futuristic cyberpunk reimagining',
        'Cinematic': 'a cinematic movie still',
        'Sketch': 'a detailed hand-drawn architectural sketch'
    };

    const imagePrompt = `An artistic travel postcard. Style: ${stylePromptMap[input.style]}. Subject: ${analysisResponse.text}. Message vibe: ${input.message || 'Greetings'}. High quality art, 16:9 aspect ratio.`;

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: imagePrompt,
    });

    const captionResponse = await ai.generate({
        prompt: `Write a single, poetic sentence in ${input.language || 'English'} about a ${input.style} version of this location.`,
    });

    return {
      postcardImageUrl: media?.url || "https://picsum.photos/seed/postcard/800/600",
      description: captionResponse.text,
    };
  } catch (error) {
    console.error("Postcard synthesis node error:", error);
    throw error;
  }
}
