import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for high-fidelity flight searching.
 * Refactored for environment-aware execution to support static exports.
 */

const SearchFlightsInputSchema = z.object({
  from: z.string().describe('Departure airport code.'),
  to: z.string().describe('Arrival airport code.'),
  departureDate: z.string().describe('YYYY-MM-DD'),
  returnDate: z.string().optional().describe('YYYY-MM-DD'),
  passengers: z.number().default(1),
  language: z.string().optional(),
});
export type SearchFlightsInput = z.infer<typeof SearchFlightsInputSchema>;

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

function getMockFlights(input: SearchFlightsInput): Flight[] {
  return [
    {
      id: 'FL-101',
      airline: 'SkyAura Airlines',
      price: 450,
      departureTime: '08:00 AM',
      arrivalTime: '11:30 AM',
      duration: '3h 30m',
      stops: 0,
      from: input.from,
      to: input.to,
    },
    {
      id: 'FL-202',
      airline: 'Nimbus Airways',
      price: 320,
      departureTime: '02:15 PM',
      arrivalTime: '07:45 PM',
      duration: '5h 30m',
      stops: 1,
      from: input.from,
      to: input.to,
    }
  ];
}

export async function searchFlights(input: SearchFlightsInput): Promise<SearchFlightsOutput> {
  if (typeof window !== 'undefined') {
    return getMockFlights(input);
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const flights = getMockFlights(input);

    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate the airline names in this list into ${input.language}. 
        Return ONLY the JSON array matching the schema.
        DATA: ${JSON.stringify(flights)}`,
        output: { schema: SearchFlightsOutputSchema },
      });
      return response.output || flights;
    }

    return flights;
  } catch (error) {
    console.error("Flight search failed, falling back to simulation:", error);
    return getMockFlights(input);
  }
}
