
/**
 * @fileOverview A Genkit flow for searching for train journeys.
 * Refactored for environment-aware execution to support static exports.
 */

import { z } from 'zod';

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

export async function searchTrains(input: any): Promise<TrainOption[]> {
  if (typeof window !== 'undefined') {
    return [
      {
        id: 'train-1',
        operator: 'EuroRail Express',
        type: 'High Speed',
        departureTime: '09:15',
        arrivalTime: '11:45',
        duration: '2h 30m',
        price: 85,
        class: 'Standard Premier',
      }
    ];
  }

  // Server-side simulation for prototype
  return [
    {
      id: 'train-1',
      operator: 'EuroRail Express',
      type: 'High Speed',
      departureTime: '09:15',
      arrivalTime: '11:45',
      duration: '2h 30m',
      price: 85,
      class: 'Standard Premier',
    }
  ];
}
