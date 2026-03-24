import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for finding nearby traveler matches.
 * Refactored for environment-aware execution to support static exports.
 */

const FindNearbyPoisForGuideInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
export type FindNearbyPoisForGuideInput = z.infer<typeof FindNearbyPoisForGuideInputSchema>;

const PoiForGuideSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});
export type PoiForGuide = z.infer<typeof PoiForGuideSchema>;

const FindNearbyPoisForGuideOutputSchema = z.array(PoiForGuideSchema);
export type FindNearbyPoisForGuideOutput = z.infer<typeof FindNearbyPoisForGuideOutputSchema>;

export async function findNearbyPoisForGuide(input: FindNearbyPoisForGuideInput): Promise<FindNearbyPoisForGuideOutput> {
  if (typeof window !== 'undefined') {
    return [
      { id: 'eiffel', name: 'Eiffel Tower', latitude: 48.8584, longitude: 2.2945 },
      { id: 'louvre', name: 'Louvre Museum', latitude: 48.8606, longitude: 2.3376 },
      { id: 'notre-dame', name: 'Notre-Dame Cathedral', latitude: 48.8530, longitude: 2.3499 },
    ];
  }

  try {
    const { ai } = await import('@/ai/genkit');
    // In a real app, this would query a database like Firestore with a geoquery.
    return [
      { id: 'eiffel', name: 'Eiffel Tower', latitude: 48.8584, longitude: 2.2945 },
      { id: 'louvre', name: 'Louvre Museum', latitude: 48.8606, longitude: 2.3376 },
    ];
  } catch (error) {
    console.error("POI discovery node error:", error);
    return [];
  }
}
