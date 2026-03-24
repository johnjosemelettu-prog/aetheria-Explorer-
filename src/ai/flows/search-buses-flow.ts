import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for searching for intercity bus journeys.
 * Refactored for environment-aware execution to support static exports.
 */

const SearchBusesInputSchema = z.object({
  from: z.string(),
  to: z.string(),
  date: z.string(),
  passengers: z.number(),
  language: z.string().optional(),
});
export type SearchBusesInput = z.infer<typeof SearchBusesInputSchema>;

const BusOptionSchema = z.object({
  id: z.string(),
  provider: z.string(),
  amenities: z.array(z.string()),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  price: z.number(),
  seatType: z.string(),
});
export type BusOption = z.infer<typeof BusOptionSchema>;

const SearchBusesOutputSchema = z.array(BusOptionSchema);
export type SearchBusesOutput = z.infer<typeof SearchBusesOutputSchema>;

function getMockBuses(): BusOption[] {
  return [
    {
      id: 'bus-1',
      provider: 'Aetheria Liner',
      amenities: ['WiFi', 'Power', 'Extra Legroom'],
      departureTime: '08:00',
      arrivalTime: '13:00',
      duration: '5h 00m',
      price: 25,
      seatType: 'Premium Recliner',
    }
  ];
}

export async function searchBuses(input: SearchBusesInput): Promise<SearchBusesOutput> {
  if (typeof window !== 'undefined') {
    return getMockBuses();
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const buses = getMockBuses();

    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate the bus options into ${input.language}: ${JSON.stringify(buses)}`,
        output: { schema: SearchBusesOutputSchema },
      });
      return response.output || buses;
    }

    return buses;
  } catch (error) {
    console.error("Bus search node error:", error);
    return getMockBuses();
  }
}
