import { z } from 'zod';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview A Genkit flow for searching for cruises.
 * Refactored for environment-aware execution to support static exports.
 */

const SearchCruisesInputSchema = z.object({
  destination: z.string(),
  departureMonth: z.string(),
  passengers: z.number(),
  language: z.string().optional(),
});
export type SearchCruisesInput = z.infer<typeof SearchCruisesInputSchema>;

const CruiseSchema = z.object({
    id: z.string(),
    cruiseLine: z.string(),
    name: z.string(),
    destination: z.string(),
    durationDays: z.number(),
    pricePerPerson: z.number(),
    image: z.object({
        id: z.string(),
        description: z.string(),
        imageUrl: z.string(),
        imageHint: z.string(),
    }).optional(),
});
export type Cruise = z.infer<typeof CruiseSchema>;

const SearchCruisesOutputSchema = z.array(CruiseSchema);
export type SearchCruisesOutput = z.infer<typeof SearchCruisesOutputSchema>;

function getMockCruises(): Cruise[] {
  return [
    {
      id: 'cruise-1',
      cruiseLine: 'Oceanic Voyages',
      name: 'Caribbean Dream',
      destination: 'Caribbean',
      durationDays: 7,
      pricePerPerson: 899,
      image: PlaceHolderImages.find((img) => img.id === 'cruise-1'),
    }
  ];
}

export async function searchCruises(input: SearchCruisesInput): Promise<SearchCruisesOutput> {
  if (typeof window !== 'undefined') {
    return getMockCruises();
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const cruises = getMockCruises();

    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate these cruise options into ${input.language}: ${JSON.stringify(cruises)}`,
        output: { schema: SearchCruisesOutputSchema },
      });
      return response.output || cruises;
    }

    return cruises;
  } catch (error) {
    console.error("Cruise search node error:", error);
    return getMockCruises();
  }
}
