import {
  type RecommendWardrobeInput,
  type RecommendWardrobeOutput,
  fallbackWardrobe,
} from './wardrobe-schemas';

/**
 * @fileOverview A Genkit flow for recommending a travel wardrobe.
 * Refactored for environment-aware execution to support static exports.
 */

export async function recommendWardrobe(
  input: RecommendWardrobeInput
): Promise<RecommendWardrobeOutput> {
  if (typeof window !== 'undefined') {
    return fallbackWardrobe;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const { RecommendWardrobeOutputSchema } = await import('./wardrobe-schemas');

    const response = await ai.generate({
      prompt: `You are an expert fashion stylist. Create a personalized, rentable travel wardrobe for ${input.tripContext.destination}. 
      Vibe: ${input.styleVibe.lovedLooks.join(', ')}. 
      Weather: ${input.tripContext.predictedWeather}.
      Output Language: ${input.language || 'English'}.`,
      output: { schema: RecommendWardrobeOutputSchema },
    });

    if (!response.output) {
      return fallbackWardrobe;
    }

    return response.output;
  } catch (error) {
    console.error('recommendWardrobe AI node error. Returning fallback.', error);
    return fallbackWardrobe;
  }
}
