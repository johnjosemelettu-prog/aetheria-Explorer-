import { z } from 'zod';

/**
 * @fileOverview Universal schemas for the Cab Booking feature.
 */

export const SearchCabsInputSchema = z.object({
  pickupLocation: z.string().describe('The pickup address or landmark.'),
  destination: z.string().describe('The destination address or landmark.'),
  date: z.string().describe('The desired pickup date in YYYY-MM-DD format.'),
  time: z.string().describe('The desired pickup time in HH:MM format.'),
  passengers: z.number().describe('The number of passengers.'),
  language: z.string().optional().describe('The output language.'),
});

export type SearchCabsInput = z.infer<typeof SearchCabsInputSchema>;

export const CabOptionSchema = z.object({
  id: z.string(),
  provider: z.string(),
  type: z.enum(['Economy', 'Premium', 'SUV', 'Electric']),
  price: z.number(),
  estimatedArrivalMinutes: z.number(),
  driverRating: z.number(),
  capacity: z.number(),
});

export type CabOption = z.infer<typeof CabOptionSchema>;

export const SearchCabsOutputSchema = z.array(CabOptionSchema);

export type SearchCabsOutput = z.infer<typeof SearchCabsOutputSchema>;
