/**
 * @fileOverview A Genkit flow for searching for train journeys with localization.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

import { z } from 'zod';

const SearchTrainsInputSchema = z.object({
  from: z.string().describe('Departure city or station.'),
  to: z.string().describe('Arrival city or station.'),
  date: z.string().describe('Departure date in YYYY-MM-DD.'),
  returnDate: z.string().optional().describe('Return date in YYYY-MM-DD for round trips.'),
  passengers: z.number().describe('Number of travelers.'),
  language: z.string().optional(),
});
export type SearchTrainsInput = z.infer<typeof SearchTrainsInputSchema>;

const TrainOptionSchema = z.object({
  id: z.string(),
  operator: z.string(),
  type: z.enum(['High Speed', 'Regional', 'Sleeper']),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  price: z.number(),
  class: z.string(),
});
export type TrainOption = z.infer<typeof TrainOptionSchema>;

const SearchTrainsOutputSchema = z.array(TrainOptionSchema);
export type SearchTrainsOutput = z.infer<typeof SearchTrainsOutputSchema>;

function getMockTrains(): TrainOption[] {
  return [
    {
      id: 'train-1',
      operator: 'EuroRail Express',
      type: 'High Speed' as const,
      departureTime: '09:15',
      arrivalTime: '11:45',
      duration: '2h 30m',
      price: 85,
      class: 'Standard Premier',
    },
    {
      id: 'train-2',
      operator: 'Trans-Continental',
      type: 'Sleeper' as const,
      departureTime: '22:00',
      arrivalTime: '07:30',
      duration: '9h 30m',
      price: 145,
      class: 'Private Cabin',
    }
  ];
}

/**
 * Searches for trains. Environment-aware for static export.
 */
export async function searchTrains(input: SearchTrainsInput): Promise<SearchTrainsOutput> {
  if (typeof window !== 'undefined') {
    return getMockTrains();
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const trains = getMockTrains();

    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate the train operator names and class types into ${input.language}: ${JSON.stringify(trains)}`,
        output: { schema: SearchTrainsOutputSchema },
      });
      return response.output || trains;
    }

    return trains;
  } catch (error) {
    console.error("Train search node error:", error);
    return getMockTrains();
  }
}
