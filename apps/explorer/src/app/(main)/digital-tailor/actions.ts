'use server'

import { recommendWardrobe } from '@/ai/flows/recommend-wardrobe-flow';
import { RecommendWardrobeInput, RecommendWardrobeOutput } from '@/ai/flows/wardrobe-schemas';
import { z } from 'zod';

export async function generateWardrobeAction(input: RecommendWardrobeInput): Promise<RecommendWardrobeOutput> {
  return recommendWardrobe(input);
}

const BodyScanSchema = z.object({
  fitPreference: z.enum(['slim', 'regular', 'relaxed', 'oversized']),
  detectedFeatures: z.array(z.string()),
});

export async function analyzeBodyScanAction(imageBase64: string) {
  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: 'Analyze this image of a person to recommend clothing fit preference. Return fitPreference (slim, regular, relaxed, oversized) and a list of detectedFeatures (e.g. broad shoulders).',
      messages: [
        {
          role: 'user',
          content: [
            { text: 'Analyze this image of a person to recommend clothing fit preference. Return fitPreference (slim, regular, relaxed, oversized) and a list of detectedFeatures (e.g. broad shoulders).' },
            { media: { url: imageBase64 } }
          ]
        }
      ],
      output: { schema: BodyScanSchema },
    });
    return response.output;
  } catch (error) {
    console.error('Error analyzing body scan:', error);
    // Fallback if AI fails or Genkit is not fully configured
    return { fitPreference: 'regular', detectedFeatures: ['Standard Proportions'] };
  }
}
