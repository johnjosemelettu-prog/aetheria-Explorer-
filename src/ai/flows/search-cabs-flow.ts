import { type SearchCabsOutput, type SearchCabsInput } from './cab-schemas';

/**
 * @fileOverview A Genkit flow for searching available cabs.
 * Refactored for environment-aware execution to support static exports.
 */

function getMockCabs(): SearchCabsOutput {
  return [
    {
      id: 'cab-1',
      provider: 'Aetheria Rides',
      type: 'Economy' as const,
      price: 15,
      estimatedArrivalMinutes: 5,
      driverRating: 4.8,
      capacity: 4,
    },
    {
      id: 'cab-2',
      provider: 'Aetheria Rides',
      type: 'Premium' as const,
      price: 30,
      estimatedArrivalMinutes: 8,
      driverRating: 4.9,
      capacity: 4,
    }
  ];
}

export async function searchCabs(input: SearchCabsInput): Promise<SearchCabsOutput> {
  if (typeof window !== 'undefined') {
    return getMockCabs();
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const { SearchCabsOutputSchema } = await import('./cab-schemas');
    
    const options = getMockCabs();

    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate these cab options into ${input.language}: ${JSON.stringify(options)}`,
        output: { schema: SearchCabsOutputSchema },
      });
      return response.output || options;
    }

    return options;
  } catch (error) {
    console.error("Cab search node error:", error);
    return getMockCabs();
  }
}
