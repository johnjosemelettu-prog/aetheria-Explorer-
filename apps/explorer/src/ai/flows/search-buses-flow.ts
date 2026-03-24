import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for searching for intercity bus journeys.
 * Refactored for environment-aware execution to support static exports.
 */

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

const mockBuses: BusOption[] = [
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

export async function searchBuses(input: {
  from: string;
  to: string;
  date: string;
  passengers: number;
  language?: string;
}): Promise<SearchBusesOutput> {
  if (typeof window !== 'undefined') {
    return mockBuses;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    return mockBuses;
  } catch (error) {
    console.error("Bus search node error:", error);
    return mockBuses;
  }
}
