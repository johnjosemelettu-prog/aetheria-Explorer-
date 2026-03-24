import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for searching for Points of Interest (POIs).
 * Refactored for environment-aware execution to support static exports.
 */

const SearchPoisInputSchema = z.object({
  query: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  language: z.string().optional(),
});
export type SearchPoisInput = z.infer<typeof SearchPoisInputSchema>;

const PoiSchema = z.object({
    id: z.string(),
    name: z.string(),
    distance: z.string(),
    icon: z.string(),
    category: z.string(),
});
export type Poi = z.infer<typeof PoiSchema>;

const SearchPoisOutputSchema = z.array(PoiSchema);
export type SearchPoisOutput = z.infer<typeof SearchPoisOutputSchema>;

const allPois = [
  { id: 'cafe', name: 'Artisan Cafe', distance: '150m', icon: 'Store', category: 'Food' },
  { id: 'park', name: 'Central Park', distance: '800m', icon: 'Waypoints', category: 'Outdoors' },
];

export async function searchPois(input: SearchPoisInput): Promise<SearchPoisOutput> {
  if (typeof window !== 'undefined') {
    return allPois;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const results = allPois;

    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate these POI names and categories into ${input.language}: ${JSON.stringify(results)}`,
        output: { schema: SearchPoisOutputSchema },
      });
      return response.output || results;
    }
    
    return results;
  } catch (error) {
    console.error("POI search node error:", error);
    return allPois;
  }
}
