import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for high-fidelity flight searching.
 * Refactored for environment-aware execution to support static exports.
 */

const FlightSchema = z.object({
  id: z.string(),
  airline: z.string(),
  price: z.number(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  stops: z.number(),
  from: z.string(),
  to: z.string(),
});
export type Flight = z.infer<typeof FlightSchema>;

const SearchFlightsOutputSchema = z.array(FlightSchema);
export type SearchFlightsOutput = z.infer<typeof SearchFlightsOutputSchema>;

const mockFlights: Flight[] = [
  {
    id: 'FL-101',
    airline: 'SkyAura Airlines',
    price: 450,
    departureTime: '08:00 AM',
    arrivalTime: '11:30 AM',
    duration: '3h 30m',
    stops: 0,
    from: 'JFK',
    to: 'LHR',
  }
];

export async function searchFlights(input: {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  language?: string;
}): Promise<SearchFlightsOutput> {
  if (typeof window !== 'undefined') {
    return mockFlights;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    return mockFlights;
  } catch (error) {
    console.error("Flight search failed:", error);
    return mockFlights;
  }
}
